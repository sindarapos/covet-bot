import { User } from 'discord.js';
import {
  Column,
  Table,
  Model,
  DataType,
  BelongsToMany,
  Unique,
} from 'sequelize-typescript';
import { GameModel } from './game.model';
import { OwnsModel } from './owns.model';
import { LikesModel } from './likes.model';

@Table({ tableName: 'User' })
export class UserModel extends Model {
  @Column(DataType.STRING)
  username!: User['username'];

  @Unique
  @Column(DataType.STRING)
  discordUserId!: User['id'];

  @BelongsToMany(() => GameModel, () => OwnsModel)
  ownedGames!: GameModel[];

  @BelongsToMany(() => GameModel, () => LikesModel)
  likedGames!: GameModel[];
}
