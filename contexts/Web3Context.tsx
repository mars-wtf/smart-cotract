"use client"
import React from "react";

import { providers } from 'ethers';
//@ts-ignore
import { useAccount, useChainId, useWalletClient } from "wagmi";

function clientToSigner(client: any) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider= new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

interface IContext {
  address: string,
  isConnected: boolean,
  isConnecting: boolean,
  chainId: number,
  isReconnecting: boolean,
  connector: any,
  signer: any
}

export const Web3Context = React.createContext<IContext|undefined>(undefined);

const Web3ContextProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {

  const { address, isConnected, isConnecting, isReconnecting, connector } = useAccount()
  const chainId = useChainId();

  
  const { data: client } = useWalletClient({ chainId })
  const signer = React.useMemo(() => (client ? clientToSigner(client) : undefined), [client])

  return (
    <Web3Context.Provider value={{ address, isConnected, isConnecting, isReconnecting, connector, chainId, signer }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3ContextProvider;
