export const throttle = <R, A extends never[]>(
  func: (...args: A) => R,
  wait: number,
): ((...args: A) => R) => {
  let previousTime = 0;
  let previousValue: R;

  return function (...args: A) {
    const now = new Date().getTime();
    const delta = now - previousTime;

    if (delta <= wait) {
      console.log('Returning previous value');
      return previousValue;
    }

    previousTime = now;
    previousValue = func(...args);
    return previousValue;
  };
};
