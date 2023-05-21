import { Socket } from 'socket.io';
import { Trump } from '../../../@types/type';

export interface User {
  socket: Socket;
  socketId: string;
  userId: number;
  userName: string;
  handCard: Trump[];
  turnNum: number;
  nextGameJoin: boolean;
  active: boolean;
  chip: number;
  betChip: number;
}

export interface Game {
  step:
    | 'stanby'
    | 'init'
    | 'bet'
    | 'hand'
    | 'hit_and_stand'
    | 'dealer_open'
    | 'dealer_hit'
    | 'payment'
    | 'break';
  turn: number;
  turnDone: boolean;
  timeout: number;
  cardStock: Trump[];
  dealer: Trump[];
  user: {
    [key: string]: User;
  };
}

export interface Games {
  [key: string]: Game;
}

export interface GameResult {
  number: number;
  blackjack: boolean;
  burst: boolean;
}

export const calculation = (cards: Trump[]): GameResult => {
  const numberList = [0];
  let ace = false;
  for (const card of cards) {
    let number = 0;
    if (10 < card.number) {
      number = 10;
    } else {
      number = card.number;
    }
    if (card.number === 1) {
      ace = true;
      const length = numberList.length;
      for (let i = 0; i < length; i++) {
        numberList[i] += 1;
      }
      for (let i = 0; i < length; i++) {
        numberList.push(numberList[i] - 1 + 11);
      }
    } else {
      for (let i = 0; i < numberList.length; i++) {
        numberList[i] += number;
      }
    }
  }
  numberList.sort((a, b) => {
    return a < b ? -1 : 1;
  });

  let res = {
    number: 0,
    blackjack: false,
    burst: false,
  };
  if (21 < numberList[0]) {
    // バースト
    res = {
      number: numberList[0],
      blackjack: false,
      burst: true,
    };
  } else if (
    ace &&
    numberList[0] === 11 &&
    numberList[1] === 21 &&
    numberList.length === 2 &&
    cards.length === 2
  ) {
    // ナチュラルブラックジャック
    res = {
      number: 21,
      blackjack: true,
      burst: false,
    };
  } else {
    // その他21以下
    let num = 0;
    for (const number of numberList) {
      if (num < number && number <= 21) {
        num = number;
      }
    }
    res = {
      number: num,
      blackjack: false,
      burst: false,
    };
  }
  return res;
};

export const judge = (args: {
  dealerResult: GameResult;
  userResult: GameResult;
}): { result: 'Win' | 'Draw' | 'Lose' } => {
  if (args.dealerResult.blackjack) {
    if (args.userResult.blackjack) {
      return { result: 'Draw' };
    } else {
      return { result: 'Lose' };
    }
  } else if (args.dealerResult.burst) {
    if (args.userResult.burst) {
      return { result: 'Draw' };
    } else {
      return { result: 'Win' };
    }
  } else if (args.userResult.blackjack) {
    // ディーラーBJは上で弾いてる想定
    return { result: 'Win' };
  } else if (args.userResult.burst) {
    // ディーラーBSは上で弾いてる想定
    return { result: 'Lose' };
  } else if (args.dealerResult.number === args.userResult.number) {
    return { result: 'Draw' };
  } else if (args.dealerResult.number < args.userResult.number) {
    return { result: 'Win' };
  } else if (args.dealerResult.number > args.userResult.number) {
    return { result: 'Lose' };
  }
  return { result: 'Win' }; // 本来はエラー TSビルド対策で入れてある
};

// export const resultEmit = (args:{socket:Socket,result:string}) => {
//   args.socket.emit(
//     'result',
//     JSON.stringify({
//       type: 'result',
//       result: args.result,
//     })
//   );
// }

export const dealerHide = (game: Game): boolean => {
  switch (game.step) {
    case 'stanby':
    case 'init':
    case 'bet':
    case 'hand':
    case 'hit_and_stand':
      return true;
      break;
    case 'dealer_open':
    case 'dealer_hit':
    case 'payment':
    case 'break':
      return false;
      break;
  }
};
