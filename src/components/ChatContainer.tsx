import { Message } from './Message.tsx';

export function ChatContainer({ handleReply }: { handleReply: (messageId: string) => void }) {
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
