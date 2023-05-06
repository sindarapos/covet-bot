import { BelongsToMany, Column, Model, Table } from 'sequelize-typescript';
import { OwnsModel } from './owns.model';
import { UserModel } from './user.model';
import { LikesModel } from './likes.model';

@Table({ tableName: 'Game' })
export class GameModel extends Model {
  @Column
  name!: string;

  @Column
  releaseDate!: string;

  @Column
  icon!: string;

  @Column
  playerCount!: number;

  @BelongsToMany(() => UserModel, () => OwnsModel)
  owners!: UserModel[];

  @BelongsToMany(() => UserModel, () => LikesModel)
  likers!: UserModel[];
}
