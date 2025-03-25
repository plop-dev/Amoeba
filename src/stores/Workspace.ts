import { persistentAtom } from '@nanostores/persistent';

export const activeWorkspace = persistentAtom<Workspace | null>('activeWorkspace', null, {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export function setActiveWorkspace(workspace: Workspace) {
	activeWorkspace.set(workspace);
}
