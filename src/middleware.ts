import { defineMiddleware } from 'astro:middleware';
import { PUBLIC_API_URL } from 'astro:env/client';

export const onRequest = defineMiddleware(async (context, next) => {
	const session = context.cookies.get('session')?.value;
	const lastLoggedIn = new Date(context.cookies.get('lastLoggedIn')?.value || '');

	if (Date.now() - lastLoggedIn.getTime() > 12 * 60 * 60 * 1000) {
		// If the last login was more than 12 hours ago, clear the session cookie
		context.cookies.delete('session');
		context.cookies.delete('lastLoggedIn');

		console.log('Session expired, cookies cleared.');
		return context.redirect('/auth/login');
	}

	if (context.url.pathname.includes('dashboard') || context.url.pathname.includes('auth')) {
		if (session && session.trim() !== '') {
			console.log('Session found:', session);

			let data;
			try {
				const res = await fetch(`${PUBLIC_API_URL}/auth/middleware`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Cookie: `session=${session}`, // Forward the session cookie
					},
					credentials: 'include',
				});
				data = await res.json().then(res => res.data);
				console.log('Middleware response:', data);
			} catch (error) {
				// In case of a network error, redirect to login.
				return context.redirect('/auth/login');
			}

			if (data.success) {
				console.log('User authenticated:', data);
				context.locals.userId = data;

				// check if user was already going somewhere in the dashboard
				if (context.url.pathname.includes('dashboard')) {
					console.log('User is going to dashboard, next()');
					return next();
				} else {
					// go to most recent workspace if available
					const user = context.cookies.get('userData')?.json();

					if (user?.workspaces && user?.workspaces.length > 0) {
						return context.redirect(`/${user.workspaces[0]}/dashboard/home`);
					} else {
						// user has no workspaces
						return new Response('No workspaces found', { status: 404 });
					}
				}
			} else {
				console.log('User not authenticated, redirecting to login');
				if (context.url.pathname.includes('dashboard')) {
					console.log('user is going to dashboard, redirecting to auth/login');
					return context.redirect('/auth/login');
				} else {
					console.log('user is not going to dashboard, next()');
					return next();
				}
			}
		}
	}
	return next();
});
