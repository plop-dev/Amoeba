import { useState } from 'react';
import { type Content } from '@tiptap/react';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export function BoardPage() {
	const { toast } = useToast();
	const [value, setValue] = useState<Content>('');

	return (
		<TooltipProvider>
			<MinimalTiptapEditor
				value={value}
				onChange={setValue}
				className='w-full'
				editorContentClassName='p-5'
				output='json'
				placeholder='Type your description here...'
				autofocus={true}
				editable={true}
				editorClassName='focus:outline-none'
				onContentError={() => {
					toast({ title: 'Error', description: 'Invalid content', variant: 'destructive' });
				}}
			/>
		</TooltipProvider>
	);
}
