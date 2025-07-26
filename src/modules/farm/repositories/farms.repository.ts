import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';
import { IFarmsByCrop } from '../interfaces/farms-by-crop.interface';
import { IFarmsByState } from '../interfaces/farms-by-state.interface';
import { ILandUsage } from '../interfaces/land-usage.interface';

export abstract class FarmsRepository {
  abstract create(data: CreateFarmDto): Promise<Farm>;
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<Farm | null>;
  abstract farmsByState(): Promise<IFarmsByState[]>;
  abstract totalAreaHectares(): Promise<number>;
  abstract findFarmsByCrop(): Promise<IFarmsByCrop[]>;
  abstract landUsage(): Promise<ILandUsage>;
}
