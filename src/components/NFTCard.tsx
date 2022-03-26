import React, { Component } from 'react';
import { Center, Container, Text, HStack, VStack, SimpleGrid, Flex, Box, Stack, Button, Image, AspectRatio, useColorMode } from '@chakra-ui/react';
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi';
import { getListDiffBasedOnMints, removeManyFromList } from '@/common/util';
import { IconButton, useBreakpointValue } from '@chakra-ui/react';
import Link from "next/link";

class NFTCard extends Component {
  
  constructor(props: any) {
    super(props)
    this.state = {
        currentVaultNFTs: props.currentVaultNFTs,
        selectedVaultNFTs: props.selectedVaultNFTs,
        desiredVaultNFTs: props.desiredVaultNFTs,
        currentWalletNFTs: props.currentWalletNFTs,
        selectedWalletNFTs: props.selectedWalletNFTs,
        desiredWalletNFTs: props.desiredWalletNFTs,
        count: 0,
        moveNFTstatus: false
    }
}

  render() {
    //@ts-ignore
    const { currentVaultNFTs, selectedVaultNFTs, desiredVaultNFTs, currentWalletNFTs, selectedWalletNFTs, desiredWalletNFTs, moveNFTstatus }  = this.state;
    //@ts-ignore
    const { moveNFTsOnChain, farmStatus, isLargerThan768 } = this.props;

    const handleWalletSelected = (e: any, selectedIndex: any) => {

        let target = e.currentTarget;
        if (target.classList.contains('selected')) {
            selectedWalletNFTs.current.splice(selectedIndex, 1);
            target.classList.remove('selected')
        } else {
            //const index = selectedWalletNFTs.current.indexOf(e.nft);
            selectedWalletNFTs.current.push(currentWalletNFTs.current[selectedIndex]);
            target.classList.add('selected')
        }
        //props.setSelectedNfts(selectedWalletNFTs.current);
        //console.log("after selectedVaultNFTs",selectedVaultNFTs);
        //console.log("after selectedWalletNFTs",selectedWalletNFTs);
        //console.log("after selectedWalletNFTs mint1: ", selectedWalletNFTs.current[0].mint.toBase58());
    };
    const handleVaultSelected = (e: any, selectedIndex: any) => {
        let target = e.currentTarget;
        if (target.classList.contains('selected')) {
            selectedVaultNFTs.current.splice(selectedIndex, 1);
            target.classList.remove('selected')
        } else {
           //const index = selectedVaultNFTs.current.indexOf(currentVaultNFTs.current);
            selectedVaultNFTs.current.push(currentVaultNFTs.current[selectedIndex]);
            target.classList.add('selected')
        }
    }
    const moveNFTsFE = (moveLeft: boolean) => {
        //console.log("b4 desiredWalletNFTs", desiredWalletNFTs.current)
        //console.log("b4 desiredVaultNFTs", desiredVaultNFTs.current)
        const beforeVaultNFTLength = desiredVaultNFTs.current.length;
        //console.log("b4 desiredVaultNFT Length", desiredVaultNFTs.current.length)
        if (moveLeft) {
            //push selected vault nfts into desired wallet
            desiredWalletNFTs.current.push(...selectedVaultNFTs.current);
            console.log("LEFT-desiredWalletNFTs", desiredWalletNFTs.current)
            //remove selected vault nfts from desired vault
            removeManyFromList(selectedVaultNFTs.current, desiredVaultNFTs.current);
            //empty selection list
            selectedVaultNFTs.current = [];
        } else {
            //push selected wallet nfts into desired vault
            desiredVaultNFTs.current.push(...selectedWalletNFTs.current);
            console.log("RIGHT-desiredWalletNFTs", desiredVaultNFTs.current)
            //remove selected wallet nfts from desired wallet
            removeManyFromList(selectedWalletNFTs.current, desiredWalletNFTs.current);
            //empty selected walelt
            selectedWalletNFTs.current = [];
        }
        
        const afterVaultNFTLength = desiredVaultNFTs.current.length;
        //console.log("after desiredVaultNFT Length", desiredVaultNFTs.current.length)
        this.setState({ currentVaultNFTs: desiredVaultNFTs})
        this.setState({ currentWalletNFTs: desiredWalletNFTs})
        if(beforeVaultNFTLength !== afterVaultNFTLength) {
            this.setState({ moveNFTstatus: true})
        }
        const value = desiredVaultNFTs.current;
        desiredVaultNFTs.current = value;
        //this.setState({ desiredVaultNFTs: desiredVaultNFTs})
        //this.setState({ desiredWalletNFTs: desiredWalletNFTs})
        console.log("selectedVaultNFTs", selectedVaultNFTs.current)
        console.log("currentVaultNFTs", currentVaultNFTs.current)
        console.log("a4 desiredWalletNFTs", desiredWalletNFTs.current)
        console.log("a4 desiredVaultNFTs", desiredVaultNFTs.current)
    };

    return (
      <div>
        {moveNFTstatus == true ? (
            <Center h="100%" p={2}>
                <Button colorScheme='blue' onClick={moveNFTsOnChain}>Move NFTs</Button>
            </Center>
        ) : (<div></div>)}
        <HStack spacing='30px' flexDirection={isLargerThan768 ? "row" : "column"}>
                <Box>
                    <Center h="100%" p={2}>
                        <Text fontSize='sm'>NFTs Available for Staking</Text> 
                    </Center>
                    <Box
                        position={'relative'}
                        width={'500px'}
                        overflow={'hidden'}>
                        {/* Slider */}
                        <div className="slider">
                        {currentWalletNFTs.current ? (
                            <div className="slides">
                                {Object.keys(currentWalletNFTs.current).map((index) => {
                                    // @ts-ignore
                                    const newIndex = parseInt(index) + 1
                                    //console.log("newIndex",newIndex)
                                    return (
                                        <div id={'slide-'+ newIndex} key={index}>
                                            <HStack spacing='0px'>
                                                <Box bg='#eb4d98' width='100%' height='250px' p={4}><Image alt="" onClick={(e) =>
                                                        //@ts-ignore
                                                        handleWalletSelected(e, index)} src=
                                                {index ?
                                                    //@ts-ignore
                                                    currentWalletNFTs.current[index].externalMetadata.image : null} width="250px" /></Box>
                                                <Box bg='#eb4d98' width='100%' height='250px' p={4}>
                                                <Text fontSize='sm' fontWeight="bold">
                                                {index ?
                                                    //@ts-ignore
                                                    currentWalletNFTs.current[index].externalMetadata.name : null}</Text>
                                                <Text fontSize='sm'>
                                                {index ? 
                                                    //@ts-ignore
                                                    currentWalletNFTs.current[index].externalMetadata.description : null}</Text></Box>
                                            </HStack>
                                        </div>
                                        )
                                    }
                                )}
                            </div>
                         ) : (<div><Center h="100%">No NFTs Found</Center></div>)}
                         </div>
                    </Box>
                </Box>
                <Box>
                    <VStack h="50%" p={1}>
                        {farmStatus == "unstaked" ? (
                             <div>
                                <Button colorScheme='blue' onClick={() => moveNFTsFE(true)}><BiLeftArrowAlt /></Button>
                                <Button colorScheme='blue' onClick={() => moveNFTsFE(false)}><BiRightArrowAlt /></Button>
                            </div>
                        ) : (<div></div>)}
                    </VStack>
                </Box>
                <Box>
                    <Center h="100%" p={2}>
                        <Text fontSize='sm'>NFTs Currently Staked in the Vault</Text>
                    </Center>
                    <Box
                        position={'relative'}
                        width={'500px'}
                        overflow={'hidden'}
                        className={'' + (farmStatus == 'unstaked' ? '' : 'lockedVault')}>
                        {/* Slider */}
                        <div className="slider">
                        {currentVaultNFTs.current ? (
                            <div className="slides">
                                {Object.keys(currentVaultNFTs.current).map((index) => {
                                    const newIndex = parseInt(index) + 1
                                    return (
                                        <div id={'slide-'+ newIndex} key={index}>
                                            <HStack spacing='0px' key={index}>
                                            <Box width='100%' height='250px' p={4}><Image alt="" onClick={(e) =>
                                                //@ts-ignore
                                                handleVaultSelected(e,index)} src=
                                                {index ?
                                                    //@ts-ignore
                                                    currentVaultNFTs.current[index].externalMetadata.image : null} width="250px" /></Box>
                                            <Box width='100%' height='250px' p={4}>
                                                <Text fontSize='sm' fontWeight="bold">
                                                {index ?
                                                    //@ts-ignore
                                                    currentVaultNFTs.current[index].externalMetadata.name : null}</Text>
                                                <Text fontSize='sm'>
                                                {index ?
                                                    //@ts-ignore
                                                    currentVaultNFTs.current[index].externalMetadata.description : null}</Text></Box>
                                            </HStack>
                                        </div>
                                        )
                                    }
                                )}
                            </div>
                            ) : (<div><Center h="100%">No NFTs Found</Center></div>)}
                        </div>
                    </Box>
                </Box>
          </HStack>
      </div>
    );
  }
}

export default NFTCard;