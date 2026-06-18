import { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { IWorkerRepository } from "@domain/repositories/worker.repository";
import { mockServiceTypeEntity } from "@test/mocks/entities/serviceType.entity.mock";
import { mockWorkerEntity } from "@test/mocks/entities/worker.entity.mock";
import { mockServiceTypeRepository } from "@test/mocks/repositories/serviceType.repository.mock";
import { mockWorkerRepository } from "@test/mocks/repositories/worker.repository.mock";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTypeNotFound } from "@application/use-cases/worker/_errors/service-type-not-found";
import { WorkerNotFound } from "@application/use-cases/worker/_errors/worker-not-found";
import { AddWorkerServiceTypeUseCase } from "@application/use-cases/worker/add-worker-service-type/add-worker-service-type.usecase";

describe('AddWorkerServiceType', () => {
    let usecase: AddWorkerServiceTypeUseCase;
    let workerRepository: IWorkerRepository; 
    let serviceTypeRepository: IServiceTypeRepository;

    beforeEach(() => {
        vi.clearAllMocks();

        workerRepository = mockWorkerRepository();
        serviceTypeRepository = mockServiceTypeRepository();
        usecase = new AddWorkerServiceTypeUseCase(
            workerRepository, 
            serviceTypeRepository
        );
    });

    afterEach(() => {
        expect(workerRepository.findById).toHaveBeenCalledOnce()
        expect(serviceTypeRepository.findById).toHaveBeenCalledOnce()
    });

    const payload = {
        serviceTypeId: "123",
        userId: '321'
    };

    it('Should fail if worker\'s not found', async () => {
        vi.mocked(workerRepository.findById).mockResolvedValue(null);
        vi.mocked(serviceTypeRepository.findById).mockResolvedValue(mockServiceTypeEntity())

        await expect(usecase.execute(payload)).rejects.toThrow(WorkerNotFound);
    });

    it('Should fail if serviceType\'s not found', async () => {
        vi.mocked(workerRepository.findById).mockResolvedValue(mockWorkerEntity());
        vi.mocked(serviceTypeRepository.findById).mockResolvedValue(null);
        await expect(usecase.execute(payload)).rejects.toThrow(ServiceTypeNotFound);
    }); 

    it('Should succeed if both worker and serviceType are found', async () => {
        await expect(usecase.execute(payload)).resolves.not.toThrow();
        expect(workerRepository.save).toHaveBeenCalledOnce();
    });
}); 