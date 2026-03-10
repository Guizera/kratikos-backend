import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SimpleScoringService } from '../scoring/simple-scoring.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly scoringService: SimpleScoringService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, {
      ...updateUserDto,
      password_hash: updateUserDto.password,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { appleId } });
  }

  async createSocialUser(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  // ========================================================================
  // VERIFICAÇÃO E CPF
  // ========================================================================

  /**
   * Gera hash do CPF (SHA-256)
   * IMPORTANTE: Nunca armazenar CPF em texto puro!
   */
  private hashCpf(cpf: string): string {
    const salt = process.env.CPF_SALT || 'kratikos_cpf_salt_change_in_production';
    
    // Remover formatação (pontos e traços)
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    
    // Validar formato
    if (cleanCpf.length !== 11) {
      throw new BadRequestException('CPF deve ter 11 dígitos');
    }
    
    // Gerar hash SHA-256
    const hash = crypto
      .createHash('sha256')
      .update(`${cleanCpf}${salt}`)
      .digest('hex');
    
    return hash;
  }

  /**
   * Valida CPF usando algoritmo oficial
   */
  private isValidCpf(cpf: string): boolean {
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    
    if (cleanCpf.length !== 11) return false;
    
    // CPFs inválidos conhecidos (todos dígitos iguais)
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
    
    return true;
  }

  /**
   * Atualiza CPF do usuário e eleva para nível 2 (Verificado)
   */
  async updateCpf(userId: string, cpf: string): Promise<void> {
    // 1. Validar CPF
    if (!this.isValidCpf(cpf)) {
      throw new BadRequestException('CPF inválido');
    }
    
    // 2. Gerar hash
    const cpfHash = this.hashCpf(cpf);
    
    // 3. Verificar se CPF já está em uso
    const existingUser = await this.usersRepository.findOne({
      where: { cpfHash },
    });
    
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('CPF já cadastrado em outra conta');
    }
    
    // 4. Atualizar usuário
    await this.usersRepository.update(userId, {
      cpfHash,
      verificationLevel: 2, // Nível 2 = Verificado
      documentVerified: true,
      documentVerifiedAt: new Date(),
    });
  }

  /**
   * Busca informações de verificação do usuário
   */
  async getVerificationInfo(userId: string): Promise<{
    verificationLevel: number;
    levelName: string;
    documentVerified: boolean;
    verifiedAt: Date | null;
    benefits: string[];
    nextLevelInfo?: {
      level: number;
      name: string;
      requirements: string[];
    };
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['verificationLevel', 'documentVerified', 'documentVerifiedAt'],
    });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    const levels = {
      1: {
        name: 'Básica',
        benefits: [
          'Votar em enquetes',
          'Criar posts básicos',
          'Comentar e interagir',
          'Peso de voto: 1.0x',
        ],
      },
      2: {
        name: 'Verificada',
        benefits: [
          'Peso de voto aumentado (até 1.5x)',
          'Criar enquetes',
          'Badge de verificado no perfil',
          'Prioridade no suporte',
          'Maior confiança da comunidade',
        ],
      },
      3: {
        name: 'Legal/Corporativa',
        benefits: [
          'Peso de voto máximo (até 2.0x)',
          'Criar conteúdo comercial',
          'Acesso a dashboard B2B (futuro)',
          'API access (futuro)',
          'Selo corporativo',
        ],
      },
    };
    
    const level = levels[user.verificationLevel] || levels[1];
    
    // Informações do próximo nível
    let nextLevelInfo = undefined;
    if (user.verificationLevel === 1) {
      nextLevelInfo = {
        level: 2,
        name: 'Verificada',
        requirements: [
          'Adicionar CPF válido',
        ],
      };
    } else if (user.verificationLevel === 2) {
      nextLevelInfo = {
        level: 3,
        name: 'Legal/Corporativa',
        requirements: [
          'Validação de CNPJ ou documento legal',
          'Entre em contato com suporte',
        ],
      };
    }
    
    return {
      verificationLevel: user.verificationLevel,
      levelName: level.name,
      documentVerified: user.documentVerified,
      verifiedAt: user.documentVerifiedAt,
      benefits: level.benefits,
      nextLevelInfo,
    };
  }

  /**
   * Remove CPF do usuário (volta para nível 1)
   */
  async removeCpf(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      cpfHash: null,
      verificationLevel: 1,
      documentVerified: false,
      documentVerifiedAt: null,
    });
  }

  /**
   * Retorna o score atual do usuário
   */
  async getCurrentScore(userId: string) {
    return await this.scoringService.calculateUserScore(userId);
  }
}
