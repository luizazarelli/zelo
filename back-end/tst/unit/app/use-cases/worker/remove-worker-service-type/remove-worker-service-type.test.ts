import { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { IWorkerRepository } from "@domain/repositories/worker.repository";
import { mockServiceTypeEntity } from "@test/mocks/entities/serviceType.entity.mock";
import { mockWorkerEntity } from "@test/mocks/entities/worker.entity.mock";
import { mockServiceTypeRepository } from "@test/mocks/repositories/serviceType.repository.mock";
import { mockWorkerRepository } from "@test/mocks/repositories/worker.repository.mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTypeNotFound } from "@application/use-cases/worker/_errors/service-type-not-found";
import { WorkerNotFound } from "@application/use-cases/worker/_errors/worker-not-found";
import { RemoveWorkerServiceTypeInputDto } from "@application/use-cases/worker/remove-worker-service-type/remove-worker-service-type.input.dto";
import { RemoveWorkerServiceTypeUseCase } from "@application/use-cases/worker/remove-worker-service-type/remove-worker-service-type.usecase";

describe('removeWorkerServiceType', () => {
    let usecase: RemoveWorkerServiceTypeUseCase;
    let workerRepository: IWorkerRepository;
    let serviceTypeRepository: IServiceTypeRepository;
    
    beforeEach(() => {
        vi.clearAllMocks();
        workerRepository = mockWorkerRepository();
        serviceTypeRepository = mockServiceTypeRepository();

        usecase = new RemoveWorkerServiceTypeUseCase(workerRepository, serviceTypeRepository);
    });

    const payload: RemoveWorkerServiceTypeInputDto = {
        workerId: "123",
        serviceTypeId: "123"
    };

    it("Should fail if worker\'s not found", async () => {
        vi.mocked(workerRepository.findById).mockResolvedValue(null); 
        vi.mocked(serviceTypeRepository.findById).mockResolvedValue(mockServiceTypeEntity()); 

        await expect(usecase.execute(payload)).rejects.toThrow(WorkerNotFound)
        expect(workerRepository.findById).toHaveBeenCalledOnce()
        expect(serviceTypeRepository.findById).toHaveBeenCalledOnce()
    });

    it("Should fail if serviceType\'s not found", async () => {
        vi.mocked(workerRepository.findById).mockResolvedValue(mockWorkerEntity()); 
        vi.mocked(serviceTypeRepository.findById).mockResolvedValue(null); 

        await expect(usecase.execute(payload)).rejects.toThrow(ServiceTypeNotFound)  
        expect(workerRepository.findById).toHaveBeenCalledOnce()
        expect(serviceTypeRepository.findById).toHaveBeenCalledOnce()
    });

    it("Should succeed if both worker and serviceType are found", async () => {
        vi.mocked(serviceTypeRepository.findById).mockResolvedValue(mockServiceTypeEntity()); 
        vi.mocked(workerRepository.findById).mockResolvedValue(mockWorkerEntity()); 
        await expect(usecase.execute(payload)).resolves.not.toThrow()

        expect(workerRepository.save).toHaveBeenCalledOnce()
        expect(workerRepository.findById).toHaveBeenCalledOnce()
        expect(serviceTypeRepository.findById).toHaveBeenCalledOnce()
    });
})