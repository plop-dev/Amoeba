import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export function DashboardLoader() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const handleBeforePrep = (event: Event) => {
			setIsVisible(true);
		};

		const handleAfterPrep = (event: Event) => {
			setIsVisible(false);
		};

		document.addEventListener('astro:before-preparation', handleBeforePrep);
		document.addEventListener('astro:after-preparation', handleAfterPrep);

		return () => {
			document.removeEventListener('astro:before-preparation', handleBeforePrep);
			document.removeEventListener('astro:after-preparation', handleAfterPrep);
		};
	}, []);

	return (
		<div
			id='dashboard-loader'
			className={`fixed inset-0 flex items-center justify-center bg-background z-[100] transition-all duration-500 ease-in-out ${
				isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}>
			<div className={`flex flex-col items-center gap-4 transition-transform duration-500 ${isVisible ? 'scale-100' : 'scale-95'}`}>
				<LoaderCircle size={40} className='animate-spin text-primary' />
				<p className='text-lg font-medium'>Loading Dashboard...</p>
			</div>
		</div>
	);
}
