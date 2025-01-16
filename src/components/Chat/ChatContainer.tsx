import { Message } from '@/components/Chat/Message';
import { useEffect } from 'react';

export function ChatContainer({ handleReply }: { handleReply: (messageId: string) => void }) {
	useEffect(() => {
		const chatContainer = document.querySelector('.chat-container');
		if (chatContainer) {
			chatContainer.scrollTo(0, chatContainer.scrollHeight);
		}
	}, []);

	return (
		<div className='chat-container overflow-auto'>
			<div className='wrapper pr-4'>
				{Array.from({ length: 25 }, (i, j) => {
					return <Message messageId={j.toString()} key={j} handleReplyTo={handleReply} />;
				})}
			</div>
		</div>
	);
}
