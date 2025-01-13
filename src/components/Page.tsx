import { Separator } from '@radix-ui/react-separator';
import { AppSidebar } from './nav/app-sidebar';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from './ui/breadcrumb';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './ui/sidebar';
import { useEffect } from 'react';

interface Props {
	children: React.ReactNode;
	defaultSidebarOpen: boolean;
	url: URL;
	className?: string;
	appName: string;
}

export default function Page(props: Props) {
	return (
		<SidebarProvider defaultOpen={props.defaultSidebarOpen}>
			<AppSidebar appName={props.appName} />

			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator orientation='vertical' className='mr-2 h-4' />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href={'/dashboard/' + props.url.pathname.split('/')[2]}>#{props.url.pathname.split('/')[2]}</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>#{props.url.pathname.split('/')[3]}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</header>
				<div className={'flex flex-1 flex-col gap-4 p-4 ' + props.className}>{props.children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
