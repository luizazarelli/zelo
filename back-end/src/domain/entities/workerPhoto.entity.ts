import { randomUUID } from 'crypto';

interface IWorkerPhotoEntityProps {
    id: string;
    workerId: string;
    url: string;
    position: number;
    createdAt: Date;
}

type CreateWorkerPhotoProps = Omit<IWorkerPhotoEntityProps, 'id' | 'createdAt'>;

export class WorkerPhotoEntity {
    private constructor(private _props: IWorkerPhotoEntityProps) {}

    static create(props: CreateWorkerPhotoProps): WorkerPhotoEntity {
        return new WorkerPhotoEntity({
            id: randomUUID(),
            createdAt: new Date(),
            ...props,
        });
    }

    static restore(props: IWorkerPhotoEntityProps): WorkerPhotoEntity {
        return new WorkerPhotoEntity(props);
    }

    get props(): Readonly<IWorkerPhotoEntityProps> {
        return this._props;
    }
}
