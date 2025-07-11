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

export function NavUser({ user }: { user: User }) {
	const { isMobile, state } = useSidebar();
	const [isVoiceConnected, setIsVoiceConnected] = useState(false);
	const [micMuted, setMicMuted] = useState(false);
	const [isDeafened, setDeafen] = useState(false);
	const [isProfileOpen, setProfileOpen] = useState(false);

	const activeUser = useStore(activeUserStore);
	const currentUser = activeUser || user;

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
							</div>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-semibold'>{currentUser.username}</span>
								<span className='truncate text-xs text-muted-foreground'>{currentUser._id}</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='rounded-lg p-0' side={isMobile ? 'bottom' : 'right'} align='end' sideOffset={4}>
						<UserProfile user={currentUser} isOpen={isProfileOpen} openChange={setProfileOpen} contentOnly={true} userControl={true}></UserProfile>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
