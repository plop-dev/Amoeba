import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarProps {
	src: string;
	username: string;
	className?: string;
	size?: number;
}

export default function UserAvatar({ src, username, className, size = 8 }: AvatarProps) {
	return (
		<Avatar className={cn(`h-${size} w-${size} rounded-full relative border border-success`, className)}>
			<AvatarImage src={src} alt={username.split('')[0].toUpperCase()} />
			<AvatarFallback>{username.split('')[0].toUpperCase()}</AvatarFallback>
		</Avatar>
	);
}
