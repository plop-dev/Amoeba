import { persistentAtom } from '@nanostores/persistent';

export const activeChannel = persistentAtom<Channel | null>('activeChannel', null, {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function setActiveChannel(channel: Channel) {
	activeChannel.set(channel);
}
