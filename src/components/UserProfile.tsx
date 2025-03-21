import { formatDate } from '@/utils/formatDate';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronsUpDown, LogOut, Mail, MessageCircle, Phone, Settings, Settings2, UserPlus } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import { UserConstant } from '@/constants/globalUser';
import { Separator } from './ui/separator';
import { statusClasses } from '@/utils/statusClass';
import { useToast } from '@/hooks/use-toast';

export function UserProfile({
	user = UserConstant,
	children,
	contentOnly = false,
	userControl = false,
	isOpen = false,
	openChange = () => {},
}: {
	user: User;
	children?: React.ReactNode;
	contentOnly?: boolean;
	userControl?: boolean;
	isOpen?: boolean;
	openChange?: (isOpen: boolean) => void;
}) {
	const { toast } = useToast();
	const [status, setStatus] = useState(user.status);

	useEffect(() => {
		console.log(`Status changed to: ${status}`);
		// add backend call to update user status
	}, [status]);

	const handleStatusChange = (newStatus: UserStatus) => {
		setStatus(newStatus);
		// add backend call to update user status
	};

	const handleLogout = async () => {
		const res = await fetch('http://localhost:8000/auth/logout', {
			method: 'POST',
			credentials: 'include',
		});

		const data = await res.json();
		if (data.success) {
			toast({ title: 'Logged out', description: 'You have been logged out', variant: 'success' });
			window.location.href = '/auth/login';
			setStatus('offline');
		} else {
			toast({ title: 'Error', description: 'An error occurred while logging out', variant: 'destructive' });
		}
	};

	const content = (
		<>
			<div className='grid grid-cols-[5fr,9fr] grid-rows-1 space-x-4'>
				<div className='m-auto'>
					<UserAvatar user={user} size={16}></UserAvatar>
				</div>
				<div className='space-y-1'>
					<h4 className='text-sm font-semibold' style={{ color: user.accentColour }}>
						@{user.username}
						<br></br>
						<span className='text-xs text-muted-foreground'>{user.id}</span>
					</h4>
					<span className='text-sm h-6 flex gap-x-2 items-center'>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Badge variant={'outline'} className={cn('h-6 gap-x-1', statusClasses[status])}>
									{status.charAt(0).toUpperCase() + status.slice(1)}
									<ChevronsUpDown className='size-4 text-muted-foreground'></ChevronsUpDown>
								</Badge>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='!w-24 !min-w-0' sideOffset={10}>
								<DropdownMenuItem onClick={() => handleStatusChange('online')}>
									<Badge variant={'outline'} className={cn('h-6', statusClasses['online'])}>
										Online
									</Badge>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusChange('away')}>
									<Badge variant={'outline'} className={cn('h-6', statusClasses['away'])}>
										Away
									</Badge>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusChange('busy')}>
									<Badge variant={'outline'} className={cn('h-6', statusClasses['busy'])}>
										Busy
									</Badge>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleStatusChange('offline')}>
									<Badge variant={'outline'} className={cn('h-6', statusClasses['offline'])}>
										Offline
									</Badge>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Separator orientation='vertical' className='h-4'></Separator>

						<Badge variant={'outline'} className='h-6'>
							{/* {user.role.charAt(0).toUpperCase() + user.role.slice(1)} */}
							Admin
						</Badge>
					</span>
					<div className='flex items-center pt-2'>
						<CalendarDays className='mr-2 h-4 w-4 opacity-70' />{' '}
						<span className='text-xs text-muted-foreground'>Joined {formatDate(new Date(user.creationDate))}</span>
					</div>
				</div>
			</div>
			<div className='mt-4'>
				<p className='text-sm'>{user.description}</p>
			</div>
			<div className='grid mt-4 gap-x-2 grid-cols-2 grid-rows-1'>
				{userControl ? (
					<>
						<a href='/dashboard/settings' className='flex flex-1'>
							<Button size='sm' className='flex-1'>
								<Settings className='mr-2 h-4 w-4' />
								Settings
							</Button>
						</a>
						<Button size='sm' variant='outline' className='flex-1' onClick={handleLogout}>
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
			<div className='w-80 z-20 bg-popover p-4 text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'>
				{content}
			</div>
		);
	} else {
		return (
			<HoverCard open={isOpen} onOpenChange={openChange} openDelay={10000} closeDelay={10000}>
				<HoverCardTrigger asChild>{children}</HoverCardTrigger>
				<HoverCardContent className='w-80'>{content}</HoverCardContent>
			</HoverCard>
		);
	}
}
