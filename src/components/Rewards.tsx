import React from 'react'
import { Center, Text, VStack, SimpleGrid, Link, Flex, Box, HStack, Stack, Button } from '@chakra-ui/react';
import { stringifyPKsAndBNs } from "@/common/gem-common/types";

export const Rewards = (props: any) => {

    const { farm, claim, refreshWallet } = props;
    
    return (
        <div>
            <SimpleGrid columns={3} spacingX='20px' spacingY='20px'>
                <Box bg='#eb4d98' height='60px' p={4} borderRadius='lg' border='1px'>
                    <Text fontSize='lg'>Status: {farm ? farm.state : null}</Text> 
                </Box>
                <Box bg='#eb4d98' height='60px' p={4} borderRadius='lg' border='1px'>
                    <Text fontSize='lg'>Earned: {farm ? stringifyPKsAndBNs(farm.acc.rewardA.accruedReward) : null}</Text> 
                </Box>
                <Box bg='#eb4d98' height='60px' p={4} borderRadius='lg' border='1px'>
                    <Text fontSize='lg'>Collected: {farm ? stringifyPKsAndBNs(farm.acc.rewardA.paidOutReward): null}</Text> 
                </Box>
            </SimpleGrid>
            <SimpleGrid columns={1} spacingX='40px' spacingY='20px'>
                <Center h="100%" p={1}>
                    <Box height='120px'p={2}>
                        <Center p={1}>
                            <Text fontSize='5xl' color='#83d0fb' fontWeight="bold">{farm ? stringifyPKsAndBNs(farm.acc.rewardA.accruedReward)-stringifyPKsAndBNs(farm.acc.rewardA.paidOutReward): null}</Text> 
                        </Center>
                        <Text fontSize='sm'>Available to Claim</Text> 
                    </Box>
                </Center>
            </SimpleGrid>
            <Center h="100%" p={0}>
                <HStack spacing='1px'>
                    <Box p={1}><Button colorScheme='blue' onClick={claim}>Claim Rewards</Button></Box>
                    <Box p={1}><Button colorScheme='blue' onClick={refreshWallet}>Refresh</Button></Box>
                </HStack>
            </Center>
        </div>
    )
}
