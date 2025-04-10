import { cn } from '@/lib/utils';

export default function UsersOnlineBadge({ usersOnline }: { usersOnline?: number }) {
	return (
		<span className='flex justify-end items-center gap-x-1'>
			<i
				className={cn('online-badge w-2 h-2 rounded-full relative', {
					'bg-green-600 before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:bg-green-400 before:rounded-full before:animate-ping before:duration-1000':
						usersOnline && usersOnline > 0,
					'bg-gray-400': usersOnline === 0,
				})}></i>
			{usersOnline}
		</span>
	);
}
