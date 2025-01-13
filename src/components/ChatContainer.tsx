import { Message } from './Message.tsx';

export function ChatContainer() {
	return (
		<div className='chat-container overflow-auto'>
			<div className='wrapper pr-4'>
				{Array.from({ length: 25 }, (i, j) => {
					return <Message key={j} />;
				})}
			</div>
		</div>
	);
}
