import { sequelize } from '../database';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export class GameModel extends Model<InferAttributes<GameModel>, InferCreationAttributes<GameModel>> {
  declare name: string;
  declare releaseDate: string;
  declare icon: CreationOptional<string>;
  declare playerCount: CreationOptional<number>;
}

export const initGameModel = () => {
  GameModel.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: DataTypes.STRING,
    playerCount: DataTypes.SMALLINT,
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Game',
  });
};
