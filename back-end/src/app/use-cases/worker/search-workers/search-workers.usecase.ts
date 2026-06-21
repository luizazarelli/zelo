import type BaseUsecase from "@application/use-cases/base.usecase";
import type { IUserRepository } from "@domain/repositories/user.repository";
import type { IWorkerRepository } from "@domain/repositories/worker.repository";
import { INFRA } from "@infra/tokens";
import { inject, injectable } from "tsyringe";
import type { SearchWorkersInputDto } from "./search-workers.input.dto";
import type { SearchWorkersOutputDto } from "./search-workers.output.dto";

@injectable()
export class SearchWorkersUseCase
	implements BaseUsecase<SearchWorkersInputDto, SearchWorkersOutputDto>
{
	constructor(
		@inject(INFRA.REPOSITORIES.WORKER)
		private readonly workerRepository: IWorkerRepository,
		@inject(INFRA.REPOSITORIES.USER)
		private readonly userRepository: IUserRepository,
	) {}

	async execute({
		serviceTypes,
	}: SearchWorkersInputDto): Promise<SearchWorkersOutputDto> {
		const workers = await this.workerRepository.search({
			...(serviceTypes && { serviceTypes }),
		});

		if (workers.length === 0) return { workers: [] };

		const userIds = workers.map((w) => w.props.userId);
		const users = await this.userRepository.searchByIds(userIds);
		const userById = new Map(users.map((u) => [u.props.id, u.props]));

		return {
			workers: workers.map((worker) => {
				const user = userById.get(worker.props.userId);
				return {
					id: worker.props.userId,
					name: user?.name ?? "",
					workingSince: worker.props.workingSince,
					serviceTypes: worker.getServiceTypes().map((st) => st.props.name),
					serviceTypeIds: worker.getServiceTypes().map((st) => st.props.id),
					profilePicture: user?.profilePicture ?? null,
				};
			}),
		};
	}
}
