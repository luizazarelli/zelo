export interface IJwtProvider<Payload extends object> {
    verify(token: string, secret: string): Promise<Payload>;
    sign(payload: Payload, secret: string, expiresin: number): string;
}
