import { ChatContainer } from '@/components/Chat/ChatContainer';
import { ChatInput } from '@/components/Chat/ChatInput';
import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export function ChatPage() {
	const [replyTo, setReplyTo] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [isVisible, setIsVisible] = useState(true);

	const handleReply = (messageId: string) => {
		const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
		if (messageElement) {
			const usernameElement = messageElement.querySelector('.username');
			if (usernameElement) {
				const username = usernameElement.textContent;
				if (username) {
					setReplyTo(username);
				}
			}
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
			setTimeout(() => {
				setIsVisible(false);
			}, 300); // Duration of the fade-out transition
		}, 2000); // Adjust the time as needed

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className='container grid grid-cols-[auto] grid-rows-[24fr_1fr] max-h-[calc(100vh-4rem-2rem)] w-full gap-y-4'>
			<ChatContainer handleReply={handleReply} />
			<ChatInput replyTo={replyTo} setReplyTo={setReplyTo} />

			{isVisible && (
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
