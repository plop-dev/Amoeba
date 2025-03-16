// This utility converts RSA keys between formats

/**
 * Convert a PKCS#1 RSA public key to SPKI format
 * PKCS#1 format starts with "-----BEGIN RSA PUBLIC KEY-----"
 * SPKI format starts with "-----BEGIN PUBLIC KEY-----"
 */
export function convertPkcs1ToSpki(pkcs1PemKey: string): string {
	// Check if the key is already in SPKI format
	if (pkcs1PemKey.includes('-----BEGIN PUBLIC KEY-----')) {
		return pkcs1PemKey;
	}

	// Extract the base64 encoded key data
	const keyData = pkcs1PemKey
		.replace(/-----BEGIN RSA PUBLIC KEY-----/, '')
		.replace(/-----END RSA PUBLIC KEY-----/, '')
		.replace(/[\r\n\s]+/g, '');

	// Decode the base64 key data
	const binaryDer = window.atob(keyData);

	// Create ASN.1 structure for PKCS#1 RSA key
	// Reference: https://tools.ietf.org/html/rfc8017

	// The binary data of the PKCS#1 key is the RSA modulus and exponent
	// For SPKI, we need to wrap this in another ASN.1 structure

	// Create SPKI DER format by prepending the OID for RSA
	// 30 xx - SEQUENCE
	//   30 0d - SEQUENCE
	//     06 09 - OID
	//       2a 86 48 86 f7 0d 01 01 01 - rsaEncryption OID (1.2.840.113549.1.1.1)
	//     05 00 - NULL
	//   03 xx - BIT STRING
	//     00 - padding
	//     [PKCS#1 RSA key]

	// OID header for RSA encryption
	const rsaOidHeader = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A';

	// Combine the parts to create SPKI format
	const spkiB64 = rsaOidHeader + keyData;

	// Return in PEM format
	return `-----BEGIN PUBLIC KEY-----\n${spkiB64}\n-----END PUBLIC KEY-----`;
}
