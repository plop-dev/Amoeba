const UserConstant: User = {
	username: 'plop',
	id: '67d9beb312ed6b961825bcd2',
	auth: {
		keyHash: '4424815be5d11df61be74d3296edc130ef0148211691123244bc26b3e836f6d7',
		iterations: 20000,
		salt: '7d61f8a03b335fca6a7b1dd5ce15b63b',
	},
	avatarUrl: 'https://maximec.dev/_astro/plop.C6PhQEc1_1CKlOU.webp',
	status: 'online',
	accentColour: '#55d38e',
	creationDate: new Date(2024, 1, 30),
	description: 'i code stuff',
	workspaces: [],
};

const UserConstant2: User = {
	username: 'eny',
	id: 'MONGOD_DB ID',
	auth: {
		keyHash: 'ej39ntoiajr9tajw4oitnao39n392j9jsldkjf09e',
		iterations: 20000,
		salt: '',
	},
	avatarUrl: '#',
	status: 'away',
	accentColour: '#1275b7',
	creationDate: new Date(2024, 2, 21),
	description: 'i like ghosting people',
	workspaces: [],
};

export { UserConstant, UserConstant2 };
