// User Related Types
type UserStatus = 'online' | 'offline' | 'away' | 'busy';
type UserRoles = 'admin' | 'user' | 'guest';

interface User {
	id: string;
	username: string;
	description: string;
	avatarUrl: string;
	creationDate: Date;
	accentColour: string;
	status: UserStatus;
	workspaces: UserWorkspace[];
}

interface AvatarProps {
	user: User;
	className?: string;
	size?: number;
}

// Workspace Related Types
interface UserWorkspace {
	id: string;
	name: string;
	creationDate: Date;
	role: UserRoles;
	channels: Channel[];
}

interface Workspace {
	id: string;
	name: string;
	creationDate: Date;
	members: { userId: User['id']; role: UserRoles }[];
}

// Channel Related Types
type ChannelTypes = 'chat' | 'voice' | 'board';

interface Channel {
	id: string;
	workspaces: Workspace['id'];
	name: string;
	description: string;
	type: ChannelTypes;
	creationDate: Date;
	members: User['id'][];
}

// Message Related Types
interface Message {
	content: string;
	author: User;
	id: string;
	channelId: Channel['id'];
	workspaceId: Workspace['id'];
	sent: Date;
	reactions: Map<string, User[]>;
	replyTo?: string;
	pinned?: boolean;
	channelId: string;
	files?: File[];
}

interface SSEMessage {
	message: Message | any;
	event: {
		author: 'server' | 'client';
		type: 'welcome' | 'message' | 'file' | 'status';
		variant?: UserStatus | any;
	};
}

// UI Component Types
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

// Utility

type KeyCheckProgressType = 'Sending' | 'Hashing' | 'Comparing' | 'Success';

interface LoginStatusStep {
	id: number;
	title: string;
	description: string;
	icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
	status: 'complete' | 'current' | 'upcoming';
}
