import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import { DataSource } from 'typeorm';
import { REGISTER_INSTANCE } from 'ts-node';

import { QUICK, DATABASE_URL } from './src/constants/constants';
import { authMiddleware } from './src/middleware/auth.middleware';
import { gqlRouter } from './src/router/gql.router';
import { userRouter } from './src/router/user.router';

// import { UserCustmResolver } from './src/db/resolvers/user.custm.resolver';
// const userCustmResolver = new UserCustmResolver();

import * as blackJack from './src/games/blackjack/bj_main';

const PORT = 5000;

const dataSource = new DataSource({
  type: 'postgres',
  synchronize: true,
  entities: [
    process[REGISTER_INSTANCE]
      ? './src/db/entities/*.entity.ts'
      : './dist/src/db/entities/*.entity.js',
  ],
  migrations: [
    process[REGISTER_INSTANCE]
      ? './src/db/migrations/*.ts'
      : './dist/src/db/migrations/*.js',
  ],
  subscribers: [
    process[REGISTER_INSTANCE]
      ? './src/db/subscribers/*.ts'
      : './dist/src/db/subscribers/*.js',
  ],
  url: DATABASE_URL,
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use(cors());

(async () => {
  await dataSource.initialize();
  console.log('connect');
  // console.log(await userCustmResolver.addUser({
  //   name: 'test4',
  //   screenName: 'test4',
  //   email: 'test4',
  //   hash: 'test4',
  //   // emailChangeTmp: null,
  //   // auth: null,
  //   // session: null,
  //   // role: 'admin',
  //   // chip: 200,
  //   // chipTemp: null
  // }))
  //await userCustmResolver.updateUser({
  //  id:1,
  //  chip: 300
  //})
  //console.log(await userCustmResolver.getUserById(1));
  //console.log(await userCustmResolver.getUserAll());

  app.use('/api', authMiddleware);
  app.use('/api/user', userRouter);
  app.use('/api/gql', gqlRouter);

  const activeUsers = {};

  io.on('connection', async (socket) => {
    socket.on('init', (message) => {
      activeUsers[socket.id] = {
        ...JSON.parse(message),
        lastAccess: new Date().getTime(),
      };
    });

    socket.on('blackjack', (message) => {
      blackJack.on({ socket, socketId: socket.id, message });
      activeUsers[socket.id].lastAccess = new Date().getTime();
    });

    socket.on('disconnect', () => {
      if (!activeUsers[socket.id]) return;
      switch (activeUsers[socket.id].game) {
        case 'blackjack':
          blackJack.disconnect(socket.id);
          break;
        //case 'roulet':
        //roulet.disconnect(socket.id);
        //break
      }
      delete activeUsers[socket.id];
    });
  });

  if (QUICK) {
    const proc = spawn('yarn', ['run', 'serve', '--port', `${PORT + 1}`], {
      cwd: './vue',
      env: {
        PATH: process.env.PATH,
        VUE_APP_PORT: (PORT + 1).toString(),
      },
    });
    app.use('/', proxy(`http://localhost:${PORT + 1}`));
    proc.stdout.on('data', (data) => {
      if (data.toString().includes('Build finished')) {
        console.log('vue Build finished');
      }
      if (data.toString().includes('Failed to compile')) {
        console.log('vue error');
      }
    });
  } else {
    app.use('/img', express.static('./vue/dist/img'));
    app.use('/css', express.static('./vue/dist/css'));
    app.use('/js', express.static('./vue/dist/js'));
    app.get(/.*/, (req, res) => {
      res.sendfile('./vue/dist/index.html');
    });
  }

  httpServer.listen(PORT, () => {
    console.log('express start!');
  });
})();
