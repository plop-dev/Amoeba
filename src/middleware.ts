import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const session = context.request.headers.get('cookie')?.match(/session=([^;]*)/)?.[1];

	if (context.url.pathname.includes('dashboard') || context.url.pathname.includes('auth')) {
		if (session) {
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
			} catch (error) {
				// In case of a network error, redirect to login.
				return context.redirect('/auth/login');
			}

			if (data.success) {
				context.locals.userId = data.userId;

				if (context.url.pathname.includes('auth')) {
					// go to most recent workspace if available

					const user = context.cookies.get('userData')?.json();

					if (user?.workspaces && user?.workspaces.length > 0) {
						console.log(`/${user.workspaces[0]}/dashboard`);
						return context.redirect(`/${user.workspaces[0]}/dashboard`);
					}
				}
			} else {
				return context.redirect('/auth/login');
			}
		} else if (context.url.pathname !== '/auth/login') {
			return context.redirect('/auth/login');
		}
	}
	return next();
});
