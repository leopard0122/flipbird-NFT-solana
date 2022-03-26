import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useContext, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js"
import { GemFarm, initGemFarm } from "../common/gem-farm";
import { stringifyPKsAndBNs } from "@/common/gem-common/types";
import { INFT } from "@/common/web3/NFTget";
import { useToast } from '@chakra-ui/react';

export interface FraktionContextType {
    fetchFarmer: Function,
    fetchFarm: Function,
    freshStart: Function,
    initFarmer: Function,
    beginStaking: Function,
    endStaking: Function,
    refreshWallet: Function,
    claim: Function,
    addSingleGem: Function,
    addGems: Function,
    selectedNFTs: Function,
    setSelectedNFTs: Function,
    farmer: Function,
    farmerAcc: String,
}

export const FarmContext = React.createContext<FraktionContextType>({
    fetchFarmer: () => { },
    fetchFarm: () => { },
    freshStart: () => { },
    initFarmer: () => { },
    beginStaking: () => { },
    endStaking: () => { },
    refreshWallet: () => { },
    claim: () => { },
    addSingleGem: () => { },
    addGems: () => { },
    selectedNFTs: () => { },
    setSelectedNFTs: () => { },
    farmer: () => { },
    farmerAcc: ""
});

export const FarmProvider = ({
    children = null,
    farm = ""
}: {
    children: JSX.Element | null,
    farm: string
}): JSX.Element => {
    const [gf, setGF] = useState<GemFarm>();
    const [farmer, setFarmer] = useState<{ acc: any, state: string | undefined, identity: string | undefined }>();
    const [farmAcc, setFarmAcc] = useState<any>();
    const [farmerAcc, setFarmerAcc] = useState<any>();
    const [rewardsA, setRewardsA] = useState<any>();
    const [rewardsB, setRewardsB] = useState<any>();
    const [selectedNFTs, setSelectedNFTs] = useState<INFT[]>([]);
    const { publicKey, wallet, connected } = useWallet()
    const { connection } = useConnection();
    const toast = useToast();

    const fetchFarmer = async () => {
        if (publicKey && gf) {
            const [farmerPDA] = await gf.findFarmerPDA(
                new PublicKey(farm),
                publicKey
            );
            const farmerIdentity = publicKey?.toBase58();
            try {
                const farmerAcc = await gf.fetchFarmerAcc(farmerPDA);
                const farmerState = gf.parseFarmerState(farmerAcc);
                setFarmer({ acc: farmerAcc, identity: farmerIdentity, state: farmerState })
                setRewardsA(farmerAcc.rewardA?.accruedReward
                    .sub(farmerAcc.rewardA.paidOutReward)
                    .toString());
                setRewardsB(farmerAcc.rewardB.accruedReward
                    .sub(farmerAcc.rewardB.paidOutReward)
                    .toString());
                console.log(
                    `fetchFarmer() farm found at ${farmerIdentity}:`,
                        stringifyPKsAndBNs(farmerAcc)
                );
            } catch (e) {
                console.log(`fetchFarmer: ${e}`);
            }
        }
    }

    const fetchFarm = async () => {
        if (gf) {
            setFarmAcc(await gf.fetchFarmAcc(new PublicKey(farm)));
            //console.log("fetchFarm() SET farmAcc", farmAcc);
            setFarmerAcc(farmAcc)
            console.log(
                `a farm found (fetchFarm) at ${farm}:`,
                stringifyPKsAndBNs(farmAcc)
            );
        }
    };

    const freshStart = async () => {
        if (wallet && connected) {
            //@ts-ignore
            const gf = await initGemFarm(connection, wallet);
            //@ts-ignore
            //console.log("freshStart() SET farm", farm.toBase58());
            const getnewfarm = await gf.fetchFarmAcc(new PublicKey(farm));
            setFarmAcc(getnewfarm);
            const farmAcc = getnewfarm;
            setGF(gf)    
            const [farmerPDA] = await gf.findFarmerPDA(
                new PublicKey(farm),
                //@ts-ignore
                publicKey
            );
            const farmerIdentity = publicKey?.toBase58();
            const farmerAcc = await gf.fetchFarmerAcc(farmerPDA);
            const farmerState = gf.parseFarmerState(farmerAcc);
            setFarmer({ acc: farmerAcc, identity: farmerIdentity, state: farmerState })
            console.log("freshStart() SET acc/farmerAcc", farmerAcc);
            console.log("freshStart() SET identity", farmerIdentity);
            console.log("freshStart() SET farmerState", farmerState);
           
            try {
                await fetchFarm();
                console.log(
                    `fetchFarm() at ${farm}:`,
                    stringifyPKsAndBNs(farmAcc)
                );
                await fetchFarmer();
            } catch (e) {
                console.log(`fetchFarm() - error ${farm} not found :(`);
            } 
            setFarmerAcc(farmAcc);
        }
    };

    useEffect(() => {
        fetchFarmer(); // def needed other farm undefined on first load
        if (publicKey && connected) {
            freshStart();
        }
    }, [publicKey, connected])

    const initFarmer = async () => {
        if (gf) {
            await gf.initFarmerWallet(new PublicKey(farm!));
            await fetchFarmer();
            freshStart();
        }
    };

    //------------ staking -----------
    const beginStaking = async () => {
        if (gf) {
            let result = await gf.stakeWallet(new PublicKey(farm!));
            //await fetchFarmer();
            setSelectedNFTs([])
            if(result.txSig !== undefined) {
                toast({
                    title: 'Staking Started Successful',
                    description: 'Transaction ID: ' + result.txSig,
                    status: 'success',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });
            } else {
                toast({
                    title: 'Start Staking Canceled',
                    description: '',
                    status: 'info',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });
            }
            await fetchFarmer();
        }
    };

    const endStaking = async () => {
        if (gf) {
            let result = await gf.unstakeWallet(new PublicKey(farm!));
            //await fetchFarmer();
            setSelectedNFTs([])
            if(result.txSig !== undefined) {
                toast({
                    title: 'Staking Ended Successful',
                    description: 'Transaction ID: ' + result.txSig,
                    status: 'success',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });
            } else {
                toast({
                    title: 'End Staking Canceled',
                    description: '',
                    status: 'info',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });

            }
            await fetchFarmer();
        }
    };

    const refreshWallet = async () => {
        if (gf) {
            const farmerIdentity = publicKey?.toBase58()
            //@ts-ignore
            let result = await gf.refreshFarmerWallet(new PublicKey(farm), new PublicKey(farmerIdentity));
            if(result.txSig !== undefined) {
                toast({
                    title: 'Refresh Successful',
                    description: 'Transaction ID: ' + result.txSig,
                    status: 'success',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });
            } else {
                toast({
                    title: 'Refresh Canceled',
                    description: '',
                    status: 'info',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });
            }
            await fetchFarmer();
        }
    };

    const claim = async () => {
        if (gf) {
            try {
                let result = await gf.claimWallet(
                    new PublicKey(farm),
                    new PublicKey(farmAcc.rewardA.rewardMint!),
                    new PublicKey(farmAcc.rewardB.rewardMint!)
                );
                if(result.txSig !== undefined) {
                    await fetchFarmer();
                    toast({
                        title: 'Claim Rewards Successful',
                        description: 'Transaction ID: ' + result.txSig,
                        status: 'success',
                        duration: 5000,
                        position: 'top',
                        isClosable: true,
                   });
                } else {
                    toast({
                        title: 'Claim Rewards Failed',
                        description: '',
                        status: 'error',
                        duration: 5000,
                        position: 'top',
                        isClosable: true,
                    });
                }
            } catch (e) {
                toast({
                    title: 'Claim Rewards Canceled',
                    description: '',
                    status: 'info',
                    duration: 5000,
                    position: 'top',
                    isClosable: true,
                });
                console.log(`fetchFarm() - error xyz ${farm} not found :(`);
            } 
        }
        await fetchFarmer();
    };

    const addSingleGem = async (
        gemMint: PublicKey,
        gemSource: PublicKey,
        creator: PublicKey
    ) => {
        if (gf) {
            await gf.flashDepositWallet(
                new PublicKey(farm!),
                '1',
                gemMint,
                gemSource,
                creator
            );
            await fetchFarmer();
        }

    };
    const addGems = async () => {
        await Promise.all(
            selectedNFTs.map((nft) => {
                const creator = new PublicKey(
                    //todo currently simply taking the 1st creator
                    (nft.onchainMetadata as any).data.creators[0].address
                );
                console.log('creator is', creator.toBase58());
                addSingleGem(nft.mint, nft.pubkey!, creator);
            })
        );
        console.log(`added another ${selectedNFTs.length} gems into staking vault`);
    };

    return <FarmContext.Provider value={{
        fetchFarmer,
        fetchFarm,
        freshStart,
        farmerAcc,
        initFarmer,
        beginStaking,
        endStaking,
        refreshWallet,
        claim,
        //@ts-ignore
        farm,
        //@ts-ignore
        farmer,
        addSingleGem,
        addGems,
        //@ts-ignore
        selectedNFTs,
        setSelectedNFTs
    }}>{children}</FarmContext.Provider>
}

export const useFarm = () => {
    const {
        fetchFarmer,
        fetchFarm,
        freshStart,
        farmerAcc,
        initFarmer,
        beginStaking,
        endStaking,
        refreshWallet,
        claim,
        //@ts-ignore
        farm,
        farmer,
        addSingleGem,
        addGems,
        selectedNFTs,
        setSelectedNFTs
    } = useContext(FarmContext);
    return {
        fetchFarmer,
        fetchFarm,
        freshStart,
        farmerAcc,
        initFarmer,
        beginStaking,
        endStaking,
        refreshWallet,
        claim,
        farm,
        farmer,
        addSingleGem,
        addGems,
        selectedNFTs,
        setSelectedNFTs
    };
};
