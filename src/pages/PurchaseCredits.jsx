import React, { useState, useEffect } from "react";
import { Coins, Check, CreditCard, ArrowLeft, TimerReset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";
import NavigationHeader from "../components/NavigationHeader";
import usePayMongoPurchase from "../hooks/usePayMongoPurchase";
import SEOHead from "../components/SEOHead";

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const { credits, fetchCredits, userRole, user } = useWalletStore();

  // Normalize role for comparison
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  // Redirect super admins away from purchase credits page
  useEffect(() => {
    if (isSuperAdmin) {
      navigate("/super-admin", { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  // Don't render for super admins
  if (isSuperAdmin) {
    return null;
  }
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
      price: 100,
      popular: false,
      description: "Perfect for small batches",
      certificates: 50, // 100 credits = 50 certificates (2 credits each)
    },
    {
      id: "professional",
      payMongoPackageId: "professional",
      name: "Professional Pack",
      credits: 500,
      price: 500,
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
      price: 1000,
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
      price: 5000,
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
      // Start checkout - backend will create PayMongo session
      // Note: PayMongo doesn't support placeholders in URLs, so we'll use a base URL
      // and the checkoutId will be passed via query params when PayMongo redirects
      const { checkoutUrl, checkoutReference, referenceNumber } =
        await startCheckout(selectedPackage, {
          autoRedirect: false,
          // Use base success URL - PayMongo will redirect here, and we'll get checkoutId from query params
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/purchase-credits`,
        });

      console.log("[PurchaseCredits] Checkout session created:");
      console.log("  - Checkout ID:", checkoutReference);
      console.log("  - Reference Number:", referenceNumber);
      console.log("  - Checkout URL:", checkoutUrl);

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
          JSON.stringify(checkoutMeta),
        );
      } catch (storageError) {
        console.warn("Unable to persist checkout metadata", storageError);
      }

      setRedirectInfo({
        redirectUrl: checkoutUrl,
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
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff]">
      <SEOHead title="Purchase Credits" noindex />
      <NavigationHeader title="Purchase Credits" showBack={true} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 flex items-center gap-2 text-gray-600 hover:text-[#2A1B5D] transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] p-4 rounded-full shadow-lg">
              <Coins className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#2A1B5D] mb-2">
            Purchase Credits
          </h1>
          <p className="text-gray-600">
            Current Balance:{" "}
            <span className="text-[#3834A8] font-semibold">
              {credits} credits
            </span>
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-[#3834A8]">
            <CreditCard className="w-5 h-5" />
            <div>
              <p className="font-semibold">{statusMessage}</p>
              {redirectInfo && redirectCountdown > 0 && (
                <p className="text-sm text-[#3834A8]/70">
                  Redirecting in {redirectCountdown} second
                  {redirectCountdown === 1 ? "" : "s"}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {(clientError || error) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{clientError || error}</p>
          </div>
        )}

        {/* Redirect Summary */}
        {redirectInfo && (
          <div className="mb-6 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 text-[#2A1B5D]">
              <TimerReset className="w-5 h-5 text-[#3834A8]" />
              <div>
                <p className="font-semibold">
                  You're about to purchase {redirectInfo.credits} credits
                </p>
                <p className="text-gray-600 text-sm">
                  Package: {redirectInfo.packageName} · ₱{redirectInfo.price}
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
              className={`relative bg-white/90 backdrop-blur-sm border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                selectedPackage?.id === pkg.id
                  ? "border-[#3834A8] bg-white shadow-lg"
                  : "border-gray-200 hover:border-[#3834A8]/50"
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Discount Badge */}
              {pkg.discount && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    {pkg.discount}
                  </span>
                </div>
              )}

              {/* Package Content */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#2A1B5D] mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-6 h-6 text-[#3834A8]" />
                    <span className="text-3xl font-bold text-[#2A1B5D]">
                      {pkg.credits}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">credits</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-gray-700 text-sm">
                    ≈{" "}
                    <span className="font-semibold text-[#2A1B5D]">
                      {pkg.certificates}
                    </span>{" "}
                    certificates
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    (2 credits per PDF)
                  </p>
                </div>

                <div className="text-3xl font-bold text-[#3834A8] mb-2">
                  ₱{pkg.price}
                </div>
                <p className="text-gray-500 text-xs">
                  ₱{(pkg.price / pkg.credits).toFixed(2)} per credit
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-4 right-4">
                  <div className="bg-[#3834A8] rounded-full p-1 shadow-md">
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
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] hover:from-[#2A1B5D] hover:to-[#1a1040] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                    ? `Purchase ${selectedPackage.credits} credits for ₱${selectedPackage.price}`
                    : "Select a package"}
                </span>
              </>
            )}
          </button>

          {selectedPackage && !redirectInfo && (
            <p className="text-center text-gray-600 text-sm mt-4">
              After purchase, you'll have{" "}
              <span className="text-[#3834A8] font-semibold">
                {credits + selectedPackage.credits} credits
              </span>
            </p>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#2A1B5D] mb-4">
            How Credits Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="bg-[#3834A8]/10 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-[#3834A8]" />
              </div>
              <div>
                <p className="font-semibold text-[#2A1B5D] mb-1">
                  Generate PDF
                </p>
                <p className="text-gray-500">2 credits per certificate</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#2A1B5D]/10 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-[#2A1B5D]" />
              </div>
              <div>
                <p className="font-semibold text-[#2A1B5D] mb-1">
                  Upload to IPFS
                </p>
                <p className="text-gray-500">1 credit per upload</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-[#2A1B5D] mb-1">
                  Blockchain Upload
                </p>
                <p className="text-gray-500">3 credits per upload</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-[#2A1B5D] mb-1">
                  Validate Certificate
                </p>
                <p className="text-gray-500">1 credit per validation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCredits;
