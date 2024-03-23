"use client"
import { useEffect } from 'react';
import Image from 'next/image';

const HomePage = () => {
  useEffect(() => {
    const url = window.location.href;
    if (url.includes('#')) {
      const id = url.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-between pt-20">
      <section id="home" className='flex flex-col lg:flex-row items-center max-w-[1200px] mx-auto'>
        <img src="/logo-avatar.gif" alt="Logo-avatar" className='lg:w-5/12 w-full' />
        <div className='py-6 -rotate-3'>
          <p className=' font-[title] text-4xl font-extrabold'>
            the most based base baser on base
          </p>
          <img src="/logo.webp" alt="Logo" className='w-full' />
        </div>
      </section>
      <section className='relative mt-[70px] text-center w-full bg-[#A6C2FA] flex-cols pt-10'>
        <h2 className='font-[title] text-[55px] font-bold [text-shadow:-4px_6px_0px_#000000]'>TOKENOMICS</h2>
        <img className='w-full !z-[1000]' src='/tokenomics.png'/>
      </section>

      <section className='p-10 border-4 rounded-2xl'>

      </section>


    </div>
  );
};

export default HomePage;
