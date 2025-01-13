import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ReactElement } from 'react';

export function CustomTooltip(props: { trigger?: any; content?: any; delay?: number }) {
	return (
		<TooltipProvider delayDuration={props.delay}>
			<Tooltip>
				<TooltipTrigger asChild>
					<span>{props.trigger}</span>
				</TooltipTrigger>
				<TooltipContent>{props.content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
