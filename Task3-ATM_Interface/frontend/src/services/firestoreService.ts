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
 * Ensures an account exists in the accounts collection.
 */
export const ensureAccountExists = async (userId: string): Promise<void> => {
  console.log('[FirestoreService] Ensuring checking account exists for user:', userId);
  try {
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
  console.log('[FirestoreService] Getting account for user:', userId);
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
  console.log('[FirestoreService] Adding transaction atomically for user:', userId, type, amount);
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
    const isClientError = error.response?.status && error.response?.status < 500;
    if (isClientError) {
      console.warn('API Transaction validation failed:', error.response?.data?.message || error.message);
    } else {
      console.error('API Transaction failed:', error);
    }
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
