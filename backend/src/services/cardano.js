import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import blockfrostService from './blockfrost.js';
import { AppError } from '../middleware/errorHandler.js';

class CardanoService {
  constructor() {
    this.C = CardanoWasm;
  }

  // Parse datum from hex to JSON
  parseDatum(datumHex) {
    try {
      const datum = this.C.PlutusData.from_hex(datumHex);
      return this.plutusDataToJson(datum);
    } catch (error) {
      throw new AppError(`Failed to parse datum: ${error.message}`, 500);
    }
  }

  // Convert PlutusData to JSON (simplified)
  plutusDataToJson(plutusData) {
    // This is a simplified version - you'll need to expand based on your datum structure
    try {
      const constr = plutusData.as_constr_plutus_data();
      if (constr) {
        const alternative = constr.alternative().to_str();
        const fields = constr.data();
        const fieldsList = [];
        
        for (let i = 0; i < fields.len(); i++) {
          fieldsList.push(this.plutusDataToJson(fields.get(i)));
        }
        
        return { constructor: alternative, fields: fieldsList };
      }

      const integer = plutusData.as_integer();
      if (integer) {
        return parseInt(integer.to_str());
      }

      const bytes = plutusData.as_bytes();
      if (bytes) {
        return Buffer.from(bytes).toString('hex');
      }

      const list = plutusData.as_list();
      if (list) {
        const result = [];
        for (let i = 0; i < list.len(); i++) {
          result.push(this.plutusDataToJson(list.get(i)));
        }
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error parsing PlutusData:', error);
      return null;
    }
  }

  // Find UTxOs for a specific datum pattern
  async findUtxosByDatum(scriptAddress, datumPattern) {
    const utxos = await blockfrostService.getScriptUtxos(scriptAddress);
    
    return utxos.filter(utxo => {
      if (!utxo.inline_datum) return false;
      
      try {
        const parsed = this.parseDatum(utxo.inline_datum);
        return this.matchesDatumPattern(parsed, datumPattern);
      } catch {
        return false;
      }
    });
  }

  // Check if parsed datum matches a pattern
  matchesDatumPattern(datum, pattern) {
    if (pattern.constructor !== undefined && datum.constructor !== pattern.constructor) {
      return false;
    }
    
    if (pattern.fields) {
      for (let i = 0; i < pattern.fields.length; i++) {
        if (pattern.fields[i] !== null && datum.fields[i] !== pattern.fields[i]) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Get total ADA in UTxOs
  getTotalLovelace(utxos) {
    return utxos.reduce((total, utxo) => {
      const lovelace = utxo.amount.find(a => a.unit === 'lovelace');
      return total + (lovelace ? parseInt(lovelace.quantity) : 0);
    }, 0);
  }

  // Convert lovelace to ADA
  lovelaceToAda(lovelace) {
    return lovelace / 1_000_000;
  }

  // Convert ADA to lovelace
  adaToLovelace(ada) {
    return Math.floor(ada * 1_000_000);
  }
}

export default new CardanoService();
