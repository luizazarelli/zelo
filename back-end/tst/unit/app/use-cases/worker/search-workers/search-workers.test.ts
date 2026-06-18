import type { IUserRepository } from "@domain/repositories/user.repository";
import type { IWorkerRepository } from "@domain/repositories/worker.repository";
import { mockServiceTypeEntity } from "@test/mocks/entities/serviceType.entity.mock";
import { mockUserEntity } from "@test/mocks/entities/user.entity.mock";
import { mockWorkerEntity } from "@test/mocks/entities/worker.entity.mock";
import { mockUserRepository } from "@test/mocks/repositories/user.repository.mock";
import { mockWorkerRepository } from "@test/mocks/repositories/worker.repository.mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchWorkersUseCase } from "@application/use-cases/worker/search-workers/search-workers.usecase";

describe("SearchWorkers", () => {
	let usecase: SearchWorkersUseCase;
	let workerRepository: IWorkerRepository;
	let userRepository: IUserRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		workerRepository = mockWorkerRepository();
		userRepository = mockUserRepository();
		usecase = new SearchWorkersUseCase(workerRepository, userRepository);
	});

	it("should return all workers with resolved names when no filters are provided", async () => {
		const worker = mockWorkerEntity();
		const user = mockUserEntity(worker.props.userId);
		vi.mocked(workerRepository.search).mockResolvedValue([worker]);
		vi.mocked(userRepository.searchByIds).mockResolvedValue([user]);

		const result = await usecase.execute({});

		expect(workerRepository.search).toHaveBeenCalledWith({});
		expect(userRepository.searchByIds).toHaveBeenCalledWith([
			worker.props.userId,
		]);
		expect(result.workers).toHaveLength(1);
		expect(result.workers[0]).toMatchObject({
			id: worker.props.userId,
			name: user.props.name,
			workingSince: worker.props.workingSince,
			serviceTypes: [],
		});
	});

	it("should forward serviceTypes filter to the repository", async () => {
		const serviceTypeId = "550e8400-e29b-41d4-a716-446655440000";
		vi.mocked(workerRepository.search).mockResolvedValue([]);

		await usecase.execute({ serviceTypes: [serviceTypeId] });

		expect(workerRepository.search).toHaveBeenCalledWith({
			serviceTypes: [serviceTypeId],
		});
	});

	it("should map service type names from the worker entity", async () => {
		const st = mockServiceTypeEntity();
		const worker = mockWorkerEntity({ serviceTypes: [st] });
		const user = mockUserEntity(worker.props.userId);
		vi.mocked(workerRepository.search).mockResolvedValue([worker]);
		vi.mocked(userRepository.searchByIds).mockResolvedValue([user]);

		const result = await usecase.execute({});

		expect(result.workers[0]?.serviceTypes).toEqual([st.props.name]);
	});

	it("should skip searchByIds and return empty list when no workers match", async () => {
		vi.mocked(workerRepository.search).mockResolvedValue([]);

		const result = await usecase.execute({});

		expect(userRepository.searchByIds).not.toHaveBeenCalled();
		expect(result.workers).toHaveLength(0);
	});
});
