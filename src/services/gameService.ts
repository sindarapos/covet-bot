import { GameModel } from '../configuration/models/game.model';

export const isEmptyGameList = async (): Promise<boolean> => {
  const gameCount = await GameModel.count();
  return gameCount === 0;
};
