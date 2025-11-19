import React, { useEffect } from "react";
import { Coins, RefreshCw, AlertTriangle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";

const CreditBalance = ({ showDetails = false, size = "md" }) => {
  const navigate = useNavigate();
  const { credits, creditsLoading, fetchCredits, lastCreditUpdate } =
    useWalletStore();

  useEffect(() => {
    // Fetch credits on mount and refresh every 30 seconds
    fetchCredits();
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await fetchCredits();
  };

  const isLowCredits = credits <= 5;
  const isMediumCredits = credits > 5 && credits <= 10;

  const badgeStyles = (() => {
    if (isLowCredits) {
      return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100";
    }
    if (isMediumCredits) {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100";
    }
    return "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100";
  })();

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {/* Credit Display - Clickable */}
      <button
        onClick={() => navigate("/purchase-credits")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${badgeStyles}`}
        title="Click to buy more credits"
      >
        <Coins className="w-4 h-4" />
        <span className="font-semibold">{credits}</span>
        <span className="text-xs opacity-75">credits</span>
      </button>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={creditsLoading}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        title="Refresh credit balance"
      >
        <RefreshCw
          className={`w-4 h-4 ${creditsLoading ? "animate-spin" : ""}`}
        />
      </button>

      {/* Buy Credits Button (shown when low) */}
      {isLowCredits && (
        <button
          onClick={() => navigate("/purchase-credits")}
          className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title="Purchase more credits"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Low Credit Warning */}
      {isLowCredits && (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Low balance</span>
        </div>
      )}

      {/* Details Section */}
      {showDetails && lastCreditUpdate && (
        <div className="text-xs text-gray-500">
          Last updated: {new Date(lastCreditUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default CreditBalance;
