import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from './entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Seguir um usuário
   */
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    // Verificar se não está tentando seguir a si mesmo
    if (followerId === followingId) {
      throw new BadRequestException('Você não pode seguir a si mesmo');
    }

    // Verificar se o usuário a ser seguido existe
    const userToFollow = await this.userRepository.findOne({
      where: { id: followingId },
    });

    if (!userToFollow) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já está seguindo
    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new BadRequestException('Você já está seguindo este usuário');
    }

    // Criar o follow
    const follow = this.followRepository.create({
      followerId,
      followingId,
    });

    return this.followRepository.save(follow);
  }

  /**
   * Deixar de seguir um usuário
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new NotFoundException('Você não está seguindo este usuário');
    }

    await this.followRepository.remove(follow);
  }

  /**
   * Verificar se um usuário está seguindo outro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }

  /**
   * Obter lista de seguidores de um usuário
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 50) {
    const [follows, total] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const followers = follows.map(follow => ({
      id: follow.follower.id,
      name: follow.follower.name,
      email: follow.follower.email,
      photoUrl: follow.follower.photoUrl,
      followedAt: follow.createdAt,
    }));

    return { data: followers, total };
  }

  /**
   * Obter lista de usuários que um usuário está seguindo
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 50) {
    const [follows, total] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const following = follows.map(follow => ({
      id: follow.following.id,
      name: follow.following.name,
      email: follow.following.email,
      photoUrl: follow.following.photoUrl,
      followedAt: follow.createdAt,
    }));

    return { data: following, total };
  }

  /**
   * Obter contadores de seguidores e seguindo
   */
  async getFollowCounts(userId: string) {
    const followersCount = await this.followRepository.count({
      where: { followingId: userId },
    });

    const followingCount = await this.followRepository.count({
      where: { followerId: userId },
    });

    return {
      followers: followersCount,
      following: followingCount,
    };
  }
}

