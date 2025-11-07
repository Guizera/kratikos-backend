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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getRemainingPolls(@Request() req) {
    // TODO: Implementar lógica de limite de enquetes por usuário/período
    // Por enquanto, retornar valor fixo
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
}

