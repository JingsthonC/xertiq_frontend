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
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    Icon: Loader2,
  },
  synced: {
    title: "Credits synced",
    description: "Your wallet has the latest balance.",
    accent: "text-green-600",
    bg: "bg-green-50 border-green-200",
    Icon: CheckCircle,
  },
  timeout: {
    title: "Taking longer than expected",
    description: "You can retry syncing or contact support if this continues.",
    accent: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    Icon: AlertTriangle,
  },
  error: {
    title: "Unable to verify payment",
    description: "Retry syncing or try purchasing again.",
    accent: "text-red-600",
    bg: "bg-red-50 border-red-200",
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
    [location.search],
  );

  const checkoutIdFromQuery = queryParams.get("checkoutId");
  const packageIdFromQuery = queryParams.get("package");

  console.log(
    "[PaymentSuccess] checkoutId from URL query:",
    checkoutIdFromQuery,
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
          parsed,
        );
        setCheckoutMeta(parsed);
      } else if (checkoutIdFromQuery) {
        // No sessionStorage but we have the checkoutId from query
        console.log(
          "[PaymentSuccess] No sessionStorage; using query checkoutId:",
          checkoutIdFromQuery,
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
          checkoutId,
        );
        const result = await apiService.verifyPayMongoPaymentStatus(checkoutId);

        if (result.success && result.data) {
          console.log(
            "[PaymentSuccess] Payment verification result:",
            result.data,
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
              "[PaymentSuccess] Payment paid but credits not added yet",
            );
            setVerificationError(
              "Payment verified but credits are being processed. Please wait...",
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
              result.data.status,
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
          "Unable to verify payment status. Credits will be added automatically.",
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
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff] p-4 sm:p-6">
      <NavigationHeader title="Payment Success" showBack={true} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Success Header Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${status === "synced" ? "bg-green-100" : status === "error" ? "bg-red-100" : status === "timeout" ? "bg-yellow-100" : "bg-blue-100"}`}
            >
              <StatusIcon className={`w-8 h-8 ${statusConfig.accent}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2A1B5D]">
                {statusConfig.title}
              </h1>
              <p className="text-gray-600 text-sm">
                {statusConfig.description}
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4 pl-16">
            {paymentVerified
              ? "Payment verified! Your credits have been added."
              : verificationError
                ? verificationError
                : "We're verifying your payment and refreshing your wallet balance."}
          </p>
          {!paymentVerified && (
            <p className="text-gray-400 text-sm pl-16">
              Attempt {Math.min(attempts, MAX_POLL_ATTEMPTS)} of{" "}
              {MAX_POLL_ATTEMPTS}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div
            className={`rounded-2xl border-2 ${statusConfig.bg} p-6 flex flex-col gap-5 shadow-lg`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#3834A8]/10">
                <Wallet className="w-6 h-6 text-[#3834A8]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Latest known balance
                </p>
                <p className="text-4xl font-bold text-[#2A1B5D]">{credits}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">
                  Incoming credits
                </p>
                <p className="text-2xl font-bold text-[#3834A8]">
                  {details?.credits ? `+${details.credits}` : "–"}
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">
                  PayMongo ref
                </p>
                <p className="text-xs break-all text-[#2A1B5D] font-mono">
                  {details?.reference || "Pending"}
                </p>
              </div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">
                Last fetched credits
              </p>
              <p className="text-3xl font-bold text-[#2A1B5D]">
                {typeof lastCredits === "number" ? lastCredits : "—"}
              </p>
            </div>
          </div>

          {/* Package Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Package</p>
                <p className="text-2xl font-bold text-[#2A1B5D]">
                  {details?.packageName ||
                    packageIdFromQuery ||
                    "Unknown package"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#3834A8]/10 to-[#2A1B5D]/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#3834A8]/5 to-[#2A1B5D]/10 rounded-xl p-4 border border-[#3834A8]/10">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">
                  Credits purchased
                </p>
                <p className="text-3xl font-bold text-[#3834A8]">
                  {details?.credits ? `${details.credits}` : "—"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">
                  Amount paid
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {details?.price ? `₱${details.price}` : "—"}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
              <p>
                Need a receipt? Check your email for PayMongo's confirmation or
                reach out to{" "}
                <span className="text-[#3834A8] font-medium">
                  support@xertiq.com
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleGoToDashboard}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] text-white font-semibold shadow-lg hover:shadow-xl hover:from-[#2A1B5D] hover:to-[#1a1040] transition-all transform hover:scale-105"
          >
            Go to dashboard
          </button>
          <button
            onClick={handleBuyMore}
            className="px-8 py-4 rounded-xl border-2 border-[#3834A8] text-[#3834A8] font-semibold hover:bg-[#3834A8] hover:text-white transition-all transform hover:scale-105"
          >
            Buy more credits
          </button>
          {(status === "timeout" || status === "error") && (
            <button
              onClick={handleRetry}
              className="px-8 py-4 rounded-xl border-2 border-yellow-500 text-yellow-600 flex items-center gap-2 font-semibold hover:bg-yellow-500 hover:text-white transition-all transform hover:scale-105"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry sync
            </button>
          )}
          {isPolling && status === "polling" && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-md">
              <Loader2 className="w-4 h-4 animate-spin text-[#3834A8]" />
              Syncing wallet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
