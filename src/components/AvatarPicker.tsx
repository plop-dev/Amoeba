import { useState, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AvatarPicker({ className }: { className?: string }) {
	const [avatar, setAvatar] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast({ title: 'File too large', description: 'Please upload a file smaller than 5MB', variant: 'destructive' });
				return;
			}
			if (!file.type.startsWith('image/')) {
				toast({ title: 'Invalid image', description: 'Only upload image files', variant: 'destructive' });
				return;
			}
			const reader = new FileReader();
			reader.onload = e => {
				setAvatar(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveAvatar = () => {
		setAvatar(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className={cn('flex flex-col items-center gap-y-4 gap-x-4', className)}>
			<Avatar className='size-20'>
				<AvatarImage src={avatar ?? undefined} alt='User avatar' />
				<AvatarFallback>{avatar ? '' : <User></User>}</AvatarFallback>
			</Avatar>
			<div className='flex gap-x-2 gap-y-2'>
				<input type='file' id='uploadPFP' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />
				<label htmlFor='uploadPFP' className={buttonVariants({ variant: 'secondary' }) + ' cursor-pointer'}>
					<Upload className='mr-2 h-4 w-4' />
					Upload
				</label>

				{avatar && (
					<Button onClick={handleRemoveAvatar} variant='outline'>
						<X className='mr-2 h-4 w-4' />
						Remove
					</Button>
				)}
			</div>
		</div>
	);
}
