import { useEffect } from 'react';
import { Message } from '@/components/chat/Message';
import { UserConstant, UserConstant2 } from '@/constants/globalUser';

export function ChatContainer({ replyingTo, onReplyClick }: { replyingTo: string | null; onReplyClick: (msgId: string) => void }) {
	useEffect(() => {
		const chatContainer = document.querySelector('.chat-container');
		if (chatContainer) {
			chatContainer.scrollTo(0, chatContainer.scrollHeight);
		}
	}, []);

	useEffect(() => {
		const chatContainer = document.querySelector('.chat-container');
		const message = document.querySelector(`.message[data-message-id="${replyingTo}"]`);

		if (chatContainer && message) {
			const messageRect = message.getBoundingClientRect();
			const containerRect = chatContainer.getBoundingClientRect();

			if (messageRect.top < containerRect.top || messageRect.bottom > containerRect.bottom) {
				message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}
	}, [replyingTo]);

	const messageData: Message = {
		id: '0',
		author: UserConstant,
		channelId: '/irish-potatoes/chat/general',
		content: 'hello everyone',
		sent: new Date(),
		reactions: new Map([
			['ThumbsUp', [UserConstant, UserConstant2]],
			['ThumbsDown', [UserConstant]],
		]),
	};

	return (
		<div className='chat-container overflow-auto'>
			<div className='wrapper pr-4'>
				{Array.from({ length: 5 }, (i, j) => {
					return (
						<Message data={messageData} messageId={j.toString()} key={j} onReplyClick={onReplyClick} isHighlighted={replyingTo === j.toString()} />
					);
				})}
			</div>
		</div>
	);
}
