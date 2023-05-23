import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { GameModel } from './models/game.model';
import { UserModel } from './models/user.model';
import { OwnsModel } from './models/owns.model';
import { LikesModel } from './models/likes.model';
import { GenreModel } from './models/genre.model';
import { CharacterizesModel } from './models/characterizes.model';
import { CategoryModel } from './models/category.model';
import { CategorizesModel } from './models/categorizes.model';

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
  sequelize.addModels([
    CharacterizesModel,
    CategorizesModel,
    OwnsModel,
    LikesModel,
    CategoryModel,
    GenreModel,
    GameModel,
    UserModel,
  ]);
};
