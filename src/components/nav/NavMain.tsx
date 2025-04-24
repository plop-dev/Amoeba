import { ChevronRight, Home, Pencil, Plus, Settings2, Users, MoreHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { activeWorkspace, activeWorkspace as activeWorkspaceStore, setActiveWorkspace } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { Icon, IconPicker, type IconName } from '@/components/ui/icon-picker';
import { activeChannel as activeChannelStore } from '@/stores/Channel';
import { Textarea } from '@/components/ui/textarea';
import { activeUser as activeUserStore } from '@/stores/User';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils/formatDate';
import { validateObjectId } from '@/utils/validateObjectId';
import { PUBLIC_API_URL } from 'astro:env/client';
import { Badge } from '../ui/badge';
import { roleClasses } from '@/utils/statusClass';

function ChannelDialog(props: {
	children: React.ReactNode;
	category: Category;
	mode: 'create' | 'edit';
	channel?: Channel;
	className?: string;
	onChannelCreated?: (channel: Channel) => void;
	onChannelUpdated?: (channel: Channel) => void;
	onChannelDeleted?: (channelId: string) => void;
}) {
	const { toast } = useToast();
	const { mode, category, channel } = props;
	const isEditMode = mode === 'edit';

	const formSchema = z.object({
		channelName: z
			.string()
			.min(2, { message: 'Channel name must be at least 2 characters.' })
			.max(20, { message: 'Channel name must be at most 20 characters.' }),
		channelDescription: z.string().max(300, { message: 'Channel description must be at most 300 characters.' }).optional(),
		channelType: z.enum(['chat', 'voice', 'board']),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			channelName: isEditMode ? channel?.name || '' : 'New Text Channel',
			channelDescription: isEditMode ? channel?.description || '' : '',
			channelType: isEditMode ? channel?.type || 'chat' : 'chat',
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (isEditMode && channel) {
			// Update existing channel
			await fetch(`${PUBLIC_API_URL}/channel/update/${channel._id}`, {
				method: 'POST',
				body: JSON.stringify(values),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${values.channelName} channel updated`,
							description: `Channel ${values.channelName} updated successfully.`,
							variant: 'success',
						});
						props.onChannelUpdated?.(res.data);
					}
				});
		} else {
			// Create new channel
			const updatedValues = {
				...values,
				categoryId: category._id,
				members: [activeUserStore.get()?._id],
				workspaceId: activeWorkspaceStore.get()?._id,
			};

			await fetch(`${PUBLIC_API_URL}/channel/new`, {
				method: 'POST',
				body: JSON.stringify(updatedValues),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${values.channelName} channel created`,
							description: `Channel ${values.channelName} created successfully.`,
							variant: 'success',
						});
						props.onChannelCreated?.(res.data);
					}
				});
		}
	}

	async function handleDeleteChannel() {
		if (isEditMode && channel) {
			await fetch(`${PUBLIC_API_URL}/channel/delete/${channel._id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${channel.name} channel deleted`,
							description: `Channel ${channel.name} deleted successfully.`,
							variant: 'success',
						});
						props.onChannelDeleted?.(channel._id);
					} else {
						toast({
							title: 'Error',
							description: res.message || 'Failed to delete channel.',
							variant: 'destructive',
						});
					}
				})
				.catch(err => {
					toast({
						title: 'Error',
						description: 'Failed to delete channel.',
						variant: 'destructive',
					});
				});
		}
	}

	const title = isEditMode ? `Edit ${channel?.name} Channel` : `New Channel in ${category.name}`;

	const description = isEditMode ? 'Edit the details of this channel.' : `This will create a new channel in ${category.name}. Fill in all fields below.`;

	const actionText = isEditMode ? 'Update' : 'Create';

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild className={props.className}>
				{props.children}
			</AlertDialogTrigger>
			<AlertDialogContent
				onClick={e => {
					e.stopPropagation();
				}}>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<AlertDialogHeader>
							<AlertDialogTitle>{title}</AlertDialogTitle>
							<AlertDialogDescription className='flex flex-col gap-y-3'>
								<span>{description}</span>
							</AlertDialogDescription>
							<FormField
								control={form.control}
								name='channelName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Channel Name</FormLabel>
										<FormControl>
											<Input placeholder='general' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='channelDescription'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Channel Description</FormLabel>
										<FormControl>
											<Textarea placeholder='Enter channel description...' {...field}></Textarea>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{!isEditMode && (
								<FormField
									control={form.control}
									name='channelType'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Channel Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder='Select a channel type' />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value='chat'>Chat</SelectItem>
													<SelectItem value='voice'>Voice</SelectItem>
													<SelectItem value='board'>Board</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</AlertDialogHeader>
						<AlertDialogFooter className='justify-between'>
							{isEditMode && (
								<Button type='button' variant='destructive' onClick={handleDeleteChannel}>
									Delete Channel
								</Button>
							)}
							<div className='flex space-x-2'>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction type='submit'>{actionText}</AlertDialogAction>
							</div>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function CategoryDialog(props: {
	children: React.ReactNode;
	className?: string;
	mode: 'create' | 'edit';
	category?: Category;
	onCategoryCreated?: (category: Category) => void;
	onCategoryUpdated?: (category: Category) => void;
	onCategoryDeleted?: (categoryId: string) => void;
}) {
	const { toast } = useToast();
	const { mode, category } = props;
	const isEditMode = mode === 'edit';
	const [categoryIcon, setCategoryIcon] = useState<IconName>(isEditMode ? (category?.icon as IconName) || 'list' : 'list');

	const formSchema = z.object({
		categoryName: z
			.string()
			.min(2, { message: 'Category name must be at least 2 characters.' })
			.max(20, { message: 'Category name must be at most 20 characters.' }),
		categoryIcon: z.custom<IconName>().optional(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			categoryName: isEditMode ? category?.name || '' : 'New Category',
			categoryIcon: isEditMode ? (category?.icon as IconName) || 'list' : 'list',
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// merge the state value for categoryIcon into form values
		const updatedValues = { ...values, categoryIcon };

		if (isEditMode && category) {
			// Update existing category
			await fetch(`${PUBLIC_API_URL}/category/update/${category._id}`, {
				method: 'POST',
				body: JSON.stringify(updatedValues),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${updatedValues.categoryName} category updated`,
							description: `Category ${updatedValues.categoryName} updated successfully.`,
							variant: 'success',
						});
						props.onCategoryUpdated?.(res.data);
					}
				});
		} else {
			// Create new category
			const newCategoryData = {
				...updatedValues,
				workspaceId: activeWorkspaceStore.get()?._id,
			};

			await fetch(`${PUBLIC_API_URL}/category/new`, {
				method: 'POST',
				body: JSON.stringify(newCategoryData),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${updatedValues.categoryName} category created`,
							description: `Category ${updatedValues.categoryName} created successfully.`,
							variant: 'success',
						});
						props.onCategoryCreated?.(res.data);
					}
				});
		}
	}

	async function handleDeleteCategory() {
		if (isEditMode && category) {
			await fetch(`${PUBLIC_API_URL}/category/delete/${category._id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${category.name} category deleted`,
							description: `Category ${category.name} deleted successfully.`,
							variant: 'success',
						});
						props.onCategoryDeleted?.(category._id);
					} else {
						toast({
							title: 'Error',
							description: res.message || 'Failed to delete category.',
							variant: 'destructive',
						});
					}
				})
				.catch(err => {
					toast({
						title: 'Error',
						description: 'Failed to delete category.',
						variant: 'destructive',
					});
				});
		}
	}

	const title = isEditMode ? `Edit ${category?.name} Category` : 'Create New Category';
	const description = isEditMode ? 'Edit the name and icon of this category.' : 'Create a new category for organizing channels.';
	const actionText = isEditMode ? 'Update' : 'Create';

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild className={props.className}>
				{props.children}
			</AlertDialogTrigger>
			<AlertDialogContent
				onClick={e => {
					e.stopPropagation();
				}}>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<AlertDialogHeader>
							<AlertDialogTitle>{title}</AlertDialogTitle>
							<AlertDialogDescription className='flex flex-col gap-y-3'>
								<span>{description}</span>
							</AlertDialogDescription>
							<FormField
								control={form.control}
								name='categoryName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category Name</FormLabel>
										<FormControl>
											<Input placeholder='Chats' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='categoryIcon'
								render={({ field }) => (
									<FormItem className='flex flex-col gap-y-2'>
										<FormLabel>Category Icon</FormLabel>
										<FormControl>
											<IconPicker
												className='w-max'
												value={(field.value as IconName) || categoryIcon}
												defaultValue={categoryIcon}
												onValueChange={(value: IconName) => {
													field.onChange(value);
													setCategoryIcon(value);
												}}></IconPicker>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</AlertDialogHeader>
						<AlertDialogFooter className='justify-between'>
							{isEditMode && (
								<Button type='button' variant='destructive' onClick={handleDeleteCategory}>
									Delete Category
								</Button>
							)}
							<div className='flex space-x-2'>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction type='submit'>{actionText}</AlertDialogAction>
							</div>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function WorkspaceDialog(props: {
	children: React.ReactNode;
	className?: string;
	mode: 'create' | 'edit';
	workspace?: Workspace;
	onWorkspaceCreated?: (workspace: Workspace) => void;
	onWorkspaceUpdated?: (workspace: Workspace) => void;
	onWorkspaceDeleted?: (workspaceId: string, nextWorkspace: Workspace) => void;
}) {
	const { toast } = useToast();
	const { mode, workspace: workspace } = props;
	const isEditMode = mode === 'edit';
	const [workspaceIcon, setWorkspaceIcon] = useState<IconName>(isEditMode ? (workspace?.icon as IconName) || 'message-square' : 'message-square');
	const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceUser[]>();
	const activeWorkspace = useStore(activeWorkspaceStore);

	useEffect(() => {
		fetch(`${PUBLIC_API_URL}/workspace/users/${activeWorkspace?._id}`, { credentials: 'include' })
			.then(res => res.json())
			.then(res => {
				if (res.success) {
					setWorkspaceMembers(res.data);
				} else {
					toast({
						title: 'Error',
						description: res.message || 'Failed to fetch workspace members.',
						variant: 'destructive',
					});
				}
			});
	}, [activeWorkspace]);

	const formSchema = z.object({
		workspaceName: z
			.string()
			.min(2, { message: 'Workspace name must be at least 2 characters.' })
			.max(20, { message: 'Workspace name must be at most 20 characters.' }),
		workspaceIcon: z.string().optional(),
		workspaceMembers: z
			.array(
				z.object({
					userId: z.string().refine(val => validateObjectId(val), {
						message: 'Invalid user ID format',
					}),
					role: z.enum(['owner', 'admin', 'member']),
					dateJoined: z.union([z.date(), z.string().transform(val => new Date(val))]),
				}),
			)
			.optional(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			workspaceName: isEditMode ? workspace?.name || '' : 'New Workspace',
			workspaceIcon: isEditMode ? (workspace?.icon as IconName) || 'message-square' : 'message-square',
			workspaceMembers: isEditMode
				? workspace?.members?.map(member => ({
						...member,
						dateJoined: new Date(member.dateJoined),
						role: member.role,
				  })) || []
				: [{ userId: activeUserStore.get()?._id || '', role: 'admin', dateJoined: new Date() }],
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			// merge the state value for workspaceIcon into form values
			const updatedValues = { ...values, workspaceIcon };

			if (isEditMode && workspace) {
				// Update existing workspace
				await fetch(`${PUBLIC_API_URL}/workspace/update/${workspace._id}`, {
					method: 'POST',
					body: JSON.stringify(updatedValues),
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
				})
					.then(res => res.json())
					.then(res => {
						if (res.success) {
							toast({
								title: `${updatedValues.workspaceName} workspace updated`,
								description: `Workspace ${updatedValues.workspaceName} updated successfully.`,
								variant: 'success',
							});
							props.onWorkspaceUpdated?.(res.data);
						} else {
							toast({
								title: 'Update failed',
								description: res.message || 'Failed to update workspace.',
								variant: 'destructive',
							});
						}
					});
			} else {
				// Create new workspace
				const newWorkspaceData = {
					...updatedValues,
				};

				await fetch(`${PUBLIC_API_URL}/workspace/new`, {
					method: 'POST',
					body: JSON.stringify(newWorkspaceData),
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
				})
					.then(res => res.json())
					.then(res => {
						if (res.success) {
							toast({
								title: `${updatedValues.workspaceName} workspace created`,
								description: `Workspace ${updatedValues.workspaceName} created successfully.`,
								variant: 'success',
							});
							props.onWorkspaceCreated?.(res.data);
						} else {
							toast({
								title: 'Creation failed',
								description: res.message || 'Failed to create workspace.',
								variant: 'destructive',
							});
						}
					});
			}
		} catch (error) {
			console.error('Form submission error:', error);
			toast({
				title: 'Form Error',
				description: 'There was a problem with your submission. Please check the form for errors.',
				variant: 'destructive',
			});
		}
	}

	async function handleDeleteWorkspace() {
		if (isEditMode && workspace) {
			await fetch(`${PUBLIC_API_URL}/workspace/delete/${workspace._id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
				.then(res => res.json())
				.then(res => {
					if (res.success) {
						toast({
							title: `${workspace.name} workspace deleted`,
							description: `Category ${workspace.name} deleted successfully.`,
							variant: 'success',
						});

						// backend should return (in res.data) another workspace the user is in,
						// otherwise null if the user is not in any more workspaces
						props.onWorkspaceDeleted?.(workspace._id, res.data);
					} else {
						toast({
							title: 'Error',
							description: res.message || 'Failed to delete workspace.',
							variant: 'destructive',
						});
					}
				})
				.catch(err => {
					console.error(err);
					toast({
						title: 'Error',
						description: 'Failed to delete workspace.',
						variant: 'destructive',
					});
				});
		}
	}

	const title = isEditMode ? `Edit ${workspace?.name} Workspace` : 'Create New Workspace';
	const description = isEditMode
		? 'Edit the name, icon and members of this workspace.'
		: 'Create a new workspace where you can create channels and invite members.';
	const actionText = isEditMode ? 'Update' : 'Create';

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild className={props.className}>
				{props.children}
			</AlertDialogTrigger>
			<AlertDialogContent
				onClick={e => {
					e.stopPropagation();
				}}
				className='max-w-[60vw]'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-y-4'>
						<AlertDialogHeader>
							<AlertDialogTitle>{title}</AlertDialogTitle>
							<AlertDialogDescription className='flex flex-col gap-y-3'>
								<span>{description}</span>
							</AlertDialogDescription>
							<FormField
								control={form.control}
								name='workspaceName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Workspace Name</FormLabel>
										<FormControl>
											<Input placeholder='New Workspace' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='workspaceIcon'
								render={({ field }) => (
									<FormItem className=''>
										<FormLabel>Workspace Icon</FormLabel>
										<FormControl>
											<IconPicker
												className='w-max'
												{...field}
												value={field.value as IconName}
												defaultValue={workspaceIcon}
												onValueChange={(value: IconName) => {
													field.onChange(value);
													setWorkspaceIcon(value);
												}}></IconPicker>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='workspaceMembers'
								render={({ field }) => {
									const [newUserId, setNewUserId] = useState<string>('');

									type AddUserEvent = React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>;

									const handleAddUser = async (e: AddUserEvent): Promise<void> => {
										e.preventDefault();

										if (!newUserId.trim() || !validateObjectId(newUserId.trim())) {
											toast({
												title: 'Invalid user ID',
												description: 'Please enter a valid user ID',
												variant: 'destructive',
											});
											return;
										}

										// Check if user is already in the list
										if (field.value?.some(member => member.userId === newUserId)) {
											toast({
												title: 'User already added',
												description: 'This user is already a member of this workspace',
												variant: 'destructive',
											});
											return;
										}

										// Check if user exists
										const userRes = await fetch(`${PUBLIC_API_URL}/user/${newUserId}`, {
											method: 'GET',
											credentials: 'include',
										}).then(res => res.json());

										if (!userRes.success) {
											toast({
												title: 'User not found',
												description: 'This user does not exist',
												variant: 'destructive',
											});
											return;
										}

										// Add the new member
										const updatedMembers = [
											...(field.value || []),
											{ userId: newUserId, role: 'member' as UserRoles, dateJoined: new Date() },
										];

										field.onChange(updatedMembers);
										setNewUserId(''); // Clear the input field
									};

									return (
										<FormItem className=''>
											<FormLabel>Workspace Members</FormLabel>
											<FormControl>
												<div className=''>
													<div className='flex gap-x-2 mb-4'>
														<Input
															type='text'
															placeholder='User Account ID'
															value={newUserId}
															onChange={e => setNewUserId(e.target.value)}
															onKeyDown={e => {
																if (e.key === 'Enter') {
																	e.preventDefault();
																	handleAddUser(e);
																}
															}}
														/>
														<Button
															type='button'
															onClick={e => {
																handleAddUser(e);
															}}>
															Add
														</Button>
													</div>

													<Table>
														<TableHeader className='bg-gray-900'>
															<TableRow className='border-b border-gray-800 hover:bg-transparent'>
																<TableHead className='text-gray-400'>ID</TableHead>
																<TableHead className='text-gray-400'>Date Added</TableHead>
																<TableHead className='text-gray-400'>Role</TableHead>
																<TableHead className='w-[40px]'></TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{field.value?.map((member: any) => (
																<TableRow key={member.userId} className='border-b border-gray-800 hover:bg-gray-900/50'>
																	<TableCell className='font-medium flex gap-x-2'>
																		{member.userId} {member.userId === activeUserStore.get()?._id && <p>(you)</p>}
																	</TableCell>
																	<TableCell>{formatDate(new Date(member.dateJoined))}</TableCell>
																	<TableCell>
																		{/* <span
																			className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
																				member.role === 'admin'
																					? 'bg-blue-950/50 text-blue-400'
																					: 'bg-gray-800 text-gray-300'
																			}`}>
																			{member.role}
																		</span> */}
																		<Badge className={roleClasses[member.role as UserRoles]}>{member.role}</Badge>
																	</TableCell>
																	<TableCell>
																		<DropdownMenu>
																			<DropdownMenuTrigger asChild>
																				<Button variant='ghost' className='h-8 w-8 p-0 text-gray-400 hover:text-white'>
																					<span className='sr-only'>Open menu</span>
																					<MoreHorizontal className='h-4 w-4' />
																				</Button>
																			</DropdownMenuTrigger>
																			<DropdownMenuContent align='end' className='bg-gray-900 text-white border-gray-800'>
																				<DropdownMenuLabel>Actions</DropdownMenuLabel>
																				<DropdownMenuSeparator className='bg-gray-800' />
																				<DropdownMenuItem
																					onClick={() => {
																						const updatedMembers = field.value?.map((m: any) =>
																							m.userId === member.userId
																								? { ...m, role: m.role === 'admin' ? 'member' : 'admin' }
																								: m,
																						);
																						field.onChange(updatedMembers);
																					}}
																					className='hover:bg-gray-800 cursor-pointer'>
																					{member.role === 'admin' ? 'Make Member' : 'Make Admin'}
																				</DropdownMenuItem>
																				<DropdownMenuItem
																					onClick={() => {
																						const updatedMembers = field.value?.filter(
																							(m: any) => m.userId !== member.userId,
																						);
																						field.onChange(updatedMembers);
																					}}
																					className='text-red-500 hover:bg-gray-800 cursor-pointer'>
																					Remove member
																				</DropdownMenuItem>
																			</DropdownMenuContent>
																		</DropdownMenu>
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}></FormField>
						</AlertDialogHeader>
						<AlertDialogFooter className='justify-between'>
							{isEditMode && (
								<Button type='button' variant='destructive' onClick={handleDeleteWorkspace}>
									Delete Workspace
								</Button>
							)}
							<div className='flex space-x-2'>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction type='submit'>{actionText}</AlertDialogAction>
							</div>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function NavMain({ channels, DBCategories }: { channels: Channel[]; DBCategories: DBCategory[] }) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [emptyCategories, setEmptyCategories] = useState<Category[]>([]);

	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeChannel = useStore(activeChannelStore);
	const activeWorkspaceId = activeWorkspace?._id;

	// add appropriate channels to categories
	useEffect(() => {
		// Skip processing if no workspace is selected
		if (!activeWorkspaceId) return;

		// Create a map of categories with their channels
		const categoryMap = new Map<string, Category>();

		// First pass: Process all categories from DB
		DBCategories.forEach(dbCategory => {
			categoryMap.set(dbCategory._id, {
				_id: dbCategory._id,
				name: dbCategory.name,
				icon: dbCategory.icon,
				url: `/${activeWorkspaceId}/categories/${dbCategory._id}`,
				items: [],
				canCreate: activeWorkspace?.members.some(
					member => member.userId === activeUserStore.get()?._id && (member.role === 'admin' || member.role === 'owner'),
				),
				isActive: true,
			});
		});

		// Second pass: Add channels to their respective categories
		channels.forEach(channel => {
			if (channel.categoryId && categoryMap.has(channel.categoryId)) {
				const category = categoryMap.get(channel.categoryId)!;

				// Add channel to category if not already present
				if (!category.items?.some(item => item._id === channel._id)) {
					category.items = [
						...(category.items || []),
						{
							...channel,
							url: `/${activeWorkspaceId}/dashboard/${channel.type}s/${channel._id}`,
						},
					];
				}
			}
		});

		// Final step: Split into categories with channels and empty categories
		const populatedCategories: Category[] = [];
		const emptyCategories: Category[] = [];

		categoryMap.forEach(category => {
			if (category.items && category.items.length > 0) {
				populatedCategories.push(category);
			} else {
				emptyCategories.push(category);
			}
		});

		// Update state once with all processed data
		setCategories(populatedCategories);
		setEmptyCategories(emptyCategories);
	}, [channels, DBCategories, activeWorkspaceId, activeWorkspace]);

	//#region Channel Utils

	function handleChannelCreated(newChannel: Channel) {
		const channelUrl = `/${activeWorkspaceId}/dashboard/${newChannel.type}s/${newChannel._id}`;

		// First, try to update if the category already exists in "categories"
		let updatedInCategories = false;
		setCategories(prev => {
			const newCategories = prev.map(category => {
				if (category._id === newChannel.categoryId) {
					updatedInCategories = true;
					return {
						...category,
						items: [...(category.items ?? []), { ...newChannel, url: channelUrl }],
					};
				}
				return category;
			});
			return newCategories;
		});

		// If not updated, then the channel belongs to a category in "emptyCategories"
		if (!updatedInCategories) {
			setEmptyCategories(prevEmpty => {
				const foundCategory = prevEmpty.find(c => c._id === newChannel.categoryId);
				if (foundCategory) {
					// Remove the category from emptyCategories and add it to categories with the new channel
					const updatedCategory = {
						...foundCategory,
						items: [{ ...newChannel, url: channelUrl }],
					};
					setCategories(prevCategories => [...prevCategories, updatedCategory]);
					return prevEmpty.filter(c => c._id !== newChannel.categoryId);
				}
				return prevEmpty;
			});
		}
	}

	function handleChannelUpdated(updatedChannel: Channel) {
		setCategories(prev => {
			const categoryIndex = prev.findIndex(c => c._id === updatedChannel.categoryId);
			if (categoryIndex !== -1) {
				const categoryItems = prev[categoryIndex].items || [];
				const channelIndex = categoryItems.findIndex(i => i._id === updatedChannel._id);

				if (channelIndex !== -1) {
					const updatedItems = [
						...categoryItems.slice(0, channelIndex),
						{ ...updatedChannel, url: `/${activeWorkspaceId}/dashboard/${updatedChannel.type}s/${updatedChannel._id}` as string },
						...categoryItems.slice(channelIndex + 1),
					];

					return [...prev.slice(0, categoryIndex), { ...prev[categoryIndex], items: updatedItems }, ...prev.slice(categoryIndex + 1)];
				}
			}
			return prev;
		});
	}

	function handleChannelDeleted(channelId: string) {
		setCategories(prev =>
			prev.map(category => ({
				...category,
				items: category.items?.filter(item => item._id !== channelId),
			})),
		);
	}

	//#endregion

	//#region Category Utils

	function handleCategoryCreated(newCategory: Category) {
		setEmptyCategories(prev => [
			...prev,
			{
				_id: newCategory._id,
				name: newCategory.name,
				icon: newCategory.icon,
				url: `/${activeWorkspaceId}/categories/${newCategory._id}`,
				items: [],
				canCreate: activeWorkspace?.members.some(
					member => member.userId === activeUserStore.get()?._id && (member.role === 'admin' || member.role === 'owner'),
				),
				isActive: true,
			},
		]);

		// setEmptyCategories(prev => prev.filter(category => category._id !== newCategory._id));
	}

	function handleCategoryUpdated(updatedCategory: Category) {
		setCategories(prev => {
			const categoryIndex = prev.findIndex(c => c._id === updatedCategory._id);
			if (categoryIndex !== -1) {
				return [
					...prev.slice(0, categoryIndex),
					{
						...prev[categoryIndex],
						name: updatedCategory.name,
						icon: updatedCategory.icon,
					},
					...prev.slice(categoryIndex + 1),
				];
			}
			return prev;
		});

		setEmptyCategories(prev => {
			const categoryIndex = prev.findIndex(c => c._id === updatedCategory._id);
			if (categoryIndex !== -1) {
				return [
					...prev.slice(0, categoryIndex),
					{
						...prev[categoryIndex],
						name: updatedCategory.name,
						icon: updatedCategory.icon,
					},
					...prev.slice(categoryIndex + 1),
				];
			}
			return prev;
		});
	}

	function handleCategoryDeleted(categoryId: string) {
		setCategories(prev => prev.filter(category => category._id !== categoryId));
		setEmptyCategories(prev => prev.filter(category => category._id !== categoryId));
	}

	//#endregion

	//#region Workspace Utils

	function handleWorkspaceCreated(newWorkspace: Workspace) {
		setActiveWorkspace(newWorkspace);
	}

	function handleWorkspaceUpdated(updatedWorkspace: Workspace) {
		setActiveWorkspace(updatedWorkspace);
	}

	async function handleWorkspaceDeleted(workspaceId: string, nextWorkspace?: Workspace) {
		if (nextWorkspace) {
			setActiveWorkspace(nextWorkspace);
		} else {
			//* this means the user has no workspaces. redirect where??
		}
	}

	//#endregion

	// reset categories on workspace change
	useEffect(() => {
		setCategories([]);
		setEmptyCategories([]);
	}, [activeWorkspace]);

	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel className='flex justify-between items-center'>Workspace</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem key={'__settings__'}>
						{activeWorkspace?.members.some(member => member.userId === activeUserStore.get()?._id && member.role === 'owner') && (
							<WorkspaceDialog
								mode='edit'
								workspace={activeWorkspace || undefined}
								onWorkspaceCreated={handleWorkspaceCreated}
								onWorkspaceUpdated={handleWorkspaceUpdated}
								onWorkspaceDeleted={handleWorkspaceDeleted}>
								<SidebarMenuButton>
									<Settings2 className='size-4'></Settings2> Settings
								</SidebarMenuButton>
							</WorkspaceDialog>
						)}
					</SidebarMenuItem>
					<SidebarMenuItem key={'__members__'}>
						<SidebarMenuButton>
							<Users></Users> Members
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel className='flex justify-between items-center'>
					App
					<CategoryDialog mode='create' onCategoryCreated={handleCategoryCreated} className='ml-auto cursor-pointer'>
						<span className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-4 p-3')}>
							<Plus />
						</span>
					</CategoryDialog>
				</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem key={'__home__'}>
						<SidebarMenuButton
							asChild
							tooltip='home'
							className={cn({ 'border-2 border-primary rounded-lg': window.location.pathname.includes('home') })}>
							<a href={`/${activeWorkspaceId}/dashboard/home`}>
								<Home></Home>
								<span>Home</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
					{categories.length > 0 &&
						categories.map(item => {
							const hasSubItems = item.items && item.items.length > 0;
							return hasSubItems ? (
								<Collapsible key={item._id} asChild defaultOpen={item.isActive} className='group/collapsible'>
									<SidebarMenuItem>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton tooltip={item.name} className='relative group/category'>
												<Icon name={item.icon as IconName}></Icon>
												<span>{item.name}</span>

												<div className='hidden group-hover/category:block'>
													{item.canCreate && (
														<CategoryDialog
															mode='edit'
															category={item}
															onCategoryUpdated={handleCategoryUpdated}
															onCategoryDeleted={handleCategoryDeleted}>
															<span
																className={cn(
																	buttonVariants({ variant: 'ghostBackground', size: 'icon' }),
																	'size-4 ml-auto p-3 absolute top-1/2 right-16 z-50 -translate-y-1/2',
																)}
																onClick={e => {
																	e.stopPropagation();
																}}>
																<Pencil />
															</span>
														</CategoryDialog>
													)}

													{item.canCreate && (
														<ChannelDialog category={item} mode='create' onChannelCreated={handleChannelCreated}>
															<span
																className={cn(
																	buttonVariants({ variant: 'ghostBackground', size: 'icon' }),
																	'size-4 ml-auto p-3 absolute top-1/2 right-8 z-50 -translate-y-1/2',
																)}
																onClick={e => {
																	e.stopPropagation();
																}}>
																<Plus />
															</span>
														</ChannelDialog>
													)}
												</div>
												<ChevronRight className='ml-auto size-8 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub className='!border-l-0'>
												{item.items?.map((subItem, pos) => (
													<SidebarMenuSubItem
														key={subItem._id}
														className={cn(
															'transition-colors *:translate-x-0 group/channelItem',
															`before:absolute before:h-[var(--before-height)] before:w-[2px] before:left-0 before:bg-border before:top-[var(--before-top)]`,
															{
																'border-2 border-primary rounded-lg before:bg-primary': activeChannel?._id === subItem._id,
															},
														)}
														style={
															{
																'--before-height': `${100 / (item.items?.length || 1)}%`,
																'--before-top': `${(pos / (item.items?.length || 1)) * 100}%`,
															} as React.CSSProperties
														}>
														<div className='relative cursor-pointer'>
															<SidebarMenuSubButton
																href={(subItem as Channel & { url: string }).url}
																className='group-hover/channelItem:bg-sidebar-accent group-hover/channelItem:text-sidebar-accent-foreground'>
																<span className='flex items-center w-full'>
																	<p className='w-full'>#{subItem.name}</p>
																</span>
															</SidebarMenuSubButton>
															{item.canCreate && (
																<ChannelDialog
																	category={item}
																	mode='edit'
																	channel={subItem as Channel}
																	onChannelUpdated={handleChannelUpdated}
																	onChannelDeleted={handleChannelDeleted}
																	className='hidden group-hover/channelItem:flex absolute top-1/2 -translate-y-1/2 right-0.5'>
																	<span
																		className={cn(
																			buttonVariants({ variant: 'ghostBackground', size: 'icon' }),
																			'size-4 ml-auto p-3 absolute top-1/2 right-0.5 z-50 -translate-y-1/2',
																		)}
																		onClick={e => {
																			e.stopPropagation();
																		}}>
																		<Pencil />
																	</span>
																</ChannelDialog>
															)}
														</div>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							) : (
								<SidebarMenuItem key={item._id} className={cn({ 'border-2 border-primary rounded-lg': activeChannel?._id === item._id })}>
									<SidebarMenuButton asChild tooltip={item.name}>
										<a href={item.url}>
											{item.icon && <item.icon />}
											<span>{item.name}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					{emptyCategories.length > 0 &&
						emptyCategories.map(item => {
							return (
								<Collapsible key={item._id} asChild defaultOpen={item.isActive} className='group/collapsible'>
									<SidebarMenuItem>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton tooltip={item.name} className='relative group/category'>
												<Icon name={item.icon as IconName}></Icon>
												<span>{item.name}</span>

												<div className='hidden group-hover/category:block'>
													<CategoryDialog
														mode='edit'
														category={item}
														onCategoryUpdated={handleCategoryUpdated}
														onCategoryDeleted={handleCategoryDeleted}>
														<span
															className={cn(
																buttonVariants({ variant: 'ghostBackground', size: 'icon' }),
																'size-4 ml-auto p-3 absolute top-1/2 right-16 z-50 -translate-y-1/2',
															)}
															onClick={e => {
																e.stopPropagation();
															}}>
															<Pencil />
														</span>
													</CategoryDialog>

													{item.canCreate && (
														<ChannelDialog category={item} mode='create' onChannelCreated={handleChannelCreated}>
															<span
																className={cn(
																	buttonVariants({ variant: 'ghostBackground', size: 'icon' }),
																	'size-4 ml-auto p-3 absolute top-1/2 right-8 z-50 -translate-y-1/2',
																)}
																onClick={e => {
																	e.stopPropagation();
																}}>
																<Plus />
															</span>
														</ChannelDialog>
													)}
												</div>
												<ChevronRight className='ml-auto size-8 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub className='!border-l-0'>
												<SidebarMenuSubItem
													key={item._id}
													className='transition-colors *:translate-x-0 group/channelItem flex flex-col items-start justify-center gap-y-2'>
													<p className='text-sm text-muted-foreground'>No channels</p>
													<ChannelDialog category={item} mode='create' onChannelCreated={handleChannelCreated}>
														<Button variant={'outline'} size={'sm'}>
															Create
														</Button>
													</ChannelDialog>
												</SidebarMenuSubItem>
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							);
						})}

					{emptyCategories.length === 0 && categories.length === 0 && (
						<SidebarMenuItem className='mx-2'>
							<span className='text-muted-foreground'>No channels in this workspace</span>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarGroup>
		</>
	);
}
