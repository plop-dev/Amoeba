import { atom } from 'nanostores';

const steps: KeyCheckProgressType[] = ['Sending', 'Hashing', 'Comparing', 'Success'];

export const keyCheckProgressStore = atom<KeyCheckProgressType>('Sending');

export function nextStep(): void {
	const currentIndex = steps.indexOf(keyCheckProgressStore.get());
	if (currentIndex < steps.length - 1) {
		keyCheckProgressStore.set(steps[currentIndex + 1]);
	}
}

export function previousStep(): void {
	const currentIndex = steps.indexOf(keyCheckProgressStore.get());
	if (currentIndex > 0) {
		keyCheckProgressStore.set(steps[currentIndex - 1]);
	}
}
