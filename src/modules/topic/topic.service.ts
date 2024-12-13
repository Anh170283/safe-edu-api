import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TopicsRepositoryInterface } from './interfaces/topic.interface';
import { CreateTopicDto} from './dto/create-topic.dto';
import { Topic } from './entities/topic.entity';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { IFile } from 'src/interfaces/file.interface';


@Injectable()
export class TopicsService {
  constructor(
    @Inject('TopicsRepositoryInterface')
    private readonly topicsRepository: TopicsRepositoryInterface,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createDto: CreateTopicDto): Promise<Topic> {
    return this.topicsRepository.create(createDto);
  }
  async update(id: string, updateDto: UpdateTopicDto): Promise<Topic> {
    const existingTopic = await this.findOne(id);

    let imageUrl = updateDto.image || existingTopic.image;

    if (typeof updateDto.image !== 'string' && updateDto.image) {
      imageUrl = await this.awsS3Service.uploadImage(updateDto.image);
    }

    const updatedTopicData = {
      ...updateDto,
      image: imageUrl,
    };

    return this.topicsRepository.update(id, updatedTopicData);
  }

  async findAll() {
    return this.topicsRepository.findAll();
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOneByCondition({ _id: id });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  async delete(id: string): Promise<Topic> {
    return await this.topicsRepository.update(id, { deleted_at: new Date() });
  }
}