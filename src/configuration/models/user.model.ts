import { User } from 'discord.js';
import {
  Column,
  Table,
  Model,
  DataType,
  BelongsToMany,
  Unique,
  AllowNull,
} from 'sequelize-typescript';
import { GameModel } from './game.model';
import { OwnsModel } from './owns.model';
import { LikesModel } from './likes.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'User' })
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  declare username: User['username'];

  @Unique
  @Column(DataType.STRING)
  declare discordUserId: User['id'];

  @BelongsToMany(() => GameModel, () => OwnsModel)
  declare ownedGames?: GameModel[];

  @BelongsToMany(() => GameModel, () => LikesModel)
  declare likedGames?: GameModel[];
}
