import { activeUsers as activeUsersStore } from '@/stores/User';
import { UserProfile } from '@/components/UserProfile';
import { useStore } from '@nanostores/react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import UsersOnlineBadge from '@/components/UsersOnlineBadge';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchActiveUsers } from '@/utils/statusManager';
import { Button } from '@/components/ui/button';
import { activeUser as activeUserStore } from '@/stores/User';

export function ActiveUsers({ workspaceTitle }: { workspaceTitle: string }) {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUsers = useStore(activeUsersStore);
	const activeUser = useStore(activeUserStore);

	// Find users for the current workspace
	const workspaceUsers = activeUsers.find(entry => entry.workspaceId === activeWorkspace?._id) || { users: [] };

	// Initial data fetch and periodic refresh
	useEffect(() => {
		if (!activeWorkspace?._id) return;

		// Initial fetch
		setLoading(true);
		fetchActiveUsers(activeWorkspace._id)
			.then(() => setLoading(false))
			.catch(err => {
				console.error('Failed to fetch active users:', err);
				setLoading(false);
			});

		// Set up periodic refresh
		return;
	}, [activeWorkspace?._id]);

	// Handle manual refresh
	const handleRefresh = async () => {
		if (!activeWorkspace?._id) return;

		setRefreshing(true);
		await fetchActiveUsers(activeWorkspace._id).catch(err => console.error('Error during manual refresh:', err));
		setRefreshing(false);
	};

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

			<div className='text-sm flex justify-between items-center'>
				<div className='flex gap-2 items-center'>
					<p>Users in {workspaceTitle} online:</p>
					<UsersOnlineBadge usersOnline={workspaceUsers.users.filter(user => user.status && user.status !== 'offline').length} />
				</div>
				<Button size='icon' variant='ghost' className='h-6 w-6' onClick={handleRefresh} disabled={refreshing}>
					<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
				</Button>
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
