declare global {
	interface FilePreview {
		id: string;
		src: string;
		name: string;
		extension: string;
		size: number;
		onDelete: (id: string) => void;
	}
}
