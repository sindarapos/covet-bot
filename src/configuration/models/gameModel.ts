import { sequelize } from '../database';
import { DataTypes, Model } from 'sequelize';

interface Attributes extends Model {
  id: number;
  name: string;
  releaseDate: string;
  icon: string;
  playerCount: number;
}

type CreationAttributes = Omit<Attributes, 'id' | 'icon' | 'playerCount'>;

export class GameModel
  extends Model<Attributes, CreationAttributes>
  implements Attributes
{
  declare id: number;
  declare name: string;
  declare releaseDate: string;
  declare icon: string;
  declare playerCount: number;
  declare set: Model['set'];
  declare setAttributes: Model['setAttributes'];
}

export const initGameModel = () => {
  GameModel.init(
    {
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
    },
    {
      sequelize,
      modelName: 'Game',
    },
  );
};
