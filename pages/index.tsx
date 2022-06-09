import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { NextPage } from 'next';
import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import GetBalance from '../components/GetBalance';

const Home: NextPage = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);

  const addressSubmitHandler = (e: MouseEvent) => {
    e.preventDefault();
    // const address = e.target.value;
    console.log(address);

    setAddress(address);
    const key = new PublicKey(address);
    const connection = new Connection(clusterApiUrl('devnet'));
    connection.getBalance(key).then((balance) => {
      setBalance(balance / LAMPORTS_PER_SOL);
    });

    console.log(balance);
  };

  return (
    <div className="text-white bg-slate-900 h-screen relative">
      <main>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <form className="flex">
          <input
            id="address"
            type="text"
            placeholder="Enter an address"
            className="rounded text-black"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" onClick={(e) => addressSubmitHandler(e)}>
            Search
          </button>
        </form>
        <GetBalance balance={balance} />
      </main>

      <footer className="absolute bottom-0 w-full flex justify-center py-5">
        Created by Elijah
      </footer>
    </div>
  );
};

export default Home;
