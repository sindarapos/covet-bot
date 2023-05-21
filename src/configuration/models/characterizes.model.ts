import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { GenreModel } from './genre.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'Characterizes' })
export class CharacterizesModel extends Model<
  InferAttributes<CharacterizesModel>,
  InferCreationAttributes<CharacterizesModel>
> {
  @ForeignKey(() => GameModel)
  @Column
  declare gameId: number;

  @ForeignKey(() => GenreModel)
  @Column
  declare genreId: number;
}
