import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationArea {
  validFarmAreas(
    totalArea: number,
    arableArea: number,
    vegetationArea: number,
  ): boolean {
    return totalArea >= arableArea + vegetationArea;
  }
}
