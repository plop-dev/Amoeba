import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Copy, Laugh, PartyPopper, Reply, Smile, SmilePlus, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/components/UserProfile';
import { UserConstant } from '@/constants/globalUser';
import UserAvatar from '@/components/UserAvatar';
import { useStore } from '@nanostores/react';
import { activeUser as activeUserStore } from '@/stores/User';
import { PUBLIC_API_URL } from 'astro:env/client';

function OptionsButton({
	children,
	variant,
	emoji = false,
	onEmojiClick,
	onClick,
	className,
	disabled,
}: {
	children: React.ReactNode;
	variant: 'default' | 'destructive' | 'ghost' | 'link' | 'outline' | 'secondary';
	emoji?: boolean;
	messageId?: string;
	onEmojiClick?: (emojiName: string) => void;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
}) {
	const handleClick = () => {
		if (React.isValidElement(children) && emoji) {
			const { type } = children;
			let emojiName: Reactions = 'Ban';

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
					emojiName = 'Ban';
			}

			onEmojiClick?.(emojiName);
		}
		onClick?.();
	};

	return (
		<Button variant={variant} onClick={handleClick} className={className} disabled={disabled}>
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

function EmojiReaction({
	emojiName,
	users,
	messageVariant,
	isActive = false,
	onToggle,
}: {
	emojiName: string;
	users: User[] | User['_id'][];
	messageVariant: 'default' | 'inline';
	isActive?: boolean;
	onToggle?: () => void;
}) {
	// Use a single state to track the index of the user profile currently open
	const [openUser, setOpenUser] = useState<number | null>(null);

	return (
		<div
			className={cn('emoji-reaction flex gap-x-2 rounded-lg border border-border items-center transition-colors duration-150', {
				'mb-1': messageVariant === 'inline',
				'!border-primary/75': isActive,
			})}>
			<TooltipProvider delayDuration={500}>
				<Tooltip onOpenChange={open => !open && setOpenUser(null)}>
					<TooltipTrigger asChild>
						<Button
							variant='ghost'
							onClick={onToggle}
							className={cn('flex gap-x-1 items-center px-2 h-7', {
								'bg-primary/10': isActive,
							})}
							size={'default'}>
							<p>{users.length}</p>
							{emojiName === 'Smile' && <Smile className='!size-4' />}
							{emojiName === 'Laugh' && <Laugh className='!size-4' />}
							{emojiName === 'ThumbsUp' && <ThumbsUp className='!size-4' />}
							{emojiName === 'ThumbsDown' && <ThumbsDown className='!size-4' />}
							{emojiName === 'PartyPopper' && <PartyPopper className='!size-4' />}
						</Button>
					</TooltipTrigger>
					<TooltipContent border={true} asChild>
						<div className='flex flex-row gap-x-2'>
							{users.map((user, i) => (
								<UserProfile
									key={i}
									userId={user as User['_id']}
									isOpen={openUser === i}
									openChange={(open: boolean) => {
										setOpenUser(open ? i : openUser === i ? null : openUser);
									}}>
									<div className='cursor-pointer' onClick={() => setOpenUser(i)}>
										<UserAvatar userId={user as User['_id']} />
									</div>
								</UserProfile>
							))}
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

export function Message({
	message,
	onReplyClick,
	handleDeleteMessage,
	isHighlighted,
	variant = 'default',
}: {
	message: Message;
	onReplyClick?: (msgId: string) => void;
	handleDeleteMessage: (msgId: string) => void;
	isHighlighted?: boolean;
	variant?: 'default' | 'inline';
}) {
	const { toast } = useToast();
	const [reactions, setReactions] = useState<Message['reactions']>(
		message.reactions instanceof Map ? message.reactions : new Map(Object.entries(message.reactions || {})),
	);
	const [replyToMessage, setReplyToMessage] = useState<Element | null>(null);
	const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
	const [isProfileOpen, setProfileOpen] = useState(false);
	const [isNextInline, setIsNextInline] = useState(false);
	const [copied, setCopied] = useState<boolean>(false);

	useEffect(() => {
		console.log('is profile open', isProfileOpen);
	}, [isProfileOpen]);

	const messageRef = useRef<HTMLDivElement | null>(null);
	const activeUser = useStore(activeUserStore);

	const handleCopyMessage = async () => {
		try {
			setCopied(true);
			navigator.clipboard.writeText(messageRef.current?.querySelector('.text')?.textContent ?? '');
			setTimeout(() => setCopied(false), 1500);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	useEffect(() => {
		const currentUser = activeUser; // current user
		const userReactionsSet = new Set<string>();

		if (reactions.size === 0) return;
		reactions.forEach((users, emojiName) => {
			if (users.length === 0) {
				console.log('No users for emoji:', emojiName);
				return;
			}
			if (users.some(user => user === currentUser?._id)) {
				userReactionsSet.add(emojiName);
			}
		});

		setUserReactions(userReactionsSet);
	}, [reactions]);

	useEffect(() => {
		if (message.replyTo) {
			const replyMessage = document.querySelector(`.message[data-message-id="${message.replyTo}"]`);
			if (replyMessage) {
				setReplyToMessage(replyMessage);
			}
		}
	}, [message.replyTo]);

	const scrollToReplyTo = () => {
		replyToMessage?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		if (replyToMessage) {
			replyToMessage.classList.add('bg-primary/30', 'duration-500');
			setTimeout(() => {
				replyToMessage.classList.remove('bg-primary/30');
			}, 500);
		}
	};

	const handleAddReaction = async (emojiName: string) => {
		await fetch(`${PUBLIC_API_URL}/msg/${message._id}/reaction/${emojiName}`, { method: 'POST', credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					// well nothing
				} else {
					toast({ title: 'Failed to add reaction', description: data.error, variant: 'destructive' });
				}
			});

		const currentUser = activeUser; // current user

		setReactions(prevReactions => {
			const newReactions = new Map(prevReactions);
			const reactionUsers = newReactions.get(emojiName) || [];
			const hasReacted = reactionUsers.some(user => user === currentUser?._id);

			if (hasReacted) {
				// User is removing their reaction
				const updatedUsers = reactionUsers.filter(user => user !== currentUser?._id);
				if (updatedUsers.length === 0) {
					newReactions.delete(emojiName);
				} else {
					newReactions.set(emojiName, updatedUsers);
				}
				setUserReactions(prev => {
					const newUserReactions = new Set(prev);
					newUserReactions.delete(emojiName);
					return newUserReactions;
				});
			} else {
				// User is adding a reaction
				if (currentUser) {
					newReactions.set(emojiName, [...reactionUsers, currentUser._id]);
				}
				setUserReactions(prev => {
					const newUserReactions = new Set(prev);
					newUserReactions.add(emojiName);
					return newUserReactions;
				});
			}

			return newReactions;
		});

		if (!messageRef.current) return;
		messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	};

	//* Check if the next message is inline
	useEffect(() => {
		const interval = setInterval(() => {
			const nextElem = messageRef.current?.parentElement?.nextElementSibling?.children[0];
			if (nextElem) {
				const inline = nextElem.hasAttribute('data-message-type') && nextElem.getAttribute('data-message-type') === 'inline';
				setIsNextInline(inline);
				clearInterval(interval);
			}
		}, 10);

		return () => clearInterval(interval);
	}, []);

	return (
		<TooltipProvider>
			<Tooltip delayDuration={50}>
				<TooltipTrigger asChild>
					<div className=''>
						{variant !== 'inline' && <Separator orientation='horizontal' className='mt-2'></Separator>}
						{message.replyTo && (
							<div className='reply-to-header cursor-pointer w-max flex items-center h-4 pl-6 gap-x-1 group mt-1' onClick={scrollToReplyTo}>
								<span className='reply-spine'></span>
								{replyToMessage ? (
									<>
										<div className='text-xs text-muted-foreground font-bold group-hover:text-foreground transition flex'>
											{replyToMessage?.getAttribute('data-message-username')}
											<span>:</span>
										</div>
										<div className='text-xs text-muted-foreground group-hover:text-foreground transition'>
											{replyToMessage?.querySelector('.msg-content')?.textContent?.substring(0, 40)}
										</div>
									</>
								) : (
									<div className='text-xs text-muted-foreground font-bold group-hover:text-foreground transition flex'>
										MESSAGE NOT LOADED
									</div>
								)}
							</div>
						)}
						<div
							className={cn('message flex gap-x-4 rounded-lg first:mt-0 transition-colors animate-fade-in animate-duration-300', {
								'bg-primary/20 hover:bg-primary/15': isHighlighted,
								'hover:bg-secondary/50': !isHighlighted,
								'my-1 p-2 items-start': variant === 'default',
								'!pb-0 !mb-0': isNextInline,
								'px-2 items-center': variant === 'inline',
							})}
							ref={messageRef}
							data-message-id={message._id}
							data-message-type={variant}
							data-message-username={message.author.username}>
							<div
								className='avatar cursor-pointer'
								onClick={() => {
									setProfileOpen(true);
								}}>
								{message.author && (
									<UserAvatar userId={message.author._id} className={variant === 'inline' ? 'invisible max-h-0' : undefined} />
								)}
							</div>

							<div className='content flex flex-col w-full overflow-hidden'>
								{variant !== 'inline' && (
									<div className={cn('info flex')}>
										<div className='username'>
											<UserProfile userId={message.author._id} isOpen={isProfileOpen} openChange={setProfileOpen}>
												<Button
													variant='link'
													className='text-base p-0 m-0 h-auto'
													style={{ color: message.author.accentColour }}
													onClick={() => setProfileOpen(true)}>
													@{message.author.username}
												</Button>
											</UserProfile>
										</div>
									</div>
								)}
								<div className='text whitespace-pre-wrap break-words max-w-full overflow-hidden msg-content'>{message.content}</div>

								<div className={cn('reactions flex gap-x-1', reactions.size > 0 ? 'my-1' : '')}>
									{Array.from(reactions).map(([emojiName, users], index) => (
										<EmojiReaction
											key={index}
											messageVariant={variant}
											emojiName={emojiName}
											users={users}
											isActive={userReactions.has(emojiName)}
											onToggle={() => handleAddReaction(emojiName)}
										/>
									))}
								</div>
							</div>

							<div className={cn('dates flex gap-x-8 flex-1 items-end flex-col', { hidden: variant === 'inline' })}>
								<div className=''>{new Date(message.sent).toLocaleTimeString()}</div>
								<div className='text-xs text-muted-foreground'>{new Date(message.sent).toLocaleDateString()}</div>
							</div>
						</div>
					</div>
				</TooltipTrigger>

				<TooltipContent
					border={true}
					className='p-1'
					asChild
					onMouseEnter={() => messageRef.current?.classList.add('bg-secondary/50')}
					onMouseLeave={() => messageRef.current?.classList.remove('bg-secondary/50')}
					onPointerDown={e => {
						e.stopPropagation();
					}}>
					<div className='flex gap-x-1'>
						<ReactionPicker onEmojiClick={handleAddReaction} />
						<OptionsButton variant='outline' messageId={message._id} onClick={() => onReplyClick?.(message._id)}>
							<Reply />
						</OptionsButton>

						<Separator orientation='vertical' className='bg-primary h-full'></Separator>

						<OptionsButton
							variant='outline'
							onClick={handleCopyMessage}
							className='disabled:opacity-100'
							aria-label={copied ? 'Copied' : 'Copy to clipboard'}
							disabled={copied}>
							<div className={cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}>
								<Check className='stroke-emerald-500' size={16} strokeWidth={2} aria-hidden='true' />
							</div>
							<div className={cn('absolute transition-all', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}>
								<Copy size={16} strokeWidth={2} aria-hidden='true' />
							</div>
						</OptionsButton>

						<OptionsButton variant='destructive' onClick={() => handleDeleteMessage(message._id)}>
							<Trash2></Trash2>
						</OptionsButton>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
