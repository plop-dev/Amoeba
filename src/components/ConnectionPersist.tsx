import { EventSource } from 'eventsource';
import UserConstant from '@/constants/globalUser';

export function ConnectionPersist() {
	const projectEventSource = new EventSource('http://localhost:8000/irish-potatoes/');

	projectEventSource.addEventListener('message', event => {
		const data: SSEMessage = JSON.parse(event.data);

		if (data.event.author === 'server') {
			if (data.event.type === 'welcome') {
				console.log('Welcome message received\n');
				// create message, add to container
			}
		} else if (data.event.author === 'client') {
			if (data.event.type === 'status') {
				const status = data.event.variant;
				console.log(`User ${data.message} is now ${status}\n`);
			}
		}
	});
	projectEventSource.addEventListener('open', async () => {
		const data: SSEMessage = {
			message: UserConstant.id,
			event: {
				author: 'client',
				type: 'status',
				variant: 'online',
			},
		};

		await fetch('http://localhost:8000/irish-potatoes/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		console.log('Connection opened\n');
	});

	return <></>;
}
