import { useEffect } from 'react';
import { EventSource } from 'eventsource';
import { activeUsers as activeUsersStore, activeUser as activeUserStore, addActiveUser, removeActiveUser, resetActiveUsers } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';

export function ConnectionPersist() {
	const activeUser = useStore(activeUserStore);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUsers = useStore(activeUsersStore);

	useEffect(() => {
		if (!activeWorkspace?._id) return;
		const projectEventSource = new EventSource(`http://localhost:8000/sse/${activeWorkspace._id}/`, { withCredentials: true });

		// reset active users when the workspace changes
		resetActiveUsers(activeWorkspace._id);

		projectEventSource.addEventListener('message', event => {
			const data: SSEMessage = JSON.parse(event.data);

			if (data.event.author === 'server') {
				//? idk
			} else if (data.event.author === 'client') {
				if (data.event.type === 'status') {
					const userId = data.message._id;
					const status: UserStatus = data.event.variant;

					if (status === 'offline') {
						removeActiveUser(activeWorkspace._id, userId);
					} else {
						if (activeUsers.length === 0) {
							addActiveUser(activeWorkspace._id, data.message);
						} else {
							// check if there's an entry for the current workspace
							const workspaceEntry = activeUsers.find(entry => entry.workspaceId === activeWorkspace._id);

							if (workspaceEntry) {
								// entry for workspace exists, check if user is already present
								if (!workspaceEntry.users.find(user => user._id === data.message._id)) {
									addActiveUser(activeWorkspace._id, data.message);
								} else {
									workspaceEntry.users = workspaceEntry.users.map(user => (user._id === data.message._id ? { ...user, status } : user));
								}
							} else {
								addActiveUser(activeWorkspace._id, data.message);
							}
						}
					}
					console.log(`User ${data.message.username} is now ${status}\n`);
				}
			}
		});

		projectEventSource.addEventListener('open', async () => {
			const data: SSEMessage = {
				message: activeUser,
				event: {
					author: 'client',
					type: 'status',
					variant: 'online',
				},
			};

			await fetch(`http://localhost:8000/workspace/${activeWorkspace._id}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(data),
			});
		});

		return () => {
			projectEventSource.close();
		};
	}, [activeWorkspace]);

	return <></>;
}
