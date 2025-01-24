import { AppSidebar } from './nav/app-sidebar';
import { SidebarProvider } from './ui/sidebar';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useEffect } from 'react';
import React from 'react';

interface Props {
	defaultSidebarOpen: boolean;
	url: URL;
	className?: string;
	appName: string;
}

export default function Page(props: Props) {
	return (
		<SidebarProvider defaultOpen={props.defaultSidebarOpen}>
			<AppSidebar appName={props.appName} />
		</SidebarProvider>
	);
}
