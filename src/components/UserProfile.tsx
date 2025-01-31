import { formatDate } from '@/utils/formatDate';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Mail, MessageCircle, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserData {
	username: string;
	avatarUrl: string;
	creationDate: Date;
	accentColor: string;
	role: 'admin' | 'user' | 'guest';
	description: string;
}

export function UserProfile({ user }: { user: UserData }) {
	return (
		<HoverCard closeDelay={50000000}>
			<HoverCardTrigger asChild>
				<Button variant='link' className='text-base p-0 text-foreground'>
					@{user.username}
				</Button>
			</HoverCardTrigger>
			<HoverCardContent className='w-80'>
				<div className='flex justify-between space-x-4'>
					<div className='m-auto'>
						<Avatar className='w-14 h-14'>
							<AvatarImage src={user.avatarUrl} />
							<AvatarFallback>{user.username.slice(0, 1).toUpperCase()}</AvatarFallback>
						</Avatar>
					</div>
					<div className='space-y-1'>
						<h4 className='text-sm font-semibold'>@{user.username}</h4>
						<span className='text-sm'>
							{/* <span className='inline-block w-3 h-3 rounded-full mr-1' style={{ backgroundColor: user.accentColor }}></span> */}
							<Badge className={cn(`bg-[${user.accentColor}] bg-[#55d38e]`)}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
						</span>
						<div className='flex items-center pt-2'>
							<CalendarDays className='mr-2 h-4 w-4 opacity-70' />{' '}
							<span className='text-xs text-muted-foreground'>Joined {formatDate(user.creationDate)}</span>
						</div>
					</div>
				</div>
				<div className='mt-4'>
					<p className='text-sm'>{user.description}</p>
				</div>
				<div className='flex mt-4 space-x-2'>
					<Button size='sm' className='flex-1'>
						<UserPlus className='mr-2 h-4 w-4' />
						Follow
					</Button>
					<Button size='sm' variant='outline' className='flex-1'>
						<MessageCircle className='mr-2 h-4 w-4' />
						Message
					</Button>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
