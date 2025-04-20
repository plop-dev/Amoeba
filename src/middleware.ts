import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const session = context.request.headers.get('cookie')?.match(/session=([^;]*)/)?.[1];

	if (context.url.pathname.includes('dashboard') || context.url.pathname.includes('auth')) {
		if (session && session.trim() !== '') {
			console.log('Session found:', session);

			let data;
			try {
				const res = await fetch('http://localhost:8000/auth/middleware', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Cookie: `session=${session}`, // Forward the session cookie
					},
					credentials: 'include',
				});
				data = await res.json();
				console.log('Middleware response:', data);
			} catch (error) {
				// In case of a network error, redirect to login.
				return context.redirect('/auth/login');
			}

			if (data.success) {
				console.log('User authenticated:', data.userId);
				context.locals.userId = data.userId;

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
					next();
				}
			}
		}
	}
	return next();
});
