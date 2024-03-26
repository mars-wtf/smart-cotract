import React from 'react';
import { Flex, Progress } from 'antd';
import type { ProgressProps } from 'antd';
import { Contract, providers, ethers } from 'ethers';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import CustomWalletConnectButton from '@/components/CustomWalletConnectButton';
import useNotification from '@/hooks/useNotification';

import { MARS_WTF_ABI, EARLY_LIQUIDITY_ABI, ERC20_ABI } from '@/constants/abis';
import  { TOKEN_ADDRESSES, EARLY_LIQUIDITY_ADDRESSES, USDC_ADDRESS, } from '@/constants/config';

import useWeb3 from "@/hooks/useWeb3";

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};
const conicColors: ProgressProps['strokeColor'] = {
  '0%': '#87d068',
  '50%': '#ffe58f',
  '100%': '#ffccc7',
};

const totalPresaleAmount = 1e6;

const Presale = () => {

  const { address, isConnected, isConnecting, isReconnecting, connector, chainId, signer } = useWeb3();// hook address, isconnected, inConnecting
  //abis
  const [contractMarsWTF, setContractMarsWTF] = React.useState<Contract|undefined>(undefined);
  const [contractEarlyLiquidity, setContractEarlyLiquidity] = React.useState<Contract|undefined>(undefined);
  const [constractUSDC, setContractUSDC] = React.useState<Contract|undefined>(undefined);
  //contract infos
  const [balances, setBalances] = React.useState<Record<string, number>>({});
  const [memeBalance, setMemeBalance] = React.useState<number>(0);
  const [presalePrice, setPresalePrice] = React.useState<number>(0);
  const [presaleBalance, setPresaleBalance] = React.useState<number>(0);
  //fromAmount and toAmount
  const [fromAmount, setFromAmount] = React.useState<string>("");
  const [toAmount, setToAmount] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { showNotification } = useNotification ();

  /**
   * get MarsBalance
   * @param _contract 
   */
  const _getMarsBalance = async(_contract = contractMarsWTF) => {
    try {
      if (!_contract) throw "no contract";
      if (!address) throw "no address";
      const _balance = await _contract.balanceOf(address);
      const _num = Number(_balance)/1e9;
      setMemeBalance (_num);
    } catch (err) {

    }
  }
  /**
   * get USDC balance
   * @param _contract 
   */
  const _getUSDCBalance = async(_contract = constractUSDC) => {
    try {
      if (!_contract) throw "no contract";
      if (!address) throw "no address";
      const _balance = await _contract.balanceOf(address);
      console.log(_balance)
      setBalances ({ ...balances, 'usdc': Number(_balance)/1e6 });
    } catch (err) {

    }
  }
  /**
   * get early LP info, 
   * @param _contract marsWTF Contract
   * @param _lpContract earlyLiquidity Contract
   */
  const _getEarlyLiquidityInfo = async (_contract = contractMarsWTF, _lpContract = contractEarlyLiquidity) => {
    try {
      if (!_contract) throw "no contract";
      const _balance = await _contract.balanceOf(EARLY_LIQUIDITY_ADDRESSES[chainId]);
      const num = Number(_balance)/1e9;
      console.log("presale balance -----------", num);
      setPresaleBalance(num); //presale amount

      if(!_lpContract) throw "no lp contract";

      const _presalePrice = await _lpContract.getPresalePrice();
      console.log('presale price ------>', Number(_presalePrice));
      setPresalePrice(Number(_presalePrice/1e6));
    } catch (err) {
      console.log(err)
    }
  }
  /**
   * get Contract data when first load
   */
  React.useEffect(() => {
    if (address && chainId && signer) {
      const _contractMarsWTF = new ethers.Contract(
        TOKEN_ADDRESSES[chainId],
        MARS_WTF_ABI,
        signer,
      );
      setContractMarsWTF (_contractMarsWTF);
      _getMarsBalance (_contractMarsWTF);
      
      const _contractEarlyLiquidity = new ethers.Contract(
        EARLY_LIQUIDITY_ADDRESSES[chainId],
        EARLY_LIQUIDITY_ABI,
        signer
      );
      
      _getEarlyLiquidityInfo (_contractMarsWTF, _contractEarlyLiquidity);
      setContractEarlyLiquidity (_contractEarlyLiquidity);
    } else {
      setBalances ({});
    }
  }, [address, chainId, signer]);
  /**
   * when load the web3, get stable Coin balances
   */
  React.useEffect(() => {
    if (address && chainId && signer) {
      const _contractUSDC = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      setContractUSDC (_contractUSDC);
      _getUSDCBalance (_contractUSDC);
    }
  }, [address, chainId, signer]);
  /**
   * when the fromAmount is changed by user typing...
   * @param e HTMLChangeEvent
   * @returns 
   */
  const handleFromAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    //@ts-ignore
    if (Number(value) < 0 || isNaN(Number(value)) || value.length > 15) {
      setFromAmount("0");
      return;
    }
    const _amount = Number(value) / presalePrice;
    setFromAmount(value);
    if (_amount === Infinity || isNaN(_amount)) {
      setToAmount ("0.0");
    } else {
      setToAmount (String(_amount));
    }
  }
  /**
   * when the toAmount is changed by user typing...
   * @param e HTMLChangeEvent
   * @returns 
   */
  const handleToAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    //@ts-ignore
    if (Number(value) < 0 || isNaN(Number(value)) || value.length > 15) {
      setToAmount("0");
      return;
    }
    setToAmount(value);
    const _amount = Number(value) * presalePrice;
    if (_amount === Infinity || isNaN(_amount)) {
      setFromAmount ("0.0");
    } else {
      setFromAmount (String(_amount));
    }
  }

  const handleBuyMeme = async () => {
    try {
      setIsLoading (true);
      if (!constractUSDC) throw "no USDC contract";
      if (!contractEarlyLiquidity) throw "no lp contract";

      if (fromAmount === "" || toAmount === "") {
        throw "Input Token Amount to Buy";
      }

      if (Number(fromAmount) < 1e-6) {
        throw "Can't buy too small amount";
      }
      if (Number(toAmount) > presaleBalance) {
        throw "Insufficient token Amount to buy";
      }
      
      const _amountUSDC = Math.round(Number(fromAmount) * 1e6);
      const _amountMeme = Math.round(Number(toAmount) * 1e9);
      const _approveTx = await constractUSDC.approve(EARLY_LIQUIDITY_ADDRESSES[chainId], _amountUSDC);
      await _approveTx.wait();
      showNotification ("Token is approved Successfully", "info");
      const _buyTx = await contractEarlyLiquidity.buy(_amountMeme);
      await _buyTx.wait();
      showNotification ("Transaction Success", "info");
      console.log(_buyTx);

      await _getEarlyLiquidityInfo ();
      await _getMarsBalance ();
      await _getUSDCBalance ();
    } catch (err: any) {
      if (String(err.code) === "ACTION_REJECTED") {
        showNotification ("User rejected transaction.", "warning");
      } else {
        showNotification (String(err), "warning");
      }
    } finally {
      setIsLoading (false);
    }
  }

 

  return (
    <div className="w-full max-w-md bg-[#D8D8D8] border border-gray-200 rounded-2xl shadow dark:bg-gray-800 dark:border-gray-700 p-3">
      <div className='w-full rounded-xl p-4 bg-white'>
        <h1 className='text-xl p-2 text-gray-800 font-title font-bold'>${ (totalPresaleAmount - presaleBalance) * presalePrice } / ${ totalPresaleAmount * presalePrice } RAISED</h1>
        <h2 className='text-lg px-2 font-text text-[#9b9ba7]'>Buy in before price increases!</h2>
        <Progress 
          percent={(totalPresaleAmount - presaleBalance) * 100 / totalPresaleAmount} 
          showInfo={false} 
          status="active" 
          strokeColor={twoColors} />
        <h2 className='font-ugly'>Current Price ${presalePrice}</h2>
      </div>

      <div className='w-full rounded-xl p-4 bg-white mt-4'>
        <h1 className='text-xl px-2 text-gray-800 font-title font-bold'>You pay</h1>
        <div className='flex items-center p-2 justify-between'>
          <input
            value={fromAmount}
            onChange={handleFromAmountChanged}
            placeholder="0.0"
            className="bg-transparent text-2xl py-2 rounded-[12px] w-full outline-none border-none" 
          />
          <div className='flex items-center justify-center gap-2'>
            <Image
              src={'/coins/usdc.png'}
              width={40}
              height={40}
              alt=''
              sizes="100vw"
            />
            <span className='font-bold font-ugly'>USDC</span>
          </div>
        </div>
        <div className='font-title px-2'>balance: <span className='font-bold'>{balances.usdc ? balances.usdc: 0}</span></div>
      </div>

      <div className='w-full rounded-xl p-4 bg-white mt-4'>
        <h1 className='text-xl px-2 text-gray-800 font-title font-bold'>You Receive</h1>
        <div className='flex items-center p-2 justify-between'>
          <input
            value={toAmount}
            onChange={handleToAmountChanged}
            placeholder="0.0"
            className="bg-transparent text-2xl py-2 rounded-[12px] w-full outline-none border-none" 
          />
          <div className='flex items-center justify-center gap-2'>
            <Icon icon="noto:coin" className='w-10 h-10'/>
            <span className='font-bold font-ugly'>MWTF</span>
          </div>
        </div>
        <div className='font-title px-2'>balance: <span className='font-bold'>{memeBalance}</span></div>
      </div>
      <CustomWalletConnectButton handleBuyMeme={handleBuyMeme} isLoading={isLoading}/>
    </div>

  )
}

export default Presale;