import { CheckCircle, Wifi } from 'lucide-react';
import useWalletStore from '../store/wallet';

const StatusIndicators = () => {
  const { isConnected, connection } = useWalletStore();

  return (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-lg p-3 mx-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wifi size={16} className={isConnected ? "text-green-400" : "text-red-400"} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-xs text-gray-300">Devnet</span>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicators;
