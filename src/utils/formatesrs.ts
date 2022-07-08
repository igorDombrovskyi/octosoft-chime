export const fmtMSS = (s: number) => {
  const minutes = (s - (s %= 60)) / 60;
  return (minutes < 10 ? `0${minutes}` : minutes) + (9 < s ? ":" : ":0") + s;
};
