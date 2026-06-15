import type { HireEntity } from '@domain/entities/hire.entity';

export interface IHireRepository {
    create(hire: HireEntity): Promise<void>;
    save(hire: HireEntity): Promise<void>;
    findById(id: string): Promise<HireEntity | null>;
    listByClientId(clientId: string, status?: string): Promise<HireEntity[]>;
    listByWorkerId(workerId: string, status?: string): Promise<HireEntity[]>;
}
