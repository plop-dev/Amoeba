import { atom } from 'nanostores';
import { Lock, User, Check } from 'lucide-react';

const initialSteps: LoginStatusStep[] = [
	{ id: 1, title: 'Key', description: 'Provide key', icon: Lock, status: 'current' },
	{ id: 2, title: '2FA', description: 'Complete 2FA', icon: User, status: 'upcoming' },
	{ id: 3, title: 'Logged In', description: 'Authenticated', icon: Check, status: 'upcoming' },
];

export const stepsStore = atom<LoginStatusStep[]>(initialSteps);

export const updateStepStatus = (stepId: number, newStatus: LoginStatusStep['status']) => {
	stepsStore.set(stepsStore.get().map(step => (step.id === stepId ? { ...step, status: newStatus } : step)));
};
