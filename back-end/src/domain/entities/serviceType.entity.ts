import { randomUUID } from "node:crypto";

interface IServiceTypeProps {
    id: string; 
    name: string; 
    description?: string; 
}

type CreateServiceType = Omit<IServiceTypeProps, 'id'>

export class ServiceTypeEntity {
    private constructor (private _props: IServiceTypeProps) {
    }

    static create(props: CreateServiceType) {
        return new ServiceTypeEntity({
            id: randomUUID(),
            ...props
        });
    }

    static restore(props: IServiceTypeProps) {
        return new ServiceTypeEntity(props); 
    }

    get props(): Readonly<IServiceTypeProps> {
        return this._props; 
    }
}