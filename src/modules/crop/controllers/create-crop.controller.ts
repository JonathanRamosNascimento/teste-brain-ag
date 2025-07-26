import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCropUseCase } from '../use-cases/create-crop.use-case';
import { CreateCropDto } from '../dto/create-crop.dto';
import { Crop } from '../entities/crop.entity';

@ApiTags('Crops')
@Controller('crops')
export class CreateCropController {
  constructor(private readonly createCropUseCase: CreateCropUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova cultura' })
  @ApiResponse({
    status: 201,
    description: 'Cultura criada com sucesso',
    type: Crop,
  })
  @ApiResponse({
    status: 409,
    description: 'Cultura já cadastrada',
  })
  async createCrop(@Body() data: CreateCropDto) {
    return await this.createCropUseCase.execute(data);
  }
}
