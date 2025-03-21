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
import { UserConstant } from '@/constants/globalUser';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	appName: string;
}

export function AppSidebar({ appName, ...props }: AppSidebarProps) {
	const { isMobile, state, toggleSidebar } = useSidebar();
	const [navData, setNavData] = useState<AppSidebarData>();

	const userId = window.localStorage.getItem('userId');

	useEffect(() => {
		let retryCount = 0;
		// const retryCountRef = React.useRef(0);
		const MAX_RETRIES = 3;

		const fetchData = async () => {
			try {
				const res = await fetch(`http://localhost:8000/user/${userId}`, { credentials: 'include' });
				const data = await res.json();

				if (data) {
					setNavData(data);
				} else {
					handleRetry();
				}
			} catch (err) {
				console.error(err);
				handleRetry();
			}
		};

		const handleRetry = () => {
			retryCount++;
			if (retryCount < MAX_RETRIES) {
				console.log(`Retrying fetch (${retryCount}/${MAX_RETRIES})...`);
				setTimeout(fetchData, 1000);
			} else {
				console.log('All retries failed, redirecting to logout');
				fetch('http://localhost:8000/auth/logout', { credentials: 'include' });
				window.location.href = '/auth/login';
			}
		};

		fetchData();
	}, []);

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
				{navData && <WorkspaceSwitcher workspace={navData.workspaces} />}
			</SidebarHeader>
			<SidebarContent>{navData && <NavMain channels={navData.channels} />}</SidebarContent>
			<SidebarFooter>{navData && <NavUser user={navData.user} />}</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
