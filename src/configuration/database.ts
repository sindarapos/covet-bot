import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { GameModel } from './models/game.model';
import { UserModel } from './models/user.model';
import { OwnsModel } from './models/owns.model';
import { LikesModel } from './models/likes.model';

export const sequelize = new Sequelize(process.env.DB_URL ?? '', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {},
  modelMatch: (filename, member) => {
    const modelNameFromFile = filename.substring(0, filename.indexOf('.model'));
    return modelNameFromFile.toLowerCase() === member.toLowerCase();
  },
});

export const initModels = () => {
  sequelize.addModels([GameModel, UserModel, OwnsModel, LikesModel]);
};
