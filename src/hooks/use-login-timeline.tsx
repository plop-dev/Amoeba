import { useState } from 'react';
import { Mail, Lock, User, Check } from 'lucide-react';

const initialSteps: LoginStatusStep[] = [
	{
		id: 1,
		title: 'Enter Email',
		description: 'Provide your email address',
		icon: Mail,
		status: 'upcoming',
	},
	{
		id: 2,
		title: 'Password',
		description: 'Enter your password',
		icon: Lock,
		status: 'upcoming',
	},
	{
		id: 3,
		title: 'Verify Identity',
		description: 'Complete 2FA if enabled',
		icon: User,
		status: 'upcoming',
	},
	{
		id: 4,
		title: 'Logged In',
		description: 'Successfully authenticated',
		icon: Check,
		status: 'upcoming',
	},
];

export function useLoginTimeline() {
	const [steps, setSteps] = useState<LoginStatusStep[]>(initialSteps);

	const updateStepStatus = (stepId: number, newStatus: LoginStatusStep['status']) => {
		setSteps(prevSteps => prevSteps.map(step => (step.id === stepId ? { ...step, status: newStatus } : step)));
	};

	const resetTimeline = () => {
		setSteps(initialSteps);
	};

	return { steps, updateStepStatus, resetTimeline };
}
