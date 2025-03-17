import { type FC, type ReactNode } from 'react';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CustomAlertProps {
	title: string;
	description: string;
	icon?: ReactNode;
	variant?: 'default' | 'destructive';
	className?: string;
	animation?: 'none' | 'fadein';
}

export const CustomAlert: FC<CustomAlertProps> = ({
	title,
	description,
	icon = <Terminal className='mr-2' />,
	variant = 'default',
	animation = 'none',
	className = '',
}) => {
	return (
		<Alert variant={variant} animation={animation} className={className}>
			{icon}
			<div>
				<AlertTitle>{title}</AlertTitle>
				<AlertDescription>{description}</AlertDescription>
			</div>
		</Alert>
	);
};
