// Copyright © 2022, Suiet Team
import {MoveCallTransaction, SuiExecuteTransactionResponse, SuiTransactionResponse} from '@mysten/sui.js';
import {
  IWindowSuietApi,
  ISuietWalletAdapter,
  Permission,
  ResData,
  ALL_PERMISSION_TYPES, PermissionType
} from "./types";
import {SignMessageInput, SignMessageOutput} from "@wallet-standard/features";

declare const window: {
  __suiet__: IWindowSuietApi;
};

export class SuietWalletAdapter implements ISuietWalletAdapter {
  name = 'Suiet';
  connecting: boolean = false;
  connected: boolean = false;
  wallet: IWindowSuietApi | null = null;

  @ensureWalletExist()
  async connect(): Promise<void> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.connect([Permission.VIEW_ACCOUNT, Permission.SUGGEST_TX]);
    this.checkError(resData, 'connection')
    if (resData.data === false) {
      throw new Error('User rejected to connect')
    }
  }

  @ensureWalletExist()
  async disconnect(): Promise<void> {
    const wallet = this.wallet as IWindowSuietApi;
    await wallet.disconnect();
  }

  @ensureWalletExist()
  async getAccounts() {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.getAccounts();
    this.checkError(resData, 'getAccounts')
    this.checkDataIsNull(resData, 'getAccounts');
    return resData.data as string[];
  }

  @ensureWalletExist()
  async hasPermissions(permissions: readonly PermissionType[] = ALL_PERMISSION_TYPES) {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.hasPermissions(permissions);
    this.checkError(resData, 'hasPermissions')
    this.checkDataIsNull(resData, 'hasPermissions')
    return resData.data as boolean;
  }

  @ensureWalletExist()
  async requestPermissions(permissions: readonly PermissionType[] = ALL_PERMISSION_TYPES) {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.requestPermissions(permissions);
    this.checkError(resData, 'requestPermissions')
    this.checkDataIsNull(resData, 'requestPermissions')
    return resData.data as boolean;
  }

  @ensureWalletExist()
  async executeMoveCall(transaction: MoveCallTransaction): Promise<SuiExecuteTransactionResponse> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.executeMoveCall(transaction);
    this.checkError(resData, 'executeMoveCall')
    this.checkDataIsNull(resData, 'executeMoveCall')
    return resData.data as SuiExecuteTransactionResponse;
  }

  @ensureWalletExist()
  async executeSerializedMoveCall(
    transactionBytes: Uint8Array
  ): Promise<SuiExecuteTransactionResponse> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.executeSerializedMoveCall(transactionBytes);
    this.checkError(resData, 'executeSerializedMoveCall')
    this.checkDataIsNull(resData, 'executeSerializedMoveCall')
    return resData.data as SuiExecuteTransactionResponse;
  }

  @ensureWalletExist()
  async signMessage(input: SignMessageInput): Promise<SignMessageOutput> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.signMessage(input);
    this.checkError(resData, 'signMessage')
    this.checkDataIsNull(resData, 'signMessage');
    return resData.data as SignMessageOutput;
  }

  @ensureWalletExist()
  async getPublicKey(): Promise<Uint8Array> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.getPublicKey();
    this.checkError(resData, 'getPublicKey')
    this.checkDataIsNull(resData, 'getPublicKey');
    return resData.data as Uint8Array;
  }

  private checkError(resData: ResData, func: string) {
    if (resData.error) {
      const errMsg = resData.error?.msg ?? 'Unknown Error';
      console.error(suietSay(`${func} failed`), errMsg)
      throw new Error(errMsg);
    }
  }

  private checkDataIsNull(resData: ResData, func: string) {
    if (resData.data === null) {
      const errMsg = 'Response data is null';
      console.error(suietSay(`${func} failed`), errMsg)
      throw new Error(errMsg);
    }
  }
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

function suietSay(msg: string) {
  return `[SUIET_WALLET]: ${msg}`
}