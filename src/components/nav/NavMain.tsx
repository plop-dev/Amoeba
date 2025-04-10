import {
	AudioWaveform,
	Book,
	ChevronRight,
	Copy,
	Home,
	List,
	MessageCircle,
	Pencil,
	Plus,
	Settings2,
	Sidebar,
	Users,
	type LucideIcon,
	type LucideProps,
} from 'lucide-react';
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { activeWorkspace as activeWorkspaceStore, setActiveWorkspace } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { Icon, IconPicker, type IconName } from '@/components/ui/icon-picker';
import { activeChannel as activeChannelStore } from '@/stores/Channel';
import { Textarea } from '../ui/textarea';
import { activeUser } from '@/stores/User';

function ChannelDialog(props: {
	children: React.ReactNode;
	category: Category;
	mode: 'create' | 'edit';
	channel?: Channel;
	className?: string;
	onChannelCreated?: (channel: Channel) => void;
	onChannelUpdated?: (channel: Channel) => void;
}) {
	const { toast } = useToast();
	const { mode, category, channel } = props;
	const isEditMode = mode === 'edit';

	const formSchema = z.object({
		channelName: z
			.string()
			.min(2, { message: 'Channel name must be at least 2 characters.' })
			.max(20, { message: 'Channel name must be at most 20 characters.' }),
		channelDescription: z
			.string()
			.min(2, { message: 'Channel description must be at least 2 characters.' })
			.max(300, { message: 'Channel description must be at most 300 characters.' })
			.optional(),
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
			await fetch(`http://localhost:8000/channel/update/${channel._id}`, {
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
				members: [activeUser.get()?._id],
				workspaceId: activeWorkspaceStore.get()?._id,
			};

			await fetch(`http://localhost:8000/channel/new`, {
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
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction type='submit'>{actionText}</AlertDialogAction>
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
			await fetch(`http://localhost:8000/category/update/${category._id}`, {
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

			await fetch(`http://localhost:8000/category/new`, {
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
												{...field}
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
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction type='submit'>{actionText}</AlertDialogAction>
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
		DBCategories.forEach((DBCategory, i) => {
			let notInCategoryCount = 0;
			channels.forEach((channel, i) => {
				// check channel has this categoryId
				if (channel.categoryId === DBCategory._id) {
					// check if channel already exists in this category
					//? REMOVE CHANNEL FROM CHANNELS FOR QUICKER ITERATIONS?
					if (categories.find(c => c.items?.find(i => i._id === channel._id))) return;

					setCategories(prev => {
						const categoryIndex = prev.findIndex(c => c._id === DBCategory._id);

						// check if category already exists
						if (categoryIndex !== -1) {
							return [
								...prev.slice(0, categoryIndex),
								{
									...prev[categoryIndex],
									items: [
										...(prev[categoryIndex].items ?? []).map(item => ({ ...item, url: item.url })),
										{ ...channel, url: `/${activeWorkspaceId}/dashboard/${channel.type}s/${channel._id}` as string },
									],
								},
								...prev.slice(categoryIndex + 1),
							];
						} else {
							return [
								...prev,
								{
									_id: DBCategory._id,
									name: DBCategory.name,
									icon: DBCategory.icon,
									url: `/${activeWorkspaceId}/channels/${channel._id}`,
									items: [{ ...channel, url: `/${activeWorkspaceId}/dashboard/${channel.type}s/${channel._id}` as string }],
									canCreate: true,
									isActive: true,
								},
							];
						}
					});
				} else {
					notInCategoryCount++;

					if (notInCategoryCount === channels.length) {
						// the category is empty
						setEmptyCategories(prev => {
							const updatedCategories = [
								...prev,
								{
									_id: DBCategory._id,
									name: DBCategory.name,
									icon: DBCategory.icon,
									url: `/${activeWorkspaceId}/categories/${DBCategory._id}`,
									items: [],
									canCreate: true,
									isActive: true,
								},
							];
							console.log(`Category ${DBCategory.name} is empty. updated emptyCategories:`, updatedCategories);
							return updatedCategories;
						});
					}
				}
			});
		});
	}, [channels, DBCategories, activeWorkspace]);

	function handleChannelCreated(newChannel: Channel) {
		setCategories(prev => {
			const categoryIndex = prev.findIndex(c => c._id === newChannel.categoryId);
			if (categoryIndex !== -1) {
				return [
					...prev.slice(0, categoryIndex),
					{
						...prev[categoryIndex],
						items: [
							...(prev[categoryIndex].items ?? []).map(item => ({ ...item, url: item.url })),
							{ ...newChannel, url: `/${activeWorkspaceId}/dashboard/${newChannel.type}s/${newChannel._id}` as string },
						],
					},
					...prev.slice(categoryIndex + 1),
				];
			}
			return prev;
		});
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

	function handleCategoryCreated(newCategory: Category) {
		setCategories(prev => [
			...prev,
			{
				_id: newCategory._id,
				name: newCategory.name,
				icon: newCategory.icon,
				url: `/${activeWorkspaceId}/categories/${newCategory._id}`,
				items: [],
				canCreate: true,
				isActive: true,
			},
		]);

		setEmptyCategories(prev => prev.filter(category => category._id !== newCategory._id));
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
					<SidebarMenuItem key={'__members__'}>
						<SidebarMenuButton>
							<Users></Users> Members
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem key={'__settings__'}>
						<SidebarMenuButton>
							<Settings2></Settings2> Settings
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
					{categories.length > 0 ? (
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
													<CategoryDialog mode='edit' category={item} onCategoryUpdated={handleCategoryUpdated}>
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
															<ChannelDialog
																category={item}
																mode='edit'
																channel={subItem as Channel}
																onChannelUpdated={handleChannelUpdated}
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
						})
					) : (
						<SidebarMenuItem className='mx-2'>
							<span className='text-muted-foreground'>No channels in this workspace</span>
						</SidebarMenuItem>
					)}
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
													<CategoryDialog mode='edit' category={item} onCategoryUpdated={handleCategoryUpdated}>
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
				</SidebarMenu>
			</SidebarGroup>
		</>
	);
}
