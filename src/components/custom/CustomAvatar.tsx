import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';

interface AvatarProps {
	src: string;
	alt: string;
	fallback: string;
	className?: string;
}

const CustomAvatar: React.FC<AvatarProps> = ({ src, alt, fallback, className }) => {
	return (
		<Avatar className={className}>
			<AvatarImage src={src} alt={alt} />
			<AvatarFallback>{fallback}</AvatarFallback>
		</Avatar>
	);
};

export default CustomAvatar;
