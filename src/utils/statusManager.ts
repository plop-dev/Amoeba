import { atom } from 'nanostores';
import { activeUser, setActiveUser, activeUsers } from '@/stores/User';
import { activeWorkspace } from '@/stores/Workspace';

// Status update queue to prevent race conditions
export const statusUpdateQueue = atom<
	{
		userId: string;
		status: UserStatus;
		timestamp: number;
	}[]
>([]);

/**
 * Updates the user status both locally and on the server
 * @param newStatus - The new status to set
 * @returns Promise that resolves when the status has been updated
 */
export async function updateUserStatus(newStatus: UserStatus): Promise<boolean> {
	try {
		// Get current user and workspace
		const currentUser = activeUser.get();
		const workspace = activeWorkspace.get();

		if (!currentUser || !workspace) {
			console.error('Cannot update status: No active user or workspace');
			return false;
		}

		// Update local state immediately for responsive UI
		const updatedUser = { ...currentUser, status: newStatus };
		setActiveUser(updatedUser);

		// Update in active users list if present
		updateUserInActiveUsers(currentUser._id, newStatus, workspace._id);

		// Prepare data for server
		const data: SSEMessage = {
			event: {
				author: 'client',
				type: 'status',
				variant: newStatus,
			},
			message: updatedUser,
		};

		// Send status update to server
		const response = await fetch(`http://localhost:8000/workspace/${workspace._id}`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		return response.ok;
	} catch (error) {
		console.error('Error updating user status:', error);
		return false;
	}
}

/**
 * Update a user's status in the activeUsers store
 * @param userId - The ID of the user to update
 * @param status - The new status
 * @param workspaceId - The ID of the workspace
 */
export function updateUserInActiveUsers(userId: string, status: UserStatus, workspaceId: string): void {
	const usersList = activeUsers.get();

	// Add status update to queue with timestamp
	statusUpdateQueue.set([
		...statusUpdateQueue.get(),
		{
			userId,
			status,
			timestamp: Date.now(),
		},
	]);

	// Process queue - only keep latest update per user
	const processedUsers = new Set<string>();
	const latestUpdates = statusUpdateQueue
		.get()
		.sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp desc
		.filter(update => {
			if (processedUsers.has(update.userId)) {
				return false;
			}
			processedUsers.add(update.userId);
			return true;
		});

	statusUpdateQueue.set(latestUpdates);

	// Find workspace entry
	const workspaceEntry = usersList.find(entry => entry.workspaceId === workspaceId);

	if (workspaceEntry) {
		// Check if user exists in this workspace
		const userIndex = workspaceEntry.users.findIndex(user => user._id === userId);

		if (userIndex !== -1) {
			// Create a new array with updated user to maintain reactivity
			const updatedUsers = [...workspaceEntry.users];
			updatedUsers[userIndex] = {
				...updatedUsers[userIndex],
				status,
			};

			// Create new array reference for all entries
			const updatedList = usersList.map(entry => (entry.workspaceId === workspaceId ? { ...entry, users: updatedUsers } : entry));

			// Update store with new reference
			activeUsers.set(updatedList);
		}
	}
}

/**
 * Set up listeners for page events to automatically update status
 */
export function setupStatusListeners(): void {
	// Set status to away when tab/window loses focus
	window.addEventListener('blur', () => {
		const currentUser = activeUser.get();
		if (currentUser && currentUser.status === 'online') {
			updateUserStatus('away');
		}
	});

	// Set status back to online when tab/window regains focus
	window.addEventListener('focus', () => {
		const currentUser = activeUser.get();
		if (currentUser && currentUser.status === 'away') {
			updateUserStatus('online');
		}
	});

	// Set user to offline status when leaving/closing the app
	window.addEventListener('beforeunload', () => {
		const currentUser = activeUser.get();
		if (currentUser && currentUser.status !== 'offline') {
			// Use fetch with keepalive to ensure the request completes
			const workspace = activeWorkspace.get();
			if (workspace) {
				const data: SSEMessage = {
					event: {
						author: 'client',
						type: 'status',
						variant: 'offline',
					},
					message: { ...currentUser, status: 'offline' },
				};

				navigator.sendBeacon(`http://localhost:8000/workspace/${workspace._id}`, new Blob([JSON.stringify(data)], { type: 'application/json' }));
			}
		}
	});
}
