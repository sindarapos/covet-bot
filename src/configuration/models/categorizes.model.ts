import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { CategoryModel } from './category.model';

@Table({ tableName: 'Categorizes' })
export class CategorizesModel extends Model<
  InferAttributes<CategorizesModel>,
  InferCreationAttributes<CategorizesModel>
> {
  @ForeignKey(() => GameModel)
  @Column
  declare gameId: number;

  @ForeignKey(() => CategoryModel)
  @Column
  declare categoryId: number;
}
