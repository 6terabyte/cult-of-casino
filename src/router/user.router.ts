import { Request, Response, Router } from 'express';

import { UserCustmResolver } from '../db/resolvers/user.custm.resolver';
const userCustmResolver = new UserCustmResolver();

import { UserAdminResolver } from '../db/resolvers/user.admin.resolver';
const userAdminResolver = new UserAdminResolver();

export const userRouter = Router();

userRouter.get('/create/:auth', async (req: Request, res: Response) => {
  const getUser = await userCustmResolver.getUserByAuth(req.params.auth);
  if (getUser) {
    userAdminResolver.authSuccess({
      id: getUser.id,
      email: getUser.emailChangeTemp,
      emailChangeTemp: null,
      auth: null,
    });
    res.redirect(303, '/apiresult/成功/メールアドレスを認証しました');
  } else {
    res.redirect(303, '/apiresult/エラー/アカウント作成に失敗しました');
  }
});
