import { useState } from 'react';
import { type Content } from '@tiptap/react';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export function BoardPage() {
	const { toast } = useToast();
	const [value, setValue] = useState<Content>('');

	return (
		<>
			<Toaster />
			<TooltipProvider>
				<MinimalTiptapEditor
					value={value}
					onChange={setValue}
					className='w-full h-full'
					editorContentClassName='p-5'
					output='json'
					placeholder='Board [name]...'
					autofocus={true}
					editable={true}
					editorClassName='focus:outline-none'
					onContentError={() => {
						toast({ title: 'Error', description: 'Invalid content', variant: 'destructive' });
					}}
				/>
			</TooltipProvider>
		</>
	);
}
