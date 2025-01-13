import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';

interface AvatarProps {
	src: string;
	alt: string;
	fallback: string;
}

const CustomAvatar: React.FC<AvatarProps> = ({ src, alt, fallback }) => {
	return (
		<Avatar>
			<AvatarImage src={src} alt={alt} />
			<AvatarFallback>{fallback}</AvatarFallback>
		</Avatar>
	);
};

export default CustomAvatar;
