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

// Updated reducer to handle optimistic updates with temp IDs
const messagesReducer = (state: Message[], action: any) => {
	switch (action.type) {
		case 'ADD_MESSAGE':
			if (Array.isArray(action.payload)) {
				return [...state, ...action.payload];
			}
			return [...state, action.payload];
		case 'UPDATE_MESSAGE_ID':
			return state.map(message => (message._id === action.payload.tempId ? { ...message, _id: action.payload.realId } : message));
		case 'RESET':
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
	const [loading, setLoading] = useState(true);
	const [isLoadingVisible, setIsLoadingVisible] = useState(true);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [cursor, setCursor] = useState<string | null>(null);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUser = useStore(activeUserStore);
	const activeChannel = useStore(activeChannelStore);
	const { toast } = useToast();

	const handleReplyClick = (msgId: string) => {
		setReplyingTo(msgId);
		messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

			return fetch(`http://localhost:8000/api/msg`, {
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

			// Add the optimistic message to the UI
			dispatch({ type: 'ADD_MESSAGE', payload: optimisticMessage });

			// Return context for potential rollback
			return { tempId };
		},
		onSuccess: async (response, message, context) => {
			try {
				// Get the real message ID from the response
				const realId = await response.text();

				if (realId.includes('error')) {
					console.error('Error sending message:', realId);
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
						realId,
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

	// Track when messageStartRef is in viewport
	useEffect(() => {
		if (!messageStartRef.current) return;

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(async entry => {
					if (entry.isIntersecting && cursor) {
						await fetchMessages(50, false);
					}
				});
			},
			{ threshold: 1 },
		);

		observer.observe(messageStartRef.current);

		return () => {
			if (messageStartRef.current) {
				observer.unobserve(messageStartRef.current);
			}
		};
	}, [cursor, messageStartRef.current]); // Add cursor as dependency

	const fetchMessages = async (limit: number = 50, initialLoad: boolean = false): Promise<{ success: boolean }> => {
		try {
			const response = await fetch(
				`http://localhost:8000/api/fetch/msgs/${activeChannel?._id}?` +
					new URLSearchParams({
						limit: limit.toString(),
						...(initialLoad ? {} : { cursor: cursor || '' }),
					}).toString(),
				{ credentials: 'include', method: 'GET' },
			);

			const data: {
				pagination: {
					nextCursor: string;
					hasMore: boolean;
				};
				messages: Message[];
			} = await response.json();

			if (data.pagination.hasMore) {
				setCursor(data.pagination.nextCursor);
			} else {
				// No more messages to fetch
				setCursor(null);
			}

			// Use a single dispatch to add all messages at once
			if (Array.isArray(data.messages)) {
				dispatch({ type: 'ADD_MESSAGE', payload: data.messages });
			} else {
				console.error('Received invalid messages format:', data.messages);
			}

			// Page loading is done
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

	// get channel details on load
	useEffect(() => {
		const pathSegments = window.location.pathname.split('/');
		const channelName = pathSegments[pathSegments.length - 1];
		const channelType = pathSegments[pathSegments.length - 2];

		fetch(`http://localhost:8000/channel/${channelType}/${channelName}`, { credentials: 'include' })
			.then(res => res.json())
			.then((data: Channel) => {
				setActiveChannel(data);
			});
	}, []);

	useEffect(() => {
		const chatEventSource = new EventSource(`http://localhost:8000/${activeWorkspace?._id}/chat/${activeChannel?._id}`, { withCredentials: true });

		chatEventSource.addEventListener('open', async event => {
			// tell user that connection is open
		});

		chatEventSource.addEventListener('message', event => {
			const data: SSEMessage = JSON.parse(event.data);

			if (data.message.author._id !== activeUser?._id) {
				dispatch({ type: 'ADD_MESSAGE', payload: data.message });

				setTimeout(() => {
					messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				}, 5);
			}
		});

		return () => {
			// Clean up EventSource when component unmounts or channel changes
			chatEventSource.close();
		};
	}, [activeChannel, activeWorkspace, activeUser]);

	useEffect(() => {
		setIsLoadingVisible(true);
		// callback function to call when event triggers
		const onPageLoad = async () => {
			await fetchMessages(50, true);

			console.log('page loaded');
			setLoading(false);

			setTimeout(() => {
				messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				setIsLoadingVisible(false);
			}, 300);
		};

		// Check if the page has already loaded
		if (document.readyState === 'complete') {
			onPageLoad();
		} else {
			window.addEventListener('load', onPageLoad, false);
			// Remove the event listener when component unmounts
			return () => window.removeEventListener('load', onPageLoad);
		}
	}, []);

	// // Listen for messages dispatched from ConnectionPersist
	// useEffect(() => {
	// 	const handler = (e: Event) => {
	// 		const customEvent = e as CustomEvent;
	// 		dispatch({ type: 'ADD_MESSAGE', payload: customEvent.detail });
	// 	};
	// 	window.addEventListener('newMessage', handler);
	// 	return () => window.removeEventListener('newMessage', handler);
	// }, []);

	return (
		<div className='container grid grid-cols-[auto] grid-rows-[24fr_1fr] max-h-[calc(100vh-4rem-2rem)] gap-y-6 max-w-full'>
			<ChatContainer
				messageStartRef={messageStartRef}
				messageEndRef={messageEndRef}
				messages={messages}
				replyingTo={replyingTo}
				onReplyClick={handleReplyClick}
			/>
			<ChatInput replyingTo={replyingTo} onClearReply={() => setReplyingTo(null)} handleSendMessage={handleSendMessage} activeChannel={activeChannel} />

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
