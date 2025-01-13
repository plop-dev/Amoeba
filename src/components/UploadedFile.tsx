import { buttonVariants } from '@/components/ui/button';
import { CustomTooltip } from '@/components/custom/CustomTooltip';
import { Button } from '@/components/ui/button';
import { Upload, SendHorizonal, Trash2 } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function UploadedFile(file: { src: string; alt: string }) {
	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className={'rounded-lg bg-secondary flex items-center justify-center flex-col gap-1 p-2'}>
						<img src={file.src} alt={file.alt} className='rounded-lg max-h-24 aspect-square' />
						<small>{file.alt}</small>
					</div>
				</TooltipTrigger>

				<TooltipContent>
					<Button variant={'destructive'}>
						<Trash2 />
					</Button>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
