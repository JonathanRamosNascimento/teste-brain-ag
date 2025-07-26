export abstract class LandUsage {
  abstract execute(): Promise<{
    arableAreaHectares: number;
    vegetationAreaHectares: number;
  }>;
}
