import { persistentAtom } from '@nanostores/persistent';

export const activeUser = persistentAtom<User | null>('activeUser', null, {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function setActiveUser(user: User) {
	activeUser.set(user);
}

export const activeUsers = persistentAtom<User[]>('activeUsers', [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function addActiveUser(user: User) {
	activeUsers.set([...activeUsers.get(), user]);
}

export function removeActiveUser(userId: User['_id']) {
	activeUsers.set(activeUsers.get().filter(user => user._id !== userId));
}
