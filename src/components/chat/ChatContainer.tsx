import { useEffect, useReducer } from 'react';
import { Message } from '@/components/chat/Message';
import { UserConstant, UserConstant2 } from '@/constants/globalUser';

export function ChatContainer({
	messageEndRef: messageEndRef,
	messages,
	replyingTo,
	onReplyClick,
}: {
	messageEndRef: React.RefObject<HTMLDivElement | null>;
	messages: Message[];
	replyingTo: string | null;
	onReplyClick: (msgId: string) => void;
}) {
	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

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
				{messages.map((message, i) => {
					return <Message data={message} key={i} onReplyClick={onReplyClick} isHighlighted={replyingTo === message.id} />;
				})}
				<div ref={messageEndRef}></div>
			</div>
		</div>
	);
}
