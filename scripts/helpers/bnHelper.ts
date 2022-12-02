const { BN } = require("@openzeppelin/test-helpers");

export function ether(wei: string): string {
  return new BN(wei).div(new BN("1000000000000000000"));
}
