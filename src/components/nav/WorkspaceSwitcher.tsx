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

// Icon component that dynamically loads icons
interface IconProps {
	name: string;
	className?: string;
}

function Icon({ name, className = 'size-4' }: IconProps) {
	const [IconComponent, setIconComponent] = React.useState<React.ComponentType<any> | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		// Reset state when name changes
		setIsLoading(true);
		setIconComponent(null);

		// Default to CurlyBraces if name is empty or undefined
		if (!name) {
			setIconComponent(() => CurlyBraces);
			setIsLoading(false);
			return;
		}

		// Convert first character to uppercase for proper import name (e.g., code -> Code)
		const iconName = name.charAt(0).toUpperCase() + name.slice(1);

		// Dynamically import the icon
		import('lucide-react')
			.then(module => {
				// If the icon exists in the module, use it; otherwise, fall back to CurlyBraces
				setIconComponent(() => (module[iconName] as React.ComponentType<any>) || CurlyBraces);
				setIsLoading(false);
			})
			.catch(() => {
				// If import fails, use fallback
				setIconComponent(() => CurlyBraces);
				setIsLoading(false);
			});
	}, [name]);

	if (isLoading || !IconComponent) {
		return <div className={className}></div>; // Placeholder while loading
	}

	return <IconComponent className={className} />;
}

// Add Workspace type definition if it doesn't exist elsewhere
interface Workspace {
	id: string;
	name: string;
	icon: string;
}

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
								<Icon name={activeWorkspace.icon} className='size-4' />
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
									<Icon name={workspace.icon} className='size-4 shrink-0' />
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
