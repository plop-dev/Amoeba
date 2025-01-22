import { Server } from '@hocuspocus/server';

const server = Server.configure({
	async onListen() {
		console.log('server listening on port', server.URL);
	},
	async connected() {
		console.log('connections:', server.getConnectionsCount());
	},
});

server.listen();
