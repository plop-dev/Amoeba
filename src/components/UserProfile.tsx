import { formatDate } from '@/utils/formatDate';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronsUpDown, LogOut, MessageCircle, Phone, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import { UserConstant } from '@/constants/globalUser';
import { Separator } from './ui/separator';
import { statusClasses } from '@/utils/statusClass';
import { useToast } from '@/hooks/use-toast';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { activeUser as activeUserStore } from '@/stores/User';
import { updateUserStatus } from '@/utils/statusManager';
import { PUBLIC_API_URL } from 'astro:env/client';

export function UserProfile({
	user,
	userId,
	children,
	contentOnly = false,
	userControl = false,
	isOpen = false,
	openChange = () => {},
}: {
	user?: User | null;
	userId?: string;
	children?: React.ReactNode;
	contentOnly?: boolean;
	userControl?: boolean;
	isOpen?: boolean;
	openChange?: (isOpen: boolean) => void;
}) {
	const { toast } = useToast();
	const [fetchedUser, setFetchedUser] = useState<User | null>(null);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUser = useStore(activeUserStore);

	// If a userId is provided but no user object, fetch the user data
	useEffect(() => {
		if (userId && !user) {
			fetch(`${PUBLIC_API_URL}/user/${userId}`, {
				method: 'GET',
				credentials: 'include',
			})
				.then(res => res.json())
				.then((data: User) => {
					setFetchedUser(data);
				})
				.catch(error => {
					console.error('Error fetching user:', error);
				});
		}
	}, [userId, user]);

	// Determine which user to display
	const displayUser = user || fetchedUser || UserConstant;

	// Handle status change initiated by the user
	const handleStatusChange = async (newStatus: UserStatus) => {
		if (!activeUser) return;

		const success = await updateUserStatus(newStatus);

		if (!success) {
			toast({
				title: 'Status update failed',
				description: 'Could not update your status. Please try again.',
				variant: 'destructive',
			});
		}
	};

	// Handle user logout
	const handleLogout = async () => {
		// Set status to offline before logging out
		await updateUserStatus('offline');

		const res = await fetch(`${PUBLIC_API_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		});

		const data = await res.json();
		if (data.success) {
			toast({ title: 'Logged out', description: 'You have been logged out', variant: 'success' });
			window.location.href = '/auth/login';
		} else {
			toast({ title: 'Error', description: 'An error occurred while logging out', variant: 'destructive' });
		}
	};

	const content = (
		<>
			<div className='grid grid-cols-[5fr,9fr] grid-rows-1 space-x-4'>
				<div className='m-auto'>
					{displayUser._id !== activeUser?._id ? (
						<UserAvatar user={displayUser} size={16}></UserAvatar>
					) : (
						<UserAvatar user={activeUser} size={16}></UserAvatar>
					)}
				</div>
				<div className='space-y-1'>
					<h4 className='text-sm font-semibold' style={{ color: displayUser.accentColour }}>
						@{displayUser.username}
						<br></br>
						<span
							className='text-xs text-muted-foreground cursor-pointer'
							onClick={() => {
								navigator.clipboard.writeText(displayUser._id);
								toast({ title: 'User ID copied', description: 'User ID has been copied to clipboard', variant: 'success' });
							}}>
							{displayUser._id}
						</span>
					</h4>
					<span className='text-sm h-6 flex gap-x-2 items-center'>
						{displayUser._id !== activeUser?._id ? (
							<Badge variant={'outline'} className={cn('h-6 gap-x-1', statusClasses[displayUser.status || 'offline'])}>
								{(displayUser.status || 'offline').charAt(0).toUpperCase() + (displayUser.status || 'offline').slice(1)}
							</Badge>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger>
									<Badge variant={'outline'} className={cn('h-6 gap-x-1', statusClasses[activeUser.status || 'offline'])}>
										{(activeUser.status || 'offline').charAt(0).toUpperCase() + (activeUser.status || 'offline').slice(1)}
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
						)}

						<Separator orientation='vertical' className='h-4'></Separator>

						<Badge variant={'outline'} className='h-6'>
							Admin
						</Badge>
					</span>
					<div className='flex items-center pt-2'>
						<CalendarDays className='mr-2 h-4 w-4 opacity-70' />{' '}
						<span className='text-xs text-muted-foreground'>Joined {formatDate(new Date(displayUser.creationDate))}</span>
					</div>
				</div>
			</div>
			<div className='mt-4'>
				<p className='text-sm'>{displayUser.description}</p>
			</div>
			<div className='grid mt-4 gap-x-2 grid-cols-2 grid-rows-1'>
				{userControl ? (
					<>
						<a href={`/${activeWorkspace?._id}/dashboard/settings`} className='flex flex-1'>
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
