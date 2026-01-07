import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { AppError } from '../middleware/errorHandler.js';

class BlockfrostService {
  constructor() {
    // Lazy initialization - API will be created on first use
    this._api = null;
  }

  get api() {
    if (!this._api) {
      const projectId = process.env.BLOCKFROST_PROJECT_ID;
      const network = process.env.BLOCKFROST_NETWORK;
      
      if (!projectId) {
        throw new Error('BLOCKFROST_PROJECT_ID is not set in environment variables');
      }
      
      this._api = new BlockFrostAPI({
        projectId: projectId,
        network: network
      });
    }
    return this._api;
  }

  async getAddressUtxos(address) {
    try {
      return await this.api.addressesUtxos(address);
    } catch (error) {
      // If address not found or has no UTxOs, return empty array
      if (error.status_code === 404 || error.message.includes('not been found')) {
        return [];
      }
      throw new AppError(`Failed to fetch UTxOs: ${error.message}`, 500);
    }
  }

  async getScriptUtxos(scriptAddress) {
    try {
      return await this.api.addressesUtxos(scriptAddress);
    } catch (error) {
      // If address not found or has no UTxOs, return empty array
      if (error.status_code === 404 || error.message.includes('not been found')) {
        return [];
      }
      throw new AppError(`Failed to fetch script UTxOs: ${error.message}`, 500);
    }
  }

  async submitTransaction(txCbor) {
    try {
      return await this.api.txSubmit(txCbor);
    } catch (error) {
      throw new AppError(`Transaction submission failed: ${error.message}`, 500);
    }
  }

  async getTransaction(txHash) {
    try {
      return await this.api.txs(txHash);
    } catch (error) {
      throw new AppError(`Failed to fetch transaction: ${error.message}`, 500);
    }
  }

  async getLatestBlock() {
    try {
      return await this.api.blocksLatest();
    } catch (error) {
      throw new AppError(`Failed to fetch latest block: ${error.message}`, 500);
    }
  }

  async getProtocolParameters() {
    try {
      const latest = await this.getLatestBlock();
      return await this.api.epochsParameters(latest.epoch);
    } catch (error) {
      throw new AppError(`Failed to fetch protocol parameters: ${error.message}`, 500);
    }
  }
}

export default new BlockfrostService();
