'use strict';

import { Request, Response, NextFunction } from 'express';
import { UserCustmResolver } from '../db/resolvers/user.custm.resolver';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userCustmResolver = new UserCustmResolver();

  // 未認証、customer、adminのうち未認証を通す
  const noAuthAllow = ['/api/gql/noauth/?.*'];
  const allowFlag = noAuthAllow.filter((allowUrl) => {
    return req.originalUrl.match(allowUrl);
  });

  if (allowFlag.length !== null) {
    next();
    return;
  }

  if (req.cookies) {
    res.status(401).json({ message: 'cookie not found' });
    return;
  }

  if (!('session' in req.cookies)) {
    res.status(401).json({ message: 'session not found in cookie' });
    return;
  }

  try {
    const user = await userCustmResolver.getUserBySession(
      req.cookies['session']
    );

    if (!user) {
      res.status(403).json({ message: 'user not fotfound' });
      return;
    }

    delete user.hash;
    delete user.session;
    res.locals.user = user;
  } catch (err) {
    res.status(500).json({ message: 'internal error' });
    return;
  }
};
