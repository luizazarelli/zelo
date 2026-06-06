export interface SearchWorkersOutputDto {
	workers: {
		id: string;
		name: string;
		workingSince: Date;
		serviceTypes: string[];
	}[];
}
