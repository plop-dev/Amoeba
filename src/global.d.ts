interface FilePreview {
	id: string;
	src: string;
	name: string;
	extension: string;
	size: number;
	onDelete: (id: string) => void;
}

interface AppSidebarData {
	user: UserData;
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

interface LoginStatusStep {
	id: number;
	title: string;
	description: string;
	icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
	status: 'complete' | 'current' | 'upcoming';
}

interface UserData {
	id: string;
	username: string;
	avatarUrl: string;
	creationDate: Date;
	accentColor: string;
	status: UserStatus;
	role: 'admin' | 'user' | 'guest';
	description: string;
}

interface AvatarProps {
	user: UserData;
	className?: string;
	size?: number;
}

type UserStatus = 'online' | 'offline' | 'away' | 'busy';
