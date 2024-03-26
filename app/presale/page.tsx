"use client"
import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Presale from '@/components/Presale';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Icon } from '@iconify/react';

const HoldersChart = dynamic(() => import("@/components/holdersChart"), { ssr: false });

interface IHolder {
  contributor: string,
  amount: number,
  cnt: number
}

const data = [
  "0xec240a8949422bb9e41c7de6fe247540655f5b2f",
  "0xf8686f2ae1e27f2a27ebf9f9561c55df6e5b7a23",
  "0x975ccbb6e81078063f579bf587c8bbd750b088bd",
  "0xec240a8949422bb9e41c7de6fe247540655f5b2f",
  "0xbd49829aa9ceb5269444d4778ff2188f5ca338e2",
  "0xec240a8949422bb9e41c7de6fe247540655f5b2f",
  "0xec240a8949422bb9e41c7de6fe247540655f5b2f",
  "0xbd49829aa9ceb5269444d4778ff2188f5ca338e2",
  "0xdd5e3a4793231fdc3a56059167f9f723131e3840",
  "0xdd5e3a4793231fdc3a56059167f9f723131e3840",
  "0xbd49829aa9ceb5269444d4778ff2188f5ca338e2",
  "0xdd5e3a4793231fdc3a56059167f9f723131e3840",
]

const HomePage = () => {

  const router = useRouter ();

  React.useEffect(() => {
    axios.get(`https://roost-api.from-me.click/contributors`).then(({data}) => {
      setHolders (data);
    }).catch(err => {
      console.log(err);
    })
  }, []);

  const [holders, setHolders] = React.useState<IHolder[]>([]);

  const _renderHolder = ({ num, address, price }: { num: number, address: string, price: string }) => (
    <div key={num} className='bg-white flex mt-3 w-full px-10 py-3 border-2 rounded-full border-black' style={{ boxShadow: '-5px 5px 0px black' }}>
      <div className='title w-1/5 text-2xl text-center'>{num}.</div>
      <div className='title w-3/5 text-2xl overflow-hidden text-ellipsis'>{address}</div>
      <div className='title w-1/5 text-2xl'>{price} ETH</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-between pt-10">
      
      <img onClick={() => router.push('/')} src='/home.png' className='fixed left-10 top-10 w-48 cursor-pointer hover:scale-105 hover:opacity-65'></img>
      <div className='w-full lg:px-0 px-5 flex justify-end max-w-[1200px] mx-auto'>
        <ConnectButton/>
      </div>
      <div className='flex justify-between items-center w-full max-w-[1200px] md:px-0 px-4 mx-auto mt-40 lg:flex-row flex-col'>
        <div className='text-5xl'>
          <h1 className='font-title font-bold leading-[80px]'>Buy MarsWTF Now, to</h1>
          <h1 className='font-title font-bold leading-[80px]'>Get Rich In the</h1>
          <h1 className='font-title font-bold leading-[80px]'>FuChainSecurityture</h1>
        </div>
        <Presale/>
      </div>

      <section id="tokenomics" className='w-full h-full items-center max-w-[1200px] mx-auto mt-20'>
        <div className='flex flex-col lg:flex-row items-center'>
          <div className='lg:w-[45%] w-full h-full'>
            <Image
              src="/meme3.gif"
              // className={`${className} ${isImageLoading ? 'hidden' : 'block'}`}
              width={0}
              alt=''
              height={0}
              sizes="100vw"
              className='w-auto'
            />
          </div>
          <div className='flex flex-col w-[55%] py-20'>
            <h1 className='text-center font-title text-5xl text-[#FA39FF]'>tokenomics</h1>
            <div className='flex flex-row w-full'>
              <div className='w-[50%] h-full'>
                <Image
                  src="/tokenomics-total-supply.webp"
                  // className={`${className} ${isImageLoading ? 'hidden' : 'block'}`}
                  width={0}
                  alt=''
                  height={0}
                  sizes="100vw"
                  className='w-auto'
                />
              </div>
              <div className='w-[50%] -ml-[10%]'>
                <Image
                  src="/tokenomics-buy-sell.webp"
                  // className={`${className} ${isImageLoading ? 'hidden' : 'block'}`}
                  width={0}
                  alt=''
                  height={0}
                  sizes="100vw"
                  className='w-auto'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='p-10 mt-10 w-full items-center border-2 border-black border-l-[5px] border-b-[5px] grid lg:grid-cols-2 rounded-2xl max-w-[1200px] mx-auto'>
        <div className='relative'>
          <HoldersChart />
          <img className='absolute w-20 h-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' src='/logo.png'/>
        </div>
        <div className='px-5 text-center'>
          <div className='mb-5 text-left'>
            <h2 className='font-title text-[45px] font-bold [text-shadow:-4px_6px_0px_#000000]'>TOP 10</h2>
            <h2 className='font-title text-[45px] font-bold [text-shadow:-4px_6px_0px_#000000]'>CONTRIBUTORS</h2>
          </div>

          {
            holders.slice(0, 10).map((item: IHolder, index: number) => (
              <div key={index} className='flex w-full items-center gap-2'>
                <span className='w-5 h-5 aspect-square rounded-full bg-orange-300'></span>
                <p className='font-[text] text-2xl overflow-hidden text-ellipsis'>{item.contributor}</p>
              </div>
            ))
          }
        </div>
      </section>

      <section className='mt-10 w-full bg-[#A6C2FA] flex justify-center py-10'>
        <div className='w-full items-center max-w-[1200px] bg-[#A6C2FA]'>
          <h2 className='font-title text-[45px] text-center font-bold [text-shadow:-4px_6px_0px_#000000]'>TOP 100 CONTRIBUTORS</h2>
          {
            holders.length > 0 ? holders.slice(0,100).map((_holder: IHolder, index: number) => _renderHolder({ num: index + 1, address: _holder.contributor, price: '10' })) :
            <div className='flex justify-center items-center pt-20'><Icon icon="eos-icons:bubble-loading" className='text-[80px]'/></div>
          }

        </div>
      </section>
    </div>
  );
};

export default HomePage;
