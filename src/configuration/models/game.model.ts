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

  @Column
  declare image?: string;

  @AllowNull(false)
  @Column
  declare releaseDate: Date;

  @BelongsToMany(() => GenreModel, () => CharacterizesModel)
  declare genres?: GenreModel[];

  @BelongsToMany(() => UserModel, () => OwnsModel)
  declare owners?: UserModel[];

  @BelongsToMany(() => UserModel, () => LikesModel)
  declare likers?: UserModel[];
}
