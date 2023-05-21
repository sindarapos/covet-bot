import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GameModel } from './game.model';
import { UserModel } from './user.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'Owns' })
export class OwnsModel extends Model<
  InferAttributes<OwnsModel>,
  InferCreationAttributes<OwnsModel>
> {
  @ForeignKey(() => GameModel)
  @Column
  declare gameId: number;

  @ForeignKey(() => UserModel)
  @Column
  declare userId: number;
}
