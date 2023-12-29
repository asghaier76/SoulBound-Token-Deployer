import {
  buildClient,
  CommitmentPolicy,
  KmsKeyringNode,
  KMS,
} from '@aws-crypto/client-node';
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

export async function generateWalletKey() {
  try {
    const clientProvider = (region: string) => new KMS({ region, credentials });

    const { randomBytes } = await import('crypto');
    const generatorKeyId = process.env.KMS_GENERATOR_KEY;
    const keyring = new KmsKeyringNode({ clientProvider, generatorKeyId });

    const privateKey = `0x${randomBytes(32).toString('hex')}`;
    const { address } = new ethers.Wallet(privateKey);

    const key = (await encrypt(keyring, privateKey)).result.toString('hex');
    return { address, key };
  } catch (error) {
    throw error;
  }
}

export async function retrieveWallet(encryptedKey: string) {
  try {
    const clientProvider = (region: string) => new KMS({ region, credentials });

    const generatorKeyId = process.env.KMS_GENERATOR_KEY;
    const keyring = new KmsKeyringNode({ clientProvider, generatorKeyId });
    const { plaintext: privateKey } = await decrypt(
      keyring,
      Buffer.from(encryptedKey, 'hex'),
    );

    return new ethers.Wallet(privateKey.toString());
  } catch (error) {
    throw error;
  }
}
