interface FilePreview {
	id: string;
	src: string;
	name: string;
	extension: string;
	size: number;
	onDelete: (id: string) => void;
}

interface AppSidebarData {
	user: {
		name: string;
		id: string;
		avatar: string;
	};
	teams: {
		name: string;
		logo: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
		plan: string;
	}[];
	navMain: NavMainProps[];
}

interface NavMainProps {
	title: string;
	url: string;
	icon?: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
	isActive?: boolean;
	canCreate?: boolean;
	items?: {
		title: string;
		url: string;
		usersOnline?: number;
		userConnected?: boolean;
	}[];
}
