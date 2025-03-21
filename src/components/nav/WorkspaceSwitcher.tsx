import * as React from 'react';
import { ChevronsUpDown, Plus, CurlyBraces } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import DOMPurify from 'dompurify';

export function WorkspaceSwitcher({ workspace: workspaces }: { workspace: Workspace[] }) {
	const { isMobile } = useSidebar();
	const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0]);

	return (
		<SidebarMenu className=''>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
								{<div className='size-4' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeWorkspace.icon) }} />}
							</div>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-semibold'>{activeWorkspace.name}</span>
								<span className='truncate text-xs text-muted-foreground'>{activeWorkspace.id}</span>
							</div>
							<ChevronsUpDown className='ml-auto' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
						align='start'
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}>
						<DropdownMenuLabel className='text-xs text-muted-foreground'>Teams</DropdownMenuLabel>
						{workspaces.map((workspace, index) => (
							<DropdownMenuItem key={workspace.name} onClick={() => setActiveWorkspace(workspace)} className='gap-2 p-2'>
								<div className='flex size-6 items-center justify-center rounded-sm border'>
									{<div className='size-4 shrink-0' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(workspace.icon) }} />}
								</div>
								{workspace.name}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className='gap-2 p-2'>
							<div className='flex size-6 items-center justify-center rounded-md border bg-background'>
								<Plus className='size-4' />
							</div>
							<div className='font-medium text-muted-foreground'>Add team</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
