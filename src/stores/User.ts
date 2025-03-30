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

export function addActiveUser(workspaceId: Workspace['_id'], user: User) {
	const list = activeUsers.get();
	const workspaceEntry = list.find(entry => entry.workspaceId === workspaceId);
	if (workspaceEntry) {
		// Prevent duplicate users if needed
		if (!workspaceEntry.users.some(u => u._id === user._id)) {
			workspaceEntry.users.push(user);
		}
	} else {
		list.push({ workspaceId, users: [user] });
	}
	activeUsers.set(list);
}

export function removeActiveUser(workspaceId: Workspace['_id'], userId: User['_id']) {
	const list = activeUsers.get();
	const workspaceIndex = list.findIndex(entry => entry.workspaceId === workspaceId);
	if (workspaceIndex !== -1) {
		const workspaceEntry = list[workspaceIndex];
		workspaceEntry.users = workspaceEntry.users.filter(user => user._id !== userId);
		// Remove workspace if no users remain
		if (workspaceEntry.users.length === 0) {
			list.splice(workspaceIndex, 1);
		}
		activeUsers.set(list);
	}
}
