// Copyright © 2022, Suiet Team
import {MoveCallTransaction, SuiTransactionResponse} from '@mysten/sui.js';
import {IWindowSuietApi, ISuietWalletAdapter, Permission, ResData, SignMsgResult} from "./types";
import {SignMessageInput, SignMessageOutput} from "@wallet-standard/features";

const {baseDecode, baseEncode} = require('borsh')

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
  async executeMoveCall(transaction: MoveCallTransaction): Promise<SuiTransactionResponse> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.executeMoveCall(transaction);
    this.checkError(resData, 'executeMoveCall')
    this.checkDataIsNull(resData, 'executeMoveCall')
    return resData.data as SuiTransactionResponse;
  }

  @ensureWalletExist()
  async executeSerializedMoveCall(
    transactionBytes: Uint8Array
  ): Promise<SuiTransactionResponse> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.executeSerializedMoveCall(transactionBytes);
    this.checkError(resData, 'executeSerializedMoveCall')
    this.checkDataIsNull(resData, 'executeSerializedMoveCall')
    return resData.data as SuiTransactionResponse;
  }

  @ensureWalletExist()
  async signMessage(input: SignMessageInput): Promise<SignMessageOutput> {
    const wallet = this.wallet as IWindowSuietApi;
    const resData = await wallet.signMessage({
      message: baseEncode(input.message)  // encode bytes to string for message passing
    });
    this.checkError(resData, 'signMessage')
    this.checkDataIsNull(resData, 'signMessage');
    const data = resData.data as SignMsgResult;
    // decode result to bytes and return
    return {
      signature: baseDecode(data.signature),
      signedMessage: baseDecode(data.signedMessage)
    };
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