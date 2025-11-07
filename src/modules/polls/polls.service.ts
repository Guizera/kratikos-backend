import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './entities/poll.entity';
import { PollOption } from './entities/poll-option.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { Post, PostType } from '../posts/entities/post.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly pollOptionRepository: Repository<PollOption>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPollDto: CreatePollDto, authorId: string): Promise<Poll> {
    const { question, description, endDate, minOptions, maxOptions, options } = createPollDto;

    // Criar o post associado à enquete
    const post = this.postRepository.create({
      title: question.substring(0, 200), // Usar a pergunta como título (limitado a 200 chars)
      content: description || question,
      type: PostType.ENQUETE,
      authorId,
    });
    const savedPost = await this.postRepository.save(post);

    // Criar a enquete
    const poll = this.pollRepository.create({
      postId: savedPost.id,
      question,
      description,
      startDate: new Date(),
      endDate: endDate || null,
      minOptions: minOptions || 1,
      maxOptions: maxOptions || 1,
    });
    const savedPoll = await this.pollRepository.save(poll);

    // Criar as opções da enquete
    const pollOptions = options.map((content) =>
      this.pollOptionRepository.create({
        pollId: savedPoll.id,
        content,
        votesCount: 0,
      }),
    );
    await this.pollOptionRepository.save(pollOptions);

    // Retornar a enquete com as opções
    return this.pollRepository.findOne({
      where: { id: savedPoll.id },
      relations: ['options', 'post'],
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Poll[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.pollRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['options', 'post', 'post.author'],
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['options', 'post', 'post.author'],
    });

    if (!poll) {
      throw new NotFoundException(`Enquete com ID ${id} não encontrada`);
    }

    return poll;
  }

  async remove(id: string): Promise<void> {
    const poll = await this.findOne(id);
    
    // Remover as opções primeiro
    await this.pollOptionRepository.delete({ pollId: id });
    
    // Remover a enquete
    await this.pollRepository.remove(poll);
    
    // Remover o post associado
    if (poll.postId) {
      await this.postRepository.delete(poll.postId);
    }
  }
}

