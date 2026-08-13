// Jembatan ke smart contract PesaninEscrow di Polygon (contracts/PesaninEscrow.sol).
//
// Default-nya OFF. Selama env belum lengkap, seluruh fungsi di sini mengembalikan
// null dan pemanggil tetap memakai mock tx hash seperti sebelumnya — jadi
// `npm run dev` tetap jalan tanpa setup eksternal apa pun.
//
// Yang sudah nyata di sini baru jalur SETTLE (payout ke merchant & driver), karena
// `settleOrder` di contract ber-modifier `onlyOwner` sehingga cukup dipanggil
// server pakai kunci platform. Jalur FUND (buyer deposit) belum ada di sini:
// itu perlu tanda tangan buyer, dan desainnya bergantung keputusan custodial vs
// non-custodial yang belum diambil — lihat README bagian "Escrow on-chain".

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Subset ABI yang dipakai server. Selaras dengan contracts/PesaninEscrow.sol.
const ESCROW_ABI = [
  'function assignDriver(bytes32 orderId, address driver) external',
  'function settleOrder(bytes32 orderId) external',
  'function getOrder(bytes32 orderId) external view returns (tuple(address buyer, address merchant, address driver, uint256 subtotal, uint256 deliveryFee, uint8 status))',
];

function readConfig() {
  return {
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || '',
    contractAddress: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '',
    platformKey: process.env.PLATFORM_PRIVATE_KEY || '',
  };
}

/// Kenapa chain aktif / tidak — dipakai juga untuk pesan diagnostik.
export function chainStatus() {
  const { rpcUrl, contractAddress, platformKey } = readConfig();
  if (!rpcUrl) return { enabled: false, reason: 'NEXT_PUBLIC_POLYGON_RPC_URL kosong' };
  if (!contractAddress || contractAddress === ZERO_ADDRESS) {
    return { enabled: false, reason: 'NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS belum diisi (masih address nol)' };
  }
  if (!platformKey) return { enabled: false, reason: 'PLATFORM_PRIVATE_KEY kosong' };
  return { enabled: true, reason: 'siap' };
}

export function isChainEnabled() {
  return chainStatus().enabled;
}

// ethers di-import dinamis supaya modul native-nya tidak ikut termuat selama
// chain masih OFF, dan instalasi ethers yang bermasalah tidak bisa menjatuhkan
// jalur mock yang dipakai mayoritas developer.
async function getContract() {
  const { rpcUrl, contractAddress, platformKey } = readConfig();
  const { JsonRpcProvider, Wallet, Contract } = await import('ethers');
  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(platformKey, provider);
  return new Contract(contractAddress, ESCROW_ABI, wallet);
}

// Order id di DB berupa hex 12 karakter, sedangkan contract memakai bytes32.
// keccak256 dari string id dipakai sebagai kunci yang deterministik.
async function toOrderKey(orderId) {
  const { id } = await import('ethers');
  return id(String(orderId));
}

function isUsableAddress(addr, isAddress) {
  return !!addr && addr !== ZERO_ADDRESS && isAddress(addr);
}

/// Settle pesanan: subtotal → merchant, ongkir → driver.
/// Return { txHash, blockNumber } kalau berhasil, atau null kalau chain OFF /
/// alamat belum lengkap. Melempar hanya kalau transaksi benar-benar ditolak chain.
export async function settleOrderOnChain({ orderId, merchantAddress, driverAddress }) {
  if (!isChainEnabled()) return null;

  const { isAddress } = await import('ethers');
  // Tanpa alamat tujuan yang valid, payout mustahil — jangan kirim transaksi
  // yang sudah pasti revert dan tetap menghabiskan gas.
  if (!isUsableAddress(merchantAddress, isAddress)) return null;
  if (!isUsableAddress(driverAddress, isAddress)) return null;

  const contract = await getContract();
  const key = await toOrderKey(orderId);

  // Contract menolak settle sebelum driver ter-assign, jadi pastikan dulu.
  const onchain = await contract.getOrder(key);
  const STATUS_FUNDED = 1;
  if (Number(onchain.status) !== STATUS_FUNDED) return null;
  if (onchain.driver === ZERO_ADDRESS) {
    const assignTx = await contract.assignDriver(key, driverAddress);
    await assignTx.wait();
  }

  const tx = await contract.settleOrder(key);
  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber ?? null };
}

/// Baca state pesanan dari contract. null kalau chain OFF atau belum pernah didanai.
export async function readOrderOnChain(orderId) {
  if (!isChainEnabled()) return null;
  const contract = await getContract();
  const key = await toOrderKey(orderId);
  const o = await contract.getOrder(key);
  if (Number(o.status) === 0) return null; // Status.None — belum ada di contract
  return {
    buyer: o.buyer,
    merchant: o.merchant,
    driver: o.driver,
    subtotal: o.subtotal.toString(),
    deliveryFee: o.deliveryFee.toString(),
    status: Number(o.status),
  };
}
