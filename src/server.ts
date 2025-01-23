import { Server } from '@hocuspocus/server';

let connections = 0;

const server = Server.configure({
	async onListen() {
		console.log('server listening on port', server.URL);
	},
	async connected() {
		console.log('connections:', server.getConnectionsCount());
		connections++;
	},
	async onDisconnect() {
		console.log('connections:', server.getConnectionsCount());
		connections--;
	},
	async onStateless({ payload, document, connection }) {
		// Output some information
		// console.log(`Server has received a stateless message "${payload}"!`);

		if (payload === 'usersConnected') {
			connection.sendStateless('usersConnected: ' + connections);
		}
	},
});

server.listen();
