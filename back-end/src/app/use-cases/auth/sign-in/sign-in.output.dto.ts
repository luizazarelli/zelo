export interface SignInOutputDTO {
	jwt: string;
	refreshToken: {
		token: string;
		expiresAt: Date;
	};
}
