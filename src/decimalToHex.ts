// Function to convert decimal to hex
export function decimalToHex(decimal: number): string {
  let hex = decimal.toString(16);
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  return hex.toUpperCase(); // Ensure it's uppercase
}
