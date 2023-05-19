import { Request, Response, Router } from 'express';

import { UserResolver } from '../db/resolvers/user.resolver';
const userResolver = new UserResolver();

export const userRouter = Router();

userRouter.get('/create/:auth', async (req: Request, res: Response) => {
  const getUser = await userResolver.getUserByAuth(req.params.auth)
  console.log(getUser)
  if(getUser) {
    userResolver.authSuccess({
      id: getUser.id,
      email: getUser.emailChangeTemp,
      emailChangeTemp: null,
      auth:null,
    })
    res.redirect(303, '/apiresult/成功/メールアドレスを認証しました');
  } else {
    res.redirect(303, '/apiresult/エラー/アカウント作成に失敗しました');
  }
})

//http://localhost:5000/api/user/create/cf2bec7c-c4b6-483a-8994-99dcc112978d