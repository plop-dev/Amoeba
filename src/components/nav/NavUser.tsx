'use client';

import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	HeadphoneOff,
	Headphones,
	LogOut,
	Mic,
	MicOff,
	PhoneOff,
	ScreenShare,
	Signal,
	Sparkles,
	Undo2,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { useState } from 'react';
import { UserProfile } from '../UserProfile';
import UserAvatar from '../UserAvatar';
import { useStore } from '@nanostores/react';
import { activeUser as activeUserStore } from '@/stores/User';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { statusClasses } from '@/utils/statusClass';
import { updateUserStatus } from '@/utils/statusManager';

export function NavUser({ user }: { user: User }) {
	const { isMobile, state } = useSidebar();
	const [isVoiceConnected, setIsVoiceConnected] = useState(false);
	const [micMuted, setMicMuted] = useState(false);
	const [isDeafened, setDeafen] = useState(false);
	const [isProfileOpen, setProfileOpen] = useState(false);

	const activeUser = useStore(activeUserStore);
	const currentUser = activeUser || user;

	// Handle direct status change from the dropdown
	const handleStatusChange = async (newStatus: UserStatus) => {
		await updateUserStatus(newStatus);
	};

	return (
		<SidebarMenu>
			{isVoiceConnected && state == 'expanded' && (
				<SidebarMenuItem className='bottom-2'>
					<Card className='rounded-lg border-border'>
						<CardHeader className='p-3 pb-0 space-y-1'>
							<CardTitle className='flex items-center gap-x-1'>
								<Signal className='size-4 text-success'></Signal>Voice Connected
							</CardTitle>
							<CardDescription className='flex items-center gap-x-1 text-xs'>
								<p className='text-success'>Connected to:</p>
								<Button variant={'link'} className='p-0 text-muted-foreground text-sm'>
									<a href='/dashboard/vcs/general'>#general</a>
								</Button>
							</CardDescription>
						</CardHeader>
						<CardFooter className='p-2 pt-0 gap-x-1'>
							<Button size={'icon'} variant={'ghost'} className='size-8'>
								<a href='/dashboard/vcs/general'>
									<Undo2></Undo2>
								</a>
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8'>
								<ScreenShare></ScreenShare>
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8' onClick={() => setMicMuted(!micMuted)}>
								{micMuted ? <MicOff></MicOff> : <Mic></Mic>}
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8' onClick={() => setDeafen(!isDeafened)}>
								{isDeafened ? <HeadphoneOff></HeadphoneOff> : <Headphones></Headphones>}
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8 text-destructive' onClick={() => setIsVoiceConnected(false)}>
								<PhoneOff />
							</Button>
						</CardFooter>
					</Card>
				</SidebarMenuItem>
			)}
			{isVoiceConnected && (state == 'collapsed' || isMobile) && (
				<SidebarMenuItem className='bottom-2'>
					<Card className='rounded-lg border-border p-1 pb-0 flex flex-col justify-center items-center gap-y-1'>
						<Signal className='size-4 text-success'></Signal>

						<div className='flex flex-col gap-0'>
							<Button size={'icon'} variant={'ghost'} className='size-8'>
								<a href='/dashboard/vcs/general'>
									<Undo2></Undo2>
								</a>
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8'>
								<ScreenShare></ScreenShare>
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8' onClick={() => setMicMuted(!micMuted)}>
								{micMuted ? <MicOff></MicOff> : <Mic></Mic>}
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8' onClick={() => setDeafen(!isDeafened)}>
								{isDeafened ? <HeadphoneOff></HeadphoneOff> : <Headphones></Headphones>}
							</Button>
							<Button size={'icon'} variant={'ghost'} className='size-8 text-destructive' onClick={() => setIsVoiceConnected(false)}>
								<PhoneOff />
							</Button>
						</div>
					</Card>
				</SidebarMenuItem>
			)}
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<div className='relative'>
								<UserAvatar user={currentUser}></UserAvatar>
								<div
									className={cn(
										'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
										statusClasses[currentUser.status || 'offline'],
									)}></div>
							</div>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-semibold'>{currentUser.username}</span>
								<Badge variant={'outline'} className={cn('w-fit text-[10px] py-0 h-4 px-1.5', statusClasses[currentUser.status || 'offline'])}>
									{(currentUser.status || 'offline').charAt(0).toUpperCase() + (currentUser.status || 'offline').slice(1)}
								</Badge>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-[--radix-dropdown-menu-trigger-width] rounded-lg p-0'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={4}>
						<UserProfile user={currentUser} isOpen={isProfileOpen} openChange={setProfileOpen} contentOnly={true} userControl={true}></UserProfile>

						<DropdownMenuSeparator />
						<DropdownMenuLabel>Set Status</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => handleStatusChange('online')} className='gap-2'>
							<div className={cn('w-2 h-2 rounded-full', 'bg-green-500')}></div>
							Online
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleStatusChange('away')} className='gap-2'>
							<div className={cn('w-2 h-2 rounded-full', 'bg-yellow-500')}></div>
							Away
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleStatusChange('busy')} className='gap-2'>
							<div className={cn('w-2 h-2 rounded-full', 'bg-red-500')}></div>
							Busy
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleStatusChange('offline')} className='gap-2'>
							<div className={cn('w-2 h-2 rounded-full', 'bg-gray-500')}></div>
							Offline
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
