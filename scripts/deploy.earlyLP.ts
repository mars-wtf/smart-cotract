import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const baseUSDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const sepoliaUSDC = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
  const vault = "0xA4Af600Ed091231DdC05f04A0Ed019c2823FC543"; //multi signature wallet address
  const wtf = "0x2562c586ecEd404391a9D4D65230CbA91f9Cd0De";  //our memecoin address

  /////Early Liquidity
  const EearlyLiquidity = await ethers.getContractFactory("EarlyLiquidity");
  const token = await EearlyLiquidity.deploy(sepoliaUSDC, vault, wtf);
  console.log("Contract address:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
