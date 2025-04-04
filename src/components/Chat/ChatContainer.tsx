import { useEffect, useReducer } from 'react';
import { Message } from '@/components/chat/Message';
import { UserConstant, UserConstant2 } from '@/constants/globalUser';

export function ChatContainer({
	messageEndRef,
	messageStartRef,
	messages,
	replyingTo,
	onReplyClick,
	handleDeleteMessage,
}: {
	messageEndRef: React.RefObject<HTMLDivElement | null>;
	messageStartRef: React.RefObject<HTMLDivElement | null>;
	messages: Message[];
	replyingTo: string | null;
	onReplyClick: (msgId: string) => void;
	handleDeleteMessage: (msgId: string) => void;
}) {
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

	return (
		<div className='chat-container overflow-auto'>
			<div className='wrapper pr-4 relative'>
				<div ref={messageStartRef} className='absolute left-0 top-0 w-full h-screen overflow-hidden'></div>

				{messages.map((message, i) => {
					const previousMessage = i > 0 ? messages[i - 1] : null;
					let variant: 'default' | 'inline' = 'default';

					if (
						previousMessage?.author._id === message.author._id &&
						previousMessage?.sent &&
						message.sent &&
						new Date(message.sent).getTime() - new Date(previousMessage.sent).getTime() < 1 * 60 * 1000 &&
						!message.replyTo
					) {
						variant = 'inline';
					}

					return (
						<Message
							message={message}
							key={i}
							onReplyClick={onReplyClick}
							handleDeleteMessage={handleDeleteMessage}
							isHighlighted={replyingTo === message._id}
							variant={variant}
						/>
					);
				})}
				<div ref={messageEndRef}></div>
			</div>
		</div>
	);
}
