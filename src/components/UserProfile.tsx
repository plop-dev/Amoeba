import { formatDate } from '@/utils/formatDate';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, LogOut, Mail, MessageCircle, Phone, Settings, Settings2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import User from '@/constants/globalUser';

export function UserProfile({
	user = User,
	children,
	contentOnly = false,
	userControl = false,
	isOpen = false,
	openChange = () => {},
	key = 0,
	useChildrenAsTrigger = false,
}: {
	user: UserData;
	children?: React.ReactNode;
	contentOnly?: boolean;
	userControl?: boolean;
	isOpen?: boolean;
	openChange?: (isOpen: boolean) => void;
	key?: number;
	useChildrenAsTrigger?: boolean;
}) {
	const content = (
		<>
			<div className='flex justify-between space-x-4' key={key}>
				<div className='m-auto'>
					<UserAvatar user={user} size={16}></UserAvatar>
				</div>
				<div className='space-y-1'>
					<h4 className='text-sm font-semibold'>@{user.username}</h4>
					<span className='text-sm'>
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
			<div className='grid mt-4 gap-x-2 grid-cols-2 grid-rows-1' key={key}>
				{userControl ? (
					<>
						<a href='/dashboard/settings' className='flex flex-1'>
							<Button size='sm' className='flex-1'>
								<Settings className='mr-2 h-4 w-4' />
								Settings
							</Button>
						</a>
						<Button size='sm' variant='outline' className='flex-1'>
							<LogOut className='mr-2 h-4 w-4' />
							Log Out
						</Button>
					</>
				) : (
					<>
						<Button size='sm' className='flex-1'>
							<MessageCircle className='mr-2 h-4 w-4' />
							Message
						</Button>
						<Button size='sm' variant='outline' className='flex-1'>
							<Phone className='mr-2 h-4 w-4'></Phone>
							Call
						</Button>
					</>
				)}
			</div>
		</>
	);

	if (contentOnly) {
		return (
			<div className='w-80 z-50 bg-popover p-4 text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'>
				{content}
			</div>
		);
	} else {
		return (
			<HoverCard open={isOpen} onOpenChange={openChange}>
				<HoverCardTrigger asChild>{children}</HoverCardTrigger>
				<HoverCardContent className='w-80'>{content}</HoverCardContent>
			</HoverCard>
		);
	}
}
