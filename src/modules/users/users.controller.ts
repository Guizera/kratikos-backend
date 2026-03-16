import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usu?rio' })
  @ApiResponse({ status: 201, description: 'Usu?rio criado com sucesso', type: User })
  @ApiResponse({ status: 400, description: 'Dados inv?lidos' })
  @ApiResponse({ status: 409, description: 'Email j? est? em uso' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar todos os usu?rios' })
  @ApiResponse({ status: 200, description: 'Lista de usu?rios retornada', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar usu?rio por ID' })
  @ApiResponse({ status: 200, description: 'Usu?rio encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usu?rio n?o encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar usu?rio' })
  @ApiResponse({ status: 200, description: 'Usu?rio atualizado', type: User })
  @ApiResponse({ status: 404, description: 'Usu?rio n?o encontrado' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remover usu?rio' })
  @ApiResponse({ status: 200, description: 'Usu?rio removido' })
  @ApiResponse({ status: 404, description: 'Usu?rio n?o encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ========================================================================
  // VERIFICA??O E CPF
  // ========================================================================

  @Patch('profile/cpf')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar CPF do usu?rio' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cpf: { 
          type: 'string', 
          example: '123.456.789-00',
          description: 'CPF com ou sem formata??o',
        },
      },
      required: ['cpf'],
    },
  })
  @ApiResponse({ status: 200, description: 'CPF atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'CPF inv?lido ou j? cadastrado' })
  @ApiResponse({ status: 401, description: 'N?o autorizado' })
  async updateCpf(@Request() req, @Body() body: { cpf: string }) {
    await this.usersService.updateCpf(req.user.userId, body.cpf);
    return { 
      message: 'CPF verificado com sucesso',
      verificationLevel: 2,
    };
  }

  @Delete('profile/cpf')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover CPF do usu?rio (volta para n?vel 1)' })
  @ApiResponse({ status: 204, description: 'CPF removido' })
  @ApiResponse({ status: 401, description: 'N?o autorizado' })
  async removeCpf(@Request() req) {
    await this.usersService.removeCpf(req.user.userId);
  }

  @Get('verification/info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Informa??es de verifica??o do usu?rio' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informa??es de verifica??o retornadas',
    schema: {
      type: 'object',
      properties: {
        verificationLevel: { type: 'number', example: 1 },
        levelName: { type: 'string', example: 'B?sica' },
        documentVerified: { type: 'boolean', example: false },
        verifiedAt: { type: 'string', format: 'date-time', nullable: true },
        benefits: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Votar em enquetes', 'Criar posts b?sicos'],
        },
        nextLevelInfo: {
          type: 'object',
          nullable: true,
          properties: {
            level: { type: 'number' },
            name: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  async getVerificationInfo(@Request() req) {
    return await this.usersService.getVerificationInfo(req.user.userId);
  }

  @Get('score/current')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Score e peso atual do usu?rio' })
  @ApiResponse({ 
    status: 200,
    description: 'Score calculado retornado',
    schema: {
      type: 'object',
      properties: {
        baseScore: { type: 'number', example: 1.0 },
        verificationBonus: { type: 'number', example: 0.3 },
        historyScore: { type: 'number', example: 0.45 },
        consistencyScore: { type: 'number', example: 0.8 },
        finalScore: { type: 'number', example: 0.92 },
        weight: { type: 'number', example: 1.35 },
      },
    },
  })
  async getCurrentScore(@Request() req) {
    return await this.usersService.getCurrentScore(req.user.userId);
  }

  @Get('stats/personal')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Estatísticas pessoais do usuário' })
  @ApiResponse({ 
    status: 200,
    description: 'Estatísticas retornadas',
    schema: {
      type: 'object',
      properties: {
        totalVotes: { type: 'number', example: 127 },
        consistentStreak: { type: 'number', example: 15 },
        lastVoteAt: { type: 'string', format: 'date-time', nullable: true },
        accountAge: { type: 'number', example: 45, description: 'Dias desde criação da conta' },
        currentScore: {
          type: 'object',
          properties: {
            baseScore: { type: 'number' },
            verificationBonus: { type: 'number' },
            historyScore: { type: 'number' },
            consistencyScore: { type: 'number' },
            finalScore: { type: 'number' },
            weight: { type: 'number' },
          },
        },
        ranking: {
          type: 'object',
          properties: {
            position: { type: 'number', example: 42 },
            total: { type: 'number', example: 1500 },
            percentile: { type: 'string', example: '97.2' },
          },
        },
        dailyActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              votes: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getPersonalStats(@Request() req) {
    return await this.usersService.getPersonalStats(req.user.userId);
  }
}
