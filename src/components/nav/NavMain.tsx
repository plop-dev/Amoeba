import { AudioWaveform, Book, ChevronRight, Home, List, MessageCircle, Plus, type LucideIcon } from 'lucide-react';
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
import { activeWorkspace as activeWorkspaceStore } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
	channelName: z.string().min(2, { message: 'Channel name must be at least 2 characters.' }).max(50),
	channelType: z.enum(['chat', 'voice', 'board']),
});

function NewChannelDialog(props: { children: React.ReactNode; category: string }) {
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			channelName: 'general',
			channelType: 'chat',
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		toast({
			title: `${values.channelType} Channel Created`,
			description: `Channel ${values.channelName} created successfully.`,
		});
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
			<AlertDialogContent
				onClick={e => {
					e.stopPropagation();
				}}>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<AlertDialogHeader>
							<AlertDialogTitle>New Channel in {props.category}</AlertDialogTitle>
							<AlertDialogDescription className='flex flex-col gap-y-3'>
								<span>This will create a new {props.category} channel. Fill in all fields below.</span>
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
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction type='submit'>Create</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function NavMain({ channels, DBCategories }: { channels: Channel[]; DBCategories: DBCategory[] }) {
	const [categories, setCategories] = useState<Category[]>([]);

	const activeWorkspace = useStore(activeWorkspaceStore);
	const activeWorkspaceId = activeWorkspace?._id;

	// make add appropriate channels to categories
	useEffect(() => {
		if (channels.length > 0) {
			for (const DBCategory of DBCategories) {
				for (const channel of channels) {
					if (channel.categoryId === DBCategory._id) {
						// check if channel already exists in this category
						if (categories.find(c => c.items?.find(i => i._id === channel._id))) continue;

						setCategories(prev => {
							const categoryIndex = prev.findIndex(c => c._id === DBCategory._id);
							if (categoryIndex !== -1) {
								return [
									...prev.slice(0, categoryIndex),
									{
										...prev[categoryIndex],
										items: [
											...(prev[categoryIndex].items ?? []),
											{ ...channel, url: `/${activeWorkspaceId}/dashboard/${channel.type}s/${channel._id}` },
										],
									},
									...prev.slice(categoryIndex + 1),
								];
							} else {
								return [
									...prev,
									{
										_id: DBCategory._id,
										title: DBCategory.name,
										icon: List,
										url: `/${activeWorkspaceId}/channels/${channel._id}`,
										items: [{ ...channel, url: `/${activeWorkspaceId}/dashboard/${channel.type}s/${channel._id}` }],
										canCreate: true,
										isActive: channel._id === activeWorkspaceId,
									},
								];
							}
						});
					}
				}
			}
		}
	}, [channels, DBCategories]);

	return (
		<SidebarGroup className=''>
			<SidebarGroupLabel>App</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem key={'home'}>
					<SidebarMenuButton asChild tooltip='home'>
						<a href={`/${activeWorkspaceId}/dashboard`}>
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
										<SidebarMenuButton tooltip={item.title} className='relative'>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											{item.canCreate && (
												<NewChannelDialog category={item.title.split('').pop() === 's' ? item.title.slice(0, -1) : item.title}>
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
												</NewChannelDialog>
											)}
											<ChevronRight className='ml-auto size-8 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map(subItem => (
												<SidebarMenuSubItem key={subItem.name} className={cn('transition-colors')}>
													<SidebarMenuSubButton asChild>
														<a href={(subItem as Channel & { url: string }).url}>
															<span className='flex items-center w-full'>
																<p className='w-full'>#{subItem.name}</p>
															</span>
														</a>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						) : (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild tooltip={item.title}>
									<a href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
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
			</SidebarMenu>
		</SidebarGroup>
	);
}
