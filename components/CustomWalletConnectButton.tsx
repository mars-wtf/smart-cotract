import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import { Icon } from '@iconify/react';

interface IProps {
  handleBuyMeme: () => Promise<void>,
  isLoading: boolean
}

export default ({ handleBuyMeme, isLoading }: IProps) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        if (connected && isLoading) {
          return (
            <div data-tooltip-target="tooltip-default" className="flex font-title cursor-pointer font-bold justify-center items-center gap-3 text-white mt-3 p-5 w-full rounded-xl bg-gradient-to-r from-[#FF6802] to-[#EE0E72] hover:from-[#ff6702de] hover:to-[#ee0e739f]">
              <div className='flex w-full h-full gap-2 items-center justify-center'><Icon icon="eos-icons:bubble-loading" className='text-3xl'/><span>Processing...</span></div>
            </div>
          )
        } else if (connected && !isLoading) {
          return (
            <div onClick={handleBuyMeme} data-tooltip-target="tooltip-default" className="flex font-title cursor-pointer font-bold justify-center items-center gap-3 text-white mt-3 p-5 w-full rounded-xl bg-gradient-to-r from-[#FF6802] to-[#EE0E72] hover:from-[#ff6702de] hover:to-[#ee0e739f]">
              <div className='w-full h-full flex justify-center items-center'>BUY MarsWTF</div>
            </div>
          )
        } else if (!connected) {
          return (
            <div onClick={openConnectModal} data-tooltip-target="tooltip-default" className="flex font-title cursor-pointer font-bold justify-center items-center gap-3 text-white mt-3 p-5 w-full rounded-xl bg-gradient-to-r from-[#FF6802] to-[#EE0E72] hover:from-[#ff6702de] hover:to-[#ee0e739f]">
              Connect Wallet
            </div>
          )
        }
      }}
    </ConnectButton.Custom>
  );
};