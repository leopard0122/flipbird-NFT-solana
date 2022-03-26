import type { NextPage } from 'next';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Head from 'next/head';
//import Image from 'next/image';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Image, Center, Container, Heading, Text, VStack, Link, Flex, Box, Stack, Button, useColorMode, HStack, Grid, GridItem } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useFarm } from '../src/contexts/farm.context';
import { useEffect, useRef, useState } from 'react';
import { PublicKey } from '@solana/web3.js'
import { Vault } from '../src/components/Vault'
import { Wallet } from '../src/components/Wallet'
import { Rewards } from '../src/components/Rewards'
import { stringifyPKsAndBNs } from '../src/common/gem-common/types';
import { GemFarm, initGemFarm } from '../src/common/gem-farm';
import favicon from '../public/favicon.ico';

const Home: NextPage = () => {
    const { connected, publicKey, wallet } = useWallet()
    const { connection } = useConnection();
    const { colorMode, toggleColorMode } = useColorMode();
    const { freshStart, farmerAcc, selectedNFTs, setSelectedNFTs, initFarmer, farm, farmer, claim, beginStaking, endStaking, refreshWallet } = useFarm()
    //useEffect(() => { }, [])
    useEffect(() => {
        if (publicKey && connected) {
            freshStart();
        }
    }, [publicKey, connected])

    if (!connected) {
        return (
            <Container maxWidth="100%" h="100vh" centerContent>
                <Head>
                    <link rel="shortcut icon" href={favicon.src} type="image/x-icon" /> 
                    <title>NFT Staking - flippingbirds.xyz</title>
                </Head>
                <Center h="100%">
                    <VStack spacing={8}>
                        <Heading as='h3' size='xl'>
                            Stake your Flipping Birdz NFTs to receive rewards in $2BIRDSUP
                        </Heading>
                        <WalletMultiButton />
                        <Text as='cite'>Powered by{' '}<Link color='teal.500' href='https://gemworks.gg' isExternal> gemworks</Link></Text>
                    </VStack>
                </Center>
            </Container>
        )
    }
    return <Container maxW="100%">
            <Head>
                <link rel="shortcut icon" href={favicon.src} type="image/x-icon" /> 
                <title>NFT Staking - flippingbirds.xyz</title>
            </Head>
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <HStack spacing={8}>
                    <Center h="48px" w="48px">
                        <Image alt="Flipping Birdz Staking" src="/images/logo.png" />
                    </Center>
                    <Text>
                        Flipping Birdz Staking
                    </Text>
                </HStack>
                <Flex alignItems={'center'}>
                    <Stack direction={'row'} spacing={7}>
                        <Button onClick={toggleColorMode}>
                            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        </Button>
                        <HStack>
                            <WalletMultiButton className='chakra-button' />
                            <WalletDisconnectButton className='chakra-button' />
                        </HStack>
                    </Stack>
                </Flex>
            </Flex>
            <Flex h={'100%'} alignItems={'center'} justifyContent={'space-between'}>
         {farmerAcc ? (
            <Center h="100%" flexGrow={'1'}>
                <VStack spacing={8}>
                    <Heading as='h1' size='xl'>
                        NFT VAULT STATS
                    </Heading>
                    <Vault farm={farmer} vault={farmerAcc} />
                    <Heading as='h1' size='xl'>
                        YOUR REWARDS
                    </Heading>
                    <Rewards farm={farmer} claim={claim} refreshWallet={refreshWallet} />
                    <Heading as='h1' size='xl'>
                        YOUR WALLET
                    </Heading>
                    <Wallet farm={farmer} beginStaking={beginStaking} endStaking={endStaking} selectedNFTs={ (nfts) => selectedNFTs.current=nfts } />
                </VStack>
            </Center>
          ) : (<div><Center h="100%">No Farms Found</Center></div>)}
          {connected && !farmerAcc ? (
                <Center h="100%">
                    <VStack spacing={8}>
                        <Heading as='h3' size='xl'>
                            Link Your Wallet to Start Farming
                        </Heading>
                        <Button onClick={initFarmer}>
                            Create
                        </Button>
                    </VStack>
                </Center>
            ) : (<div></div>)}
            </Flex>
    </Container>
};

export default Home;
