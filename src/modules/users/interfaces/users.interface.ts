import { User } from '@modules/users/entities/user.entity';
import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { FindAllResponse, QueryParams } from 'src/types/common.type';

export interface UsersRepositoryInterface
	extends BaseRepositoryInterface<User> {
	findAllWithSubFields(
		condition: object,
		options: QueryParams & {
			projection?: string;
			populate?: string[] | any;
		},
	): Promise<FindAllResponse<User>>;

	getUserWithRole(user_id: string): Promise<User>;
}
