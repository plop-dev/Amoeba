import * as React from 'react';
import { AudioWaveform, Book, CurlyBraces, Droplet, Home, MessageCircle, Settings, TreePine, Worm } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { NavMain } from '@/components/nav/NavMain';
import { NavUser } from '@/components/nav/NavUser';
import { WorkspaceSwitcher } from '@/components/nav/WorkspaceSwitcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useStore } from '@nanostores/react';
import { activeUser as activeUserStore } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { PUBLIC_API_URL } from 'astro:env/client';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	appName: string;
}

export function AppSidebar({ appName, ...props }: AppSidebarProps) {
	const { isMobile, state, toggleSidebar } = useSidebar();
	const [channels, setChannels] = useState<Channel[]>([]);
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [navData, setNavData] = useState<AppSidebarData>();
	const [DBCategories, setDBCategories] = useState<DBCategory[]>([]);

	const activeUser = useStore(activeUserStore);

	const activeWorkspace = useStore(activeWorkspaceStore);

	// load user workspaces
	useEffect(() => {
		if (activeUser)
			fetch(`${PUBLIC_API_URL}/workspaces/${activeUser._id}`, { credentials: 'include' })
				.then(res => res.json())
				.then(data => {
					setWorkspaces(data);
				})
				.catch(err => {
					console.error(err);
				});
		else console.error('No active user found');
	}, [activeUser]);

	// load channels from active workspace
	useEffect(() => {
		if (activeWorkspace && !Object.keys(activeWorkspace).includes('error')) {
			fetch(`${PUBLIC_API_URL}/channels/${activeWorkspace._id}`, { credentials: 'include' })
				.then(res => res.json())
				.then(data => {
					setChannels(data);
				})
				.catch(err => {
					console.error(err);
				});
		} else console.error('No active workspace found');
	}, [activeWorkspace]);

	// load categories from db (keep in mind DBCategories is a 'stripped' down version of Channel type)
	useEffect(() => {
		if (activeWorkspace && !Object.keys(activeWorkspace).includes('error')) {
			fetch(`${PUBLIC_API_URL}/categories/${activeWorkspace._id}`, { credentials: 'include' })
				.then(res => res.json())
				.then(data => {
					setDBCategories(data);
				})
				.catch(err => {
					console.error(err);
				});
		} else console.error('No categories found');
	}, [activeWorkspace]);

	if (!activeUser || !workspaces) {
		document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		fetch(`${PUBLIC_API_URL}/auth/logout`, { credentials: 'include' }).then(() => {
			window.location.href = '/auth/login';
		});
		return null;
	}

	useEffect(() => {
		setNavData({
			user: activeUser,
			workspaces: workspaces,
			channels: channels,
			DBCategories: DBCategories,
		});
	}, [activeUser, workspaces, channels, DBCategories]);

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
				{navData && <WorkspaceSwitcher workspaces={navData.workspaces} />}
			</SidebarHeader>
			<SidebarContent>{navData && <NavMain channels={navData.channels} DBCategories={navData.DBCategories} />}</SidebarContent>
			<SidebarFooter>{navData && <NavUser user={navData.user} />}</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
