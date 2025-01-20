import * as React from 'react';
import { AudioWaveform, Book, CurlyBraces, Droplet, MessageCircle, Settings, TreePine, Worm } from 'lucide-react';

import { NavMain } from '@/components/nav/nav-main';
import { NavUser } from '@/components/nav/nav-user';
import { TeamSwitcher } from '@/components/nav/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// This is sample data.

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	appName: string;
}

export function AppSidebar({ appName, ...props }: AppSidebarProps) {
	const { isMobile, state, toggleSidebar } = useSidebar();

	const data = {
		user: {
			name: 'plop',
			id: '02dfjkd023',
			avatar: '',
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
				title: 'Chats',
				url: '/dashboard/chats',
				icon: MessageCircle,
				isActive: true,
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
				items: [
					{
						title: '#general',
						url: '/dashboard/boards/general',
						usersOnline: 3,
					},
					{
						title: '#off-topic',
						url: '/dashboard/boards/off-topic',
					},
				],
			},
			{
				title: 'Ned',
				url: '/dashboard/ned',
				icon: Worm,
				items: [
					{
						title: 'Control Centre',
						url: '/dashboard/ned/control-centre',
					},
					{
						title: 'Stats',
						url: '/dashboard/ned/stats',
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
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader className='relative'>
				<div className={cn('logo flex items-center', state === 'expanded' && 'px-2')}>
					<Button variant={'outline'} className='aspect-square size-8 p-0 flex items-center justify-center' onClick={toggleSidebar}>
						<CurlyBraces className='w-4 h-4'></CurlyBraces>
					</Button>

					<div
						className={cn('text-lg transition-all overflow-hidden cursor-pointer', state === 'collapsed' ? 'max-w-0' : 'max-w-20 ml-2')}
						onClick={toggleSidebar}>
						<span>{appName}</span>
					</div>
				</div>
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
