import { BelongsToMany, Column, Model, Table, Unique } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { CategorizesModel } from './categorizes.model';

@Table({ tableName: 'Category' })
export class CategoryModel extends Model<
  InferAttributes<CategoryModel>,
  InferCreationAttributes<CategoryModel>
> {
  @Unique
  @Column
  declare description: string;

  @BelongsToMany(() => GameModel, () => CategorizesModel)
  declare games?: GameModel[];
}
