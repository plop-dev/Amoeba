import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useImageUpload } from '@/hooks/use-image-upload';
import { ImagePlus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { keyInput, setKeyInput } from '@/stores/Auth';

export function FileUpload({ id }: { id?: string }) {
	const { previewUrl, fileName, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload({
		onUpload: url => console.log('Uploaded file URL:', url),
	});

	const [isDragging, setIsDragging] = useState(false);

	// Wrap the file change event to also read the file as base64.
	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Call the original handler to update previewUrl and fileName.
		handleFileChange(e);

		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// Extract base64 without the Data URL prefix
				const base64 = result.includes(',') ? result.split(',')[1] : result;

				if (id === 'login-key') setKeyInput(base64);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const file = e.dataTransfer.files?.[0];
			if (file) {
				const fakeEvent = {
					target: {
						files: [file],
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;
				onFileChange(fakeEvent);
			}
		},
		[onFileChange],
	);

	return (
		<div className='w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm'>
			<div className='space-y-2'>
				<h3 className='text-lg font-medium'>Key Upload</h3>
				<p className='text-sm text-muted-foreground'>
					Supported formats: <i>Your key</i>
				</p>
			</div>

			<Input type='file' className='hidden' ref={fileInputRef} onChange={onFileChange} />

			{!previewUrl ? (
				<div
					onClick={handleThumbnailClick}
					onDragOver={handleDragOver}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={cn(
						'flex h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted',
						isDragging && 'border-primary/50 bg-primary/5',
					)}>
					<div className='rounded-full bg-background p-3 shadow-sm'>
						<ImagePlus className='h-6 w-6 text-muted-foreground' />
					</div>
					<div className='text-center'>
						<p className='text-sm font-medium'>Click to select</p>
						<p className='text-xs text-muted-foreground'>or drag and drop file here</p>
					</div>
				</div>
			) : (
				<div className='relative'>
					<div className='group relative h-48 overflow-hidden rounded-lg border flex items-center justify-center'>
						<div className='text-center'>
							<p className='text-5xl thicc-text opacity-50'>{fileName?.split('.').pop()?.toUpperCase()}</p>
						</div>
						<div className='absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100' />
					</div>
					{fileName && (
						<div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
							<span className='truncate'>{fileName}</span>
							<button onClick={handleRemove} className='ml-auto rounded-full p-1 hover:bg-muted'>
								<X className='h-4 w-4' />
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
