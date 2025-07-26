export abstract class FindFarmsByCrop {
  abstract execute(): Promise<{ cropName: string; count: number }[]>;
}
