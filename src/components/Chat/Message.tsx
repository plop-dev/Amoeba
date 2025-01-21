import React, { useRef, useState, useEffect, useCallback } from 'react';
import CustomAvatar from '@/components/custom/CustomAvatar';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Laugh, PartyPopper, Reply, Smile, SmilePlus, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function OptionsButton({
	children,
	variant,
	emoji = false,
	messageId,
	onEmojiClick,
	onClick,
}: {
	children: React.ReactNode;
	variant: 'default' | 'destructive' | 'ghost' | 'link' | 'outline' | 'secondary';
	emoji?: boolean;
	messageId?: string;
	onEmojiClick?: (emojiName: string) => void;
	onClick?: () => void;
}) {
	const handleClick = () => {
		if (React.isValidElement(children) && emoji) {
			const { type } = children;
			let emojiName = '';

			switch (type) {
				case SmilePlus:
					emojiName = 'SmilePlus';
					break;
				case Smile:
					emojiName = 'Smile';
					break;
				case Laugh:
					emojiName = 'Laugh';
					break;
				case ThumbsUp:
					emojiName = 'ThumbsUp';
					break;
				case ThumbsDown:
					emojiName = 'ThumbsDown';
					break;
				case PartyPopper:
					emojiName = 'PartyPopper';
					break;
				default:
					emojiName = 'Unknown';
			}

			onEmojiClick?.(emojiName);
		}
		onClick?.();
	};

	return (
		<Button variant={variant} onClick={handleClick}>
			{children}
		</Button>
	);
}

function ReactionPicker({ onEmojiClick }: { onEmojiClick: (emojiName: string) => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div>
					<OptionsButton variant='outline'>
						<SmilePlus></SmilePlus>
					</OptionsButton>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='p-1'>
				<div className='flex gap-x-1'>
					<OptionsButton variant='outline' emoji onEmojiClick={() => onEmojiClick('Smile')}>
						<Smile></Smile>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={() => onEmojiClick('Laugh')}>
						<Laugh></Laugh>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={() => onEmojiClick('ThumbsUp')}>
						<ThumbsUp></ThumbsUp>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={() => onEmojiClick('ThumbsDown')}>
						<ThumbsDown></ThumbsDown>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={() => onEmojiClick('PartyPopper')}>
						<PartyPopper></PartyPopper>
					</OptionsButton>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function EmojiReaction({ emojiName, count, messageVariant }: { emojiName: string; count: number; messageVariant: 'default' | 'inline' }) {
	const style = 'w-4 h-4';

	return (
		<div
			className={cn(
				'emoji-reaction flex gap-x-2 rounded-lg border border-border px-1 items-center hover:border-primary/75 transition-colors duration-300',
				{
					'mb-1': messageVariant === 'inline',
				},
			)}>
			<TooltipProvider delayDuration={50}>
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='flex gap-x-1 items-center px-2 py-1'>
							<p>{count}</p>
							{emojiName === 'Smile' && <Smile className={style} />}
							{emojiName === 'Laugh' && <Laugh className={style} />}
							{emojiName === 'ThumbsUp' && <ThumbsUp className={style} />}
							{emojiName === 'ThumbsDown' && <ThumbsDown className={style} />}
							{emojiName === 'PartyPopper' && <PartyPopper className={style} />}
						</span>
					</TooltipTrigger>
					<TooltipContent border={true} asChild>
						<div className='flex flex-row gap-x-2'>
							<CustomAvatar alt='P' fallback='P' src='' className='w-8 h-8'></CustomAvatar>
							<CustomAvatar alt='P' fallback='P' src='' className='w-8 h-8'></CustomAvatar>
							<CustomAvatar alt='P' fallback='P' src='' className='w-8 h-8'></CustomAvatar>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

export function Message({
	messageId,
	onReplyClick,
	isHighlighted,
	variant = 'default',
}: {
	messageId: string;
	onReplyClick?: (msgId: string) => void;
	isHighlighted?: boolean;
	variant?: 'default' | 'inline';
}) {
	const { toast } = useToast();
	const [reactions, setReactions] = useState<{ emojiName: string; count: number }[]>([]);
	const messageRef = useRef<HTMLDivElement | null>(null);

	const handleCopyMessage = () => {
		navigator.clipboard.writeText(messageRef.current?.querySelector('.text')?.textContent ?? '');
		toast({ title: 'Message copied to clipboard', variant: 'success' });
	};

	const handleAddReaction = (emojiName: string) => {
		setReactions(prevReactions => {
			const reactionIndex = prevReactions.findIndex(r => r.emojiName === emojiName);
			if (reactionIndex !== -1) {
				const updatedReactions = [...prevReactions];
				updatedReactions[reactionIndex].count += 1;
				return updatedReactions;
			} else {
				return [...prevReactions, { emojiName, count: 1 }];
			}
		});

		if (!messageRef.current) return;
		messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	};

	const date = new Date(Date.now() + Math.random() * 10000000000).toLocaleTimeString();

	return (
		<TooltipProvider delayDuration={50}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={cn('message flex gap-x-4 rounded-lg first:mt-0 transition-colors', {
							'bg-primary/20 hover:bg-primary/15': isHighlighted,
							'hover:bg-secondary/50': !isHighlighted,
							'my-1 p-2 items-start': variant === 'default',
							'!pb-0 !mb-0':
								messageRef.current?.nextElementSibling?.hasAttribute('data-message-type') &&
								messageRef.current?.nextElementSibling?.getAttribute('data-message-type') === 'inline',
							'px-2 items-center': variant === 'inline',
						})}
						ref={messageRef}
						data-message-id={messageId}
						data-message-type={variant}>
						<div className='avatar'>
							<CustomAvatar alt='' fallback='P' src='' className={variant === 'inline' ? 'invisible max-h-0' : undefined} />
						</div>

						<div className='content flex flex-col w-full'>
							<div className={cn('info flex', { hidden: variant === 'inline' })}>
								<div className='username'>plop</div>
							</div>
							<div className='text'>hey guys first message</div>

							<div className='reactions flex gap-x-2 mt-1'>
								{reactions.map((reaction, index) => (
									<EmojiReaction key={index} messageVariant={variant} emojiName={reaction.emojiName} count={reaction.count} />
								))}
							</div>
						</div>

						<div className={cn('dates flex gap-x-8 flex-1 items-end flex-col', { hidden: variant === 'inline' })}>
							<div className='sent'>{date}</div>
							<div className='expiry text-xs text-red-900'>{date}</div>
						</div>
					</div>
				</TooltipTrigger>

				<TooltipContent border={true} className='p-1' asChild>
					<div className='flex gap-x-1'>
						<ReactionPicker onEmojiClick={handleAddReaction} />
						<OptionsButton variant='outline' messageId={messageId} onClick={() => onReplyClick?.(messageId)}>
							<Reply />
						</OptionsButton>

						<Separator orientation='vertical' className='bg-primary h-full'></Separator>

						<OptionsButton variant='outline' onClick={handleCopyMessage}>
							<Copy></Copy>
						</OptionsButton>

						<OptionsButton variant='destructive'>
							<Trash2></Trash2>
						</OptionsButton>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
