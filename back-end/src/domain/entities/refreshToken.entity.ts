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
    'id' | 'token' | 'createdAt' | 'isRevoked'
>;

export class RefreshTokenEntity {
    private constructor(private _props: IRefreshTokenProps) {}

    static create(props: createRefreshTokenProps) {
        const now = new Date();
        return new RefreshTokenEntity({
            id: randomUUID(),
            token: randomUUID(),
            createdAt: now,
            isRevoked: false,
            ...props,
        });
    }

    static restore(props: IRefreshTokenProps) {
        return new RefreshTokenEntity(props);
    }

    get props(): Readonly<IRefreshTokenProps> {
        return this._props;
    }

    revoke() {
        this._props.isRevoked = true;
    }
}
