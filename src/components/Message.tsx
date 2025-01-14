import React, { useState } from 'react';
import CustomAvatar from '@/components/custom/CustomAvatar';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Laugh, PartyPopper, Pen, Reply, Smile, SmilePlus, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function OptionsButton({
	children,
	variant,
	emoji = false,
	messageId,
	onEmojiClick,
	onReplyClick,
}: {
	children: React.ReactNode;
	variant: 'default' | 'destructive' | 'ghost' | 'link' | 'outline' | 'secondary';
	emoji?: boolean;
	messageId?: string;
	onEmojiClick?: (emojiName: string) => void;
	onReplyClick?: (messageId: string) => void;
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

		if (onReplyClick && messageId) {
			onReplyClick(messageId);
		}
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
					<OptionsButton variant='outline' emoji onEmojiClick={onEmojiClick}>
						<Smile></Smile>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={onEmojiClick}>
						<Laugh></Laugh>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={onEmojiClick}>
						<ThumbsUp></ThumbsUp>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={onEmojiClick}>
						<ThumbsDown></ThumbsDown>
					</OptionsButton>
					<OptionsButton variant='outline' emoji onEmojiClick={onEmojiClick}>
						<PartyPopper></PartyPopper>
					</OptionsButton>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function EmojiReaction({ emojiName, count }: { emojiName: string; count: number }) {
	return (
		<span className='emoji-reaction flex gap-x-2 rounded-lg border border-border px-2 py-1 items-center'>
			<p>{count}</p>
			{emojiName === 'SmilePlus' && <SmilePlus className='w-4 h-4' />}
			{emojiName === 'Smile' && <Smile className='w-4 h-4' />}
			{emojiName === 'Laugh' && <Laugh className='w-4 h-4' />}
			{emojiName === 'ThumbsUp' && <ThumbsUp className='w-4 h-4' />}
			{emojiName === 'ThumbsDown' && <ThumbsDown className='w-4 h-4' />}
			{emojiName === 'PartyPopper' && <PartyPopper className='w-4 h-4' />}
		</span>
	);
}

export function Message({ messageId, handleReplyTo }: { messageId: string; handleReplyTo: (messageId: string) => void }) {
	const [reactions, setReactions] = useState<{ emojiName: string; count: number }[]>([]);

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
	};

	const date = new Date(Date.now() + Math.random() * 10000000000).toLocaleTimeString();

	return (
		<TooltipProvider delayDuration={50}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className='message flex items-start gap-x-4 my-1 p-2 rounded-lg first:mt-0 hover:bg-secondary/50' data-message-id={messageId}>
						<div className='avatar'>
							<CustomAvatar alt='' fallback='P' src='' />
						</div>
						<div className='content flex flex-col w-full'>
							<div className='info flex'>
								<div className='username'>plop</div>
							</div>
							<div className='text'>hey guys first message</div>

							<div className='reactions flex gap-x-2 mt-1'>
								{reactions.map((reaction, index) => (
									<EmojiReaction key={index} emojiName={reaction.emojiName} count={reaction.count} />
								))}
							</div>
						</div>
						<div className='dates flex gap-x-8 flex-1 items-end flex-col'>
							<div className='sent'>{date}</div>
							<div className='expiry text-xs text-red-900'>{date}</div>
						</div>
					</div>
				</TooltipTrigger>

				<TooltipContent border={true} className='p-1' asChild>
					<div className='flex gap-x-1'>
						<ReactionPicker onEmojiClick={handleAddReaction} />
						<OptionsButton variant='outline' onReplyClick={handleReplyTo} messageId={messageId}>
							<Reply></Reply>
						</OptionsButton>

						<Separator orientation='vertical' className='bg-primary h-full'></Separator>

						<OptionsButton variant='destructive'>
							<Trash2></Trash2>
						</OptionsButton>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
