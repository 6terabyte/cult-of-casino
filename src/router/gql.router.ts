import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'type-graphql';
import { Request, Response, Router } from 'express';

import { UserCustmResolver } from '../db/resolvers/user.custm.resolver';

export const gqlRouter = Router();

(async () => {
  const customerSchema = await buildSchema({
    resolvers: [UserCustmResolver],
  });
  gqlRouter.use(
    '/noauth',
    graphqlHTTP((req: Request, res: Response) => {
      console.log('gql router access');
      // console.log(res.locals.user)
      return {
        schema: customerSchema,
        context: res.locals.user,
        graphiql: true,
      };
    })
  );
})();
