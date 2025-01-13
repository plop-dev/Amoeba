import CustomAvatar from '@/components/custom/CustomAvatar';
import { useEffect } from 'react';

export function Message() {
	const date = new Date(Date.now() + Math.random() * 10000000000).toLocaleTimeString();

	return (
		<div className='message flex items-start gap-x-4 my-4 first:mt-0'>
			<div className='avatar'>
				<CustomAvatar alt='' fallback='P' src='' />
			</div>
			<div className='content flex flex-col w-full'>
				<div className='info flex'>
					<div className='username'>plop</div>
				</div>
				<div className='text'>hey guys first message</div>
			</div>
			<div className='dates flex gap-x-8 flex-1 items-end flex-col'>
				<div className='sent'>{date}</div>
				<div className='expiry text-xs text-red-900'>36:23:02</div>
			</div>
		</div>
	);
}
