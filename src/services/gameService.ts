import { GameModel } from '../configuration/models/game.model';
import { Includeable, Op } from 'sequelize';
import { sequelize } from '../configuration/database';
import moment from 'moment';
import { GenreModel } from '../configuration/models/genre.model';

export const isEmptyGameList = async (): Promise<boolean> => {
  const gameCount = await GameModel.count();
  return gameCount === 0;
};

export const findAllGamesByName = async (filter: GameModel['name']) =>
  await GameModel.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `${filter}%` } },
        { name: { [Op.iLike]: `%${filter}%` } },
      ],
    },
    include: { all: true, nested: true },
  });

export const findGameByName = async (filter: GameModel['name']) =>
  await GameModel.findOne({
    where: { name: filter },
    include: { all: true, nested: true },
  });

export const findGamesByGenre = async (filter?: string | number | boolean) => {
  const genresFilterInclude: Includeable[] = filter
    ? [
        {
          model: GenreModel,
          where: { description: filter },
          as: 'genresFilter',
        },
      ]
    : [];

  // multiple games found
  return await GameModel.findAll({
    order: [['releaseDate', 'DESC']],
    include: ['genres', 'owners', 'categories', ...genresFilterInclude],
  });
};

export const findRandomGame = async () =>
  await GameModel.findOne({
    order: sequelize.random(),
    include: { all: true, nested: true },
  });

export const findGamesByReleaseDate = async (date: Date, offsetDays = 900) => {
  const upperBound = moment(date).add(offsetDays, 'days').toDate();
  return await GameModel.findAll({
    where: {
      releaseDate: { [Op.and]: [{ [Op.gte]: date }, { [Op.lte]: upperBound }] },
    },
    include: { all: true, nested: true },
  });
};

export const destroyGameByName = async (filter: GameModel['name']) =>
  await GameModel.destroy({
    where: { name: filter },
  });
