import { useCallback, useState } from "react";
import useWalletStore from "../store/wallet";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

const getEndpoint = (path) =>
  API_BASE_URL ? `${API_BASE_URL}${path}` : `/api${path}`;

const getDefaultSuccessUrl = () => `${window.location.origin}/payment/success`;
const getDefaultCancelUrl = () => `${window.location.origin}/purchase-credits`;

const buildPayload = (pkg, overrides) => ({
  packageId: overrides?.packageId ?? pkg?.payMongoPackageId ?? pkg?.id,
  successUrl: overrides?.successUrl || getDefaultSuccessUrl(),
  cancelUrl: overrides?.cancelUrl || getDefaultCancelUrl(),
  returnUrl: overrides?.returnUrl || getDefaultSuccessUrl(),
  metadata: {
    credits: pkg?.credits,
    price: pkg?.price,
    name: pkg?.name,
    ...overrides?.metadata,
  },
});

const extractCheckoutUrl = (payload) => {
  if (!payload) return null;

  return (
    payload?.data?.attributes?.checkout_url ||
    payload?.data?.attributes?.checkoutUrl ||
    payload?.checkoutUrl ||
    payload?.data?.checkoutUrl ||
    null
  );
};

const usePayMongoPurchase = () => {
  const { token } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);

  const startCheckout = useCallback(
    async (pkg, overrides = {}) => {
      if (!pkg) {
        throw new Error("A credit package must be selected");
      }

      const packageId =
        overrides?.packageId || pkg?.payMongoPackageId || pkg?.id;

      if (!packageId) {
        throw new Error("Package ID is missing");
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload = buildPayload(pkg, { ...overrides, packageId });
        const response = await fetch(getEndpoint(`/credits/purchase`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Unable to start PayMongo checkout");
        }

        const checkoutUrl =
          extractCheckoutUrl(data) || data?.data?.url || data?.url;
        const checkoutReference =
          data?.data?.checkoutId || data?.checkoutId || data?.data?.id;
        const referenceNumber =
          data?.data?.referenceNumber || data?.referenceNumber;

        if (!checkoutUrl) {
          throw new Error("Checkout URL not provided by server");
        }

        setPendingCheckout({
          checkoutUrl,
          packageId,
          packageName: pkg?.name,
          credits: pkg?.credits,
          price: pkg?.price,
          autoRedirect: overrides?.autoRedirect !== false,
          checkoutReference,
          referenceNumber,
        });

        if (overrides?.autoRedirect !== false) {
          window.location.assign(checkoutUrl);
        }

        return {
          checkoutUrl,
          checkoutReference,
          referenceNumber,
        };
      } catch (err) {
        console.error("PayMongo checkout failed", err);
        const message = err?.message || "Failed to start checkout";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const resetCheckoutState = useCallback(() => {
    setPendingCheckout(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    startCheckout,
    isLoading,
    error,
    pendingCheckout,
    resetCheckoutState,
  };
};

export default usePayMongoPurchase;
