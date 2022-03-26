import * as anchor from '@project-serum/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { BN, Wallet } from '@project-serum/anchor';
import { AccountUtils, ITokenData } from './account-utils';
import { NATIVE_MINT, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export class NodeWallet extends AccountUtils {
  // @ts-ignore
  wallet: typeof Wallet; //node wallet

  // @ts-ignore
  constructor(conn: Connection, wallet: anchor.Wallet) {
    super(conn);
    // @ts-ignore
    this.wallet = wallet;
  }

  async createFundedWallet(lamports: number): Promise<Keypair> {
    const wallet = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        // @ts-ignore
        fromPubkey: this.wallet.publicKey,
        // @ts-ignore
        toPubkey: wallet.publicKey,
        lamports,
      })
    );
    // @ts-ignore
    await sendAndConfirmTransaction(this.conn, tx, [this.wallet.payer]);
    return wallet;
  }

  // --------------------------------------- Mint

  async createMint(
    decimals: number,
    // @ts-ignore
    authority: Keypair = this.wallet.payer
  ): Promise<Token> {
    return Token.createMint(
      this.conn,
      authority,
      authority.publicKey,
      authority.publicKey,
      decimals,
      TOKEN_PROGRAM_ID
    );
  }

  async createNativeMint() {
    return new Token(
      this.conn,
      NATIVE_MINT,
      TOKEN_PROGRAM_ID,
        // @ts-ignore
      this.wallet.payer
    );
  }

  async createAndFundATA(
    token: Token,
    owner: PublicKey,
    amount: BN
  ): Promise<PublicKey> {
    if (token.publicKey == NATIVE_MINT) {
      const account = await Token.createWrappedNativeAccount(
        this.conn,
        TOKEN_PROGRAM_ID,
        owner,
          // @ts-ignore
        this.wallet.payer,
        amount.toNumber()
      );
      return account;
    } else {
      const account = await token.createAssociatedTokenAccount(owner);
      if (amount.toNumber() > 0) {
        // @ts-ignore
        await token.mintTo(account, this.wallet.payer, [], amount.toNumber());
      }
      return account;
    }
  }

  async createMintAndFundATA(
    owner: PublicKey,
    amount: BN
  ): Promise<ITokenData> {
    const token = await this.createMint(0);
    const tokenAcc = await this.createAndFundATA(token, owner, amount);
    return {
      tokenMint: token.publicKey,
      tokenAcc,
      owner,
      token,
    } as ITokenData;
  }
}