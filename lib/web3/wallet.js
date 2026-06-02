'use client';

import { BrowserProvider } from 'ethers';

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask belum terpasang.');
  }
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
}

export async function currentAccount() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_accounts', []);
  return accounts[0] ?? null;
}

/** Estimasi gas fee IDR untuk ditampilkan di checkout.
 *  MVP: pakai angka flat; production ambil dari estimator + oracle MATIC/IDR.
 */
export function estimateGasFeeIdr() {
  return 500;
}
