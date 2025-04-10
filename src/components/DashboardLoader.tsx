import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export function DashboardLoader() {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		// Initial delay to ensure components have time to initialize
		const initialDelay = setTimeout(() => {
			// Start fade out transition
			setIsVisible(false);

			// Remove from DOM after transition completes
			setTimeout(() => {
				const loader = document.getElementById('dashboard-loader');
				if (loader) {
					loader.style.display = 'none';
				}
			}, 300); // match with css animation duration
		}, 500);

		return () => clearTimeout(initialDelay);
	}, []);

	return (
		<div
			id='dashboard-loader'
			className={`fixed inset-0 flex items-center justify-center bg-background z-[100] transition-opacity duration-300 ${
				isVisible ? 'opacity-100' : 'opacity-0'
			}`}>
			<div className='flex flex-col items-center gap-4'>
				<LoaderCircle size={40} className='animate-spin text-primary' />
				<p className='text-lg font-medium'>Loading Dashboard...</p>
			</div>
		</div>
	);
}
