import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { UserModel } from './user.model';

@Table({ tableName: 'Owns' })
export class OwnsModel extends Model {
  @ForeignKey(() => GameModel)
  @Column
  gameId!: number;

  @ForeignKey(() => UserModel)
  @Column
  userId!: number;
}
