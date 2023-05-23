import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { OwnsModel } from './owns.model';
import { UserModel } from './user.model';
import { LikesModel } from './likes.model';
import { GenreModel } from './genre.model';
import { CharacterizesModel } from './characterizes.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { CategorizesModel } from './categorizes.model';
import { CategoryModel } from './category.model';

@Table({ tableName: 'Game' })
export class GameModel extends Model<
  InferAttributes<GameModel>,
  InferCreationAttributes<GameModel>
> {
  @Unique
  @AllowNull(false)
  @Column
  declare name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.INTEGER)
  declare steamAppid?: number;

  @Column
  declare image?: string;

  @Column
  declare releaseDate?: Date;

  @Column(DataType.FLOAT)
  declare price?: number;

  @BelongsToMany(() => GenreModel, () => CharacterizesModel)
  declare genres?: GenreModel[];

  @BelongsToMany(() => CategoryModel, () => CategorizesModel)
  declare categories?: CategoryModel[];

  @BelongsToMany(() => UserModel, () => OwnsModel)
  declare owners?: UserModel[];

  @BelongsToMany(() => UserModel, () => LikesModel)
  declare likers?: UserModel[];
}
