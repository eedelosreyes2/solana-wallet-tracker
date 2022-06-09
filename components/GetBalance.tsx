import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import React from 'react';

type Props = {
  balance: number;
};

export default function GetBalance({ balance }: Props) {
  return <div>{balance}</div>;
}
