export const statusClasses: Record<UserStatus, string> = {
	online: 'border-green-500',
	offline: 'border-gray-500',
	away: 'border-yellow-500',
	busy: 'border-red-500',
};

export const roleClasses: Record<UserRoles, string> = {
	owner: 'bg-yellow-400/40 border border-yellow-200',
	admin: 'bg-blue-400/40 border border-blue-200',
	member: 'bg-gray-400/40 border border-gray-200',
};
