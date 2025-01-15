import { useState } from 'react';
import { type Content } from '@tiptap/react';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { TooltipProvider } from '@/components/ui/tooltip';

export function BoardPage() {
	const [value, setValue] = useState<Content>('');

	return (
		<TooltipProvider>
			<MinimalTiptapEditor
				value={value}
				onChange={setValue}
				className='w-full'
				editorContentClassName='p-5'
				output='html'
				placeholder='Type your description here...'
				autofocus={true}
				editable={true}
				editorClassName='focus:outline-none'
			/>
		</TooltipProvider>
	);
}
