import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../store/wallet';

const Transaction = () => {
  const navigate = useNavigate();
  const { transactions, fetchTransactions } = useWalletStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        if (fetchTransactions) {
          await fetchTransactions();
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [fetchTransactions]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={16} />;
      case 'failed':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Transaction History</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Transactions Yet</h3>
            <p className="text-gray-400">Your blockchain transactions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span className="font-medium text-white capitalize">
                      {transaction.type || 'Document Verification'}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.status || 'pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Transaction Hash</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-mono text-gray-300">
                        {truncateHash(transaction.hash)}
                      </span>
                      {transaction.hash && (
                        <button
                          onClick={() => copyToClipboard(transaction.hash)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy size={12} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Date</span>
                    <span className="text-sm text-gray-300">
                      {formatDate(transaction.createdAt || new Date())}
                    </span>
                  </div>

                  {transaction.documentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Document</span>
                      <span className="text-sm text-gray-300">
                        {truncateHash(transaction.documentId)}
                      </span>
                    </div>
                  )}

                  {transaction.gasUsed && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Gas Used</span>
                      <span className="text-sm text-gray-300">
                        {transaction.gasUsed} SOL
                      </span>
                    </div>
                  )}
                </div>

                {transaction.hash && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => window.open(`https://explorer.solana.com/tx/${transaction.hash}?cluster=devnet`, '_blank')}
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>View on Solana Explorer</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transaction;
