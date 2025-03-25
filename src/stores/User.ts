import { persistentAtom } from '@nanostores/persistent';

export const activeUser = persistentAtom<User | null>('activeUser', null, {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function setActiveUser(user: User) {
	activeUser.set(user);
}
