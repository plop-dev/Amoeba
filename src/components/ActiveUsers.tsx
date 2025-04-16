import { activeUsers as activeUsersStore } from '@/stores/User';
import { UserProfile } from '@/components/UserProfile';
import { useStore } from '@nanostores/react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import UsersOnlineBadge from '@/components/UsersOnlineBadge';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ActiveUsers({ workspaceTitle }: { workspaceTitle: string }) {
	const [loading, setLoading] = useState(true);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUsers = useStore(activeUsersStore);

	// Find users for the current workspace
	const workspaceUsers = activeUsers.find(entry => entry.workspaceId === activeWorkspace?._id) || { users: [] };

	// Set loading state on initial render
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			{loading && (
				<div className='absolute inset-0 flex items-center justify-center bg-background z-50'>
					<div className='flex flex-col items-center gap-4'>
						<LoaderCircle className='animate-spin' />
						<p className='text-sm font-medium'>Loading Users...</p>
					</div>
				</div>
			)}

			<div className='text-sm flex gap-2'>
				<p>Users in {workspaceTitle} online:</p>
				<UsersOnlineBadge usersOnline={workspaceUsers.users.filter(user => user.status && user.status !== 'offline').length} />
			</div>

			{workspaceUsers.users.length > 0 && (
				<ScrollArea className='users-online border-border border-2 rounded-lg w-min'>
					<div className='flex flex-col gap-2 p-4 w-min'>
						{workspaceUsers.users
							.sort((a, b) => {
								// Sort users by status priority: online > away > busy > offline
								const statusPriority = { online: 0, away: 1, busy: 2, offline: 3 };
								return statusPriority[a.status || 'offline'] - statusPriority[b.status || 'offline'];
							})
							.map((user, index) => (
								<div className='contents' key={user._id || index}>
									<UserProfile user={user} contentOnly={true} />
									{index < workspaceUsers.users.length - 1 && <Separator />}
								</div>
							))}
					</div>
				</ScrollArea>
			)}
		</>
	);
}
