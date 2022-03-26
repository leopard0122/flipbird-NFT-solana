import React, { useRef } from 'react'
import { Text, SimpleGrid, Box, Flex, Stat, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';
import moment from 'moment/moment';
import { stringifyPKsAndBNs } from "@/common/gem-common/types";
import { ReactNode } from 'react';
import { BsPerson } from 'react-icons/bs';
import { FiServer } from 'react-icons/fi';
import { AiOutlineFieldTime } from 'react-icons/ai';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { GoLocation } from 'react-icons/go';

interface StatsCardProps {
    title: string;
    stat: string;
    icon: ReactNode;
}
function StatsCard(props: StatsCardProps) {
    const { title, stat, icon } = props;
    return (
      <Stat
        px={{ base: 2, md: 3 }}
        py={'1'}
        shadow={'xl'}
        bg={'#eb4d98'}
        border={'1px solid'}
        borderColor={useColorModeValue('gray.800', 'gray.500')}
        rounded={'lg'}>
        <Flex justifyContent={'space-between'}>
          <Box pl={{ base: 2, md: 4 }}>
            <StatLabel fontWeight={'medium'} isTruncated>
              {title}
            </StatLabel>
            <StatNumber fontSize={'md'} fontWeight={'medium'}>
              {stat}
            </StatNumber>
          </Box>
          <Box
            my={'auto'}
            color={useColorModeValue('gray.800', 'gray.200')}
            alignContent={'center'}>
            {icon}
          </Box>
        </Flex>
      </Stat>
    );
}
  
export const Vault = (props: any) => {
    //console.log("VAULTY", props.farm)
    return (
        <div>
            <SimpleGrid columns={3} spacingX='40px' spacingY='20px'>
                <Box p={0}>
                    <StatsCard
                    title={'NFTs Staked'}
                    stat={stringifyPKsAndBNs(props.vault.gemsStaked)}
                    icon={<FiServer size={'2em'} />}
                    />
                </Box>
                <Box p={0}>
                    <StatsCard
                    title={'Farmers'}
                    stat={stringifyPKsAndBNs(props.vault.farmerCount)}
                    icon={<BsPerson size={'2em'} />}
                    />
                </Box>
                <Box p={0}>
                    <StatsCard
                    title={'Staked Farmers'}
                    stat={stringifyPKsAndBNs(props.vault.stakedFarmerCount)}
                    icon={<BsPerson size={'2em'} />}
                    />
                </Box>
                <Box p={0}>
                    <StatsCard
                    title={'Rewards Paid'}
                    stat={stringifyPKsAndBNs(props.vault.rewardA.funds.totalAccruedToStakers)}
                    icon={<RiMoneyDollarCircleLine size={'2em'} />}
                    />
                </Box>
                <Box p={0}>
                    <StatsCard
                    title={'Rewards In Pool'}
                    stat={stringifyPKsAndBNs(props.vault.rewardA.funds.totalFunded)}
                    icon={<RiMoneyDollarCircleLine size={'2em'} />}
                    />
                </Box>
                <Box p={0}>
                    <StatsCard
                    title={'Rewards End'}
                    stat={moment(props.vault.rewardA.times.rewardEndTs).format("MMM-DD-YYYY")}
                    icon={<AiOutlineFieldTime size={'2em'} />}
                    />
                </Box>
            </SimpleGrid>
        </div>
    )
}
