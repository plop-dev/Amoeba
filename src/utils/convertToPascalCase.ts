/**
 * @param {string} input - The input string to be converted.
 * @example console.log(convertToPascalCase("a-arrow-down"));
 */
export function convertToPascalCase(input: string): string {
	return input
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
}
