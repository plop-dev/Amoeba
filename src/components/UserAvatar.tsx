import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { statusClasses } from '@/utils/statusClass';

export default function UserAvatar({ user, className, size = 8 }: AvatarProps) {
	const sizeClass: { [key: number]: string } = {
		0: 'size-0',
		2: 'size-2',
		4: 'size-4',
		6: 'size-6',
		8: 'size-8',
		10: 'size-10',
		12: 'size-12',
		14: 'size-14',
		16: 'size-16',
		18: 'size-18',
		20: 'size-20',
		24: 'size-24',
		28: 'size-28',
		32: 'size-32',
		36: 'size-36',
		40: 'size-40',
		44: 'size-44',
		48: 'size-48',
	};

	return (
		<Avatar className={cn(`rounded-full relative border-2 ${sizeClass[size]}`, statusClasses[user.status], className)}>
			<AvatarImage src={user.avatarUrl} alt={user.username.split('')[0].toUpperCase()} />
			<AvatarFallback>{user.username.split('')[0].toUpperCase()}</AvatarFallback>
		</Avatar>
	);
}
