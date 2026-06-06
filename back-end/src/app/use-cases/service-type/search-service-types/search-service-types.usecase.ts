import type BaseUsecase from "@application/use-cases/base.usecase";
import type { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { INFRA } from "@infra/tokens";
import { inject, injectable } from "tsyringe";
import type { SearchServiceTypesInputDto } from "./search-service-types.input.dto";
import type { SearchServiceTypesOutputDto } from "./search-service-types.output.dto";

@injectable()
export class SearchServiceTypesUseCase
	implements BaseUsecase<SearchServiceTypesInputDto, SearchServiceTypesOutputDto>
{
	constructor(
		@inject(INFRA.REPOSITORIES.SERVICE_TYPE)
		private readonly serviceTypeRepository: IServiceTypeRepository,
	) {}

	async execute(_: SearchServiceTypesInputDto): Promise<SearchServiceTypesOutputDto> {
		const serviceTypes = await this.serviceTypeRepository.search();

		return {
			serviceTypes: serviceTypes.map((st) => ({
				id: st.props.id,
				name: st.props.name,
				description: st.props.description ?? "",
			})),
		};
	}
}
