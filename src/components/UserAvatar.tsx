import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function UserAvatar({ user, className, size = 8 }: AvatarProps) {
	return (
		<Avatar
			className={cn(
				`rounded-full relative border-2 size-${size}`,
				{
					'border-green-500': user.status === 'online',
					'border-gray-500': user.status === 'offline',
					'border-yellow-500': user.status === 'away',
					'border-red-500': user.status === 'busy',
				},
				className,
			)}>
			<AvatarImage src={user.avatarUrl} alt={user.username.split('')[0].toUpperCase()} />
			<AvatarFallback>{user.username.split('')[0].toUpperCase()}</AvatarFallback>
		</Avatar>
	);
}
