import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Solana Wallet Tracker</title>
        <meta
          name="description"
          content="Track the activity of a Solana Wallet"
        />
        <link rel="icon" href="/SOL.jpg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
