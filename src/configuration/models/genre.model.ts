import { BelongsToMany, Column, Model, Table, Unique } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { CharacterizesModel } from './characterizes.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'Genre' })
export class GenreModel extends Model<
  InferAttributes<GenreModel>,
  InferCreationAttributes<GenreModel>
> {
  @Unique
  @Column
  declare description: string;

  @BelongsToMany(() => GameModel, () => CharacterizesModel)
  declare games?: GameModel[];
}
