import { NextPage } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import { MouseEvent, useEffect, useState } from 'react';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  PublicKeyInitData,
  RpcResponseAndContext,
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Home: NextPage = () => {
  const [splTokens, setSplTokens] = useState([]);
  const [address, setAddress] = useState('');
  const [submittedAddress, setSubmittedAddress] = useState('');
  const [solAmount, setSol] = useState(0);
  const [balances, setBalances] = useState([]);
  const [nfts, setNfts] = useState([]);
  const { publicKey } = useWallet();

  useEffect(() => {
    const splTokensPromise = fetch(
      'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json'
    )
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson.tokens;
      })
      .catch((err) => {
        console.log(err);
      });

    splTokensPromise.then((splTokens) => {
      setSplTokens(splTokens);
    });
  }, []);

  useEffect(() => {
    if (publicKey) {
      setAddress(publicKey.toString());
      addressSubmitHandler(null, publicKey.toString());
    } else {
      clearData();
    }
  }, [publicKey]);

  const addressSubmitHandler = (e: MouseEvent, address: String) => {
    if (e) e.preventDefault();

    if (address !== submittedAddress) {
      try {
        const key = new PublicKey(address);
        const connection = new Connection(clusterApiUrl('mainnet-beta'));

        connection
          .getBalance(key)
          .then((balance) => setSol(balance / LAMPORTS_PER_SOL));

        connection
          .getParsedTokenAccountsByOwner(key, {
            programId: new PublicKey(
              'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
            ),
          })
          .then((balance) => {
            parseRpcResponseAndContext(balance);
          });
      } catch (err) {
        clearData();
        alert(err);
      }
    }
  };

  const parseRpcResponseAndContext = (balance: RpcResponseAndContext<any>) => {
    setSubmittedAddress(address);
    setBalances([]);
    setNfts([]);

    let ownedBalances = balance.value.filter(
      ({ account }) =>
        account.data.parsed.info.tokenAmount.amount > 0 &&
        account.data.parsed.info.tokenAmount.decimals > 0
    );

    let ownedNfts = balance.value.filter(
      ({ account }) =>
        account.data.parsed.info.tokenAmount.amount > 0 &&
        account.data.parsed.info.tokenAmount.decimals === 0
    );

    // Balances
    ownedBalances.map(async ({ account }) => {
      const { mint } = account.data.parsed.info;
      const amount = account.data.parsed.info.tokenAmount.uiAmountString;

      splTokens.map((splToken) => {
        if (splToken.address === mint) {
          const { logoURI, name, symbol } = splToken;
          const token = {
            mint,
            logoURI,
            name,
            symbol,
            amount,
          };

          setBalances((balance) => balance.concat(token));
        }
      });
    });

    // Nfts
    ownedNfts.map(async ({ account }) => {
      const { mint } = account.data.parsed.info;

      let headers = new Headers();

      // TODO: Fix cors error
      fetch('https://api-mainnet.magiceden.dev/v2/tokens/' + mint, {
        mode: 'cors',
        method: 'GET',
        headers: headers,
        redirect: 'follow',
      })
        .then((response) => response.json())
        .then((result) => {
          const { attributes, collection, image, name, supply } = result;
          const token = {
            mint,
            attributes,
            collection,
            image,
            name,
            supply,
          };

          let index = nfts.findIndex((nft) => nft.mint === mint);
          if (index < 0) {
            setNfts((nft) => nft.concat(token));
          }
        })
        .catch((err) => console.log(err));
    });
  };

  const clearData = () => {
    setAddress('');
    setSubmittedAddress('');
    setSol(0);
    setBalances([]);
    setNfts([]);
  };

  const renderHeader = () => (
    <div className="flex flex-col items-center py-20">
      <Head>
        <title>Solana Wallet Tracker</title>
        <meta
          name="description"
          content="Track the activity of a Solana Wallet"
        />
        <link rel="icon" href="/SOL.jpg" />
      </Head>
      <h1 className="text-center font-bold text-3xl pb-3 sm:text-5xl">
        Solana Wallet Tracker
      </h1>
      <h3 className="text-center sm:text-xl">
        View the balances and nfts from a Solana wallet
      </h3>
    </div>
  );

  const renderForm = () => {
    return (
      <>
        {!publicKey ? (
          <>
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
                onClick={(e) => addressSubmitHandler(e, address)}
                className="text-center font-bold bg-teal-400 rounded px-3"
              >
                Search
              </button>
            </form>

            <div className="flex items-center justify-evenly w-full">
              <hr className="text-slate-100 w-40" />
              <div className="p-5 font-bold">or</div>
              <hr className="text-slate-100 w-40" />
            </div>
          </>
        ) : null}

        <div className="rounded pb-20">
          <WalletMultiButton className="wallet-adapter-button-select" />
        </div>
      </>
    );
  };

  const renderBalances = () => {
    return (
      <>
        {balances.length ? (
          <div
            className="flex flex-col items-start
          bg-slate-800 rounded w-full px-3 mt-5"
          >
            <div className="flex justify-between w-full py-3">
              <div className="flex items-center">
                <Image
                  src={'/SOL.jpg'}
                  alt={'Solana'}
                  width={25}
                  height={25}
                  className="rounded-full"
                />
                <div className="pl-2">SOL</div>
              </div>
              {solAmount}
            </div>
            {balances.map(({ mint, logoURI, name, symbol, amount }) =>
              logoURI ? (
                <div key={mint} className="flex justify-between w-full py-3">
                  <div className="flex items-center">
                    <Image
                      loader={() => logoURI}
                      src={logoURI}
                      unoptimized
                      alt={name}
                      width={25}
                      height={25}
                      className="rounded-full"
                    />
                    <div className="pl-2">{symbol}</div>
                  </div>
                  {amount}
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </>
    );
  };

  const renderNfts = () => {
    return (
      <>
        {nfts.length ? (
          <div
            className="flex flex-col items-start
          bg-slate-800 rounded w-full px-3 mt-5 mb-32"
          >
            {nfts.map(({ mint, attributes, collection, image, name, supply }) =>
              image ? (
                <div
                  key={mint}
                  className="h-100 flex flex-col items-center w-full py-5 pb-10"
                >
                  <a
                    href={'https://magiceden.io/item-details/' + mint}
                    target="__blank"
                    rel="noreferrer"
                    className="cursor-pointer image-wrapper flex flex-col items-center"
                  >
                    <div className="font-bold pb-2">{name}</div>
                    <Image
                      loader={() => image}
                      src={image}
                      alt={name}
                      unoptimized
                      width={225}
                      height={225}
                      className="rounded min-w-min"
                    />
                  </a>
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </>
    );
  };

  const renderFooter = () => (
    <footer className="absolute bottom-0 w-full flex justify-center py-5">
      Built by
      <a
        href="https://elijahdr.vercel.app/"
        target="_blank"
        rel="noreferrer"
        className="font-bold pl-1"
      >
        Elijah
      </a>
    </footer>
  );

  return (
    <div className="text-white bg-slate-900 min-h-screen relative">
      <main
        className="min-h-screen flex flex-col justify-center 
        items-center px-3 pb-32 max-w-md sm:max-w-lg mx-auto"
      >
        {renderHeader()}
        {renderForm()}
        {renderBalances()}
        {renderNfts()}
      </main>
      {renderFooter()}
    </div>
  );
};

export default Home;
