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
import apiService from "../services/api";

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
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

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

  const checkoutIdFromQuery = queryParams.get("checkoutId");
  const packageIdFromQuery = queryParams.get("package");

  console.log(
    "[PaymentSuccess] checkoutId from URL query:",
    checkoutIdFromQuery
  );
  console.log("[PaymentSuccess] packageId from URL query:", packageIdFromQuery);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("xertiq-active-checkout");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge checkoutId from query if sessionStorage didn't have it
        if (checkoutIdFromQuery && !parsed.checkoutId) {
          parsed.checkoutId = checkoutIdFromQuery;
        }
        console.log(
          "[PaymentSuccess] Merged checkoutMeta from sessionStorage:",
          parsed
        );
        setCheckoutMeta(parsed);
      } else if (checkoutIdFromQuery) {
        // No sessionStorage but we have the checkoutId from query
        console.log(
          "[PaymentSuccess] No sessionStorage; using query checkoutId:",
          checkoutIdFromQuery
        );
        setCheckoutMeta({
          checkoutId: checkoutIdFromQuery,
          packageId: packageIdFromQuery,
        });
      }
    } catch (err) {
      console.warn("Unable to read checkout metadata", err);
    }
  }, [checkoutIdFromQuery, packageIdFromQuery]);

  // Verify payment status with backend when checkoutId is available
  useEffect(() => {
    const verifyPayment = async () => {
      const checkoutId = checkoutMeta?.checkoutId || checkoutIdFromQuery;

      if (!checkoutId || paymentVerified) {
        return;
      }

      try {
        console.log(
          "[PaymentSuccess] Verifying payment status for checkoutId:",
          checkoutId
        );
        const result = await apiService.verifyPayMongoPaymentStatus(checkoutId);

        if (result.success && result.data) {
          console.log(
            "[PaymentSuccess] Payment verification result:",
            result.data
          );

          if (result.data.paid && result.data.creditsAdded) {
            setPaymentVerified(true);
            // Refresh credits immediately after verification
            await useWalletStore.getState().fetchCredits();
            // Start polling to ensure UI updates
            if (!hasStarted) {
              startPolling();
              setHasStarted(true);
            }
          } else if (result.data.paid && !result.data.creditsAdded) {
            // Payment is paid but credits weren't added - this shouldn't happen
            // but the backend should have added them via verifyPayMongoPaymentStatus
            console.warn(
              "[PaymentSuccess] Payment paid but credits not added yet"
            );
            setVerificationError(
              "Payment verified but credits are being processed. Please wait..."
            );
            // Start polling to wait for credits
            if (!hasStarted) {
              startPolling();
              setHasStarted(true);
            }
          } else {
            // Payment not completed yet
            console.log(
              "[PaymentSuccess] Payment not completed yet, status:",
              result.data.status
            );
            setVerificationError("Payment not completed yet. Please wait...");
            // Start polling to wait for payment
            if (!hasStarted) {
              startPolling();
              setHasStarted(true);
            }
          }
        }
      } catch (error) {
        console.error("[PaymentSuccess] Payment verification error:", error);
        setVerificationError(
          "Unable to verify payment status. Credits will be added automatically."
        );
        // Start polling anyway - webhook might still process it
        if (!hasStarted) {
          startPolling();
          setHasStarted(true);
        }
      }
    };

    verifyPayment();
  }, [
    checkoutMeta,
    checkoutIdFromQuery,
    paymentVerified,
    hasStarted,
    startPolling,
  ]);

  useEffect(() => {
    if (!hasStarted && paymentVerified) {
      startPolling();
      setHasStarted(true);
    }
  }, [hasStarted, paymentVerified, startPolling]);

  useEffect(() => {
    if (status === "synced") {
      try {
        sessionStorage.removeItem("xertiq-active-checkout");
      } catch (err) {
        console.warn("Unable to clear checkout metadata", err);
      }
    }
  }, [status]);

  const details = checkoutMeta || {
    checkoutId: checkoutIdFromQuery,
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
            {paymentVerified
              ? "Payment verified! Your credits have been added."
              : verificationError
              ? verificationError
              : "We're verifying your payment and refreshing your wallet balance."}
          </p>
          {!paymentVerified && (
            <p className="text-gray-400 text-sm">
              Attempt {Math.min(attempts, MAX_POLL_ATTEMPTS)} of{" "}
              {MAX_POLL_ATTEMPTS}
            </p>
          )}
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
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primaryDark font-semibold"
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
