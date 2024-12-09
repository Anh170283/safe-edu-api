import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	SerializeOptions,
	UseGuards,
	UploadedFiles,
	Query,
	ParseIntPipe,
	Req,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

// INNER
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

// OUTER
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { RequestWithUser } from 'src/types/requests.type';
import { QueryParams } from 'src/types/common.type';

@Controller('users')
@ApiTags('users')
// @ApiBearerAuth('token')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
	constructor(private readonly users_service: UsersService) {}

	@Post()
	create(@Body() create_user_dto: CreateUserDto) {
		console.log(create_user_dto);

		return this.users_service.create(create_user_dto);
	}

	@Get()
	@ApiQuery({ name: 'page', type: Number, required: true })
	@ApiQuery({ name: 'limit', type: Number, required: true })
	@ApiQuery({ name: 'sort', type: String, required: false })
	@ApiQuery({ name: 'filter', type: String, required: false })
	@ApiQuery({ name: 'globalFilter', type: String, required: false })
	@Roles(USER_ROLE.USER)
	@UseGuards(RolesGuard)
	@UseGuards(JwtAccessTokenGuard)
	async findAll(
		@Query('page', ParseIntPipe) page: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('sort') sort?: string,
		@Query('filter') filter?: string,
		@Query('globalFilter') globalFilter?: string,
	) {
		// Parse sort and filter if they exist
		const parsedSort = sort ? JSON.parse(sort) : [];
		const parsedFilter = filter ? JSON.parse(filter) : [];

		const queryParams: QueryParams = {
			page,
			limit,
			sort: parsedSort,
			filter: parsedFilter,
			globalFilter: globalFilter ? { value: globalFilter } : undefined,
		};

		return await this.users_service.findAll(queryParams);
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return await this.users_service.findOne(id);
	}

	@Post('student-cards')
	@ApiOperation({
		summary: 'Admin create topic',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				student_card_front: {
					type: 'string',
					format: 'binary',
				},
				student_card_back: {
					type: 'string',
					format: 'binary',
				},
				live_photos: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
				},
			},
			required: ['student_card_front', 'student_card_back', 'live_photos'],
		},
	})
	@UseInterceptors(AnyFilesInterceptor())
	updateStudentCard(@UploadedFiles() files: Array<Express.Multer.File>) {
		console.log(files);
		return files.map((file) => file.originalname);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() update_user_dto: UpdateUserDto) {
		return this.users_service.update(id, update_user_dto);
	}

	@Delete(':id')
	@Roles(USER_ROLE.ADMIN)
	@UseGuards(RolesGuard)
	@UseGuards(JwtAccessTokenGuard)
	remove(@Param('id') id: string) {
		return this.users_service.remove(id);
	}
}
