import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './entities/poll.entity';
import { PollOption } from './entities/poll-option.entity';
import { PollVote } from './entities/poll-vote.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { Post, PostType } from '../posts/entities/post.entity';
import { PostScope } from '../posts/dto/location.dto';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly pollOptionRepository: Repository<PollOption>,
    @InjectRepository(PollVote)
    private readonly pollVoteRepository: Repository<PollVote>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPollDto: CreatePollDto, authorId: string): Promise<Poll> {
    const { question, description, endDate, minOptions, maxOptions, options, scope, location } = createPollDto;

    // DEBUG: Log das opções recebidas
    console.log('🔍 Criando enquete:', question);
    console.log('📊 Opções recebidas:', options);
    console.log('📊 Número de opções:', options?.length || 0);

    // Criar o post associado à enquete
    const post = this.postRepository.create({
      title: question.substring(0, 200), // Usar a pergunta como título (limitado a 200 chars)
      content: description || question,
      type: PostType.ENQUETE,
      authorId,
      scope: scope || PostScope.NACIONAL,
      locationLat: location?.lat,
      locationLng: location?.lng,
      locationRangeKm: location?.range_km || 50,
      locationCity: location?.city,
      locationState: location?.state,
      locationCountry: location?.country || 'Brasil',
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
    console.log('📝 Criando opções para poll:', savedPoll.id);
    const pollOptions = options.map((content) =>
      this.pollOptionRepository.create({
        pollId: savedPoll.id,
        content,
        votesCount: 0,
      }),
    );
    console.log('📝 Opções criadas:', pollOptions.length);
    const savedOptions = await this.pollOptionRepository.save(pollOptions);
    console.log('✅ Opções salvas no banco:', savedOptions.length);

    // Retornar a enquete com as opções
    const result = await this.pollRepository.findOne({
      where: { id: savedPoll.id },
      relations: ['options', 'post'],
    });
    console.log('📤 Retornando enquete com', result?.options?.length || 0, 'opções');
    return result;
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
    
    // Remover votos primeiro
    await this.pollVoteRepository.delete({ pollId: id });
    
    // Remover as opções
    await this.pollOptionRepository.delete({ pollId: id });
    
    // Remover a enquete
    await this.pollRepository.remove(poll);
    
    // Remover o post associado
    if (poll.postId) {
      await this.postRepository.delete(poll.postId);
    }
  }

  // ========================================================================
  // VOTING
  // ========================================================================

  async vote(pollId: string, votePollDto: VotePollDto, userId: string): Promise<void> {
    const { optionId } = votePollDto;

    // Verificar se enquete existe
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options'],
    });

    if (!poll) {
      throw new NotFoundException('Enquete não encontrada');
    }

    // Verificar se enquete está ativa
    if (poll.endDate && new Date() > poll.endDate) {
      throw new BadRequestException('Enquete encerrada');
    }

    // Verificar se opção pertence a esta enquete
    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new BadRequestException('Opção inválida para esta enquete');
    }

    // Verificar se usuário já votou
    const existingVote = await this.pollVoteRepository.findOne({
      where: { pollId, userId },
    });

    if (existingVote) {
      // Se já votou, atualizar voto
      // Decrementar contador da opção antiga
      await this.pollOptionRepository.decrement(
        { id: existingVote.optionId },
        'votesCount',
        1,
      );

      // Atualizar voto
      existingVote.optionId = optionId;
      await this.pollVoteRepository.save(existingVote);
    } else {
      // Criar novo voto
      const vote = this.pollVoteRepository.create({
        pollId,
        userId,
        optionId,
      });
      await this.pollVoteRepository.save(vote);
    }

    // Incrementar contador da opção escolhida
    await this.pollOptionRepository.increment({ id: optionId }, 'votesCount', 1);
  }

  async removeVote(pollId: string, userId: string): Promise<void> {
    // Verificar se voto existe
    const vote = await this.pollVoteRepository.findOne({
      where: { pollId, userId },
    });

    if (!vote) {
      throw new NotFoundException('Voto não encontrado');
    }

    // Decrementar contador
    await this.pollOptionRepository.decrement({ id: vote.optionId }, 'votesCount', 1);

    // Remover voto
    await this.pollVoteRepository.remove(vote);
  }

  async getUserVote(pollId: string, userId: string): Promise<PollVote | null> {
    return this.pollVoteRepository.findOne({
      where: { pollId, userId },
      relations: ['option'],
    });
  }

  async getPollResults(pollId: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options', 'post', 'post.author'],
    });

    if (!poll) {
      throw new NotFoundException('Enquete não encontrada');
    }

    return poll;
  }
}

