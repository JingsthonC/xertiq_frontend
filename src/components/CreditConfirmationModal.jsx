import React from "react";
import { X, Coins, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { CREDIT_COSTS } from "../services/api";

const CreditConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  operation,
  count = 1,
  currentBalance,
  loading = false,
}) => {
  if (!isOpen) return null;

  const operationLabels = {
    generatePDF: "Generate PDF Certificate",
    uploadToIPFS: "Upload to IPFS",
    uploadToBlockChain: "Upload to Blockchain",
    validateCertificate: "Validate Certificate",
  };

  const cost = (CREDIT_COSTS[operation] || 0) * count;
  const newBalance = currentBalance - cost;
  const isInsufficient = newBalance < 0;

  const handleConfirm = () => {
    if (!isInsufficient && !loading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Credit Usage
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Operation Details */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="mt-1">
              {isInsufficient ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {operationLabels[operation] || operation}
              </p>
              {count > 1 && (
                <p className="text-sm text-gray-600 mt-1">
                  Processing {count} certificate{count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Credit Calculation */}
          <div className="space-y-3">
            {/* Cost Per Item */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cost per certificate:</span>
              <div className="flex items-center gap-1 font-medium">
                <Coins className="w-4 h-4 text-gray-400" />
                <span>{CREDIT_COSTS[operation] || 0}</span>
              </div>
            </div>

            {/* Quantity */}
            {count > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">× {count}</span>
              </div>
            )}

            <div className="border-t pt-3">
              {/* Total Cost */}
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">Total Cost:</span>
                <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                  <Coins className="w-5 h-5" />
                  <span>{cost}</span>
                </div>
              </div>

              {/* Balance Change */}
              <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Current balance:
                  </span>
                  <span className="font-semibold">{currentBalance}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">New balance:</span>
                  <span
                    className={`font-semibold ${
                      isInsufficient ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {newBalance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insufficient Credits Warning */}
          {isInsufficient && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Insufficient Credits</p>
                <p className="text-sm text-red-700 mt-1">
                  You need {Math.abs(newBalance)} more credits to complete this
                  operation.
                </p>
              </div>
            </div>
          )}

          {/* Low Balance Warning */}
          {!isInsufficient && newBalance < 10 && newBalance >= 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Your balance will be low after this operation. Consider
                purchasing more credits.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {isInsufficient ? (
            <button
              onClick={() => {
                onClose();
                // Open purchase credits in new tab or navigate
                window.open("/purchase-credits", "_blank");
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Purchase Credits
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Confirm & Proceed</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditConfirmationModal;
