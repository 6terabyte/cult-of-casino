import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import { Server } from 'socket.io';
import { spawn } from 'child_process';

import * as blackJack from './src/games/blackjack/bj_main';

const PORT = 5000;
const QUICK = true;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use(cors());

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
      console.log('vue Build finished')
    }
    if (data.toString().includes('Failed to compile')) {
      console.log('vue error')
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
