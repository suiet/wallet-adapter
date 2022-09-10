// Copyright © 2022, Suiet Team
import { MoveCallTransaction, SuiTransactionResponse } from '@mysten/sui.js';
import { WalletCapabilities } from '@mysten/wallet-adapter-base';
const ALL_PERMISSION_TYPES = ['viewAccount', 'suggestTransactions'] as const;
type AllPermissionsType = typeof ALL_PERMISSION_TYPES;
type PermissionType = AllPermissionsType[number];

interface SuiWalletWindow {
  __suiet__: ISuietWallet;
}

declare const window: SuiWalletWindow;

export interface ISuietWallet extends WalletCapabilities {
  connect: () => Promise<void>;
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
      const result = method.apply(target, ...args)
      return result;
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
      return method.apply(target, ...args)
    }
    return descriptor;
  }
}

function suietSay(msg: string) {
  return `[SUIET_WALLET]: ${msg}`
}

export class SuietWalletAdapter implements WalletCapabilities {
  name = 'Suiet Wallet';
  connecting: boolean;
  connected: boolean;
  wallet: ISuietWallet | null = null;

  constructor() {
    this.connected = false;
    this.connecting = false;
  }

  @ensureWalletExist()
  async connect(): Promise<void> {
    const wallet = this.wallet as ISuietWallet;
    this.connecting = true;
    try {
      await wallet.connect();
      const given = await wallet.requestPermissions();
      console.log(suietSay('requestPermissions'), given);
      const newLocal: readonly PermissionType[] = ['viewAccount'];
      const perms = await wallet.hasPermissions(newLocal);
      console.log(suietSay('hasPermissions'), perms);
      this.connected = true;
    } catch (err) {
      console.error(err);
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
  async getAccounts(): Promise<string[]> {
    const wallet = this.wallet as ISuietWallet;
    return await wallet.getAccounts();
  }

  @requireConnected()
  @ensureWalletExist()
  async executeMoveCall(
    transaction: MoveCallTransaction
  ): Promise<SuiTransactionResponse> {
    const wallet = this.wallet as ISuietWallet;
    return await wallet.executeMoveCall(transaction);
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
