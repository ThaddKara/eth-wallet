import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SendTransaction from './SendTransaction';

interface WalletState {
  isConnected: boolean;
  account: string | null;
  balance: string | null;
  error: string | null;
  network: {
    chainId: string | null;
    name: string | null;
    isTestnet: boolean;
  };
  showSendForm: boolean;
}

const WalletConnect: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    account: null,
    balance: null,
    error: null,
    network: {
      chainId: null,
      name: null,
      isTestnet: false,
    },
    showSendForm: false,
  });
  const [web3, setWeb3] = useState<Web3 | null>(null);

  // Network configuration
  const NETWORKS = {
    '0x1': { name: 'Ethereum Mainnet', isTestnet: false, symbol: 'ETH' },
    '0x5': { name: 'Goerli Testnet', isTestnet: true, symbol: 'ETH' },
    '0xaa36a7': { name: 'Sepolia Testnet', isTestnet: true, symbol: 'ETH' },
    '0x89': { name: 'Polygon Mainnet', isTestnet: false, symbol: 'MATIC' },
    '0x13881': { name: 'Mumbai Testnet', isTestnet: true, symbol: 'MATIC' },
    '0xa': { name: 'Optimism', isTestnet: false, symbol: 'ETH' },
    '0xa4b1': { name: 'Arbitrum One', isTestnet: false, symbol: 'ETH' },
  };

  // Get network info from chainId
  const getNetworkInfo = (chainId: string) => {
    return NETWORKS[chainId as keyof typeof NETWORKS] || {
      name: `Chain ID: ${parseInt(chainId, 16)}`,
      isTestnet: false,
      symbol: 'ETH'
    };
  };

  // Check if MetaMask is installed
  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } else {
        setWalletState(prev => ({
          ...prev,
          error: 'Please install MetaMask to use this app!'
        }));
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWalletState(prev => ({
        ...prev,
        error: 'Error checking wallet connection'
      }));
    }
  };

  // Get current network
  const getCurrentNetwork = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return { chainId: null, name: 'Unknown', isTestnet: false, symbol: 'ETH' };
      }
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkInfo = getNetworkInfo(chainId);
      return { chainId, ...networkInfo };
    } catch (error) {
      console.error('Error getting network:', error);
      return { chainId: null, name: 'Unknown', isTestnet: false, symbol: 'ETH' };
    }
  };

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        const account = accounts[0];
        const network = await getCurrentNetwork();
        
        const balance = await web3Instance.eth.getBalance(account);
        const balanceInEth = web3Instance.utils.fromWei(balance, 'ether');
        
        setWalletState({
          isConnected: true,
          account,
          balance: balanceInEth,
          error: null,
          network: {
            chainId: network.chainId,
            name: network.name,
            isTestnet: network.isTestnet,
          },
          showSendForm: false,
        });
      } else {
        setWalletState(prev => ({
          ...prev,
          error: 'Please install MetaMask!'
        }));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({
        ...prev,
        error: 'Error connecting to wallet'
      }));
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      account: null,
      balance: null,
      error: null,
      network: {
        chainId: null,
        name: null,
        isTestnet: false,
      },
      showSendForm: false,
    });
    setWeb3(null);
  };

  // Update balance and network
  const updateBalance = async () => {
    if (web3 && walletState.account) {
      try {
        const balance = await web3.eth.getBalance(walletState.account);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        const network = await getCurrentNetwork();
        
        setWalletState(prev => ({
          ...prev,
          balance: balanceInEth,
          network: {
            chainId: network.chainId,
            name: network.name,
            isTestnet: network.isTestnet,
          },
        }));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  // Switch to Ethereum mainnet
  const switchToMainnet = async () => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 4902) {
        // Chain not added, try to add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://ethereum.publicnode.com'],
              blockExplorerUrls: ['https://etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Error adding mainnet:', addError);
        }
      }
    }
  };

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Chain changed to:', chainId);
        if (walletState.isConnected) {
          connectWallet(); // Reconnect to get new network info
        }
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners();
      }
    };
  }, [walletState.isConnected]);

  // Check for existing connection on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Update balance every 30 seconds
  useEffect(() => {
    if (walletState.isConnected) {
      const interval = setInterval(updateBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [walletState.isConnected, web3, walletState.account]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkSymbol = () => {
    if (!walletState.network.chainId) return 'ETH';
    const networkInfo = getNetworkInfo(walletState.network.chainId);
    return networkInfo.symbol;
  };

  const toggleSendForm = () => {
    setWalletState(prev => ({
      ...prev,
      showSendForm: !prev.showSendForm,
    }));
  };

  return (
    <div className="wallet-connect">
      <h2>Ethereum Wallet</h2>
      
      {walletState.error && (
        <div className="error-message">
          {walletState.error}
        </div>
      )}

      {!walletState.isConnected ? (
        <div className="connect-section">
          <p>Connect your Ethereum wallet to view your balance</p>
          <button 
            onClick={connectWallet}
            className="connect-button"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="wallet-info">
          <div className="network-info">
            <h3>Network</h3>
            <p className={`network-name ${walletState.network.isTestnet ? 'testnet' : 'mainnet'}`}>
              {walletState.network.name}
              {walletState.network.isTestnet && <span className="testnet-badge">TESTNET</span>}
            </p>
            {walletState.network.isTestnet && (
              <button 
                onClick={switchToMainnet}
                className="switch-network-button"
              >
                Switch to Mainnet
              </button>
            )}
          </div>

          <div className="account-info">
            <h3>Connected Account</h3>
            <p className="account-address">
              {walletState.account && formatAddress(walletState.account)}
            </p>
          </div>
          
          <div className="balance-info">
            <h3>{getNetworkSymbol()} Balance</h3>
            <p className="balance-amount">
              {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ${getNetworkSymbol()}` : 'Loading...'}
            </p>
          </div>
          
          <div className="actions">
            <button 
              onClick={updateBalance}
              className="refresh-button"
            >
              Refresh Balance
            </button>
            <button 
              onClick={toggleSendForm}
              className="send-button"
            >
              {walletState.showSendForm ? 'Hide Send Form' : 'Send ETH'}
            </button>
            <button 
              onClick={disconnectWallet}
              className="disconnect-button"
            >
              Disconnect
            </button>
          </div>

          {walletState.showSendForm && (
            <div className="send-transaction-container">
              <SendTransaction
                web3={web3}
                account={walletState.account}
                balance={walletState.balance}
                networkSymbol={getNetworkSymbol()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
