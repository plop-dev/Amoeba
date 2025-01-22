import { buttonVariants } from '@/components/ui/button';
import { CustomTooltip } from '@/components/custom/CustomTooltip';
import { Button } from '@/components/ui/button';
import { Upload, SendHorizonal, Trash2 } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { humanFileSize } from '@/utils/humanFileSize';

export function UploadedFile(props: { file: FilePreview; onDelete: (id: string) => void }) {
	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className={'rounded-lg bg-secondary flex items-center justify-center flex-col gap-1 p-2'}>
						<img src={props.file.src} alt={props.file.name} className='rounded-lg max-h-24 min-h-24 aspect-square' />
						<small className='truncate w-[6.5rem]'>{props.file.name}</small>
					</div>
				</TooltipTrigger>

				<TooltipContent border={true}>
					<div className='py-2 flex flex-col gap-y-1'>
						<h3 className='font-semibold'>{props.file.name}</h3>
						<Separator></Separator>
						<p className='text-sm'>Size: {humanFileSize(props.file.size)}</p>
						<p className='text-sm'>Type: {props.file.extension}</p>
						<Button variant='destructive' size='sm' className='w-full' onClick={() => props.onDelete(props.file.id)}>
							Delete
							<Trash2 className='' />
						</Button>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
