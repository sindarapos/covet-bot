import { sequelize } from '../database';
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

import { User } from 'discord.js';

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare username: User['username'];
  declare discordUserId: User['id'];
}

export const initUserModel = () => {
  UserModel.init({
    discordUserId: {
      type: DataTypes.STRING,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
};
