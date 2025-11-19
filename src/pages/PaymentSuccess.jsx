import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import NavigationHeader from "../components/NavigationHeader";
import useWalletPolling from "../hooks/useWalletPolling";
import useWalletStore from "../store/wallet";

const MAX_POLL_ATTEMPTS = 6;

const STATUS_COPY = {
  polling: {
    title: "Verifying your payment",
    description: "Hang tight while we sync your new credits.",
    accent: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/40",
    Icon: Loader2,
  },
  synced: {
    title: "Credits synced",
    description: "Your wallet has the latest balance.",
    accent: "text-green-300",
    bg: "bg-green-500/20 border-green-500/40",
    Icon: CheckCircle,
  },
  timeout: {
    title: "Taking longer than expected",
    description: "You can retry syncing or contact support if this continues.",
    accent: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/40",
    Icon: AlertTriangle,
  },
  error: {
    title: "Unable to verify payment",
    description: "Retry syncing or try purchasing again.",
    accent: "text-red-300",
    bg: "bg-red-500/20 border-red-500/40",
    Icon: AlertTriangle,
  },
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { credits } = useWalletStore();
  const [checkoutMeta, setCheckoutMeta] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    status,
    attempts,
    lastCredits,
    startPolling,
    stopPolling,
    isPolling,
  } = useWalletPolling({ maxAttempts: MAX_POLL_ATTEMPTS });

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("xertiq-active-checkout");
      if (stored) {
        setCheckoutMeta(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Unable to read checkout metadata", err);
    }
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      startPolling();
      setHasStarted(true);
    }
  }, [hasStarted, startPolling]);

  useEffect(() => {
    if (status === "synced") {
      try {
        sessionStorage.removeItem("xertiq-active-checkout");
      } catch (err) {
        console.warn("Unable to clear checkout metadata", err);
      }
    }
  }, [status]);

  const packageIdFromQuery = queryParams.get("package");

  const details = checkoutMeta || {
    packageId: packageIdFromQuery,
  };

  const statusConfig = STATUS_COPY[status] || STATUS_COPY.polling;
  const StatusIcon = statusConfig.Icon;

  const handleGoToDashboard = () => {
    stopPolling();
    navigate("/dashboard");
  };

  const handleBuyMore = () => {
    stopPolling();
    navigate("/purchase-credits");
  };

  const handleRetry = () => {
    startPolling();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0f2e] via-[#181143] to-[#05030f] text-white">
      <NavigationHeader title="Payment Success" showBack={true} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <StatusIcon className={`w-10 h-10 ${statusConfig.accent}`} />
            <div>
              <h1 className="text-2xl font-semibold">{statusConfig.title}</h1>
              <p className="text-gray-300 text-sm">
                {statusConfig.description}
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            We automatically refresh your wallet every few seconds to confirm
            the payment with PayMongo.
          </p>
          <p className="text-gray-400 text-sm">
            Attempt {Math.min(attempts, MAX_POLL_ATTEMPTS)} of{" "}
            {MAX_POLL_ATTEMPTS}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`rounded-2xl border ${statusConfig.bg} p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-sm text-white/70">Latest known balance</p>
                <p className="text-3xl font-bold text-white">{credits}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Incoming credits
                </p>
                <p className="text-xl font-semibold">
                  {details?.credits ? `${details.credits}` : "–"}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  PayMongo ref
                </p>
                <p className="text-sm break-all">
                  {details?.reference || "Pending"}
                </p>
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Last fetched credits
              </p>
              <p className="text-2xl font-semibold">
                {typeof lastCredits === "number" ? lastCredits : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm text-white/60">Package</p>
              <p className="text-xl font-semibold">
                {details?.packageName ||
                  packageIdFromQuery ||
                  "Unknown package"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Credits purchased
                </p>
                <p className="text-2xl font-semibold">
                  {details?.credits ? `${details.credits}` : "—"}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Amount paid
                </p>
                <p className="text-2xl font-semibold">
                  {details?.price ? `$${details.price}` : "—"}
                </p>
              </div>
            </div>
            <div className="text-sm text-white/70">
              <p>
                Need a receipt? Check your email for PayMongo's confirmation or
                reach out to support@xertiq.com.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"
          >
            Go to dashboard
          </button>
          <button
            onClick={handleBuyMore}
            className="px-6 py-3 rounded-xl border border-white/30 text-white/90"
          >
            Buy more credits
          </button>
          {(status === "timeout" || status === "error") && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 rounded-xl border border-yellow-400/50 text-yellow-200 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry sync
            </button>
          )}
          {isPolling && status === "polling" && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing wallet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
