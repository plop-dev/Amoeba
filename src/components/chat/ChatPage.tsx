import { ChatContainer } from '@/components/chat/ChatContainer';
import { ChatInput } from '@/components/chat/ChatInput';
import { useState, useEffect, useReducer, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { activeUser as activeUserStore } from '@/stores/User';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { useToast } from '@/hooks/use-toast';
import { activeChannel as activeChannelStore, setActiveChannel } from '@/stores/Channel';
import { PUBLIC_API_URL } from 'astro:env/client';
import { sleep } from '@/utils/sleep';

// Updated reducer to handle optimistic updates with temp IDs and prepend older messages
const messagesReducer = (state: Message[], action: any) => {
	switch (action.type) {
		case 'ADD_MESSAGE':
			if (Array.isArray(action.payload)) {
				return [...state, ...action.payload];
			}
			return [...state, action.payload];
		case 'ADD_MESSAGE_TOP':
			if (Array.isArray(action.payload)) {
				return [...action.payload, ...state];
			}
			return [action.payload, ...state];
		case 'UPDATE_MESSAGE_ID':
			return state.map(message => (message._id === action.payload.tempId ? { ...message, _id: action.payload.realId } : message));
		case 'DELETE_MESSAGE':
			return state.filter(message => message._id !== action.payload);
		case 'UPDATE_MESSAGE_REACTIONS':
			return state.map(message => (message._id === action.payload.messageId ? { ...message, reactions: action.payload.reactions } : message));
		case 'RESET':
			// Ensure we're truly resetting to an empty array
			return [];
		default:
			return state;
	}
};

// Inner component using React Query
function ChatPageContent() {
	const [messages, dispatch] = useReducer(messagesReducer, []);
	const messageEndRef = useRef<HTMLDivElement | null>(null);
	const messageStartRef = useRef<HTMLDivElement | null>(null);
	const editorRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(true);
	const [isLoadingVisible, setIsLoadingVisible] = useState(true);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [cursor, setCursor] = useState<string | null>(null);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUser = useStore(activeUserStore);
	const activeChannel = useStore(activeChannelStore);
	const { toast } = useToast();
	// Add reference to track current channel ID to prevent race conditions
	const currentChannelIdRef = useRef<string | null>(null);

	const handleReplyClick = (msgId: string) => {
		setReplyingTo(msgId);
		editorRef.current?.focus();
		messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	};

	const handleDeleteMessage = async (msgId: string) => {
		try {
			await fetch(`${PUBLIC_API_URL}/msg/${msgId}`, {
				method: 'DELETE',
				credentials: 'include',
			});
		} catch (error) {
			console.error('Error deleting message:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete message. Please try again.',
				variant: 'destructive',
			});
		}
		dispatch({ type: 'DELETE_MESSAGE', payload: msgId });
	};

	// Updated send message mutation with optimistic updates using temp ID prefix
	const sendMessageMutation = useMutation({
		mutationFn: (message: MessageToSend) => {
			const data: SSEMessage = {
				event: {
					author: 'client',
					type: 'message',
				},
				message,
			};

			return fetch(`${PUBLIC_API_URL}/msg`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
				},
			});
		},
		onMutate: async (message: MessageToSend) => {
			// Generate a temporary ID with "temp" prefix
			const tempId = `temp_${uuidv4()}`;

			// Create a copy of the message with the temporary ID
			const optimisticMessage = {
				...message,
				_id: tempId,
			};

			// Add the optimistic message to the UI (append to end)
			dispatch({ type: 'ADD_MESSAGE', payload: optimisticMessage });

			// Return context for potential rollback
			return { tempId };
		},
		onSuccess: async (response, message, context) => {
			try {
				// Get the real message ID from the response
				const realId = await response.json();

				if (!realId.success) {
					console.error('Error sending message:', realId.error);
					toast({
						title: 'Error',
						description: 'Failed to send message. Please reload page.',
						variant: 'destructive',
					});
				}

				// Update the message with the real ID
				dispatch({
					type: 'UPDATE_MESSAGE_ID',
					payload: {
						tempId: context?.tempId,
						realId: realId.data,
					},
				});
			} catch (error) {
				console.error('Error processing message ID:', error);
			}
		},
		onError: error => {
			console.error('Failed to send message:', error);
			toast({
				title: 'Error',
				description: 'Failed to send message. Please try again.',
				variant: 'destructive',
			});
		},
	});

	const handleSendMessage = (message: MessageToSend) => {
		sendMessageMutation.mutate(message);

		setTimeout(() => {
			messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, 5);
	};

	//* LAZY LOAD MESSAGES
	// Track when messageStartRef is in viewport (top of messages)
	useEffect(() => {
		if (!hasLoaded || !cursor || loading) return;
		if (!messageStartRef.current) return;

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(async entry => {
					if (entry.isIntersecting) {
						if (cursor && !loading) {
							// store current scroll position
							const scrollContainer = messageStartRef.current?.parentElement?.parentElement;
							const scrollPosition = scrollContainer?.scrollHeight || 0;

							console.trace('Loading more messages...');
							await fetchMessages(50, false, activeChannel);

							// restore scroll position
							setTimeout(() => {
								const newScrollHeight = scrollContainer?.scrollHeight || 0;
								const scrollDiff = newScrollHeight - scrollPosition;
								scrollContainer?.scrollTo({
									top: scrollDiff,
									behavior: 'auto',
								});
							}, 10);
						}
					}
				});
			},
			{ threshold: 0.5 },
		);
		const timeoutId = setTimeout(() => {
			if (messageStartRef.current) {
				observer.observe(messageStartRef.current);
			}
		}, 500);

		return () => {
			clearTimeout(timeoutId);
			if (messageStartRef.current) {
				observer.unobserve(messageStartRef.current);
			}
		};
	}, [cursor, loading, activeChannel]);

	const fetchMessages = async (limit: number = 50, initialLoad: boolean = false, activeChannelData: Channel | null): Promise<{ success: boolean }> => {
		try {
			// Safety check: ensure we have a valid channel
			if (!activeChannelData?._id) {
				console.warn('No active channel ID for fetchMessages');
				return { success: false };
			}

			// Store the channel ID we're fetching for
			const channelId = activeChannelData._id;

			// If this doesn't match our current tracking ID, abort
			if (currentChannelIdRef.current && channelId !== currentChannelIdRef.current) {
				console.log(`Aborting fetch for ${channelId} - current channel is now ${currentChannelIdRef.current}`);
				return { success: false };
			}

			console.log(`Fetching messages for channel: ${channelId}`);
			const response = await fetch(
				`${PUBLIC_API_URL}/msgs/${channelId}?` +
					new URLSearchParams({
						limit: limit.toString(),
						...(initialLoad ? {} : { cursor: cursor || '' }),
					}).toString(),
				{ credentials: 'include', method: 'GET' },
			);

			// Another check after the fetch to ensure we're still on the same channel
			if (channelId !== currentChannelIdRef.current) {
				console.log(`Discarding fetch results - channel changed from ${channelId} to ${currentChannelIdRef.current}`);
				return { success: false };
			}

			const data: {
				pagination: {
					nextCursor: string;
					hasMore: boolean;
				};
				messages: Message[];
			} = await response.json().then(res => res.data);

			if (data.pagination.hasMore) {
				setCursor(data.pagination.nextCursor);
			} else {
				setCursor(null);
				console.log(`No more messages to load for channel ${channelId}`);
			}

			// Use a single dispatch to add all messages at once
			if (Array.isArray(data.messages)) {
				// For initial load or adding new messages, add them differently than old messages
				if (initialLoad) {
					dispatch({ type: 'ADD_MESSAGE', payload: data.messages.reverse() });
				} else {
					// Prepend older messages at the top
					dispatch({ type: 'ADD_MESSAGE_TOP', payload: data.messages.reverse() });
				}
			} else {
				console.error('Received invalid messages format:', data.messages);
			}

			return { success: true };
		} catch (error) {
			console.error('Error fetching messages:', error);
			toast({
				title: 'Error',
				description: 'Failed to fetch messages. Please reload page.',
				variant: 'destructive',
			});
			return { success: false };
		}
	};

	//* LOAD SSE CONNECTION FOR REALTIME UPDATES
	useEffect(() => {
		// null active channel probably means user is on 'home'
		if (!activeChannel || !activeWorkspace) return;

		const chatEventSource = new EventSource(`${PUBLIC_API_URL}/sse/${activeWorkspace?._id}/chat/${activeChannel?._id}`, { withCredentials: true });

		chatEventSource.addEventListener('open', async event => {
			// tell user that connection is open
		});

		chatEventSource.addEventListener('message', event => {
			const data: SSEMessage = JSON.parse(event.data);

			if (data.event.variant === 'reaction') {
				// Update the message's reaction state
				const message: Message & { __v: string } = data.message;
				const updatedReactions = message.reactions instanceof Map ? message.reactions : new Map(Object.entries(message.reactions || {}));

				dispatch({
					type: 'UPDATE_MESSAGE_REACTIONS',
					payload: {
						messageId: message._id,
						reactions: updatedReactions,
					},
				});
			} else {
				if (data.message.author._id !== activeUser?._id) {
					dispatch({ type: 'ADD_MESSAGE', payload: data.message });

					setTimeout(() => {
						messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					}, 5);
				}
			}
		});

		return () => {
			// Clean up EventSource when component unmounts or channel changes
			chatEventSource.close();
		};
	}, [activeChannel, activeWorkspace]);

	useEffect(() => {
		if (!activeChannel) return;

		const chanId = activeChannel._id;
		console.log(`Channel changed to: ${chanId}`);

		// Update our reference to the current channel ID
		currentChannelIdRef.current = chanId;

		// Reset everything related to messages
		dispatch({ type: 'RESET' });
		setCursor(null);
		setIsLoadingVisible(true);
		setLoading(true);
		setHasLoaded(false);

		// Double check to be sure we've cleared existing messages
		console.log('Messages after reset:', messages);

		(async () => {
			// Make sure we're still on the same channel before fetching
			if (chanId !== currentChannelIdRef.current) return;

			await fetchMessages(50, true, activeChannel);

			// Another check after fetching to make sure we're still on the same channel
			if (chanId !== currentChannelIdRef.current) return;

			messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			setIsLoadingVisible(false);
			setLoading(false);
			setHasLoaded(true);
		})();

		// Clean up function to handle component unmounting or channel changing again
		return () => {
			// This helps identify if a fetch completed after we moved away
			console.log(`Cleaning up channel: ${chanId}`);
		};
	}, [activeChannel?._id]); // Use _id directly to ensure the effect runs properly when changing channels

	return (
		<div className='container grid grid-cols-[auto] grid-rows-[24fr_1fr] max-h-[calc(100vh-4rem-2rem)] gap-y-4 max-w-full'>
			<ChatContainer
				messageStartRef={messageStartRef}
				messageEndRef={messageEndRef}
				messages={messages}
				replyingTo={replyingTo}
				onReplyClick={handleReplyClick}
				handleDeleteMessage={handleDeleteMessage}
			/>
			<ChatInput
				replyingTo={replyingTo}
				setReplyingTo={setReplyingTo}
				editorRef={editorRef}
				onClearReply={() => setReplyingTo(null)}
				handleSendMessage={handleSendMessage}
				activeChannel={activeChannel}
			/>

			{isLoadingVisible && (
				<div
					className={`absolute inset-0 flex items-center justify-center bg-background z-50 transition-opacity duration-300 ${
						loading ? 'opacity-100' : 'opacity-0'
					}`}>
					<div className='flex flex-col items-center gap-4'>
						<LoaderCircle className='animate-spin'></LoaderCircle>
						<p className='text-sm font-medium'>Loading Chats...</p>
					</div>
				</div>
			)}
		</div>
	);
}

// Wrapper component that provides the QueryClient
export function ChatPage() {
	return (
		<ReactQueryProvider>
			<ChatPageContent />
		</ReactQueryProvider>
	);
}
