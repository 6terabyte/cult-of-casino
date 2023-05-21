import { Socket } from 'socket.io';
import { Game, Games, calculation, judge, dealerHide } from './bj_modules';
import { createCard } from '../modules/trump';
import { UserCustmResolver } from '../../db/resolvers/user.custm.resolver';
const userCustmResolver = new UserCustmResolver();
import { UserAdminResolver } from '../../db/resolvers/user.admin.resolver';
const userAdminResolver = new UserAdminResolver();

const userToGame: {
  [key: string]: { gameName: string };
} = {};
const games: Games = {};

games.room0 = {
  step: 'stanby',
  turn: -1,
  turnDone: false,
  timeout: new Date().getTime() + 5 * 1000,
  cardStock: [],
  dealer: [],
  user: {},
};

setInterval(async () => {
  for (const gameName in games) {
    const game = games[gameName];
    //console.log(game.step);
    if (1 <= Object.keys(game.user).length) {
      if (game.step === 'stanby') {
        for (const user in game.user) {
          game.user[user].handCard = [];
        }
        game.dealer = [];
        if (game.timeout < new Date().getTime()) {
          game.step = 'init';
          game.timeout = 0;
        }
        tableChange({ game, dealerHide: true });
      } else if (game.step === 'init') {
        // 初期化
        const nextUser = { ...game.user };
        let seat = 0;
        for (const userName in nextUser) {
          nextUser[userName].handCard = [];
          nextUser[userName].betChip = 0;
          if (nextUser[userName].nextGameJoin) {
            if (seat < 5) {
              nextUser[userName].turnNum = seat++;
            } else {
              nextUser[userName].turnNum = -1;
            }
          } else {
            nextUser[userName].turnNum = -1;
          }
          if (nextUser[userName].userId !== -1) {
            const user = await userAdminResolver.getUserById(
              nextUser[userName].userId
            );
            if (user) {
              nextUser[userName].chip = user.chip;
            }
          }
          if (!nextUser[userName].active) {
            delete nextUser[userName];
            delete userToGame[userName];
          }
        }
        games[gameName] = {
          step: 'bet',
          turn: -1,
          turnDone: false,
          timeout: 0,
          cardStock: [],
          dealer: [],
          user: nextUser,
        };
        tableChange({ game, dealerHide: true });
        game.step = 'bet';
      } else if (game.step === 'bet') {
        if (game.turnDone && game.timeout === 0) {
          for (const userName in game.user) {
            if (game.user[userName].turnNum === game.turn) {
              game.timeout = new Date().getTime() + 10 * 1000;
              game.turnDone = false;
              game.user[userName].socket.emit(
                'your_bet_turn',
                JSON.stringify({
                  type: 'your_bet_turn',
                  timeout: game.timeout,
                })
              );
              tableChange({ game, dealerHide: true });
              break;
            }
          }
        }
        if (game.timeout < new Date().getTime()) {
          const nextGameFlag = forNextUser(game);
          if (nextGameFlag) {
            game.turn = -1;
            game.timeout = 0;
            game.turnDone = false;
            game.step = 'hand';
          }
        }
      } else if (game.step === 'hand') {
        // カード配布
        game.cardStock = createCard(0);
        for (let i = 0; i < 2; i++) {
          game.dealer.push(hit(game));
        }
        for (const user in game.user) {
          for (let i = 0; i < 2; i++) {
            if (0 <= game.user[user].turnNum) {
              game.user[user].handCard.push(hit(game));
            }
          }
        }
        tableChange({ game, dealerHide: true });
        game.step = 'hit_and_stand';
      } else if (game.step === 'hit_and_stand') {
        if (game.turnDone && game.timeout === 0) {
          for (const userName in game.user) {
            if (game.user[userName].turnNum === game.turn) {
              game.timeout = new Date().getTime() + 10 * 1000;
              game.turnDone = false;
              game.user[userName].socket.emit(
                'your_hit_turn',
                JSON.stringify({
                  type: 'your_hit_turn',
                  timeout: game.timeout,
                })
              );
              tableChange({ game, dealerHide: true });
              break;
            }
          }
        }
        if (game.timeout < new Date().getTime()) {
          stand(game);
        }
      } else if (game.step === 'dealer_open') {
        tableChange({ game, dealerHide: false });
        game.step = 'dealer_hit';
      } else if (game.step === 'dealer_hit') {
        if (calculation(game.dealer).number < 17) {
          game.dealer.push(hit(game));
          tableChange({ game, dealerHide: false });
        } else {
          game.step = 'payment';
        }
      } else if (game.step === 'payment') {
        const dealerResult = calculation(game.dealer);
        for (const userId in game.user) {
          const user = game.user[userId];
          if (user.turnNum < 0) {
            continue;
          }
          const userResult = calculation(user.handCard);
          const result = judge({ dealerResult, userResult });
          user.socket.emit(
            'result',
            JSON.stringify({
              type: 'result',
              result: result.result,
              dealerResult,
              userResult,
            })
          );
          switch (result.result) {
            case 'Win':
              user.chip += user.betChip * 2;
              if (user.userId !== -1) {
                await userAdminResolver.chipUpdate({
                  id: user.userId,
                  chip: user.betChip * 2,
                });
              }
              break;
            case 'Draw':
              user.chip += user.betChip;
              if (user.userId !== -1) {
                await userAdminResolver.chipUpdate({
                  id: user.userId,
                  chip: user.betChip,
                });
              }
              break;
            case 'Lose':
              break;
          }
          user.betChip = 0;
        }
        game.timeout = new Date().getTime() + 5 * 1000;
        game.step = 'break';
        tableChange({ game, dealerHide: false });
      } else if (game.step === 'break') {
        if (game.timeout < new Date().getTime()) {
          game.step = 'stanby';
          game.timeout = new Date().getTime() + 5 * 1000;
        }
        //tableChange({game, dealerHide: false})
      }
    }
  }
}, 1000);

