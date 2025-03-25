// User Related Types
type UserStatus = 'online' | 'offline' | 'away' | 'busy';
type UserRoles = 'admin' | 'user' | 'guest';

interface User {
	_id: string;
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

interface ActiveUser {
	id: User['_id'];
	status: User['status'];
}

interface AvatarProps {
	user: User;
	className?: string;
	size?: number;
}

// Workspace Related Types
interface Workspace {
	_id: string;
	name: string;
	creationDate: Date;
	icon: string;
	members: { userId: User['_id']; role: UserRoles }[];
}

// Channel Related Types
type ChannelTypes = 'chat' | 'voice' | 'board';

interface Channel {
	_id: string;
	workspace: Workspace['_id'];
	name: string;
	description: string;
	type: ChannelTypes;
	creationDate: Date;
	members: User['_id'][];
}

// Message Related Types
interface Message {
	content: string;
	author: User;
	_id: string;
	channelId: Channel['_id'];
	workspaceId: Workspace['_id'];
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
	_id: string;
	src: string;
	name: string;
	extension: string;
	size: number;
	onDelete: (_id: string) => void;
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
	_id: number;
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
