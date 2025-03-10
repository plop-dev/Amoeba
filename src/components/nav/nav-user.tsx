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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { UserConstant } from '@/constants/globalUser';

export function NavUser({ user }: { user: User }) {
	const { isMobile, state } = useSidebar();
	const [isVoiceConnected, setIsVoiceConnected] = useState(true);
	const [micMuted, setMicMuted] = useState(false);
	const [isDeafened, setDeafen] = useState(false);
	const [isProfileOpen, setProfileOpen] = useState(false);

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
						<SidebarMenuButton
							onClick={() => setProfileOpen}
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<UserAvatar user={UserConstant}></UserAvatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-semibold'>{user.username}</span>
								<span className='truncate text-xs text-muted-foreground'>{user.id}</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-[--radix-dropdown-menu-trigger-width rounded-lg p-0'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={4}>
						<UserProfile
							user={{
								username: 'plop',
								accentColour: '#55d38e',
								avatarUrl: 'https://maximec.dev/_astro/plop.C6PhQEc1_1CKlOU.webp',
								creationDate: new Date(2024, 1, 30),
								description: 'i code stuff',
								role: 'admin',
								status: 'online',
								id: '02dfjkd023',
							}}
							isOpen={isProfileOpen}
							openChange={setProfileOpen}
							contentOnly={true}
							userControl={true}></UserProfile>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
