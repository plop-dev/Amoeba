import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { isOpenStore, updateIsOpenState } from '@/stores/VerificationDialogStore.ts';
import { useStore } from '@nanostores/react';
export function VerificationDialog() {
	const isOpen = useStore(isOpenStore);

	return (
		<AlertDialog open={isOpen} onOpenChange={open => updateIsOpenState(open)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='flex items-center gap-x-2 text-success'>Verified</AlertDialogTitle>
					<AlertDialogDescription>You have been successfully logged in and verified.</AlertDialogDescription>
				</AlertDialogHeader>

				<div className='flex flex-col items-center justify-center p-6'>
					<div className={`relative w-24 h-24`}>
						<video src='/media/tickanim.webm' muted autoPlay playsInline></video>
					</div>
				</div>

				<AlertDialogFooter>
					<AlertDialogAction>
						<a href='/dashboard'>Continue to Dashboard</a>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
