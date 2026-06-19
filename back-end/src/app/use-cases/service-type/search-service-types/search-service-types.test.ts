import type { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { mockServiceTypeEntity } from "src/test/mocks/entities/serviceType.entity.mock";
import { mockServiceTypeRepository } from "src/test/mocks/repositories/serviceType.repository.mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchServiceTypesUseCase } from "./search-service-types.usecase";

describe("SearchServiceTypes", () => {
	let usecase: SearchServiceTypesUseCase;
	let serviceTypeRepository: IServiceTypeRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		serviceTypeRepository = mockServiceTypeRepository();
		usecase = new SearchServiceTypesUseCase(serviceTypeRepository);
	});

	it("should return all service types", async () => {
		const st = mockServiceTypeEntity();
		vi.mocked(serviceTypeRepository.search).mockResolvedValue([st]);

		const result = await usecase.execute({});

		expect(serviceTypeRepository.search).toHaveBeenCalledOnce();
		expect(result.serviceTypes).toHaveLength(1);
		expect(result.serviceTypes[0]).toMatchObject({
			id: st.props.id,
			name: st.props.name,
			description: st.props.description ?? "",
		});
	});

	it("should return an empty list when no service types exist", async () => {
		vi.mocked(serviceTypeRepository.search).mockResolvedValue([]);

		const result = await usecase.execute({});

		expect(result.serviceTypes).toHaveLength(0);
	});
});
