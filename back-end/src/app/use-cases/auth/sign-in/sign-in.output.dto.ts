export interface SignInOutputDTO {
    jwt: string;
    refreshToken: {
        token: string;
        expiresIn: Date;
    };
}
