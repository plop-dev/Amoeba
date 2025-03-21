// User Related Types
type UserStatus = 'online' | 'offline' | 'away' | 'busy';
type UserRoles = 'admin' | 'user' | 'guest';

interface User {
	id: string;
	auth: {
		keyHash: string;
		salt: string;
		iterations: number;
	};
	username: string;
	description: string;
	avatarUrl: string;
	creationDate: Date;
	accentColour: string;
	status: UserStatus;
	workspaces: Array<String>;
}

interface AvatarProps {
	user: User;
	className?: string;
	size?: number;
}

// Workspace Related Types
interface Workspace {
	id: string;
	name: string;
	creationDate: Date;
	icon: string;
	members: { userId: User['id']; role: UserRoles }[];
}

// Channel Related Types
type ChannelTypes = 'chat' | 'voice' | 'board';

interface Channel {
	id: string;
	workspace: Workspace['id'];
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
	workspaces: Workspace[];
	channels: Channel[];
}

interface Category {
	title: string;
	url: string;
	icon?: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
	isActive?: boolean;
	canCreate?: boolean;
	items?: Channel[] & { url: string }[];
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

declare namespace App {
	interface Locals {
		userId: string;
	}
}
