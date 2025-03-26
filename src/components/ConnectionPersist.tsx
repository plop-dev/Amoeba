import React, { useEffect } from 'react';
import { EventSource } from 'eventsource';
import { activeUsers as activeUsersStore, activeUser as activeUserStore, addActiveUser, removeActiveUser } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';

export function ConnectionPersist() {
	const activeUser = useStore(activeUserStore);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUsers = useStore(activeUsersStore);

	useEffect(() => {
		if (!activeWorkspace?._id) return;
		const projectEventSource = new EventSource(`http://localhost:8000/${activeWorkspace._id}/`, { withCredentials: true });

		// projectEventSource.onerror = ev => {
		// 	console.log(ev);
		// };

		projectEventSource.addEventListener('message', event => {
			const data: SSEMessage = JSON.parse(event.data);

			if (data.event.author === 'server') {
				if (data.event.type === 'welcome') {
					// console.log('Welcome message received\n');
					// create message, add to container
				}
			} else if (data.event.author === 'client') {
				if (data.event.type === 'status') {
					const userId = data.message._id;
					const status: UserStatus = data.event.variant;

					if (status === 'offline') {
						removeActiveUser(userId);
					} else {
						if (!activeUsers.find(user => user._id === data.message._id)) {
							addActiveUser(data.message);
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

			await fetch(`http://localhost:8000/${activeWorkspace._id}/`, {
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
