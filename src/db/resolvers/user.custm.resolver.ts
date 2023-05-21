import {
  Resolver,
  Query,
  InputType,
  ArgsType,
  Field,
  Arg,
  Ctx,
  Mutation,
  UseMiddleware,
  Int,
} from 'type-graphql';
import { v4 as uuidV4 } from 'uuid';
import { MAIL_AUTH_MAIL, SERVICE_URL } from '../../constants/constants';
import { UserEntity } from '../entities/user.entity';
import { hash, hashCheck } from '../../tool/hash';
import { mailSend } from '../../tool/mail';

@InputType()
class AddUser implements Partial<UserEntity> {
  @Field((type) => String, { nullable: false })
  name: string;
  @Field((type) => String, { nullable: false })
  screenName: string;
  @Field((type) => String, { nullable: false })
  emailChangeTemp: string;
  @Field((type) => String, { nullable: false })
  hash: string;
}

@InputType()
class AuthInfo implements Partial<UserEntity> {
  @Field((type) => String, { nullable: true })
  email: string;
  @Field((type) => String, { nullable: true })
  hash: string;
}

/*
@InputType()
class EditUser implements Partial<UserEntity> {
  @Field(type => Int, { nullable: false})
  id: number;
  @Field(type => String, { nullable: true})
  name: string;
  @Field(type => String, { nullable: true})
  screenName: string;
  @Field(type => String, { nullable: true})
  email: string;
  @Field(type => String, { nullable: true})
  hash: string;
  @Field(type => String, { nullable: true})
  emailChangeTemp: string;
  @Field(type => String, { nullable: true})
  auth: string;
  @Field(type => String, { nullable: true})
  session: string;
  @Field(type => String, { nullable: true})
  role: string;
  @Field(type => Int, { nullable: true})
  chip: number;
  @Field(type => Int, { nullable: true})
  chipTemp: number;
  @Field(type => Boolean, { nullable: true})
  using: boolean;
}
*/

@Resolver()
export class UserCustmResolver {
  // customer使う
  @Query((returns) => UserEntity, { nullable: true })
  async getUserBySession(
    @Arg('session') session: string
  ): Promise<UserEntity | undefined> {
    return UserEntity.findOneBy({ session, using: true });
  }

  // ログインなしでアクセス可
  @Query((returns) => UserEntity, { nullable: true })
  async getUserByAuth(
    @Arg('auth', { validate: false }) authInfo: AuthInfo
  ): Promise<UserEntity | undefined> {
    const userData = await UserEntity.findOneBy({
      email: authInfo.email,
      using: true,
    });
    if (!userData) return;
    if (!hashCheck(authInfo.hash, userData.hash)) return;
    userData.session = uuidV4();
    await UserEntity.save(userData);
    return userData;
  }

  // ログインなしでアクセス可
  @Mutation((returns) => UserEntity)
  async addUser(
    @Arg('data', { validate: false }) newUser: AddUser
  ): Promise<UserEntity> {
    if (
      !(
        newUser.emailChangeTemp &&
        newUser.hash &&
        newUser.name &&
        newUser.screenName
      )
    ) {
      return undefined;
    }

    const newUserEdit = { ...newUser } as UserEntity;
    newUserEdit.auth = uuidV4();
    newUserEdit.hash = hash(newUser.hash);
    mailSend({
      from: MAIL_AUTH_MAIL,
      to: newUser.emailChangeTemp,
      subject: 'casion-R利用登録について',
      text: `アクセスしてください ${SERVICE_URL}/api/user/create/${newUserEdit.auth}`,
    });
    const result = await UserEntity.create(newUserEdit);
    return await result.save();
  }
}
