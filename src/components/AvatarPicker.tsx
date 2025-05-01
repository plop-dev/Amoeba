// src/components/AvatarPicker.tsx
import { useState, useRef, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { activeUser } from '@/stores/User';
import { useStore } from '@nanostores/react';
import { humanFileSize } from '@/utils/humanFileSize';

function isBase64Image(str?: string) {
	return !!str && /^data:image\/[a-zA-Z]+;base64,/.test(str);
}

function isValidHttpUrl(str?: string) {
	if (!str) return false;
	try {
		const url = new URL(str);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

function getAvatarSrc(src?: string, userAvatar?: string | null): string | null {
	// if src is the magic placeholder, fall back to the store
	const raw = src === 'ACTIVEUSER.AVATARURL' ? userAvatar : src;
	if (!raw) return null;

	if (isBase64Image(raw)) return raw;
	if (isValidHttpUrl(raw)) return raw;

	return null;
}

export default function AvatarPicker({ className, src, maxSize = 5 * 1024 * 1024, ...htmlProps }: { className?: string; src?: string; maxSize?: number }  & React.HTMLAttributes<HTMLDivElement>) {
	const user = useStore(activeUser);
	const [avatar, setAvatar] = useState<string | null>(getAvatarSrc(src, user?.avatarUrl));
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > maxSize) {
			toast({
				title: 'File too large',
				description: `Please upload a file smaller than ${humanFileSize(maxSize)}`,
				variant: 'destructive',
			});
			return;
		}
		if (!file.type.startsWith('image/')) {
			toast({
				title: 'Invalid image',
				description: 'Only upload image files',
				variant: 'destructive',
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = e => {
			const dataUrl = e.target?.result as string;
			setAvatar(dataUrl);
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveAvatar = () => {
		setAvatar(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	useEffect(() => {
		setAvatar(getAvatarSrc(src, user?.avatarUrl));
	}, [src, user?.avatarUrl]);

	return (
		<div className={cn('flex flex-col items-start gap-4', className)}>
			<Avatar className='size-20'>
				<AvatarImage src={avatar ?? undefined} alt='User avatar' />
				<AvatarFallback>{avatar ? '' : <User />}</AvatarFallback>
			</Avatar>

			<div className='flex gap-2'>
				<input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' id='uploadPFP' />
				<label htmlFor='uploadPFP' className={buttonVariants({ variant: 'default' }) + ' cursor-pointer'}>
					<Upload className='mr-2 h-4 w-4' />
					Upload
				</label>

				{avatar && (
					<Button onClick={handleRemoveAvatar} variant='destructive'>
						<X className='mr-2 h-4 w-4' />
						Remove
					</Button>
				)}
			</div>
		</div>
	);
}
