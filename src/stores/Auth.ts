import { atom } from 'nanostores';

export const keyInput = atom('');
export const challenge = atom('');
export const publicKey = atom('');
export const userId = atom('');

// Functions to update stores
export function setKeyInput(value: string) {
	keyInput.set(value);
}

export function setChallenge(value: string) {
	challenge.set(value);
}

export function setPublicKey(value: string) {
	publicKey.set(value);
}

export function setUserId(value: string) {
	userId.set(value);
}
