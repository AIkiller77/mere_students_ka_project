import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import { useAuth } from './AuthContext';

// ABI imports for our smart contracts
import MedicalRecordsABI from '../contracts/MedicalRecords.json';
import MedTokenABI from '../contracts/MedToken.json';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [networkId, setNetworkId] = useState(null);
  const [medicalRecordsContract, setMedicalRecordsContract] = useState(null);
  const [medTokenContract, setMedTokenContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  
  const { currentUser, updateProfile } = useAuth();

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      setError(null);
      try {
        // Modern dapp browsers
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3Instance.eth.getAccounts();
            setAccounts(accounts);
            setConnected(accounts.length > 0);
            
            // Get network ID
            const networkId = await web3Instance.eth.net.getId();
            setNetworkId(networkId);
            
            // Initialize contracts
            initializeContracts(web3Instance, networkId);
            
            // Setup event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
          } catch (error) {
            console.error('User denied account access', error);
          }
        } 
        // Legacy dapp browsers
        else if (window.web3) {
          const web3Instance = new Web3(window.web3.currentProvider);
          setWeb3(web3Instance);
          
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);
          setConnected(accounts.length > 0);
          
          const networkId = await web3Instance.eth.net.getId();
          setNetworkId(networkId);
          
          initializeContracts(web3Instance, networkId);
        } 
        // No web3 provider
        else {
          console.log('No Web3 provider detected');
        }
      } catch (error) {
        console.error('Error initializing web3', error);
        setError('Error connecting to blockchain network');
      } finally {
        setLoading(false);
      }
    };

    initWeb3();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Update token balance when user or accounts change
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (medTokenContract && accounts.length > 0) {
        try {
          const balance = await medTokenContract.methods.balanceOf(accounts[0]).call();
          setTokenBalance(web3.utils.fromWei(balance, 'ether'));
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    };

    fetchTokenBalance();
  }, [medTokenContract, accounts, web3]);

  // Initialize smart contracts
  const initializeContracts = async (web3Instance, networkId) => {
    try {
      // Fetch contract addresses from the backend
      const response = await axios.get('/api/blockchain/status');
      const { medicalRecordsAddress, medTokenAddress } = response.data;
      
      // Initialize Medical Records contract
      if (medicalRecordsAddress) {
        const medicalRecordsContract = new web3Instance.eth.Contract(
          MedicalRecordsABI.abi,
          medicalRecordsAddress
        );
        setMedicalRecordsContract(medicalRecordsContract);
      }
      
      // Initialize MedToken contract
      if (medTokenAddress) {
        const medTokenContract = new web3Instance.eth.Contract(
          MedTokenABI.abi,
          medTokenAddress
        );
        setMedTokenContract(medTokenContract);
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setError('Error initializing blockchain contracts');
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    setAccounts(accounts);
    setConnected(accounts.length > 0);
  };

  // Handle network changes
  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  // Connect wallet
  const connectWallet = async () => {
    setError(null);
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        setConnected(accounts.length > 0);
        
        // If user is logged in, update their wallet address
        if (currentUser && accounts[0] && (!currentUser.wallet_address || currentUser.wallet_address !== accounts[0])) {
          await updateProfile({ wallet_address: accounts[0] });
        }
        
        return true;
      } else {
        setError('No Ethereum wallet detected. Please install MetaMask.');
        return false;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Error connecting to wallet');
      return false;
    }
  };

  // Sign a message for authentication
  const signMessage = async (message) => {
    try {
      if (!web3 || accounts.length === 0) {
        await connectWallet();
      }
      
      const signature = await web3.eth.personal.sign(
        message,
        accounts[0],
        '' // Password (empty for most wallets like MetaMask)
      );
      
      return {
        address: accounts[0],
        signature
      };
    } catch (error) {
      console.error('Error signing message:', error);
      setError('Error signing message with wallet');
      return null;
    }
  };

  // Verify a medicine on the blockchain
  const verifyMedicine = async (medicineId) => {
    try {
      if (!connected) {
        await connectWallet();
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/blockchain/verify-medicine`,
        { medicine_id: medicineId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error verifying medicine:', error);
      setError('Error verifying medicine on blockchain');
      return null;
    }
  };

  // Store medical record hash on blockchain
  const storeMedicalRecord = async (recordData) => {
    try {
      if (!connected) {
        await connectWallet();
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/blockchain/store-medical-record`,
        recordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error storing medical record:', error);
      setError('Error storing medical record on blockchain');
      return null;
    }
  };

  // Get token information
  const getTokenInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/blockchain/token-info`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  };

  // Mint reward tokens
  const mintReward = async (actionType) => {
    try {
      if (!connected) {
        await connectWallet();
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/blockchain/mint-reward`,
        { action_type: actionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error minting rewards:', error);
      setError('Error minting reward tokens');
      return null;
    }
  };

  const value = {
    web3,
    accounts,
    connected,
    networkId,
    medicalRecordsContract,
    medTokenContract,
    loading,
    error,
    tokenBalance,
    connectWallet,
    signMessage,
    verifyMedicine,
    storeMedicalRecord,
    getTokenInfo,
    mintReward
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
