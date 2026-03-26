import { randomUUID } from 'crypto';

export interface IRefreshTokenProps {
    id: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    userId: string;
    isRevoked: boolean;
}

type createRefreshTokenProps = Omit<
    IRefreshTokenProps,
    'id' | 'token' | 'createdAt'
>;

export class RefreshTokenEntity {
    private constructor(private _props: IRefreshTokenProps) {}

    static create(props: createRefreshTokenProps) {
        const now = new Date();
        return new RefreshTokenEntity({
            id: randomUUID(),
            token: randomUUID(),
            createdAt: now,
            ...props,
        });
    }

    revoke() {
        this._props.isRevoked = true;
    }
}
