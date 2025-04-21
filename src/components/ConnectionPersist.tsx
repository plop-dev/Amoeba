import { useEffect, useRef } from 'react';
import { EventSource } from 'eventsource';
import { activeUsers as activeUsersStore, activeUser as activeUserStore, addActiveUser, removeActiveUser, resetActiveUsers } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { updateUserStatus, updateUserInActiveUsers, setupStatusListeners } from '@/utils/statusManager';
import { PUBLIC_API_URL } from 'astro:env/client';

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
		const projectEventSource = new EventSource(`${PUBLIC_API_URL}/sse/${activeWorkspace._id}/`, { withCredentials: true });
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
				} else if (data.event.type === 'welcome') {
					// When a new connection is established, the server sends a welcome event
					console.log('Welcome event received:', data);

					// Announce current user's presence to everyone in the workspace
					if (activeUser) {
						announcePresence(activeWorkspace._id, activeUser);
					}

					// If the welcome message includes active users, sync with them
					if (data.message && Array.isArray(data.message.activeUsers)) {
						console.log("Syncing with server's active users list:", data.message.activeUsers);

						// Reset the workspace's users first to avoid duplicates
						resetActiveUsers(activeWorkspace._id);

						// Add each active user from the server's list
						data.message.activeUsers.forEach((user: User) => {
							if (user._id !== activeUser?._id) {
								// Don't add yourself twice
								addActiveUser(activeWorkspace._id, user);
							}
						});

						// Always add yourself to ensure you're in the list
						if (activeUser) {
							addActiveUser(activeWorkspace._id, activeUser);
						}
					}
				} else if (data.event.type === 'user-joined') {
					// A new user has joined the workspace
					console.log('User joined workspace:', data.message);

					// Add the new user to our active users list if they're not already there
					if (data.message._id !== activeUser?._id) {
						addActiveUser(activeWorkspace._id, data.message);

						// Announce current user's presence to the new user
						if (activeUser) {
							announcePresence(activeWorkspace._id, activeUser);
						}
					}
				}
			} catch (error) {
				console.error('Error processing SSE message:', error);
			}
		});

		// When connection opens, set status to online and announce presence
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

	// Function to announce user presence to the workspace
	const announcePresence = async (workspaceId: string, user: User) => {
		try {
			// Prepare the announcement data
			const data: SSEMessage = {
				event: {
					author: 'client',
					type: 'status',
					variant: user.status || 'online',
				},
				message: user,
			};

			// Send the announcement to the server
			const response = await fetch(`${PUBLIC_API_URL}/workspace/${workspaceId}/`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				console.error('Failed to announce presence:', await response.text());
			}
		} catch (error) {
			console.error('Error announcing presence:', error);
		}
	};

	return <></>;
}
