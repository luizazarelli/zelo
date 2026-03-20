import { randomUUID } from "crypto";

interface IUserEntityProps {
    id: string; 
    createdAt: Date; 
    updatedAt: Date; 
    name: string; 
}

export default class UserEntity {
    private constructor(private props: IUserEntityProps) {}

    static create(props: Omit<IUserEntityProps, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
        const now = new Date();
        return new UserEntity({
            id: randomUUID(),
            createdAt: now, 
            updatedAt: now,
            ...props
        }); 
    }

    static restore(props: IUserEntityProps): UserEntity {
        return new UserEntity(props);        
    }
}