const turnCheck = (args): Game | false => {
  const game = games[userToGame[args.socketId].gameName];
  if (
    game.turn !==
    games[userToGame[args.socketId].gameName].user[args.socketId].turnNum
  ) {
    game.user[args.socketId].socket.emit(
      'error',
      JSON.stringify({
        type: 'error',
        title: '操作できません',
        message: 'あなたのターンではありません',
      })
    );
    return false;
  }
  return game;
};

const stepCheck = (args, step: string): boolean => {
  const game = games[userToGame[args.socketId].gameName];
  if (game.step === step) {
    return false;
  } else {
    game.user[args.socketId].socket.emit(
      'error',
      JSON.stringify({
        type: 'error',
        title: '操作できません',
        message: '今はその操作はできません',
      })
    );
    return true;
  }
};

export const on = async (args: {
  socket: Socket;
  socketId: string;
  message: string;
}): Promise<void> => {
  const data = JSON.parse(args.message);
  if (data.type === 'join') {
    const user = await userCustmResolver.getUserBySession(data.session);
    games.room0.user[args.socketId] = {
      socket: args.socket,
      socketId: args.socketId,
      userId: user ? user.id : -1,
      userName: user ? user.name : 'guest',
      handCard: [],
      turnNum: -1,
      nextGameJoin: true,
      active: true,
      chip: user ? user.chip : 200,
      betChip: 0,
    };
    userToGame[args.socketId] = {
      gameName: 'room0',
    };
    setTimeout(() => {
      tableChange({
        game: games['room0'],
        dealerHide: dealerHide(games['room0']),
      });
    }, 1000);
  } else if (data.type === 'hit') {
    if (stepCheck(args, 'hit_and_stand')) return;
    const game = turnCheck(args);
    if (!game) {
      return;
    }
    game.user[args.socketId].handCard.push(hit(game));
    if (calculation(game.user[args.socketId].handCard).burst) {
      stand(game);
    }
    tableChange({ game, dealerHide: true });
  } else if (data.type == 'stand') {
    if (stepCheck(args, 'hit_and_stand')) return;
    const game = turnCheck(args);
    if (game) {
      stand(game);
    }
  } else if (data.type === 'bet') {
    if (stepCheck(args, 'bet')) return;
    const game = turnCheck(args);
    if (!game) {
      return;
    }
    game.user[args.socketId].chip -= data.bet;
    game.user[args.socketId].betChip = data.bet;

    if (game.user[args.socketId].userId !== -1) {
      const user = await userAdminResolver.getUserById(
        game.user[args.socketId].userId
      );
      await userAdminResolver.chipUpdate({ id: user.id, chip: data.bet * -1 });
    }
    game.user[args.socketId].socket.emit(
      'your_bet_success',
      JSON.stringify({
        type: 'your_bet_success',
        timeout: game.timeout,
      })
    );
    forNextUser(game);
    tableChange({ game, dealerHide: true });
  } else if (data.type === 'next_game_join') {
    const game = games[userToGame[args.socketId].gameName];
    game.user[args.socketId].nextGameJoin = data.join;
  }
};

