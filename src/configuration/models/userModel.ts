import { sequelize } from '../database';
import { DataTypes, Model } from 'sequelize';
import { User } from 'discord.js';

interface Attributes {
  id: number;
  username: User['username'];
  discordUserId: User['id'];
}

type CreationAttributes = Omit<Attributes, 'id'>;

export class UserModel
  extends Model<Attributes, CreationAttributes>
  implements Attributes
{
  declare id: number;
  declare username: User['username'];
  declare discordUserId: User['id'];
  declare set: Model['set'];
  declare setAttributes: Model['setAttributes'];
}

export const initUserModel = () => {
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      discordUserId: {
        type: DataTypes.STRING,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
};
