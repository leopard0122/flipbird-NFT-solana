import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { FC } from 'react';

export const Navigation: FC = () => {
    const { wallet } = useWallet();

    return (
        <nav>
            <h1>Flipping Birdz on Solana and Algorand</h1>
            <div>
                <WalletMultiButton />
                {wallet && <WalletDisconnectButton />}
            </div>
        </nav>
    );
};
