import React, { useState, useEffect } from "react";
import { Coins, Check, CreditCard, ArrowLeft, TimerReset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";
import NavigationHeader from "../components/NavigationHeader";
import usePayMongoPurchase from "../hooks/usePayMongoPurchase";

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const { credits, fetchCredits } = useWalletStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [clientError, setClientError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [redirectInfo, setRedirectInfo] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const { startCheckout, isLoading, error, resetCheckoutState } =
    usePayMongoPurchase();

  useEffect(() => {
    // Fetch latest credit balance on mount
    fetchCredits();
  }, [fetchCredits]);

  const packages = [
    {
      id: "starter",
      payMongoPackageId: "starter",
      name: "Starter Pack",
      credits: 100,
      price: 10,
      popular: false,
      description: "Perfect for small batches",
      certificates: 50, // 100 credits = 50 certificates (2 credits each)
    },
    {
      id: "professional",
      payMongoPackageId: "professional",
      name: "Professional Pack",
      credits: 500,
      price: 45,
      popular: true,
      description: "Best value for regular use",
      certificates: 250,
      discount: "10% off",
    },
    {
      id: "enterprise",
      payMongoPackageId: "enterprise",
      name: "Enterprise Pack",
      credits: 1000,
      price: 80,
      popular: false,
      description: "For high-volume needs",
      certificates: 500,
      discount: "20% off",
    },
    {
      id: "ultimate",
      payMongoPackageId: "ultimate",
      name: "Ultimate Pack",
      credits: 5000,
      price: 350,
      popular: false,
      description: "Maximum value",
      certificates: 2500,
      discount: "30% off",
    },
  ];

  useEffect(() => {
    if (!redirectInfo || redirectCountdown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, redirectInfo]);

  useEffect(() => {
    if (redirectInfo?.redirectUrl && redirectCountdown === 0) {
      window.location.assign(redirectInfo.redirectUrl);
    }
  }, [redirectCountdown, redirectInfo]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setClientError("Please select a package to continue.");
      return;
    }

    setClientError(null);
    setStatusMessage("Preparing secure PayMongo checkout...");
    resetCheckoutState();

    try {
      // First call without successUrl so backend creates session and returns checkoutId
      const { checkoutUrl, checkoutReference, referenceNumber } =
        await startCheckout(selectedPackage, {
          autoRedirect: false,
          // Send successUrl with placeholder; backend ideally passes it to PayMongo
          successUrl: `${window.location.origin}/payment/success?checkoutId=CHECKOUT_ID_PLACEHOLDER`,
          cancelUrl: `${window.location.origin}/purchase-credits`,
        });

      // Replace placeholder with actual checkoutId (if backend echoes it into the URL)
      console.log("[PurchaseCredits] checkoutReference returned:", checkoutReference);
      console.log("[PurchaseCredits] Building successUrl with checkoutId:", checkoutReference);
      const finalCheckoutUrl = checkoutUrl?.replace(
        "CHECKOUT_ID_PLACEHOLDER",
        checkoutReference || ""
      );
      console.log("[PurchaseCredits] Final checkout URL:", finalCheckoutUrl);

      const checkoutMeta = {
        reference: checkoutReference || referenceNumber,
        checkoutId: checkoutReference,
        checkoutReference,
        referenceNumber,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        credits: selectedPackage.credits,
        price: selectedPackage.price,
        createdAt: Date.now(),
      };
      try {
        sessionStorage.setItem(
          "xertiq-active-checkout",
          JSON.stringify(checkoutMeta)
        );
      } catch (storageError) {
        console.warn("Unable to persist checkout metadata", storageError);
      }

      setRedirectInfo({
        redirectUrl: finalCheckoutUrl || checkoutUrl,
        credits: selectedPackage.credits,
        price: selectedPackage.price,
      });
      setStatusMessage("Redirecting you to PayMongo...");
      setRedirectCountdown(3);
    } catch (err) {
      console.error("Purchase error:", err);
      setStatusMessage(null);
      setClientError(err?.message || "Failed to process purchase");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1347] via-[#1e1554] to-[#0f0a2e]">
      <NavigationHeader title="Purchase Credits" showBack={true} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="bg-blue-500/20 p-4 rounded-full">
              <Coins className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Purchase Credits
          </h1>
          <p className="text-gray-400">
            Current Balance:{" "}
            <span className="text-blue-400 font-semibold">
              {credits} credits
            </span>
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3 text-blue-200">
            <CreditCard className="w-5 h-5" />
            <div>
              <p className="font-semibold">{statusMessage}</p>
              {redirectInfo && redirectCountdown > 0 && (
                <p className="text-sm text-blue-100">
                  Redirecting in {redirectCountdown} second
                  {redirectCountdown === 1 ? "" : "s"}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {(clientError || error) && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-300">{clientError || error}</p>
          </div>
        )}

        {/* Redirect Summary */}
        {redirectInfo && (
          <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 text-white">
              <TimerReset className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-semibold">
                  You're about to purchase {redirectInfo.credits} credits
                </p>
                <p className="text-gray-300 text-sm">
                  Package: {redirectInfo.packageName} · ${redirectInfo.price}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative bg-white/5 backdrop-blur-xl border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedPackage?.id === pkg.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Discount Badge */}
              {pkg.discount && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pkg.discount}
                  </span>
                </div>
              )}

              {/* Package Content */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-6 h-6 text-blue-400" />
                    <span className="text-3xl font-bold text-white">
                      {pkg.credits}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">credits</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-gray-300 text-sm">
                    ≈{" "}
                    <span className="font-semibold text-white">
                      {pkg.certificates}
                    </span>{" "}
                    certificates
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    (2 credits per PDF)
                  </p>
                </div>

                <div className="text-3xl font-bold text-blue-400 mb-2">
                  ${pkg.price}
                </div>
                <p className="text-gray-400 text-xs">
                  ${(pkg.price / pkg.credits).toFixed(3)} per credit
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-4 right-4">
                  <div className="bg-blue-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Purchase Button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePurchase}
            disabled={
              !selectedPackage ||
              isLoading ||
              redirectCountdown > 0 ||
              Boolean(redirectInfo)
            }
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>
                  {selectedPackage
                    ? `Purchase ${selectedPackage.credits} credits for $${selectedPackage.price}`
                    : "Select a package"}
                </span>
              </>
            )}
          </button>

          {selectedPackage && !redirectInfo && (
            <p className="text-center text-gray-400 text-sm mt-4">
              After purchase, you'll have{" "}
              <span className="text-blue-400 font-semibold">
                {credits + selectedPackage.credits} credits
              </span>
            </p>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            How Credits Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Generate PDF</p>
                <p className="text-gray-400">2 credits per certificate</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Upload to IPFS</p>
                <p className="text-gray-400">1 credit per upload</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">
                  Blockchain Upload
                </p>
                <p className="text-gray-400">3 credits per upload</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">
                  Validate Certificate
                </p>
                <p className="text-gray-400">1 credit per validation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCredits;
