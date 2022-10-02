import {MoveCallTransaction, SuiAddress, SuiTransactionResponse} from "@mysten/sui.js";
import {WalletCapabilities} from "@mysten/wallet-adapter-base";
import type {
  SignMessageInput,
  SignMessageOutput,
} from '@wallet-standard/features'

export type SignMessageParams = {
  message: string;
};

export const ALL_PERMISSION_TYPES = ['viewAccount', 'suggestTransactions'] as const;
export type AllPermissionsType = typeof ALL_PERMISSION_TYPES;
export type PermissionType = AllPermissionsType[number];

export enum Permission {
  VIEW_ACCOUNT = 'viewAccount',
  SUGGEST_TX = 'suggestTransactions',
}

export interface ResData<T = any> {
  id: string;
  error: null | {
    code: string;
    msg: string;
  };
  data: null | T;
}

export type SignMsgPayload = {
  message: string
}
export type SignMsgResult = {
  signature: string;
  signedMessage: string;
}

export interface IWindowSuietApi {
  connect: (perms: Permission[]) => Promise<ResData<any>>;
  getAccounts: () => Promise<ResData<SuiAddress[]>>;
  executeMoveCall: (transaction: MoveCallTransaction) => Promise<ResData<SuiTransactionResponse>>;
  executeSerializedMoveCall: (transactionBytes: Uint8Array) => Promise<ResData<SuiTransactionResponse>>;
  disconnect: () => Promise<ResData<void>>;
  hasPermissions: (permissions: readonly PermissionType[]) => Promise<ResData<boolean>>;
  requestPermissions: () => Promise<ResData<boolean>>;
  signMessage: (input: SignMsgPayload) => Promise<ResData<SignMsgResult>>;
}

export interface ISuietWalletAdapter extends WalletCapabilities {
  signMessage: (input: SignMessageInput) => Promise<SignMessageOutput>;
}