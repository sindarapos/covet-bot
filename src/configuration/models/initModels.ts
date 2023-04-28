import { initUserModel, UserModel } from './userModel';
import { GameModel, initGameModel } from './gameModel';

const initRelationships = () => {
  UserModel.belongsToMany(GameModel, { through: 'Owns' });
  GameModel.belongsToMany(UserModel, { through: 'Owns' });

  UserModel.belongsToMany(GameModel, { through: 'Likes' });
  GameModel.belongsToMany(UserModel, { through: 'Likes' });
};

export const initModels = () => {
  initUserModel();
  initGameModel();

  initRelationships();
};
