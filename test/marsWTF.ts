import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
describe("Create Collection Test", function () {
    let Mars:any;
    let owner:any;
    let user:any;
    let user1:any;
    let user2:any;
    let user3:any;
    let user4:any;
    let USDC:any;
    it("should deploy Mars contract", async function(){
        // Get the first account as the owner
        [owner, user, user1, user2, user3, user4] = await ethers.getSigners();
        console.log("\tAccount address\t", await owner.getAddress());
        const MarsInstance = await ethers.getContractFactory("MarsWTF") ;
        Mars = await MarsInstance.deploy() ;
        console.log('\tMarsWTF Contract deployed at:', await Mars.getAddress());
    })
    it("check name, symbol, totalSupply", async function(){
        const name = await Mars.name() ;
        const symbol = await Mars.symbol() ;
        const totalSupply = await Mars.totalSupply() ;
        console.log("name => " + name) ;
        console.log("symbol => " + symbol) ;
        console.log("totalSupply => " + totalSupply) ;
    })
    // it("approve", async function(){
    //   const amount = 5 * 1e9 ;
    //   await Mars.connect(owner).approve(user, amount) ;
    //   console.log("allowance => " + await Mars.allowance(owner, user)) ;
    // })
    // it("transferFrom", async function(){
    //     const amount = 5 * 1e9 ;
    //     const result = await Mars.connect(user).transferFrom(owner, user1, amount) ;
    //     console.log("result => " + result) ;
    // })
    it("check the balance", async function(){
       const amountInOwner = await Mars.balanceOf(owner) ;
       console.log("owner => " + amountInOwner) ;
       const amountInUser = await Mars.balanceOf(user1) ;
       console.log("user => " + amountInUser) ;
    })
    it("should deploy USDC contract", async function(){
      // Get the first account as the owner
      const USDCInstance = await ethers.getContractFactory("USDC") ;
      USDC = await USDCInstance.connect(user1).deploy() ;
      console.log('\tUSDC Contract deployed at:', await USDC.getAddress());
    })
    let early: any ;
    it("should deploy USDC contract", async function(){
      // Get the first account as the owner
      const earlyInstance = await ethers.getContractFactory("EarlyLiquidity") ;
      early = await earlyInstance.connect(owner).deploy(await USDC.getAddress(), user2, await Mars.getAddress()) ;
      console.log('\tUSDC Contract deployed at:', await early.getAddress());
    })
    it("transfer function", async function(){
        const amount = 10000 * 1e9 ;
        const result = await Mars.transfer(await early.getAddress(), amount) ;
        console.log("result => " + await Mars.balanceOf(await early.getAddress())) ;
    })
    it("approve usdc", async function(){
      const amount = 1 ;
      await USDC.connect(user1).approve(await early.getAddress(), amount * 1e6) ;
    })
    it("buy function", async function(){
      await early.connect(user1).buy(1000*1e9);
      console.log("Mars.balance => " + await Mars.balanceOf(user1)) ;
      console.log("USDC.balance =>" + await USDC.balanceOf(user1)) ;
    })
})