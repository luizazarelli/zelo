import { randomUUID } from 'crypto';

interface IUserEntityProps {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    password: string;
}

type CreateUserProps = Omit<
    IUserEntityProps,
    'id' | 'createdAt' | 'updatedAt' | 'refreshTokens'
>;

export default class UserEntity {
    private static MAX_REFRESH_TOKENS = 3;
    private constructor(private _props: IUserEntityProps) {}

    static create(props: CreateUserProps): UserEntity {
        const now = new Date();

        return new UserEntity({
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            ...props,
        });
    }

    static restore(props: IUserEntityProps): UserEntity {
        return new UserEntity(props);
    }

    get props(): Readonly<IUserEntityProps> {
        return this.props;
    }

    private createRefreshToken() {
        return randomUUID();
    }
}
