import { PublicKey } from '@solana/web3.js';
//import { GEM_FARM_PROG_ID } from '@gemworks/gem-farm-ts';
export const DEFAULTS = {
  CLUSTER: 'devnet',
  //todo these need to be PER cluster
  GEM_BANK_PROG_ID: new PublicKey(
    'bankHHdqMuaaST4qQk6mkzxGeKPHWmqdgor6Gs8r88m' // this the main bank contract id from gemworks.gg
  ),
  GEM_FARM_PROG_ID: new PublicKey(
    'farmL4xeBFVXJqtfxCzU9b28QACM7E2W2ctT6epAjvE' // this the main farm contract id from gemworks.gg
  ),
  GEM_FARM_PK: new PublicKey(
    'YdnpbpTvTmmx9v3RrnueYfE9QA6tpmLxaST1y9q4NB5' // this is the PK for the actual pool created
  ),
};
