export interface IStep {
  [key: string]: string | number | boolean | Oid | Date | null | undefined;
  public: boolean;
  featured: boolean;
  main_eth_notarization: string;
  test_eth_notarization: string;
  sepolia_test_eth_notarization: string;
  main_algo_notarization: string;
  polygon_matic_notarization: string;
  test_algo_notarization: string;
  bitcoin_notarization: string;
  ipfs_notarization: string;
  _id: Oid;
  user: Oid;
  name: string;
  uri: string;
  randomizeProof: string | null;
  historyId: Oid;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  hash: string;
  calcHash?: string;
}

export interface Oid {
  $oid: string;
}

export type BlockchainName = "Polygon Matic" | "Ethereum Rinkeby" | "Unknown";
