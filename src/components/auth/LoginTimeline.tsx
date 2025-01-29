import React from 'react';
import { useStore } from '@nanostores/react';
import { Check, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stepsStore } from '@/stores/LoginTimelineStore';

export default function LoginTimeline({ className }: { className?: string }) {
	const steps = useStore(stepsStore);

	return (
		<div className={cn('w-full mx-auto px-4 py-8', className)}>
			<ol className='flex items-center w-full'>
				{steps.map((step, index) => (
					<li key={step.id} className={cn('flex items-center', index !== steps.length - 1 && 'w-full')}>
						<div className='flex flex-col items-center'>
							<div
								className={cn(
									'flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0',
									step.status === 'complete' && 'bg-green-900',
									step.status === 'current' && 'bg-blue-900',
									step.status === 'upcoming' && 'bg-gray-900',
								)}>
								{step.status === 'complete' ? (
									<Check className='w-5 h-5 text-green-500' />
								) : (
									<step.icon
										className={cn('w-5 h-5', {
											'text-blue-500': step.status === 'current',
											'text-gray-500': step.status === 'upcoming',
										})}></step.icon>
								)}
							</div>
							<div className='mt-2 text-center'>
								<h3
									className={cn(
										'text-sm font-medium',
										step.status === 'complete' && 'text-green-500',
										step.status === 'current' && 'text-blue-500',
										step.status === 'upcoming' && 'text-gray-500',
									)}>
									{step.title}
								</h3>
								<p className='text-xs text-muted-foreground mt-1 hidden sm:block'>{step.description}</p>
							</div>
						</div>
						{index !== steps.length - 1 && (
							<div className={cn('flex-1 h-0.5 mx-2', step.status === 'complete' ? 'bg-green-500' : 'bg-gray-200')}></div>
						)}
					</li>
				))}
			</ol>
		</div>
	);
}
