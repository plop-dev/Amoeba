import { useEffect, useState } from 'react';
import { type Content } from '@tiptap/react';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

export function BoardPage({ boardName }: { boardName: string }) {
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [isLoadingVisible, setIsLoadingVisible] = useState(true);
	const [value, setValue] = useState<Content>('');

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
		<TooltipProvider>
			<MinimalTiptapEditor
				value={value}
				onChange={setValue}
				className='w-full h-full'
				editorContentClassName='p-5'
				output='json'
				placeholder={`Start typing in ${boardName}...`}
				autofocus={true}
				editable={true}
				editorClassName='focus:outline-none'
				border={false}
				toolbarClassName='fixed z-50 bg-background w-full shadow-sm'
				onContentError={() => {
					toast({ title: 'Error', description: 'Invalid content', variant: 'destructive' });
				}}
			/>

			{isLoadingVisible && (
				<div
					className={`absolute inset-0 flex items-center justify-center bg-background z-50 transition-opacity duration-300 ${
						loading ? 'opacity-100' : 'opacity-0'
					}`}>
					<div className='flex flex-col items-center gap-4'>
						<LoaderCircle className='animate-spin'></LoaderCircle>
						<p className='text-sm font-medium'>Loading Boards...</p>
					</div>
				</div>
			)}
		</TooltipProvider>
	);
}
