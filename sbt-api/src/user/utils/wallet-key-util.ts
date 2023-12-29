import {
  buildClient,
  CommitmentPolicy,
  KmsKeyringNode,
  KMS,
} from '@aws-crypto/client-node';
import { Logger } from '@nestjs/common';
import { ethers } from 'ethers';

const { encrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
);
const { decrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
);

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};

const logger = new Logger('Wallet Key Utility');

export async function generateWalletKey() {
  try {
    logger.log('initializing KMS service generating new wallet');
    const clientProvider = (region: string) => new KMS({ region, credentials });

    const { randomBytes } = await import('crypto');
    const generatorKeyId = process.env.KMS_GENERATOR_KEY;
    const keyring = new KmsKeyringNode({ clientProvider, generatorKeyId });

    const privateKey = `0x${randomBytes(32).toString('hex')}`;
    const { address } = new ethers.Wallet(privateKey);

    const key = (await encrypt(keyring, privateKey)).result.toString('hex');
    logger.log('Succeffuly generating new wallet');
    return { address, key };
  } catch (error) {
    logger.error('An error occured: ', error);
    throw error;
  }
}

export async function retrieveWallet(encryptedKey: string) {
  try {
    logger.log('initializing KMS service retreiving a wallet');
    const clientProvider = (region: string) => new KMS({ region, credentials });

    const generatorKeyId = process.env.KMS_GENERATOR_KEY;
    const keyring = new KmsKeyringNode({ clientProvider, generatorKeyId });
    const { plaintext: privateKey } = await decrypt(
      keyring,
      Buffer.from(encryptedKey, 'hex'),
    );
    logger.log('Succeffuly retreived a wallet');

    return new ethers.Wallet(privateKey.toString());
  } catch (error) {
    logger.error('An error occured: ', error);
    throw error;
  }
}
