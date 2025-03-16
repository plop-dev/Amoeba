export function pemToArrayBuffer(pem: string): ArrayBuffer {
	// More thoroughly remove PEM formatting
	const b64 = pem
		.replace(/-----BEGIN PUBLIC KEY-----/, '')
		.replace(/-----END PUBLIC KEY-----/, '')
		.replace(/-----BEGIN [^-]+-----/, '') // Handle other possible PEM headers
		.replace(/-----END [^-]+-----/, '') // Handle other possible PEM footers
		.replace(/[\r\n\s]+/g, ''); // Remove all whitespace, including line breaks

	try {
		const binary = window.atob(b64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	} catch (error: any) {
		console.error('Error converting PEM to ArrayBuffer:', error);
		console.debug('Processed base64 string (first 50 chars):', b64.substring(0, 50));
		throw new Error('Invalid PEM format: ' + error.message);
	}
}
