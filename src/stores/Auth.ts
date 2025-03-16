import { atom } from 'nanostores';

export const keyInput = atom('');
export const challenge = atom('');
export const publicKey = atom('');

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
