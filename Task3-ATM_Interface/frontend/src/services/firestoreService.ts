import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  runTransaction, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, isMockMode } from '../firebase';

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
    const accountRef = doc(db, 'accounts', userId);
    const docSnap = await getDoc(accountRef);
    if (!docSnap.exists()) {
      await setDoc(accountRef, {
        userId,
        balance: 0, // Initial balance = 0
        updatedAt: serverTimestamp(),
      });
      console.log(`Created checking account document with $0 initial balance for user ${userId}.`);
    }
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
    const accountRef = doc(db, 'accounts', userId);
    const docSnap = await getDoc(accountRef);
    if (docSnap.exists()) {
      return docSnap.data() as AccountInfo;
    }
    return null;
  } catch (error) {
    console.error('Error in getAccount:', error);
    throw error;
  }
};

/**
 * Runs a Firestore transaction to update the user's balance and record a transaction.
 * Ensures data consistency for concurrent actions.
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

  const accountRef = doc(db, 'accounts', userId);
  const transactionColRef = collection(db, 'transactions');
  let txnId = '';
  
  try {
    await runTransaction(db, async (txn) => {
      const accountSnap = await txn.get(accountRef);
      if (!accountSnap.exists()) {
        throw new Error('Account does not exist.');
      }
      
      const currentBalance = accountSnap.data().balance ?? 0;
      let newBalance = currentBalance;
      
      if (type === 'credit') {
        newBalance += amount;
      } else if (type === 'debit') {
        if (currentBalance < amount) {
          throw new Error('Insufficient funds.');
        }
        newBalance -= amount;
      }
      
      // Update account balance
      txn.update(accountRef, {
        balance: newBalance,
        updatedAt: serverTimestamp(),
      });
      
      // Create transaction document reference
      const newTxnRef = doc(transactionColRef);
      txnId = newTxnRef.id;
      txn.set(newTxnRef, {
        userId,
        type,
        amount,
        description,
        createdAt: serverTimestamp(),
      });
    });
    return txnId;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

/**
 * Fetches user transaction documents dynamically.
 */
export const getTransactions = async (
  userId: string,
  limitCount?: number
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
    const transactionColRef = collection(db, 'transactions');
    let q = query(
      transactionColRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const transactions: TransactionInfo[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      transactions.push({
        id: docSnap.id,
        userId: data.userId || '',
        type: data.type || 'credit',
        amount: data.amount || 0,
        description: data.description || '',
        createdAt: data.createdAt,
      });
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};
