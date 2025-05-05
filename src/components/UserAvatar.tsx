import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserConstant } from '@/constants/globalUser';
import { cn } from '@/lib/utils';
import { statusClasses } from '@/utils/statusClass';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { PUBLIC_API_URL } from 'astro:env/client';
import { getCachedUser, setCachedUser } from '@/stores/UserCache';

export default function UserAvatar({ user, userId, className, size = 8 }: AvatarProps) {
	const [userData, setUserData] = useState(user || UserConstant);

	useEffect(() => {
		if (user) {
			setUserData(user);
			// Update cache when direct user data is provided
			setCachedUser(user);
		}
	}, [user]);

	useEffect(() => {
		if (userId && !user) {
			// First check the cache
			const cachedUser = getCachedUser(userId);
			if (cachedUser) {
				setUserData(cachedUser);
				return;
			}

			// If not in cache, fetch user data
			fetch(`${PUBLIC_API_URL}/user/${userId}`, {
				method: 'GET',
				credentials: 'include',
			})
				.then(async res => await res.json())
				.then(data => {
					if (data.data) {
						setUserData(data.data);
						// Update the cache with fresh data
						setCachedUser(data.data);
					}
				});
		}
	}, [userId]);

	const sizeClass: { [key: number]: string } = {
		0: 'size-0',
		2: 'size-2',
		4: 'size-4',
		6: 'size-6',
		8: 'size-8',
		10: 'size-10',
		12: 'size-12',
		14: 'size-14',
		16: 'size-16',
		18: 'size-18',
		20: 'size-20',
		24: 'size-24',
		28: 'size-28',
		32: 'size-32',
		36: 'size-36',
		40: 'size-40',
		44: 'size-44',
		48: 'size-48',
	};

	return (
		<Avatar className={cn(`rounded-full relative border-2 ${sizeClass[size]}`, statusClasses[userData.status], className)}>
			<AvatarImage src={!userData.avatarUrl.trim() ? '#' : userData.avatarUrl} alt={userData.username.split('')[0].toUpperCase()} />
			<AvatarFallback>{userData.username.split('')[0].toUpperCase()}</AvatarFallback>
		</Avatar>
	);
}
