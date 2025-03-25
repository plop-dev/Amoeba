import { EventSource } from 'eventsource';
import { UserConstant } from '@/constants/globalUser';
import { activeUser as activeUserStore, addActiveUser } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';

export function ConnectionPersist() {
	const activeUser = useStore(activeUserStore);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const projectEventSource = new EventSource(`http://localhost:8000/${activeWorkspace?._id}/`, { withCredentials: true });

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
				const status = data.event.variant;

				addActiveUser({ id: userId, status });
				console.log(`User ${data.message} is now ${status}\n`);
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

		await fetch(`http://localhost:8000/${activeWorkspace?._id}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(data),
		});
	});

	return <></>;
}
