import { isMockMode } from '../firebase';
import api from './apiService';

export interface AccountInfo {
  userId: string;
  balance: number;
  updatedAt: unknown;
}

export interface TransactionInfo {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: unknown;
}

/**
 * Ensures an account exists in the accounts collection with an initial balance of 0.
 */
export const ensureAccountExists = async (userId: string): Promise<void> => {
  if (isMockMode) {
    const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
    if (!accounts[userId]) {
      accounts[userId] = {
        userId,
        balance: 0, // Initial balance = 0
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('apex_mock_accounts', JSON.stringify(accounts));
      console.log(`[Mock] Created checking account document with $0 initial balance for user ${userId}.`);
    }
    return;
  }

  try {
    // The backend automatically ensures account exists, so we call get balance to initialize it if needed.
    await api.get('/account/balance');
  } catch (error) {
    console.error('Error in ensureAccountExists:', error);
    throw error;
  }
};

/**
 * Retrieves checking account details for a user.
 */
export const getAccount = async (userId: string): Promise<AccountInfo | null> => {
  if (isMockMode) {
    const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
    return (accounts[userId] as AccountInfo) || null;
  }

  try {
    const response = await api.get('/account/balance');
    const data = response.data.data;
    return {
      userId: data.userId,
      balance: data.balance,
      updatedAt: data.lastUpdatedAt,
    };
  } catch (error) {
    console.error('Error in getAccount:', error);
    throw error;
  }
};

/**
 * Runs a backend API call to update the user's balance and record a transaction.
 */
export const addTransactionAtomically = async (
  userId: string,
  type: 'credit' | 'debit',
  amount: number,
  description: string
): Promise<string> => {
  if (isMockMode) {
    const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
    const account = accounts[userId] || { userId, balance: 0, updatedAt: new Date().toISOString() };
    
    let newBalance = account.balance;
    if (type === 'credit') {
      newBalance += amount;
    } else if (type === 'debit') {
      if (newBalance < amount) {
        throw new Error('Insufficient funds.');
      }
      newBalance -= amount;
    }
    
    account.balance = newBalance;
    account.updatedAt = new Date().toISOString();
    accounts[userId] = account;
    localStorage.setItem('apex_mock_accounts', JSON.stringify(accounts));
    
    const transactions = JSON.parse(localStorage.getItem('apex_mock_transactions') || '[]');
    const txnId = 'mock-txn-' + Math.random().toString(36).slice(2, 11);
    const newTxn = {
      id: txnId,
      userId,
      type,
      amount,
      description,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTxn);
    localStorage.setItem('apex_mock_transactions', JSON.stringify(transactions));
    
    // Dispatch custom event for real-time balance listener syncing
    globalThis.dispatchEvent(
      new CustomEvent('apex_mock_balance_update', {
        detail: { userId, balance: newBalance }
      })
    );
    
    return txnId;
  }

  try {
    const endpoint = type === 'credit' ? '/account/deposit' : '/account/withdraw';
    const response = await api.post(endpoint, {
      amount,
      description
    });
    if (response.data?.success) {
      return response.data.data.id;
    }
    throw new Error(response.data?.message || 'Transaction execution failed');
  } catch (error: any) {
    console.error('API Transaction failed:', error);
    const serverMessage = error.response?.data?.message;
    throw new Error(serverMessage || error.message || 'Transaction failed');
  }
};

/**
 * Fetches user transaction documents dynamically from backend REST API.
 */
export const getTransactions = async (
  userId: string,
  limitCount?: number,
  type?: string,
  sortBy?: string,
  direction?: string,
  page?: number
): Promise<TransactionInfo[]> => {
  if (isMockMode) {
    const transactions = JSON.parse(localStorage.getItem('apex_mock_transactions') || '[]');
    const filtered = transactions.filter((t: TransactionInfo) => t.userId === userId);
    // Sort descending by createdAt
    filtered.sort((a: TransactionInfo, b: TransactionInfo) => {
      return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
    });
    if (limitCount) {
      return filtered.slice(0, limitCount);
    }
    return filtered;
  }

  try {
    const response = await api.get('/account/transactions', {
      params: {
        size: limitCount,
        type,
        sortBy,
        direction,
        page
      }
    });
    const list = response.data.data || [];
    return list.map((item: any) => ({
      id: item.id,
      userId: userId,
      type: item.type,
      amount: item.amount,
      description: item.description,
      createdAt: item.createdAt,
    }));
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    const serverMessage = error.response?.data?.message;
    throw new Error(serverMessage || error.message || 'Failed to fetch transaction ledger');
  }
};
