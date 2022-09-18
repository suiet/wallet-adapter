// Copyright © 2022, Suiet Team
import {MoveCallTransaction, SuiAddress, SuiTransactionResponse} from '@mysten/sui.js';
import {WalletCapabilities} from '@mysten/wallet-adapter-base';

const ALL_PERMISSION_TYPES = ['viewAccount', 'suggestTransactions'] as const;
type AllPermissionsType = typeof ALL_PERMISSION_TYPES;
enum Permission {
  VIEW_ACCOUNT = 'viewAccount',
  SUGGEST_TX = 'suggestTransactions',
}
type PermissionType = AllPermissionsType[number];

interface SuiWalletWindow {
  __suiet__: ISuietWallet;
}

declare const window: SuiWalletWindow;

export interface ISuietWallet {
  connect: (perms: Permission[]) => Promise<ResData<any>>;
  getAccounts: () => Promise<ResData<SuiAddress[]>>;
  executeMoveCall: (transaction: MoveCallTransaction) => Promise<ResData<SuiTransactionResponse>>;
  executeSerializedMoveCall: (transactionBytes: Uint8Array) => Promise<SuiTransactionResponse>;
  disconnect: () => Promise<void>;
  hasPermissions: (permissions: readonly PermissionType[]) => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
}

function guideToInstallExtension() {
  // TODO
  throw new Error(suietSay('You need to install Suiet Extension from Chrome Store firstly!'));
}

function ensureWalletExist() {
  return (target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) => {
    const method = descriptor.value;
    descriptor.value = (...args: any[]) => {
      if (!window.__suiet__) {
        return guideToInstallExtension();
      }
      if (!target.wallet) {
        target.wallet = window.__suiet__;
      }
      return method.apply(target, args);
    }
    return descriptor;
  }
}

function requireConnected() {
  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    descriptor.value = (...args: any) => {
      if (!target.connected) {
        throw new Error(suietSay(`call function failed, wallet is not connected. methodName=${methodName}`))
      }
      return method.apply(target, args)
    }
    return descriptor;
  }
}

function suietSay(msg: string) {
  return `[SUIET_WALLET]: ${msg}`
}

interface ResData<T> {
  id: string;
  error: null | {
    code: string;
    msg: string;
  };
  data: null | T;
}

export class SuietWalletAdapter implements WalletCapabilities {
  name = 'Suiet';
  connecting: boolean = false;
  connected: boolean = false;
  wallet: ISuietWallet | null = null;

  @ensureWalletExist()
  async connect(): Promise<void> {
    if (this.connected || this.connecting) return;
    const wallet = this.wallet as ISuietWallet;

    this.connecting = true;
    try {
      const res = await wallet.connect([Permission.VIEW_ACCOUNT, Permission.SUGGEST_TX]);
      if (res.error) {
        throw new Error(res.error.msg);
      }
      if (res.data === false) {
        throw new Error('user rejected to connect')
      }
      this.connected = true;
    } finally {
      this.connecting = false;
    }
  }

  @requireConnected()
  @ensureWalletExist()
  async disconnect(): Promise<void> {
    const wallet = this.wallet as ISuietWallet;
    await wallet.disconnect();
    this.connected = false;
  }

  @requireConnected()
  @ensureWalletExist()
  // @ts-ignore
  async getAccounts() {
    const wallet = this.wallet as ISuietWallet;
    const resData = await wallet.getAccounts();
    if (resData.error) {
      throw new Error(resData.error.msg);
    }
    return resData.data as string[];
  }

  @requireConnected()
  @ensureWalletExist()
  async executeMoveCall(
    transaction: MoveCallTransaction
  ) {
    const wallet = this.wallet as ISuietWallet;
    const resData = await wallet.executeMoveCall(transaction);
    if (resData.error) {
      throw new Error(resData.error.msg);
    }
    return resData.data;
  }

  @requireConnected()
  @ensureWalletExist()
  async executeSerializedMoveCall(
    transactionBytes: Uint8Array
  ): Promise<SuiTransactionResponse> {
    const wallet = this.wallet as ISuietWallet;
    return await wallet.executeSerializedMoveCall(transactionBytes);
  }
}
