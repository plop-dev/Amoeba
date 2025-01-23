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

function NewChannelDialog(props: { children: React.ReactNode; channelType: string }) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
			<AlertDialogContent
				onClick={e => {
					e.stopPropagation();
				}}>
				<AlertDialogHeader>
					<AlertDialogTitle>New {props.channelType} Channel</AlertDialogTitle>
					<AlertDialogDescription className='flex flex-col gap-y-2'>
						<span>This will create a new {props.channelType} channel. Fill in all fields below.</span>

						<Input type='text' placeholder='Channel Name'></Input>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
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
											<NewChannelDialog channelType={item.title.split('').pop() === 's' ? item.title.slice(0, -1) : item.title}>
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
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton asChild>
													<a href={subItem.url}>
														<span className='flex items-center w-full'>
															<p className='w-full'>{subItem.title}</p>
															{subItem.usersOnline && subItem.usersOnline !== 0 && (
																<span className='flex justify-end items-center gap-x-1'>
																	<i className='online-badge w-2 h-2 rounded-full relative bg-green-600 before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:bg-green-400 before:rounded-full before:animate-ping before:duration-[1500ms]'></i>
																	{subItem.usersOnline}
																</span>
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
