import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('app.upload.uploadPath') || 'uploads/';
    this.maxFileSize = this.configService.get<number>('app.upload.maxFileSize') || 5242880; // 5MB

    // Criar diretório de upload se não existir
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Validar tamanho do arquivo
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Validar tipo de arquivo (apenas imagens e vídeos)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo não suportado. Use apenas imagens (JPEG, PNG, GIF, WebP) ou vídeos (MP4, MPEG, MOV)',
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}-${randomString}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Salvar arquivo
    fs.writeFileSync(filePath, file.buffer);

    // Retornar URL do arquivo
    // TODO: Em produção, usar URL do CDN ou S3
    const baseUrl = this.configService.get<string>('app.baseUrl') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extrair nome do arquivo da URL
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadPath, fileName);

      // Verificar se o arquivo existe
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      // Não lançar exceção, apenas logar o erro
    }
  }
}

