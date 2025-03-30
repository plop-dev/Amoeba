import { activeUsers as activeUsersStore } from '@/stores/User';
import { UserProfile } from '@/components/UserProfile';
import { useStore } from '@nanostores/react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import UsersOnlineBadge from '@/components/UsersOnlineBadge';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';

export function ActiveUsers({ workspaceTitle }: { workspaceTitle: string }) {
	const activeUsers = useStore(activeUsersStore);
	const activeWorkspace = useStore(activeWorkspaceStore);

	const activeUsersWorkspace = activeUsers.find(entry => entry.workspaceId === activeWorkspace?._id);

	return (
		<>
			<div className='text-sm flex gap-2'>
				<p>Users in {workspaceTitle} online:</p>
				<UsersOnlineBadge usersOnline={activeUsers.length} />
			</div>

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
		</>
	);
}
