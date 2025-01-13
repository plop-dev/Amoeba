import { Input } from '@/components/ui/input';
import { Upload, SendHorizonal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';

export function ChatInput() {
	const { toast } = useToast();
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.target;
		const newFiles = input.files ? Array.from(input.files) : [];
		if (newFiles.length === 0) return;

		setFiles(prevFiles => [...prevFiles, ...newFiles]);

		newFiles.forEach(file => {
			const reader = new FileReader();
			reader.onload = function (e) {
				setPreviews(prevPreviews => [...prevPreviews, e.target?.result as string]);
			};

			reader.readAsDataURL(file);
		});

		input.value = '';
	};

	return (
		<div className='container'>
			<div className='input-container grid gap-x-4 grid-cols-[100fr_1fr_5fr] grid-rows-1'>
				<Input placeholder='Type message' type='text' className='py-6' />

				<input type='file' id='uploadFile' className='hidden' ref={fileInputRef} multiple onChange={handleFileChange} />
				<label htmlFor='uploadFile' className={(buttonVariants({ variant: 'outline', size: 'icon' }), 'p-6 cursor-pointer')}>
					<Upload />
				</label>

				<Button size={'icon'} className='p-6' onClick={() => console.log('Submit button clicked')}>
					<SendHorizonal />
				</Button>
			</div>

			{previews.length > 0 && (
				<div className='uploaded-files-container flex rounded-lg border border-border p-4 gap-x-4'>
					{previews.map((src, index) => (
						<img key={index} src={src} alt={`Preview ${index}`} className='rounded-lg max-h-32 min-h-32 aspect-square' />
					))}
				</div>
			)}
		</div>
	);
}
