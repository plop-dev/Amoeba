import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const session = context.request.headers.get('cookie')?.match(/session=([^;]*)/)?.[1];

	if (context.url.pathname.includes('dashboard') || context.url.pathname.includes('auth')) {
		if (session) {
			const res = await fetch('http://localhost:8000/auth/middleware', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `session=${session}`, // Forward the session cookie
				},
				credentials: 'include',
			});

			const data = await res.json();
			if (data.success) {
				context.locals.userId = data.userId;

				if (context.url.pathname.includes('auth')) {
					return context.redirect('/dashboard');
				}
			} else {
				return context.redirect('/auth/login');
			}
		} else if (context.url.pathname === '/auth/login') {
			return next();
		} else {
			return context.redirect('/auth/login');
		}
	}
	return next();
});
