import { activeUsers as activeUsersStore } from '@/stores/User';
import { UserProfile } from '@/components/UserProfile';
import { useStore } from '@nanostores/react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import UsersOnlineBadge from '@/components/UsersOnlineBadge';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export function ActiveUsers({ workspaceTitle }: { workspaceTitle: string }) {
	const [activeUsersWorkspace, setActiveUsersWorkspace] = useState<{ workspaceId: string; users: User[] } | null>(null);
	const [loading, setLoading] = useState(true);
	const [isLoadingVisible, setIsLoadingVisible] = useState(true);

	const activeUsers = useStore(activeUsersStore);
	const activeWorkspace = useStore(activeWorkspaceStore);

	useEffect(() => {
		setIsLoadingVisible(true);
		// callback function to call when event triggers
		const onPageLoad = async () => {
			setActiveUsersWorkspace(activeUsers.find(entry => entry.workspaceId === activeWorkspace?._id) ?? null);
			setIsLoadingVisible(false);
			setLoading(false);
		};

		// Check if the page has already loaded
		if (document.readyState === 'complete') {
			setTimeout(() => {
				onPageLoad();
			}, 250);
		} else {
			window.addEventListener('load', onPageLoad, false);
			// Remove the event listener when component unmounts
			return () => window.removeEventListener('load', onPageLoad);
		}
	}, []);

	return (
		<>
			{isLoadingVisible && (
				<div
					className={`absolute inset-0 flex items-center justify-center bg-background z-50 transition-opacity duration-300 ${
						loading ? 'opacity-100' : 'opacity-0'
					}`}>
					<div className='flex flex-col items-center gap-4'>
						<LoaderCircle className='animate-spin'></LoaderCircle>
						<p className='text-sm font-medium'>Loading Users...</p>
					</div>
				</div>
			)}

			<div className='text-sm flex gap-2'>
				<p>Users in {workspaceTitle} online:</p>
				<UsersOnlineBadge usersOnline={activeUsersWorkspace?.users ? activeUsersWorkspace.users.length : 0} />
			</div>

			{(activeUsersWorkspace?.users?.length ?? 0) > 0 && (
				<ScrollArea className='users-online border-border border-2 rounded-lg w-min'>
					<div className='flex flex-col gap-2 p-4 w-min'>
						{activeUsersWorkspace?.users.map((user, index) => (
							<div className='contents' key={index}>
								<UserProfile user={user} contentOnly={true} />
								<Separator></Separator>
							</div>
						))}
					</div>
				</ScrollArea>
			)}
		</>
	);
}
