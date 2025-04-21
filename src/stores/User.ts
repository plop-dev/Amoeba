import { persistentAtom } from '@nanostores/persistent';

export const activeUser = persistentAtom<User | null>('activeUser', null, {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function setActiveUser(user: User) {
	activeUser.set(user);
}

export const activeUsers = persistentAtom<{ workspaceId: Workspace['_id']; users: User[] }[]>('activeUsers', [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function resetActiveUsers(workspaceId: Workspace['_id']) {
	const list = activeUsers.get();
	const workspaceIndex = list.findIndex(entry => entry.workspaceId === workspaceId);
	if (workspaceIndex !== -1) {
		list.splice(workspaceIndex, 1);
	}
	activeUsers.set([...list]); // Create new array reference to ensure reactivity
}

export function addActiveUser(workspaceId: Workspace['_id'], user: User) {
	const list = activeUsers.get();
	const workspaceEntry = list.find(entry => entry.workspaceId === workspaceId);

	if (workspaceEntry) {
		// Prevent duplicate users
		const userExists = workspaceEntry.users.some(u => u._id === user._id);

		if (!userExists) {
			// Create new arrays to ensure reactivity
			workspaceEntry.users = [...workspaceEntry.users, user];
			activeUsers.set([...list]);
		} else {
			// Update existing user if found (for status changes)
			const userIndex = workspaceEntry.users.findIndex(u => u._id === user._id);
			if (userIndex !== -1) {
				workspaceEntry.users = [...workspaceEntry.users.slice(0, userIndex), user, ...workspaceEntry.users.slice(userIndex + 1)];
				activeUsers.set([...list]);
			}
		}
	} else {
		// Add new workspace entry with this user
		activeUsers.set([...list, { workspaceId, users: [user] }]);
	}
}

export function removeActiveUser(workspaceId: Workspace['_id'], userId: User['_id']) {
	const list = activeUsers.get();
	const workspaceIndex = list.findIndex(entry => entry.workspaceId === workspaceId);

	if (workspaceIndex !== -1) {
		const workspaceEntry = list[workspaceIndex];
		workspaceEntry.users = workspaceEntry.users.filter(user => user._id !== userId);

		// Create a new reference for the modified workspace entry
		list[workspaceIndex] = { ...workspaceEntry };

		// Remove workspace entry if no users remain
		if (workspaceEntry.users.length === 0) {
			list.splice(workspaceIndex, 1);
		}

		// Set with new array to trigger reactivity
		activeUsers.set([...list]);
	}
}

/**
 * Get all online users for a specific workspace
 * @param workspaceId The workspace ID to get users for
 * @returns Array of users in the specified workspace
 */
export function getWorkspaceUsers(workspaceId: Workspace['_id']): User[] {
	const list = activeUsers.get();
	const workspaceEntry = list.find(entry => entry.workspaceId === workspaceId);
	return workspaceEntry?.users || [];
}

/**
 * Manually synchronize the status of all users in a workspace
 * @param workspaceId The workspace ID
 * @param users The list of users with current statuses
 */
export function syncWorkspaceUsers(workspaceId: Workspace['_id'], users: User[]) {
	// First remove workspace entry if it exists
	const list = activeUsers.get();
	const filteredList = list.filter(entry => entry.workspaceId !== workspaceId);

	// Then add it back with the new users
	if (users.length > 0) {
		filteredList.push({ workspaceId, users });
	}

	activeUsers.set(filteredList);
}
