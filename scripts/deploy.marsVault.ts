import { ethers } from "hardhat";
import args from '../arguments/vault';

async function main() {
  const [deployer] = await ethers.getSigners();
  const vault = await ethers.getContractFactory("VaultMarsWTF");
  //@ts-ignore
  const _vault = await vault.deploy(...args);
  console.log("Contract address:", await _vault.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
