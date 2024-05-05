export function isBitOn(number, index) {
  return (number & (1 << index)) ? 1 : 0;
}