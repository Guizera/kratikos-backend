import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('polls')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova enquete' })
  @ApiResponse({
    status: 201,
    description: 'Enquete criada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() createPollDto: CreatePollDto, @Request() req) {
    return this.pollsService.create(createPollDto, req.user.userId);
  }

  @Get('remaining')
  @ApiOperation({ summary: 'Obter número de enquetes restantes' })
  @ApiResponse({
    status: 200,
    description: 'Número de enquetes restantes retornado',
    schema: {
      type: 'object',
      properties: {
        remaining: { type: 'number', example: 2 },
      },
    },
  })
  async getRemainingPolls() {
    // TODO: Implementar lógica de limite de enquetes por usuário/período
    // Por enquanto, retornar valor fixo (sem autenticação necessária)
    return { remaining: 2 };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as enquetes' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de itens por página', example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de enquetes retornada com sucesso' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.pollsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar enquete por ID' })
  @ApiResponse({ status: 200, description: 'Enquete encontrada' })
  @ApiResponse({ status: 404, description: 'Enquete não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pollsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover enquete' })
  @ApiResponse({ status: 200, description: 'Enquete removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Enquete não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.pollsService.remove(id);
    return { message: 'Enquete removida com sucesso' };
  }

  // ========================================================================
  // VOTING
  // ========================================================================

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Votar em uma enquete' })
  @ApiResponse({ status: 200, description: 'Voto registrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Enquete não encontrada' })
  @ApiResponse({ status: 400, description: 'Enquete encerrada ou opção inválida' })
  async vote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() votePollDto: VotePollDto,
    @Request() req,
  ) {
    await this.pollsService.vote(id, votePollDto, req.user.userId);
    return { message: 'Voto registrado com sucesso' };
  }

  @Delete(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover voto de uma enquete' })
  @ApiResponse({ status: 200, description: 'Voto removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Voto não encontrado' })
  async removeVote(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.pollsService.removeVote(id, req.user.userId);
    return { message: 'Voto removido com sucesso' };
  }

  @Get(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter voto do usuário em uma enquete' })
  @ApiResponse({ status: 200, description: 'Voto retornado com sucesso' })
  async getUserVote(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const vote = await this.pollsService.getUserVote(id, req.user.userId);
    return vote || { message: 'Usuário ainda não votou' };
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Obter resultados de uma enquete' })
  @ApiResponse({ status: 200, description: 'Resultados retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Enquete não encontrada' })
  async getResults(@Param('id', ParseUUIDPipe) id: string) {
    return this.pollsService.getPollResults(id);
  }
}

