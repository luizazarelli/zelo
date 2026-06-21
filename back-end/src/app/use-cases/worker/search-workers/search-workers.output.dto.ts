export interface SearchWorkersOutputDto {
	workers: {
		id: string;
		name: string;
		workingSince: Date;
		serviceTypes: string[];
		serviceTypeIds: string[];
		profilePicture: string | null;
	}[];
}
