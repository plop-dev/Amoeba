import { v4 as uuidv4 } from 'uuid';

import { Input } from '@/components/ui/input';
import { Upload, SendHorizonal, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { UploadedFile } from '@/components/Chat/UploadedFile';

export function ChatInput({ replyingTo, onClearReply }: { replyingTo?: string | null; onClearReply?: () => void }) {
	const { toast } = useToast();
	const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
	const [previews, setPreviews] = useState<FilePreview[]>([]);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.target;
		const newFiles = input.files ? Array.from(input.files) : [];
		if (newFiles.length === 0) return;

		const filesWithId = newFiles.map(file => ({ id: uuidv4(), file }));

		setFiles(prevFiles => [...prevFiles, ...filesWithId]);

		filesWithId.forEach(({ id, file }) => {
			const reader = new FileReader();
			reader.onload = function (e) {
				setPreviews(prevPreviews => [
					...prevPreviews,
					{
						id,
						src: e.target?.result as string,
						name: file.name,
						extension: file.name.split('.').pop() as string,
						size: file.size,
						onDelete: handleDeleteFile,
					},
				]);
			};

			reader.readAsDataURL(file);
		});

		input.value = '';
	};

	const handleDeleteFile = (id: string) => {
		setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
		setPreviews(prevPreviews => prevPreviews.filter(preview => preview.id !== id));
	};

	const handleSend = () => {
		console.log('send');
	};

	return (
		<>
			{previews.length > 0 && (
				<div className='uploaded-files-container flex rounded-lg border border-border p-4 gap-x-4'>
					{previews.map((file, index) => (
						<UploadedFile key={index} file={file} onDelete={handleDeleteFile} />
					))}
				</div>
			)}

			{replyingTo && (
				<div className='replying-to flex items-center gap-2 p-2 text-sm bg-muted'>
					<span>Replying to {document.querySelector(`.message[data-message-id="${replyingTo}"]`)?.querySelector('.username')?.textContent}</span>
					<X className='cursor-pointer' onClick={onClearReply} />
				</div>
			)}

			<div className='input-container grid gap-x-4 grid-cols-[100fr_1fr_5fr] grid-rows-1'>
				<Input placeholder='Type message' type='text' className='py-6' />

				<input type='file' id='uploadFile' className='hidden' ref={fileInputRef} multiple onChange={handleFileChange} />
				<label htmlFor='uploadFile' className={buttonVariants({ variant: 'outline', size: 'icon' }) + ' p-6 cursor-pointer'}>
					<Upload />
				</label>

				<Button size='icon' className='p-6' onClick={handleSend}>
					<SendHorizonal />
				</Button>
			</div>
		</>
	);
}
