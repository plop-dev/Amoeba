import { atom } from 'nanostores';
export const isOpenStore = atom<boolean>(false);

export const updateIsOpenState = (isOpen: boolean) => {
	isOpenStore.set(isOpen);
};
