import { calculation, judge, User } from '../src/games/blackjack/bj_modules';
import { Trump } from '../@types/type';

const createHandCards = (arr: number[]) => {
  const cards: Trump[] = [];
  for (const num of arr) {
    cards.push({
      symbol: 'spade',
      joker: false,
      color: 'black',
      number: num,
      str: num.toString(),
    });
  }
  return cards;
};

test('create cards', async () => {
  expect(createHandCards([1])).toEqual([
    {
      symbol: 'spade',
      joker: false,
      color: 'black',
      number: 1,
      str: '1',
    },
  ]);
});

test('A+2+3=16', async () => {
  const result = await calculation(createHandCards([1, 2, 3]));
  expect(result).toEqual({
    blackjack: false,
    burst: false,
    number: 16,
  });
});

test('A+10=bj', async () => {
  const result = await calculation(createHandCards([1, 10]));
  expect(result).toEqual({
    blackjack: true,
    burst: false,
    number: 21,
  });
});

test('A+11=bj', async () => {
  const result = await calculation(createHandCards([1, 11]));
  expect(result).toEqual({
    blackjack: true,
    burst: false,
    number: 21,
  });
});

test('A+A=12', async () => {
  const result = await calculation(createHandCards([1, 1]));
  expect(result).toEqual({
    blackjack: false,
    burst: false,
    number: 12,
  });
});

test('A+A+13=15', async () => {
  const result = await calculation(createHandCards([1, 1, 13]));
  expect(result).toEqual({
    blackjack: false,
    burst: false,
    number: 12,
  });
});

test('A+13+13=21', async () => {
  const result = await calculation(createHandCards([1, 13, 13]));
  expect(result).toEqual({
    blackjack: false,
    burst: false,
    number: 21,
  });
});

test('10+10+2=22 burst', async () => {
  const result = await calculation(createHandCards([10, 10, 2]));
  expect(result).toEqual({
    blackjack: false,
    burst: true,
    number: 22,
  });
});

test('BJ && BJ === draw', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([1, 10])),
    userResult: calculation(createHandCards([1, 10])),
  });
  expect(result.result).toBe('Draw');
});

test('BJ && 21 === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([1, 10])),
    userResult: calculation(createHandCards([1, 2, 9])),
  });
  expect(result.result).toBe('Lose');
});

test('BJ && 17 === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([1, 10])),
    userResult: calculation(createHandCards([10, 7])),
  });
  expect(result.result).toBe('Lose');
});

test('BJ && BS === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([1, 10])),
    userResult: calculation(createHandCards([10, 2, 10])),
  });
  expect(result.result).toBe('Lose');
});

test('21 && BJ === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 2, 9])),
    userResult: calculation(createHandCards([10, 1])),
  });
  expect(result.result).toBe('Win');
});

test('21 && 21 === Draw', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 2, 9])),
    userResult: calculation(createHandCards([10, 2, 9])),
  });
  expect(result.result).toBe('Draw');
});

test('21 && 17 === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 9, 2])),
    userResult: calculation(createHandCards([10, 7])),
  });
  expect(result.result).toBe('Lose');
});

test('21 && BS === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 9, 2])),
    userResult: calculation(createHandCards([10, 10, 10])),
  });
  expect(result.result).toBe('Lose');
});

test('17 && BJ === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 7])),
    userResult: calculation(createHandCards([10, 1])),
  });
  expect(result.result).toBe('Win');
});

test('17 && 21 === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 7])),
    userResult: calculation(createHandCards([10, 9, 2])),
  });
  expect(result.result).toBe('Win');
});

test('17 && 20 === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 7])),
    userResult: calculation(createHandCards([10, 10])),
  });
  expect(result.result).toBe('Win');
});

test('17 && 17 === Draw', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 7])),
    userResult: calculation(createHandCards([10, 7])),
  });
  expect(result.result).toBe('Draw');
});

test('17 && 16 === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 7])),
    userResult: calculation(createHandCards([10, 6])),
  });
  expect(result.result).toBe('Lose');
});

test('17 && BS === Lose', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 7])),
    userResult: calculation(createHandCards([10, 10, 10])),
  });
  expect(result.result).toBe('Lose');
});

test('BS && BJ === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 10, 10])),
    userResult: calculation(createHandCards([10, 1])),
  });
  expect(result.result).toBe('Win');
});

test('BS && 21 === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 10, 10])),
    userResult: calculation(createHandCards([10, 9, 2])),
  });
  expect(result.result).toBe('Win');
});

test('BS && 17 === Win', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 10, 10])),
    userResult: calculation(createHandCards([10, 7])),
  });
  expect(result.result).toBe('Win');
});

test('BS && BS === Draw', async () => {
  const result = judge({
    dealerResult: calculation(createHandCards([10, 10, 10])),
    userResult: calculation(createHandCards([10, 10, 10])),
  });
  expect(result.result).toBe('Draw');
});
