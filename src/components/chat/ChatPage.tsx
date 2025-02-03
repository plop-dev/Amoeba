import { ChatContainer } from '@/components/chat/ChatContainer';
import { ChatInput } from '@/components/chat/ChatInput';
import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export function ChatPage() {
	const [loading, setLoading] = useState(true);
	const [isLoadingVisible, setIsLoadingVisible] = useState(true);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	const handleReplyClick = (msgId: string) => {
		setReplyingTo(msgId);
	};

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

	return (
		<div className='container grid grid-cols-[auto] grid-rows-[24fr_1fr] max-h-[calc(100vh-4rem-2rem)] gap-y-4 max-w-full'>
			<ChatContainer replyingTo={replyingTo} onReplyClick={handleReplyClick} />
			<ChatInput replyingTo={replyingTo} onClearReply={() => setReplyingTo(null)} />

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