export const disconnect = (socketId: string): void => {
  if (userToGame[socketId]) {
    const gameName = userToGame[socketId].gameName;
    games[gameName].user[socketId].nextGameJoin = false;
    games[gameName].user[socketId].active = false;
  }
};

const tableChange = (args: { game: Game; dealerHide: boolean }) => {
  const statusDealer = calculation(args.game.dealer);
  for (const user in args.game.user) {
    const memberData = [];
    for (const member in args.game.user) {
      if (member === user) continue;
      if (args.game.user[member].turnNum === -1) continue;
      memberData.push({
        userName: args.game.user[member].userName,
        handCard: args.game.user[member].handCard,
      });
    }
    args.game.user[user].socket.emit(
      'table_change',
      JSON.stringify({
        type: 'table_change',
        yourCard: args.game.user[user].handCard,
        memberData,
        dealer: args.game.dealer.length
          ? args.dealerHide
            ? [args.game.dealer[0]]
            : args.game.dealer
          : [],
        timeout: args.game.timeout,
        status: {
          your: calculation(args.game.user[user].handCard),
          dealer: args.dealerHide
            ? {
                number: args.game.dealer.length
                  ? args.game.dealer[0].number
                  : 0,
                blackjack: false,
                burst: false,
              }
            : statusDealer,
        },
        step: args.game.step,
        turnNum: args.game.user[user].turnNum,
        nowTurn: args.game.turn,
        chip: args.game.user[user].chip,
        betChip: args.game.user[user].betChip,
        userName: args.game.user[user].userName,
      })
    );
  }
};

const hit = (game: Game) => {
  const hitCard = Math.floor(Math.random() * game.cardStock.length);
  return game.cardStock.splice(hitCard, 1)[0];
};

const stand = (game: Game) => {
  for (const userName in game.user) {
    if (game.user[userName].turnNum < 0) continue;
    if (game.user[userName].turnNum === game.turn) {
      game.user[userName].socket.emit(
        'your_stand',
        JSON.stringify({
          type: 'your_stand',
          result: calculation(game.user[userName].handCard),
        })
      );
      break;
    }
  }
  if (forNextUser(game)) {
    game.timeout = 0;
    game.step = 'dealer_open';
  }
};

const forNextUser = (game: Game) => {
  game.timeout = 0;
  game.turn++;
  game.turnDone = true;
  let flag = false;
  for (const userName in game.user) {
    if (game.user[userName].turnNum === game.turn) {
      flag = true;
    }
  }
  if (!flag) {
    // next step
    return true;
  } else {
    // next user
    return false;
  }
};
