import { randomUUID } from 'crypto';

interface IUserEntityProps {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    password: string;
    phone: string;
    profilePicture?: string | null;
}
type CreateUserProps = Omit<IUserEntityProps, 'id' | 'createdAt' | 'updatedAt'>;

export default class UserEntity {
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

    updateProfilePicture(url: string): void {
        this._props.profilePicture = url;
    }

    get props(): Readonly<IUserEntityProps> {
        return this._props;
    }
}
