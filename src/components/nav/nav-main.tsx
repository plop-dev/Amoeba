import { ChevronRight, Plus, type LucideIcon } from 'lucide-react';

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
('use client');
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import UsersOnlineBadge from '../UsersOnlineBadge';

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

export function NavMain({ items }: { items: NavMainProps[] }) {
	return (
		<SidebarGroup className=''>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map(item => {
					const hasSubItems = item.items && item.items.length > 0;
					return hasSubItems ? (
						<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
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
													<Plus></Plus>
												</span>
											</NewChannelDialog>
										)}
										<ChevronRight className='ml-auto size-8 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map(subItem => (
											<SidebarMenuSubItem
												key={subItem.title}
												className={cn('transition-colors', {
													'border-primary border-2 box-border rounded-lg': subItem.userConnected,
												})}>
												<SidebarMenuSubButton asChild>
													<a href={subItem.url}>
														<span className='flex items-center w-full'>
															<p className='w-full'>{subItem.title}</p>
															{typeof subItem.usersOnline === 'number' && subItem.usersOnline > 0 && (
																<UsersOnlineBadge usersOnline={subItem.usersOnline}></UsersOnlineBadge>
															)}
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
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
