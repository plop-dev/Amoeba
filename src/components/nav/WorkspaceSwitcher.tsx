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
import { activeWorkspace as activeWorkspaceStore, setActiveWorkspace } from '@/stores/Workspace';
import { useStore } from '@nanostores/react';
import { cn } from '@/lib/utils';

export function WorkspaceSwitcher({ workspaces }: { workspaces: Workspace[] }) {
	const { isMobile } = useSidebar();

	const activeWorkspace = useStore(activeWorkspaceStore);

	if (!activeWorkspace) {
		return null;
	}

	const cleanSVGString = DOMPurify.sanitize(activeWorkspace.icon, {
		USE_PROFILES: { svg: true, svgFilters: true },
	});
	const parser = new DOMParser();
	const svgElement = parser.parseFromString(cleanSVGString, 'image/svg+xml').documentElement;
	svgElement.setAttribute('class', 'size-4');
	const icon = svgElement.outerHTML;

	const handleWorkspaceChange = (workspaceId: string) => {
		const selectedWorkspace = workspaces.find(workspace => workspace._id === workspaceId);
		if (selectedWorkspace) {
			setActiveWorkspace(selectedWorkspace);
		} else {
			console.error('Workspace not found:', workspaceId);
		}
	};

	return (
		<SidebarMenu className=''>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
								{<div className='size-4' dangerouslySetInnerHTML={{ __html: icon }} />}
							</div>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-semibold'>{activeWorkspace.name}</span>
								<span className='truncate text-xs text-muted-foreground'>{activeWorkspace._id}</span>
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
						{workspaces.map((workspace, index) => {
							const parser = new DOMParser();
							const svgElement = parser.parseFromString(workspace.icon, 'image/svg+xml').documentElement;
							svgElement.setAttribute('class', 'size-4 shrink-0');

							return (
								<DropdownMenuItem
									key={index}
									onClick={() => handleWorkspaceChange(workspace._id)}
									className={cn('gap-2 p-2 cursor-pointer', {
										'border-2 border-primary rounded-lg': activeWorkspace._id === workspace._id,
									})}>
									<div className='flex size-6 items-center justify-center rounded-sm border'>
										{<div dangerouslySetInnerHTML={{ __html: svgElement.outerHTML }} />}
									</div>
									<div className=''>
										{workspace.name}
										<br></br>
										<span className='text-xs text-muted-foreground'>{workspace._id}</span>
									</div>
								</DropdownMenuItem>
							);
						})}
						<DropdownMenuSeparator />
						<DropdownMenuItem className='gap-2 p-2' key={'add-team'}>
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
