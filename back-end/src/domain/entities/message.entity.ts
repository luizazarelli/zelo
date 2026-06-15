import { randomUUID } from 'node:crypto';

interface IMessageEntityProps {
    id: string;
    hireId: string;
    senderId: string;
    content: string;
    createdAt: Date;
}

type CreateMessageProps = Omit<IMessageEntityProps, 'id' | 'createdAt'>;

export class MessageEntity {
    private constructor(private _props: IMessageEntityProps) {}

    static create(props: CreateMessageProps): MessageEntity {
        return new MessageEntity({
            id: randomUUID(),
            createdAt: new Date(),
            ...props,
        });
    }

    static restore(props: IMessageEntityProps): MessageEntity {
        return new MessageEntity(props);
    }

    get props(): Readonly<IMessageEntityProps> {
        return this._props;
    }
}
