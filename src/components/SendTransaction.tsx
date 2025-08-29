import React, { useState } from 'react';
import Web3 from 'web3';

interface SendTransactionProps {
  web3: Web3 | null;
  account: string | null;
  balance: string | null;
  networkSymbol: string;
}

interface TransactionState {
  to: string;
  amount: string;
  gasPrice: string;
  gasLimit: string;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
}

const SendTransaction: React.FC<SendTransactionProps> = ({ 
  web3, 
  account, 
  balance, 
  networkSymbol 
}) => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    to: '',
    amount: '',
    gasPrice: '',
    gasLimit: '21000', // Default gas limit for simple ETH transfers
    isProcessing: false,
    error: null,
    success: null,
  });

  // Validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    if (!web3) return false;
    try {
      return web3.utils.isAddress(address);
    } catch {
      return false;
    }
  };

  // Validate amount
  const isValidAmount = (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  // Get estimated gas price
  const getGasPrice = async () => {
    if (!web3) return;
    
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceInGwei = web3.utils.fromWei(gasPrice, 'gwei');
      setTransactionState(prev => ({
        ...prev,
        gasPrice: gasPriceInGwei,
      }));
    } catch (error) {
      console.error('Error getting gas price:', error);
      // Set a default gas price if we can't get it
      setTransactionState(prev => ({
        ...prev,
        gasPrice: '20', // Default 20 gwei
      }));
    }
  };

  // Estimate gas limit
  const estimateGas = async () => {
    if (!web3 || !account || !transactionState.to || !transactionState.amount) return;

    try {
      const amountInWei = web3.utils.toWei(transactionState.amount, 'ether');
      const gasLimit = await web3.eth.estimateGas({
        from: account,
        to: transactionState.to,
        value: amountInWei,
      });
      
      setTransactionState(prev => ({
        ...prev,
        gasLimit: gasLimit.toString(),
      }));
    } catch (error) {
      console.error('Error estimating gas:', error);
      // Use default gas limit for simple transfers
      setTransactionState(prev => ({
        ...prev,
        gasLimit: '21000',
      }));
    }
  };

  // Calculate transaction fee
  const calculateFee = (): string => {
    if (!transactionState.gasPrice || !transactionState.gasLimit || !web3) return '0';
    
    try {
      const gasPriceInWei = web3.utils.toWei(transactionState.gasPrice, 'gwei');
      const gasLimit = BigInt(transactionState.gasLimit);
      const gasPrice = BigInt(gasPriceInWei);
      const feeInWei = gasPrice * gasLimit;
      return web3.utils.fromWei(feeInWei.toString(), 'ether');
    } catch (error) {
      console.error('Error calculating fee:', error);
      // Fallback calculation
      try {
        const gasPrice = parseFloat(transactionState.gasPrice);
        const gasLimit = parseInt(transactionState.gasLimit);
        const feeInGwei = gasPrice * gasLimit;
        return (feeInGwei / 1e9).toString(); // Convert gwei to ether
      } catch {
        return '0';
      }
    }
  };

  // Send transaction
  const sendTransaction = async () => {
    if (!web3 || !account) {
      setTransactionState(prev => ({
        ...prev,
        error: 'Wallet not connected',
      }));
      return;
    }

    if (!isValidAddress(transactionState.to)) {
      setTransactionState(prev => ({
        ...prev,
        error: 'Invalid recipient address',
      }));
      return;
    }

    if (!isValidAmount(transactionState.amount)) {
      setTransactionState(prev => ({
        ...prev,
        error: 'Invalid amount',
      }));
      return;
    }

    const currentBalance = parseFloat(balance || '0');
    const amount = parseFloat(transactionState.amount);
    const fee = parseFloat(calculateFee());
    const totalCost = amount + fee;

    if (totalCost > currentBalance) {
      setTransactionState(prev => ({
        ...prev,
        error: `Insufficient balance. You need ${totalCost.toFixed(6)} ${networkSymbol} (${amount.toFixed(6)} + ${fee.toFixed(6)} fee)`,
      }));
      return;
    }

    setTransactionState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      success: null,
    }));

    try {
      const amountInWei = web3.utils.toWei(transactionState.amount, 'ether');
      const gasPriceInWei = web3.utils.toWei(transactionState.gasPrice, 'gwei');

      const transaction = {
        from: account,
        to: transactionState.to,
        value: amountInWei,
        gas: transactionState.gasLimit,
        gasPrice: gasPriceInWei,
      };

      const receipt = await web3.eth.sendTransaction(transaction);
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        success: `Transaction successful! Hash: ${receipt.transactionHash}`,
        to: '',
        amount: '',
      }));
    } catch (error: unknown) {
      console.error('Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
    }
  };

  // Auto-estimate gas when address or amount changes
  React.useEffect(() => {
    if (transactionState.to && transactionState.amount && web3) {
      estimateGas();
    }
  }, [transactionState.to, transactionState.amount, web3]);

  // Get gas price on component mount
  React.useEffect(() => {
    if (web3) {
      getGasPrice();
    }
  }, [web3]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="send-transaction">
      <h3>Send {networkSymbol}</h3>
      
      {transactionState.error && (
        <div className="error-message">
          {transactionState.error}
        </div>
      )}

      {transactionState.success && (
        <div className="success-message">
          {transactionState.success}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="recipient">Recipient Address</label>
        <input
          id="recipient"
          type="text"
          placeholder="0x..."
          value={transactionState.to}
          onChange={(e) => setTransactionState(prev => ({ ...prev, to: e.target.value }))}
          className={transactionState.to && !isValidAddress(transactionState.to) ? 'error' : ''}
        />
        {transactionState.to && !isValidAddress(transactionState.to) && (
          <span className="error-text">Invalid Ethereum address</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount ({networkSymbol})</label>
        <input
          id="amount"
          type="number"
          step="0.000001"
          placeholder="0.0"
          value={transactionState.amount}
          onChange={(e) => setTransactionState(prev => ({ ...prev, amount: e.target.value }))}
          className={transactionState.amount && !isValidAmount(transactionState.amount) ? 'error' : ''}
        />
        {transactionState.amount && !isValidAmount(transactionState.amount) && (
          <span className="error-text">Invalid amount</span>
        )}
      </div>

      <div className="gas-settings">
        <h4>Gas Settings</h4>
        
        <div className="form-group">
          <label htmlFor="gasPrice">Gas Price (Gwei)</label>
          <input
            id="gasPrice"
            type="number"
            step="0.1"
            placeholder="Auto"
            value={transactionState.gasPrice}
            onChange={(e) => setTransactionState(prev => ({ ...prev, gasPrice: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gasLimit">Gas Limit</label>
          <input
            id="gasLimit"
            type="number"
            placeholder="21000"
            value={transactionState.gasLimit}
            onChange={(e) => setTransactionState(prev => ({ ...prev, gasLimit: e.target.value }))}
          />
        </div>

        <div className="fee-display">
          <span>Estimated Fee: {calculateFee()} {networkSymbol}</span>
        </div>
      </div>

      <div className="transaction-summary">
        <h4>Transaction Summary</h4>
        <div className="summary-item">
          <span>From:</span>
          <span>{account && formatAddress(account)}</span>
        </div>
        <div className="summary-item">
          <span>To:</span>
          <span>{transactionState.to ? formatAddress(transactionState.to) : 'Not specified'}</span>
        </div>
        <div className="summary-item">
          <span>Amount:</span>
          <span>{transactionState.amount || '0'} {networkSymbol}</span>
        </div>
        <div className="summary-item">
          <span>Fee:</span>
          <span>{calculateFee()} {networkSymbol}</span>
        </div>
        <div className="summary-item total">
          <span>Total:</span>
          <span>
            {transactionState.amount && transactionState.amount !== '' 
              ? (parseFloat(transactionState.amount) + parseFloat(calculateFee())).toFixed(6) 
              : '0'} {networkSymbol}
          </span>
        </div>
      </div>

      <button
        onClick={sendTransaction}
        disabled={transactionState.isProcessing || !transactionState.to || !transactionState.amount}
        className="send-button"
      >
        {transactionState.isProcessing ? 'Processing...' : `Send ${networkSymbol}`}
      </button>
    </div>
  );
};

export default SendTransaction;
