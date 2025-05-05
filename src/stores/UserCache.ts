import { atom } from 'nanostores';

// Cache structure with timestamps for TTL management
interface UserCacheEntry {
	user: User;
	timestamp: number;
}

// 5 minute TTL for cached user data
const CACHE_TTL = 5 * 60 * 1000;

// Initialize the cache store
export const userCache = atom<Record<string, UserCacheEntry>>({});

export function getCachedUser(userId: string): User | null {
	const entry = userCache.get()[userId];
	if (!entry) return null;

	// Check if cache entry is still fresh
	if (Date.now() - entry.timestamp > CACHE_TTL) return null;

	return entry.user;
}

export function setCachedUser(user: User): void {
	userCache.set({
		...userCache.get(),
		[user._id]: {
			user,
			timestamp: Date.now(),
		},
	});
}
