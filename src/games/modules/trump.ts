import { Trump } from '../../../@types/type'

export const createCard = (jokerNumber = 2) => {
  const cards: Trump[] = [];
  for (const symbol of ['spade', 'club', 'heart', 'diamond']) {
    for (let number = 1; number <= 13; number++) {
      let str = '';
      switch (symbol) {
        case 'spade':
          str += '♤';
          break;
        case 'club':
          str += '♧';
          break;
        case 'heart':
          str += '♡';
          break;
        case 'diamond':
          str += '♢';
          break;
      }
      switch (number) {
        case 11:
          str += 'Jack';
          break;
        case 12:
          str += 'Queen';
          break;
        case 13:
          str += 'King';
          break;
        default:
          str += number;
          break;
      }
      cards.push({
        symbol: symbol as 'spade' | 'club' | 'heart' | 'diamond' | 'joker',
        joker: false,
        color: symbol === 'spade' || symbol == 'club' ? 'black' : 'red',
        number,
        str,
      });
    }
  }

  for (let i = 0; i < jokerNumber ; i++) {
    cards.push({
      symbol: 'joker',
      joker: true,
      color: 'joker',
      number: 0,
      str: 'Joker',
    });
  }
  return cards;
};
