import {
  Resolver,
  Query,
  InputType,
  Field,
  Arg,
  Mutation,
  Int,
} from 'type-graphql';
import { UserEntity } from '../entities/user.entity';

@InputType()
class ChipEdit implements Partial<UserEntity> {
  @Field((type) => Int, { nullable: true })
  chip: number;
}

@InputType()
class AuthSuccess implements Partial<UserEntity> {
  @Field((type) => Int, { nullable: false })
  id: number;
  @Field((type) => String, { nullable: true })
  email: string;
  @Field((type) => String, { nullable: true })
  emailChangeTemp: string;
  @Field((type) => String, { nullable: true })
  auth: string;
}

@InputType()
class ChipUpdate implements Partial<UserEntity> {
  @Field((type) => Int, { nullable: true })
  id: number;
  @Field((type) => Int, { nullable: true })
  chip: number;
}

@Resolver()
export class UserAdminResolver {
  // 現状gqlアクセスなし
  @Query((returns) => UserEntity, { nullable: true })
  async getUserById(@Arg('id') id: number): Promise<UserEntity | undefined> {
    return UserEntity.findOneBy({ id, using: true });
  }

  // 現状gqlアクセスなし
  @Query((returns) => UserEntity, { nullable: true })
  async authSuccess(
    @Arg('data') editData: AuthSuccess
  ): Promise<UserEntity | undefined> {
    return UserEntity.save(editData);
  }

  // 現状gqlアクセスなし
  @Mutation((returns) => UserEntity)
  async chipUpdate(
    @Arg('data', { validate: false }) data: ChipUpdate
  ): Promise<UserEntity> {
    if (!(data.id && data.chip)) {
      return undefined;
    }
    const user = await UserEntity.findOneBy({ id: data.id, using: true });
    user.chip += data.chip;
    const result = await UserEntity.save(user);
    return await result.save();
  }
}
