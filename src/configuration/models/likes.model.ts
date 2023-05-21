import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { UserModel } from './user.model';

@Table({ tableName: 'Likes' })
export class LikesModel extends Model<LikesModel> {
  @ForeignKey(() => GameModel)
  @Column
  declare gameId: number;

  @ForeignKey(() => UserModel)
  @Column
  declare userId: number;
}
