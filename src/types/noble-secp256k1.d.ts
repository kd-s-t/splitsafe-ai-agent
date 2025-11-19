declare module '@noble/secp256k1' {
  export interface SignOptions {
    der?: boolean;
    extraEntropy?: Uint8Array | Buffer;
  }
  
  export interface EtcConfig {
    hmacSha256Sync?: (k: Uint8Array, ...m: Uint8Array[]) => Uint8Array;
    sha256Sync?: (...m: Uint8Array[]) => Uint8Array;
    hashes?: {
      sha256?: (...m: Uint8Array[]) => Uint8Array;
    };
  }
  
  export const etc: EtcConfig;
  
  export function sign(msgHash: Uint8Array, privKey: Uint8Array | Buffer, opts?: SignOptions): Promise<Uint8Array>;
  export function signSync(msgHash: Uint8Array, privKey: Uint8Array | Buffer, opts?: SignOptions): Uint8Array;
  export function getPublicKey(privKey: Uint8Array | Buffer, isCompressed?: boolean): Uint8Array;
}


