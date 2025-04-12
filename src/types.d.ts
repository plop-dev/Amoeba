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

interface AvatarProps {
	user?: User;
	userId?: string;
	className?: string;
	size?: number;
}

// Workspace Related Types
interface Workspace {
	_id: string;
	name: string;
	creationDate: Date;
	icon: string;
	members: WorkspaceUser[];
}

interface WorkspaceUser {
	userId: User['_id'];
	role: UserRoles;
	dateJoined: Date;
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
	categoryId?: string;
	url: string;
}

// Message Related Types
type Reactions = 'SmilePlus' | 'ThumbsUp' | 'ThumbsDown' | 'Smile' | 'PartyPopper' | 'Laugh' | 'Ban';

interface Message {
	_id: string;
	content: string;
	author: User;
	channelId: Channel['_id'];
	workspaceId: Workspace['_id'];
	sent: Date;
	reactions: Map<string, User['_id'][]>;
	replyTo?: string;
	pinned?: boolean;
	channelId: string;
	files?: File[];
}

interface MessageToSend extends Message {
	_id?: string;
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
	DBCategories: DBCategory[];
}

interface Category {
	_id: string;
	name: string;
	url: string;
	icon?: string;
	isActive?: boolean;
	canCreate?: boolean;
	items?: Channel[] & { url: string }[];
}

interface DBCategory {
	_id: string;
	workspaceId: string;
	name: string;
	description: string;
	order: number;
	icon: string;
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
