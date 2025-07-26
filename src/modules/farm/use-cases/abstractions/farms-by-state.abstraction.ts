import { IFarmsByState } from '@modules/farm/interfaces/farms-by-state.interface';

export abstract class FarmsByState {
  abstract execute(): Promise<IFarmsByState[]>;
}
