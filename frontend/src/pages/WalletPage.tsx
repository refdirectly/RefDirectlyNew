import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Lock, Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Transaction {
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface WalletData {
  totalBalance: number;
  freeBalance: number;
  lockedBalance: number;
  transactions: Transaction[];
}

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/add-funds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(amount), paymentId: 'razorpay_' + Date.now() })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchWallet();
        setShowAddFunds(false);
        setAmount('');
        alert(`✅ Successfully added ₹${parseFloat(amount).toLocaleString()} to your wallet!`);
      } else {
        alert(data.message || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Add funds error:', error);
      alert('Failed to add funds. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > (wallet?.freeBalance || 0)) {
      alert('Insufficient free balance');
      return;
    }
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchWallet();
        setShowWithdraw(false);
        setAmount('');
        alert(`✅ Successfully withdrawn ₹${parseFloat(amount).toLocaleString()} from your wallet!`);
      } else {
        alert(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-purple" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Trust Message */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">💰 Your Money, Your Control</h3>
                <p className="text-sm text-green-800">
                  Your wallet balance is <span className="font-bold">fully withdrawable</span> until a referrer accepts your request. 
                  Funds are only locked in escrow after acceptance. <span className="font-bold">Zero charges if no one accepts.</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <Wallet className="h-8 w-8 text-brand-purple" />
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Balance</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">₹{wallet?.totalBalance.toLocaleString() || 0}</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border-2 border-green-200"
            >
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <span className="text-xs font-semibold text-green-700 uppercase">Free Balance</span>
              </div>
              <h2 className="text-3xl font-bold text-green-900">₹{wallet?.freeBalance.toLocaleString() || 0}</h2>
              <p className="text-xs text-green-700 mt-2">✓ Fully withdrawable</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-lg border-2 border-orange-200"
            >
              <div className="flex items-center justify-between mb-4">
                <Lock className="h-8 w-8 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700 uppercase">Locked in Escrow</span>
              </div>
              <h2 className="text-3xl font-bold text-orange-900">₹{wallet?.lockedBalance.toLocaleString() || 0}</h2>
              <p className="text-xs text-orange-700 mt-2">🔒 Secured until completion</p>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setShowAddFunds(true)}
              className="flex items-center justify-center gap-3 bg-gradient-primary text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              <ArrowDownLeft className="h-5 w-5" />
              Add Funds
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={!wallet || wallet.freeBalance <= 0}
              className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-xl font-bold hover:border-brand-purple hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="h-5 w-5" />
              Withdraw
            </button>
          </div>

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-bold text-xl text-gray-900 mb-6">Recent Transactions</h3>
            {wallet?.transactions && wallet.transactions.length > 0 ? (
              <div className="space-y-3">
                {wallet.transactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'ADD' ? 'bg-green-100' :
                        tx.type === 'WITHDRAW' ? 'bg-blue-100' :
                        tx.type === 'LOCK' ? 'bg-orange-100' :
                        tx.type === 'RELEASE' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {tx.type === 'ADD' && <ArrowDownLeft className="h-5 w-5 text-green-600" />}
                        {tx.type === 'WITHDRAW' && <ArrowUpRight className="h-5 w-5 text-blue-600" />}
                        {tx.type === 'LOCK' && <Lock className="h-5 w-5 text-orange-600" />}
                        {tx.type === 'RELEASE' && <CheckCircle className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'ADD' || tx.type === 'REFUND' ? 'text-green-600' :
                        tx.type === 'WITHDRAW' || tx.type === 'LOCK' || tx.type === 'RELEASE' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {tx.type === 'ADD' || tx.type === 'REFUND' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-500">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-bold text-xl mb-4">Add Funds to Wallet</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddFunds}
                disabled={processing}
                className="flex-1 bg-gradient-primary text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Add Funds'}
              </button>
              <button
                onClick={() => setShowAddFunds(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-bold text-xl mb-4">Withdraw Funds</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-800">
                Available: <span className="font-bold">₹{wallet?.freeBalance.toLocaleString()}</span>
              </p>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={wallet?.freeBalance}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                disabled={processing}
                className="flex-1 bg-gradient-primary text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Withdraw'}
              </button>
              <button
                onClick={() => setShowWithdraw(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default WalletPage;
