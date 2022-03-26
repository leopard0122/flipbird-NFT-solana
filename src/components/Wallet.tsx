import React, { useRef } from 'react'
import { PublicKey } from "@solana/web3.js"
import { getNFTMetadataForMany, getNFTsByOwner, INFT } from "@/common/web3/NFTget";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { initGemBank } from '@/common/gem-bank';
import { getListDiffBasedOnMints } from '@/common/util';
import { BN } from '@project-serum/anchor';
import { Center, Container, Button, useToast, useMediaQuery, useBreakpointValue } from '@chakra-ui/react';
import NFTCard from "./NFTCard"

export const Wallet = (props: any) => {

    const { farm, beginStaking, endStaking } = props;
    const { wallet, publicKey } = useWallet();
    const { connection } = useConnection();
    const toast = useToast();
    //current walet/vault state
    const currentWalletNFTs = useRef<INFT[]>([]);
    const currentVaultNFTs = useRef<INFT[]>([]);
    //selected but not yet moved over in FE
    const selectedWalletNFTs = useRef<INFT[]>([]);
    const selectedVaultNFTs = useRef<INFT[]>([]);
    //moved over in FE but not yet onchain
    const desiredWalletNFTs = useRef<INFT[]>([]);
    const desiredVaultNFTs = useRef<INFT[]>([]);
    //moved over onchain
    const toWalletNFTs = useRef<INFT[]>([]);
    const toVaultNFTs = useRef<INFT[]>([]);

    const vault = useRef<PublicKey>();
    vault.current = farm.acc.vault;
    console.log("vault123", vault)
    
    // These are the breakpoints which changes the position of the
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
    console.log("farmfarmfarm", farm)
    // --------------------------------------- populate initial nfts

    const populateWalletNFTs = async () => {
        // zero out to begin with
        currentWalletNFTs.current = [];
        selectedWalletNFTs.current = [];
        desiredWalletNFTs.current = [];

        if (wallet) {
            console.log(`publicKeypublicKey ${publicKey}`);
            currentWalletNFTs.current = await getNFTsByOwner(
                publicKey!,
                connection
            );
            desiredWalletNFTs.current = [...currentWalletNFTs.current];
        }
    };

    const populateVaultNFTs = async () => {
        // zero out to begin with
        currentVaultNFTs.current = [];
        selectedVaultNFTs.current = [];
        desiredVaultNFTs.current = [];

        const foundGDRs = await gb.fetchAllGdrPDAs(vault.current);
        if (foundGDRs && foundGDRs.length) {
            gdrs.current = foundGDRs;
            console.log(`found a total of ${foundGDRs.length} gdrs`);
            const mints = foundGDRs.map((gdr: any) => {
                return { pubkey: publicKey, mint: gdr.account.gemMint };
            });
            currentVaultNFTs.current = await getNFTMetadataForMany(
                mints,
                connection
            );
            desiredVaultNFTs.current = [...currentVaultNFTs.current];
            console.log(
                `populated a total of ${currentVaultNFTs.current.length} vault NFTs`
            );
        }
    };

    const updateVaultState = async () => {
        vaultAcc.current = await gb.fetchVaultAcc(vault.current);
        bank.current = vaultAcc.current.bank;
        vaultLocked.current = vaultAcc.current.locked;
    };

    useEffect(() => {
        const refresh = async () => {
            // @ts-ignore
            gb = await initGemBank(connection, wallet!);
            //populate wallet + vault nfts (dont uncomment this makes a ton of requests dunno why)
            //await Promise.all([populateWalletNFTs(), populateVaultNFTs()])
        }
        refresh()
    }, [wallet]);

    useEffect(() => {
        const getData = async () => {
            // @ts-ignore
            gb = await initGemBank(connection, wallet!);

            //prep vault + bank variables
            //vault.current = vault;
            //vault.current = new PublicKey("4CpZPNNTVp7cqFRUyGS82aV76LBBTxi6Sgg6Nx5FY1E3");
            await updateVaultState();

            //populate wallet + vault nfts
            await Promise.all([populateWalletNFTs(), populateVaultNFTs()]);
        }
        getData();
    }, []);

    // --------------------------------------- moving nfts
    //todo jam into single tx
    const moveNFTsOnChain = async () => {
        
        console.log('start vault nfts are', toVaultNFTs.current);
        toVaultNFTs.current = getListDiffBasedOnMints(
            desiredVaultNFTs.current,
            currentVaultNFTs.current
        );
        console.log('to vault nfts are', toVaultNFTs.current);
        console.log('start wallet nfts are', toWalletNFTs.current);
        toWalletNFTs.current = getListDiffBasedOnMints(
            desiredWalletNFTs.current,
            currentWalletNFTs.current
        );
        console.log('to wallet nfts are', toWalletNFTs.current);
        console.log('moveNFTsOnChain vault:', vault.current);

        try {
            for (const nft of toVaultNFTs.current) {
                console.log(nft);
                const creator = new PublicKey(
                    //todo currently simply taking the 1st creator
                    (nft.onchainMetadata as any).data.creators[0].address
                );
                console.log('creator is', creator.toBase58());
                await depositGem(nft.mint, creator, nft.pubkey!);
                //@ts-ignore
                gb = await initGemBank(connection, wallet!);
                //await Promise.all([populateWalletNFTs(), populateVaultNFTs()]);
            }
        } catch (e) {
            toast({
                title: 'Deposit NFT to Vault Canceled',
                description: '',
                status: 'info',
                duration: 5000,
                position: 'top',
                isClosable: true,
            });
        } 
        
        try {
            for (const nft of toWalletNFTs.current) {
                await withdrawGem(nft.mint);
            }
        } catch (e) {
            toast({
                title: 'Withdrawl NFT from Vault Canceled',
                description: '',
                status: 'info',
                duration: 5000,
                position: 'top',
                isClosable: true,
            });
        } 
    };

    //to vault = vault desired - vault current
    useEffect(() => {
        console.log('start vault nfts are', toVaultNFTs.current);
        toVaultNFTs.current = getListDiffBasedOnMints(
            desiredVaultNFTs.current,
            currentVaultNFTs.current
        );
        console.log('to vault nfts are', toVaultNFTs.current);
    }, [desiredVaultNFTs]);

    //to wallet = wallet desired - wallet current
    useEffect(() => {
        console.log('start wallet nfts are', toWalletNFTs.current);
        toWalletNFTs.current = getListDiffBasedOnMints(
            desiredWalletNFTs.current,
            currentWalletNFTs.current
        );
        console.log('to wallet nfts are', toWalletNFTs.current);
    }, [desiredWalletNFTs]);

    // --------------------------------------- gem bank
    let gb: any;
    const bank = useRef<PublicKey>();
    //const vault = useRef<PublicKey>();
    const vaultAcc = useRef<any>();
    const gdrs = useRef<PublicKey[]>([]);
    const vaultLocked = useRef<boolean>(false);

    const depositGem = async (
        mint: PublicKey,
        creator: PublicKey,
        source: PublicKey
    ) => {
        // @ts-ignore
        gb = await initGemBank(connection, wallet!);
        const { txSig } = await gb.depositGemWallet(
            // @ts-ignore
            bank.current,
            vault.current,
            new BN(1),
            mint,
            source,
            creator
        );
        console.log('deposit done', txSig);
    };

    const withdrawGem = async (mint: PublicKey) => {
        // @ts-ignore
        gb = await initGemBank(connection, wallet!);
        const { txSig } = await gb.withdrawGemWallet(
            // @ts-ignore
            bank.current,
            vault.current,
            new BN(1),
            mint
        );
        if(txSig !== undefined) {
            toast({
                title: 'NFT Withdrawl Successful',
                description: 'Transaction ID: ' + txSig,
                status: 'success',
                duration: 5000,
                position: 'top',
                isClosable: true,
           });
        } else {
            toast({
                title: 'NFT Withdrawl Failed',
                description: '',
                status: 'error',
                duration: 5000,
                position: 'top',
                isClosable: true,
            });
        }
        console.log('withdrawal done', txSig);
    };
    const farmStatus = farm ? farm.state : "unstaked"
    return (
        <div>
           <Container maxWidth="50%" centerContent>
            {farmStatus == "unstaked" ? (
            <Center h="100%" p={2}>
                <Button colorScheme='blue' onClick={beginStaking}>Stake NFTs</Button>
            </Center>
            ) : (
            <Center h="100%" p={2}>
                <Button colorScheme='blue' onClick={endStaking}>{farmStatus == "pendingCooldown" ? "End Cooldown Period" : "End Staking"}</Button>
            </Center>
            )}
            <NFTCard 
                // @ts-ignore 
                isLargerThan768={isLargerThan768} 
                farmStatus={farmStatus} 
                moveNFTsOnChain={moveNFTsOnChain} 
                currentVaultNFTs={currentVaultNFTs} 
                selectedVaultNFTs={selectedVaultNFTs} 
                desiredVaultNFTs={desiredVaultNFTs} 
                currentWalletNFTs={currentWalletNFTs} 
                selectedWalletNFTs={selectedWalletNFTs} 
                desiredWalletNFTs={desiredWalletNFTs} />
          </Container>
        </div>
    )
}
