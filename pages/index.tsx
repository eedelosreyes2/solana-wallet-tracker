import { NextPage } from 'next';
import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

const Home: NextPage = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);

  const addressSubmitHandler = (e: MouseEvent) => {
    e.preventDefault();

    try {
      const key = new PublicKey(address);
      const connection = new Connection(clusterApiUrl('devnet'));
      connection.getBalance(key).then((balance) => {
        setBalance(balance / LAMPORTS_PER_SOL);
      });
    } catch (e) {
      setAddress('');
      setBalance(0);
      alert(e);
    }
  };

  const renderForm = () => {
    return (
      <form className="flex w-full">
        <input
          id="address"
          type="text"
          placeholder="Enter an address"
          className="rounded placeholder:text-white text-white w-full bg-slate-800"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          type="submit"
          onClick={(e) => addressSubmitHandler(e)}
          className="text-center bg-teal-400 rounded px-3"
        >
          Search
        </button>
      </form>
    );
  };

  const renderBalance = () => {
    return (
      <>
        {balance ? (
          <div
            className="flex flex-col items-start
          bg-slate-800 rounded w-full px-3 mt-5"
          >
            <div className="flex justify-between w-full py-3">
              <div className="flex items-center">
                <Image
                  src="/SOL.jpg"
                  alt=""
                  width={25}
                  height={25}
                  className="rounded-full"
                />
                <div className="pl-2">SOL</div>
              </div>
              {balance}
            </div>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className="text-white bg-slate-900 h-screen relative">
      <main className="flex flex-col justify-center items-center px-3 max-w-md mx-auto">
        <h1 className="text-3xl font-bold py-20">Solana Wallet Tracker</h1>
        {renderForm()}
        {renderBalance()}
      </main>

      <footer className="absolute bottom-0 w-full flex justify-center py-5">
        Built by
        <a
          href="https://elijahdr.vercel.app/"
          target="_blank"
          className="font-bold pl-1"
        >
          Elijah
        </a>
      </footer>
    </div>
  );
};

export default Home;
