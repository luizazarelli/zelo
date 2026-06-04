import { WorkerServiceTypeAlreadyExists } from "@domain/errors/worker.errors";
import { ServiceTypeEntity } from "./serviceType.entity";

interface IWorkerEntityProps {
    userId: string;
    createdAt: Date;
    description: string; 
    workingSince: Date; 
    serviceTypes: ServiceTypeEntity[];
}

type CreateWorkerProps = Omit<IWorkerEntityProps, 'createdAt'>

export class WorkerEntity {
    private constructor(private _props: IWorkerEntityProps) { }

    static create(props: CreateWorkerProps) {
        const now = new Date(); 
        return new WorkerEntity({
            createdAt: now, 
            ...props
        })
    }

    static restore(props: IWorkerEntityProps) {
        return new WorkerEntity(props);
    }

    updateProfile({ description }: Pick<IWorkerEntityProps, "description">) {
        this._props.description = description;
    }

    addServiceType(serviceType: ServiceTypeEntity) {
        const hasServiceType = this._props.serviceTypes.some(s => s.props.id == serviceType.props.id);
        if (hasServiceType) 
            throw new WorkerServiceTypeAlreadyExists()

        this._props.serviceTypes.push(serviceType);
    }

    removeServiceType(serviceType: ServiceTypeEntity) {
        this._props.serviceTypes = this._props.serviceTypes
            .filter(s => s.props.id != serviceType.props.id)
    }

    getServiceTypes(): Readonly<ServiceTypeEntity[]> {
        return this._props.serviceTypes; 
    }

    get props(): Readonly<IWorkerEntityProps> {
        return this._props;
    }
}