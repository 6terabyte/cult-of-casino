export const getSession = document.cookie
  .split('; ')
  .find((row) => row.startsWith('session'))
  ?.split('=')[1];
