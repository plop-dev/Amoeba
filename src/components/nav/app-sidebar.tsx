import * as React from 'react';
import { AudioWaveform, Book, Droplet, MessageCircle, Settings, TreePine, Worm } from 'lucide-react';

import { NavMain } from '@/components/nav/nav-main';
import { NavUser } from '@/components/nav/nav-user';
import { TeamSwitcher } from '@/components/nav/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	appName: string;
}

export function AppSidebar({ appName, ...props }: AppSidebarProps) {
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
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				{/* <video autoPlay muted playsInline loop>
					<source src='https://ia804502.us.archive.org/33/items/GoldenGa1939_3/GoldenGa1939_3_512kb.mp4' type='video/mp4' />
				</video> */}
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
