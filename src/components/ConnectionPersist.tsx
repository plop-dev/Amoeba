import { useEffect, useRef } from 'react';
import { EventSource } from 'eventsource';
import { activeUsers as activeUsersStore, activeUser as activeUserStore, addActiveUser, removeActiveUser, resetActiveUsers } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { updateUserStatus, updateUserInActiveUsers, setupStatusListeners } from '@/utils/statusManager';

export function ConnectionPersist() {
	const activeUser = useStore(activeUserStore);
	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeUsers = useStore(activeUsersStore);
	const eventSourceRef = useRef<EventSource | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Set up global status listeners once on component mount
	useEffect(() => {
		setupStatusListeners();

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!activeWorkspace?._id) return;

		// Close any existing connection before opening a new one
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		// Reset active users when the workspace changes
		resetActiveUsers(activeWorkspace._id);

		// Create new EventSource connection
		const projectEventSource = new EventSource(`http://localhost:8000/sse/${activeWorkspace._id}/`, { withCredentials: true });
		eventSourceRef.current = projectEventSource;

		// Handle incoming messages
		projectEventSource.addEventListener('message', event => {
			try {
				const data: SSEMessage = JSON.parse(event.data);
				console.log('SSE message received:', data);

				if (data.event.type === 'status') {
					const userId = data.message._id;
					const status: UserStatus = data.event.variant;
					console.log(`Status update received for user ${userId}: ${status}`);

					if (status === 'offline') {
						// Remove offline users
						removeActiveUser(activeWorkspace._id, userId);
						console.log(`User ${userId} removed (offline)`);
					} else {
						// If this status update is about the current user and was triggered elsewhere
						// (like another tab/device), make sure local state reflects it
						if (activeUser && userId === activeUser._id && activeUser.status !== status) {
							console.log(`Syncing current user status from server: ${status}`);
							activeUserStore.set({ ...activeUser, status });
						}

						// Update the user in the active users list
						updateUserInActiveUsers(userId, status, activeWorkspace._id);

						// If the user isn't in our list yet, add them
						const workspaceEntry = activeUsers.find(entry => entry.workspaceId === activeWorkspace._id);
						if (!workspaceEntry || !workspaceEntry.users.some(user => user._id === userId)) {
							console.log(`Adding new user ${userId} with status: ${status}`);
							addActiveUser(activeWorkspace._id, data.message);
						}
					}
				}
			} catch (error) {
				console.error('Error processing SSE message:', error);
			}
		});

		// When connection opens, set status to online
		projectEventSource.addEventListener('open', async () => {
			console.log('SSE connection established');
			if (activeUser) {
				await updateUserStatus('online');
			}
		});

		// Handle errors and implement reconnection logic
		projectEventSource.addEventListener('error', error => {
			console.error('SSE connection error:', error);

			// Close the current connection
			projectEventSource.close();
			eventSourceRef.current = null;

			// Attempt to reconnect after a delay
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			reconnectTimeoutRef.current = setTimeout(() => {
				if (activeWorkspace?._id) {
					console.log('Attempting to reconnect SSE...');
					// This will trigger the useEffect again and create a new connection
					activeWorkspaceStore.set({ ...activeWorkspace });
				}
			}, 5000); // Reconnect after 5 seconds
		});

		return () => {
			projectEventSource.close();
			eventSourceRef.current = null;

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
		};
	}, [activeWorkspace?._id]);

	return <></>;
}
