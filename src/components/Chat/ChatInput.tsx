import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Upload, SendHorizonal, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { UploadedFile } from '@/components/chat/UploadedFile';
import { cn } from '@/lib/utils';
import '@/styles/animations.css';
import { activeUser as activeUserStore } from '@/stores/User';
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';

export function ChatInput({
	replyingTo,
	onClearReply,
	handleSendMessage,
	activeChannel,
}: {
	replyingTo?: string | null;
	onClearReply?: () => void;
	handleSendMessage: (message: MessageToSend) => void;
	activeChannel?: Channel | null;
}) {
	const { toast } = useToast();
	const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
	const [previews, setPreviews] = useState<FilePreview[]>([]);
	const [closingReply, setClosingReply] = useState(false);
	const [containerHeight, setContainerHeight] = useState('auto');
	const [messageContent, setMessageContent] = useState('');

	const activeUser = useStore(activeUserStore);
	const activeWorkspace = useStore(activeWorkspaceStore);

	// Refs for measuring height
	const typingIndicatorRef = useRef<HTMLDivElement>(null);
	const replyContainerRef = useRef<HTMLDivElement>(null);

	const messageContentRef = useRef<HTMLInputElement>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const editorRef = useRef<HTMLDivElement>(null);

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter') {
			if (!e.shiftKey) {
				e.preventDefault();

				if (messageContent.trim()) {
					handleSend();
					setMessageContent('');
					if (editorRef.current) {
						editorRef.current.innerHTML = '&#8203;';

						// Place cursor at the beginning
						const selection = window.getSelection();
						const range = document.createRange();
						if (selection && editorRef.current.firstChild) {
							range.setStart(editorRef.current.firstChild, 0);
							range.collapse(true);
							selection.removeAllRanges();
							selection.addRange(range);
						}
					}
				}
			}
		}
	};

	const handleContentChange = () => {
		if (editorRef.current) {
			setMessageContent(editorRef.current.innerText.replace('&#8203;', '\n').trim());
		}
	};

	useEffect(() => {
		if (editorRef.current) editorRef.current.innerHTML = '&#8203;';
		editorRef.current?.focus();
	}, []);

	// Handle container height transitions
	useEffect(() => {
		if (replyingTo && !closingReply) {
			// Sum of both heights when replying
			const height = (typingIndicatorRef.current?.offsetHeight || 0) + (replyContainerRef.current?.offsetHeight || 0);
			setContainerHeight(`${height}px`);
		} else if (closingReply) {
			// Just typing indicator height when closing reply
			setContainerHeight(`${typingIndicatorRef.current?.offsetHeight || 0}px`);
		} else {
			// Just typing indicator in normal state
			setContainerHeight(`${typingIndicatorRef.current?.offsetHeight || 0}px`);
		}
	}, [replyingTo, closingReply]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.target;
		const newFiles = input.files ? Array.from(input.files) : [];
		if (newFiles.length === 0) return;

		const filesWithId = newFiles.map(file => ({ id: uuidv4(), file }));

		setFiles(prevFiles => [...prevFiles, ...filesWithId]);

		filesWithId.forEach(({ id, file }) => {
			const reader = new FileReader();
			reader.onload = function (e) {
				setPreviews(prevPreviews => [
					...prevPreviews,
					{
						_id: id,
						src: e.target?.result as string,
						name: file.name,
						extension: file.name.split('.').pop() as string,
						size: file.size,
						onDelete: handleDeleteFile,
					},
				]);
			};

			reader.readAsDataURL(file);
		});

		input.value = '';
	};

	const handleDeleteFile = (id: string) => {
		setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
		setPreviews(prevPreviews => prevPreviews.filter(preview => preview._id !== id));
	};

	const handleClearReply = () => {
		setClosingReply(true);
		setTimeout(() => {
			setClosingReply(false);
			onClearReply?.();
		}, 300);
	};

	const handleSend = () => {
		if (activeUser) {
			if (activeWorkspace && activeChannel && messageContent.trim() !== '') {
				const messageData: MessageToSend = {
					author: activeUser,
					channelId: activeChannel._id,
					content: messageContent,
					sent: new Date(),
					workspaceId: activeWorkspace._id,
					reactions: new Map<string, User[]>(),
					// reactions: new Map([
					// 	['ThumbsUp', [UserConstant, UserConstant2]],
					// 	['ThumbsDown', [UserConstant]],
					// ]),
				};

				handleSendMessage(messageData);
				setMessageContent('');

				if (messageContentRef.current) {
					messageContentRef.current.value = '';
				}
			} else {
				console.error('Error: activeUser, activeWorkspace or activeChannel is not defined');
				console.error('activeUser:', activeUser);
				console.error('activeWorkspace:', activeWorkspace);
				console.error('activeChannel:', activeChannel);
			}
		} else {
			toast({
				title: 'Error',
				description: 'You must be logged in to send a message',
				variant: 'destructive',
			});
		}
	};

	return (
		<>
			{previews.length > 0 && (
				<div className='uploaded-files-container flex rounded-lg border border-border p-4 gap-x-4'>
					{previews.map((file, index) => (
						<UploadedFile key={index} file={file} onDelete={handleDeleteFile} />
					))}
				</div>
			)}

			<div className='input-container grid gap-x-4 grid-cols-[100fr_1fr_5fr] grid-rows-1 align-bottom'>
				<div className=''>
					<div className='animated-container overflow-hidden transition-all duration-100' style={{ height: containerHeight }}>
						{false && (
							<div
								ref={typingIndicatorRef}
								className={cn(
									'typing-indicator sticky top-0 z-40 bg-background h-10 flex items-center gap-2 p-2 text-sm border-2 border-b-0 rounded-b-none rounded-lg',
								)}>
								<span className='font-bold'>plop</span>
								<span>is typing</span>
								<div className='flex items-center'>
									<span className='dot-anim'>•</span>
									<span className='dot-anim'>•</span>
									<span className='dot-anim'>•</span>
								</div>
							</div>
						)}

						{(replyingTo || closingReply) && (
							<div
								ref={replyContainerRef}
								className={cn(
									'replying-to h-10 w-full flex items-center gap-2 p-2 z-0 relative text-sm border-2 border-b-0 rounded-b-none rounded-lg transition-all duration-100 transform',
									closingReply ? 'animate-slideOutDown' : 'animate-slideInUp',
								)}>
								<span className='flex justify-start'>
									Replying to{' '}
									{document
										.querySelector(`.message[data-message-id="${replyingTo}"]`)
										?.getAttribute('data-message-username')
										?.split(' ')[0] || 'Unknown'}
								</span>
								<div className='flex justify-end ml-auto'>
									<X className='cursor-pointer opacity-80' onClick={handleClearReply} />
								</div>
							</div>
						)}
					</div>

					<div
						ref={editorRef}
						contentEditable
						onKeyDown={handleInputKeyDown}
						onInput={handleContentChange}
						aria-placeholder={`Message ${activeChannel?.name}`}
						className={cn(
							`py-[14px] z-50 relative bg-background flex w-full rounded-md border border-input px-3 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
							`break-words whitespace-break-spaces`,
							{
								'relative after:content-[attr(aria-placeholder)] after:text-muted-foreground after:absolute after:top-1/2 after:left-3 after:-translate-y-1/2':
									editorRef.current?.innerText.length === 1,
							},
						)}
					/>
				</div>

				<div className='flex items-end'>
					<input type='file' id='uploadFile' className='hidden' ref={fileInputRef} multiple onChange={handleFileChange} />
					<label htmlFor='uploadFile' className={buttonVariants({ variant: 'outline', size: 'icon' }) + ' p-6 cursor-pointer'}>
						<Upload />
					</label>
				</div>
				<div className='flex items-end'>
					<Button size='icon' className='p-6' onClick={handleSend}>
						<SendHorizonal />
					</Button>
				</div>
			</div>
		</>
	);
}
