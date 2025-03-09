interface FilePreview {
	id: string;
	src: string;
	name: string;
	extension: string;
	size: number;
	onDelete: (id: string) => void;
}

interface AppSidebarData {
	user: User;
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

type UserRoles = 'admin' | 'user' | 'guest';

interface User {
	id: string;
	username: string;
	avatarUrl: string;
	creationDate: Date;
	accentColor: string;
	status: UserStatus;
	role: UserRoles;
	description: string;
}

interface AvatarProps {
	user: User;
	className?: string;
	size?: number;
}

type UserStatus = 'online' | 'offline' | 'away' | 'busy';

interface SSEMessage {
	message: Message | any;
	event: {
		author: 'server' | 'client';
		type: 'welcome' | 'message' | 'file' | 'status';
		variant?: UserStatus | any;
	};
}

interface Message {
	content: string;
	id: string;
	sent: Date;
	expires: Date;
	reactions: Map<string, number>;
	replyTo?: string;
	pinned?: boolean;
	channelId: string;
}

type ChannelTypes = 'chat' | 'voice' | 'board';

interface Channel {
	id: string;
	name: string;
	description: string;
	type: ChannelTypes;
	creationDate: Date;
	members: string[];
}
