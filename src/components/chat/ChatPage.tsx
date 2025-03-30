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

// Updated reducer to handle optimistic updates with temp IDs
const messagesReducer = (state: Message[], action: any) => {
	switch (action.type) {
		case 'ADD_MESSAGE':
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
	const [loading, setLoading] = useState(true);
	const [isLoadingVisible, setIsLoadingVisible] = useState(true);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUser = useStore(activeUserStore);

	const handleReplyClick = (msgId: string) => {
		setReplyingTo(msgId);
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

			return fetch(`http://localhost:8000/msg`, {
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
				console.log('Message sent with ID:', realId);

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
			// You could add error handling UI here
		},
	});

	const handleSendMessage = (message: MessageToSend) => {
		sendMessageMutation.mutate(message);

		setTimeout(() => {
			messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, 5);
	};

	// change channel when active workspace changes
	useEffect(() => {
		// send request to backend for redirect (need the id of a chat channel in the switched workspace)
		fetch(`http://localhost:8000/${activeWorkspace?._id}/chat`, { credentials: 'include' })
			.then(res => res.json())
			.then((data: Channel) => {
				console.log(data);
			});
	}, [activeWorkspace]);

	// get channel details on load
	useEffect(() => {
		const pathSegments = window.location.pathname.split('/');
		const channelName = pathSegments[pathSegments.length - 1];
		const channelType = pathSegments[pathSegments.length - 2];

		fetch(`http://localhost:8000/channel/${channelType}/${channelName}`, { credentials: 'include' })
			.then(res => res.json())
			.then((data: Channel) => {
				console.log(data);
				setActiveChannel(data);
			});
	}, []);

	useEffect(() => {
		const chatEventSource = new EventSource(`http://localhost:8000/${activeWorkspace?._id}/chat/${activeChannel?._id}`, { withCredentials: true });

		chatEventSource.addEventListener('open', event => {
			// tell user that connection is open
		});

		chatEventSource.addEventListener('message', event => {
			const data: SSEMessage = JSON.parse(event.data);

			if (data.message.author._id !== activeUser?._id) {
				dispatch({ type: 'ADD_MESSAGE', payload: data.message });
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
		const onPageLoad = () => {
			console.log('page loaded');
			setLoading(false);

			setTimeout(() => {
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
		<div className='container grid grid-cols-[auto] grid-rows-[24fr_1fr] max-h-[calc(100vh-4rem-2rem)] gap-y-4 max-w-full'>
			<ChatContainer messageEndRef={messageEndRef} messages={messages} replyingTo={replyingTo} onReplyClick={handleReplyClick} />
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
