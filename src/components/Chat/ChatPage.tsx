import { ChatContainer } from '@/components/Chat/ChatContainer';
import { ChatInput } from '@/components/Chat/ChatInput';
import { useState } from 'react';

export function ChatPage() {
	const [replyTo, setReplyTo] = useState<string>('');

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

	return (
		<div className='container grid grid-cols-[auto] grid-rows-[24fr_1fr] max-h-[calc(100vh-4rem-2rem)] w-full gap-y-4'>
			<ChatContainer handleReply={handleReply} />
			<ChatInput replyTo={replyTo} setReplyTo={setReplyTo} />
		</div>
	);
}
