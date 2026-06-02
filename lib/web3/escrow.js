'use client';

import { BrowserProvider, Contract, parseEther, keccak256, toUtf8Bytes } from 'ethers';

// ABI minimal — sesuai contracts/PesaninEscrow.sol
export const ESCROW_ABI = [
  'function fundOrder(bytes32 orderId, address merchant, uint256 subtotal, uint256 deliveryFee) payable',
  'function assignDriver(bytes32 orderId, address driver)',
  'function settleOrder(bytes32 orderId)',
  'function cancelOrder(bytes32 orderId)',
  'function getOrder(bytes32 orderId) view returns (tuple(address buyer,address merchant,address driver,uint256 subtotal,uint256 deliveryFee,uint8 status))',
  'event OrderFunded(bytes32 indexed orderId, address buyer, address merchant, uint256 subtotal, uint256 deliveryFee)',
  'event OrderSettled(bytes32 indexed orderId, address merchant, address driver, uint256 subtotal, uint256 deliveryFee)',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID || 80002);

const USE_MOCK =
  !CONTRACT_ADDRESS ||
  CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';

export function orderIdToBytes32(uuid) {
  return keccak256(toUtf8Bytes(uuid));
}

async function getContract() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet tidak terdeteksi. Install MetaMask.');
  }
  const provider = new BrowserProvider(window.ethereum);
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
    } catch {
      throw new Error(`Pindah ke jaringan Polygon (chainId ${CHAIN_ID}).`);
    }
  }
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, ESCROW_ABI, signer);
}

// --------------------------------------------------------------------------
// MOCK (dipakai sebelum deploy contract): simulate latency + random hash.
// --------------------------------------------------------------------------
async function mockTx() {
  await new Promise((r) => setTimeout(r, 600));
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return (
    '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  );
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/** Buyer memfund order. `subtotalIdr` + `deliveryFeeIdr` dikonversi via rate.
 *  Untuk MVP pakai konversi 1 IDR = 1 wei (placeholder). Ganti dengan oracle.
 */
export async function fundOrder({ orderUuid, merchantAddress, subtotal, deliveryFee }) {
  if (USE_MOCK) return mockTx();
  const c = await getContract();
  const id = orderIdToBytes32(orderUuid);
  const sub = parseEther(String(subtotal / 1e9));      // placeholder rate
  const fee = parseEther(String(deliveryFee / 1e9));
  const tx = await c.fundOrder(id, merchantAddress, sub, fee, { value: sub + fee });
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Settle: distribusi ke merchant + driver. Dipanggil oleh platform owner
 *  saat driver menandai pesanan selesai. Di MVP driver langsung panggil
 *  (owner == deployer, via relayer di production).
 */
export async function settleOrder(orderUuid) {
  if (USE_MOCK) return mockTx();
  const c = await getContract();
  const tx = await c.settleOrder(orderIdToBytes32(orderUuid));
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function cancelOrder(orderUuid) {
  if (USE_MOCK) return mockTx();
  const c = await getContract();
  const tx = await c.cancelOrder(orderIdToBytes32(orderUuid));
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function assignDriver(orderUuid, driverAddress) {
  if (USE_MOCK) return mockTx();
  const c = await getContract();
  const tx = await c.assignDriver(orderIdToBytes32(orderUuid), driverAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}
