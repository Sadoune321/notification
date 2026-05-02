import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { StorageListener } from './storage.listener';

@Controller('storage')
@UseGuards(AuthGuard('jwt'))
export class StorageController {
  constructor(private readonly storageListener: StorageListener) {}

 
  @Post('upload/single')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId: string,
    @Body('doctorId') doctorId: string,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }
    if (!patientId || !doctorId) {
      throw new BadRequestException('patientId and doctorId are required.');
    }

    return this.storageListener.uploadSingle({
      file,
      patientId,
      doctorId,
      type: type ?? 'document',
    });
  }

 
  @Post('upload/multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10)) 
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('patientId') patientId: string,
    @Body('doctorId') doctorId: string,
    @Body('type') type: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided.');
    }
    if (!patientId || !doctorId) {
      throw new BadRequestException('patientId and doctorId are required.');
    }

    return this.storageListener.uploadMultiple({
      files,
      patientId,
      doctorId,
      type: type ?? 'document',
    });
  }
}
