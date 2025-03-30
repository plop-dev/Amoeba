import React, { useEffect } from 'react';
import { EventSource } from 'eventsource';
import { activeUsers as activeUsersStore, activeUser as activeUserStore, addActiveUser, removeActiveUser } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { v4 as uuidv4 } from 'uuid';

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
				// if (data.event.type === 'welcome') {
				// 	console.log(`received welcome message: ${data.message.content}`);
				// 	// Create new welcome message and dispatch a global event so ChatPage can add it
				// 	const welcomeMsg: Message = {
				// 		_id: `welcome-${uuidv4()}`,
				// 		content: data.message,
				// 		author: {
				// 			_id: 'server',
				// 			auth: { keyHash: '', salt: '', iterations: 0 },
				// 			username: 'Server',
				// 			description: '',
				// 			avatarUrl: '',
				// 			creationDate: new Date(),
				// 			accentColour: '#000000',
				// 			status: 'online',
				// 			workspaces: [],
				// 		},
				// 		channelId: 'default', // update if needed
				// 		workspaceId: activeWorkspace._id,
				// 		sent: new Date(),
				// 		reactions: new Map(),
				// 	};
				// 	window.dispatchEvent(new CustomEvent('newMessage', { detail: welcomeMsg }));
				// }
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
							activeUsers.forEach(entry => {
								if (entry.workspaceId === activeWorkspace._id) {
									if (!entry.users.find(user => user._id === data.message._id)) {
										addActiveUser(activeWorkspace._id, data.message);
									}
								}
							});
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
