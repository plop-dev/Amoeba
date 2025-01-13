import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TooltipDemo() {
	const [isOpen, setIsOpen] = React.useState(false);

	console.log('TooltipDemo rendered');

	return (
		<TooltipProvider>
			<Tooltip open={isOpen}>
				<TooltipTrigger asChild>
					<Button
						variant='outline'
						onMouseEnter={() => {
							console.log('Mouse entered');
							setIsOpen(true);
						}}
						onMouseLeave={() => {
							console.log('Mouse left');
							setIsOpen(false);
						}}>
						Hover
					</Button>
				</TooltipTrigger>
				<TooltipContent className='bg-secondary text-secondary-foreground p-2 rounded shadow-lg'>
					<p>Add to library</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
