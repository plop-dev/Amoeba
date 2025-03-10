import * as React from 'react';
import { AudioWaveform, Book, CurlyBraces, Droplet, Home, MessageCircle, Settings, TreePine, Worm, type LucideProps } from 'lucide-react';
import { useState, useEffect } from 'react';

import { NavMain } from '@/components/nav/nav-main';
import { NavUser } from '@/components/nav/nav-user';
import { TeamSwitcher } from '@/components/nav/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';

// This is sample data.

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	appName: string;
}

export function AppSidebar({ appName, ...props }: AppSidebarProps) {
	const { isMobile, state, toggleSidebar } = useSidebar();
	const [usersConnected, setUsersConnected] = useState(0);

	useEffect(() => {
		function handleUsersConnectedUpdate(e: CustomEvent<{ count: number }>) {
			setUsersConnected(e.detail.count);
		}
		window.addEventListener('usersConnectedUpdate', handleUsersConnectedUpdate as EventListener);
		return () => {
			window.removeEventListener('usersConnectedUpdate', handleUsersConnectedUpdate as EventListener);
		};
	}, []);

	const data: AppSidebarData = {
		user: {
			username: 'plop',
			id: '02dfjkd023',
			avatarUrl: 'https://maximec.dev/_astro/plop.C6PhQEc1_1CKlOU.webp',
			role: 'admin',
			status: 'online',
			accentColour: '#55d38e',
			creationDate: new Date(2024, 1, 30),
			description: 'i code stuff',
		},
		teams: [
			{
				name: 'Project 1',
				logo: TreePine,
				plan: '3 Members',
			},
			{
				name: 'Project 2',
				logo: Droplet,
				plan: '2 Members',
			},
		],
		navMain: [
			{
				title: 'Home',
				url: '/dashboard',
				icon: Home,
			},
			{
				title: 'Chats',
				url: '/dashboard/chats',
				icon: MessageCircle,
				isActive: true,
				canCreate: true,
				items: [
					{
						title: '#general',
						url: '/dashboard/chats/general',
					},
					{
						title: '#off-topic',
						url: '/dashboard/chats/off-topic',
					},
				],
			},
			{
				title: 'VCs',
				url: '/dashboard/vcs',
				icon: AudioWaveform,
				isActive: true,
				canCreate: true,
				items: [
					{
						title: '#general',
						url: '/dashboard/vcs/general',
					},
					{
						title: '#off-topic',
						url: '/dashboard/vcs/off-topic',
					},
				],
			},
			{
				title: 'Boards',
				url: '/dashboard/boards',
				icon: Book,
				isActive: true,
				canCreate: true,
				items: [
					{
						title: '#general',
						url: '/dashboard/boards/general',
						usersOnline: usersConnected,
						userConnected: true,
					},
					{
						title: '#off-topic',
						url: '/dashboard/boards/off-topic',
					},
				],
			},
			{
				title: 'Settings',
				url: '/dashboard/settings',
				icon: Settings,
			},
		],
	};

	return (
		<Sidebar collapsible='icon' {...props} className=''>
			<SidebarHeader className='relative'>
				{isMobile && (
					<div className='absolute top-0 left-0'>
						<Button variant={'outline'} className='aspect-square size-8 p-0 flex items-center justify-center' onClick={toggleSidebar}>
							<CurlyBraces className='w-4 h-4'></CurlyBraces>
						</Button>
					</div>
				)}

				<div className={cn('logo flex items-center h-[calc(3rem-1rem-1px)]', state === 'expanded' && 'px-2')}>
					<Button variant={'outline'} className='aspect-square size-8 p-0 flex items-center justify-center' onClick={toggleSidebar}>
						<CurlyBraces className='w-4 h-4'></CurlyBraces>
					</Button>

					<div
						className={cn('text-lg transition-all overflow-hidden cursor-pointer', state === 'collapsed' ? 'max-w-0' : 'max-w-20 ml-2')}
						onClick={toggleSidebar}>
						<span>{appName}</span>
					</div>
				</div>
				<Separator orientation='horizontal' className='relative -left-full min-w-[100vw] w-screen'></Separator>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
