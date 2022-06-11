import { NextPage } from 'next';
import Image from 'next/image';
import { MouseEvent, useEffect, useState } from 'react';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
} from '@solana/web3.js';

const Home: NextPage = () => {
  const [address, setAddress] = useState('');
  const [splTokens, setSplTokens] = useState([]);
  const [solAmount, setSol] = useState(0);
  const [balances, setBalances] = useState({});
  const [nftMetadata, setNftMetadata] = useState([]);

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

  const addressSubmitHandler = (e: MouseEvent) => {
    e.preventDefault();

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
    } catch (e) {
      setAddress('');
      setSol(0);
      setBalances({});
      alert(e);
    }
  };

  const parseRpcResponseAndContext = (balance: RpcResponseAndContext<any>) => {
    let ownedBalances = balance.value.filter(
      ({ account }) =>
        account.data.parsed.info.tokenAmount.amount > 0 &&
        account.data.parsed.info.tokenAmount.decimals > 0
    );

    let nfts = balance.value.filter(
      ({ account }) =>
        account.data.parsed.info.tokenAmount.amount > 0 &&
        account.data.parsed.info.tokenAmount.decimals === 0
    );

    setBalances(ownedBalances);

    // Nfts
    Object.values(nfts).map(async ({ account }) => {
      const { mint } = account.data.parsed.info;

      fetch('https://api-mainnet.magiceden.dev/v2/tokens/' + mint, {
        method: 'GET',
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

          // TODO: fix logic
          if (nftMetadata.length) {
            // nftMetadata.map((nft) => {
            //   if (nft.mint !== mint) {
            //     setNftMetadata([...nftMetadata, token]);
            //   }
            // });
          } else {
            setNftMetadata([token]);
          }
        })
        .catch((err) => console.log(err));
    });
  };

  const renderHeader = () => (
    <div className="flex flex-col items-center py-20">
      <h1 className="text-3xl font-bold pb-3">Solana Wallet Tracker</h1>
      <h3 className="text-center">
        View the balances and nfts from a Solana wallet
      </h3>
    </div>
  );

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

  const renderBalances = (balances: Object) => {
    let tokens = [];

    Object.values(balances).map(async ({ account }) => {
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
          tokens.push(token);
        }
      });
    });

    tokens.sort((a, b) => a.symbol + b.symbol);

    return (
      <>
        {tokens.length ? (
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
            {tokens.map(({ mint, logoURI, name, symbol, amount }) => (
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
            ))}
          </div>
        ) : null}
      </>
    );
  };

  const renderNfts = () => {
    // Object.values(nfts).map(async ({ account }) => {
    //   const { mint } = account.data.parsed.info;

    //   fetch('https://api-mainnet.magiceden.dev/v2/tokens/' + mint, {
    //     method: 'GET',
    //     redirect: 'follow',
    //   })
    //     .then((response) => response.json())
    //     .then((result) => {
    //       const { attributes, collection, image, name, supply } = result;
    //       const token = {
    //         mint,
    //         attributes,
    //         collection,
    //         image,
    //         name,
    //         supply,
    //       };

    //       if (nftMetadata.length) {
    //         nftMetadata.map((nft) => {
    //           if (nft.mint !== mint) {
    //             // setNftMetadata([...nftMetadata, token]);
    //           }
    //         });
    //       } else {
    //         setNftMetadata([token]);
    //       }
    //     })
    //     .catch((err) => console.log(err));
    // });

    return (
      <>
        {nftMetadata.length ? (
          <div
            className="flex flex-col items-start
          bg-slate-800 rounded w-full px-3 mt-5 mb-32"
          >
            {nftMetadata.map(
              ({ mint, attributes, collection, image, name, supply }) => (
                <div
                  key={mint}
                  className="flex flex-col items-center w-full py-5 pb-10"
                >
                  <div className="flex flex-col items-center">
                    <div className="font-bold pb-2">{name}</div>
                    <Image
                      loader={() => image}
                      src={image}
                      unoptimized
                      alt={name}
                      width={225}
                      height={225}
                      className="rounded"
                    />
                  </div>
                </div>
              )
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
      <main className="flex flex-col justify-center items-center px-3 max-w-md mx-auto">
        {renderHeader()}
        {renderForm()}
        {renderBalances(balances)}
        {renderNfts()}
      </main>
      {renderFooter()}
    </div>
  );
};

export default Home;
