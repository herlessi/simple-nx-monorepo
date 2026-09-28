export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const randomBetween = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));
