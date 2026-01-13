import React, { useEffect, useState, useRef } from "react";
import { X, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";

/**
 * PDF Preview Overlay Component
 * Displays a live PDF preview overlay on top of the canvas
 * Shows exactly what the final PDF will look like
 */
const PDFPreviewOverlay = ({
  pdfBlobUrl,
  isVisible,
  onClose,
  canvasWidth,
  canvasHeight,
  canvasScale = 1,
  opacity = 0.8,
  onOpacityChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentOpacity, setCurrentOpacity] = useState(opacity);
  const iframeRef = useRef(null);

  useEffect(() => {
    setCurrentOpacity(opacity);
  }, [opacity]);

  const handleOpacityChange = (newOpacity) => {
    setCurrentOpacity(newOpacity);
    if (onOpacityChange) {
      onOpacityChange(newOpacity);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isVisible || !pdfBlobUrl) {
    return null;
  }

  // Calculate overlay dimensions to match canvas display size
  const overlayWidth = canvasWidth * canvasScale;
  const overlayHeight = canvasHeight * canvasScale;

  if (!isVisible || !pdfBlobUrl) {
    return null;
  }

  return (
    <>
      {/* Preview Overlay - Positioned over canvas */}
      <div
        className={`absolute z-30 transition-all duration-300 ${
          isFullscreen ? "fixed inset-4" : "left-0 top-0"
        }`}
        style={{
          width: isFullscreen ? "calc(100% - 2rem)" : `${overlayWidth}px`,
          height: isFullscreen ? "calc(100% - 2rem)" : `${overlayHeight}px`,
          maxWidth: isFullscreen ? "none" : "100%",
          maxHeight: isFullscreen ? "none" : "100%",
          pointerEvents: currentOpacity < 0.3 ? "none" : "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-white/20 rounded-t-xl p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="text-[#4A70A9]" size={18} />
              <span className="text-white font-semibold text-sm">
                PDF Preview
              </span>
              <span className="text-xs text-gray-400">
                (What you see is what you get)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Opacity Control */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-700/50 rounded-lg">
              <EyeOff size={14} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={currentOpacity * 100}
                onChange={(e) =>
                  handleOpacityChange(parseInt(e.target.value) / 100)
                }
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4A70A9 0%, #4A70A9 ${
                    currentOpacity * 100
                  }%, #4b5563 ${currentOpacity * 100}%, #4b5563 100%)`,
                }}
              />
              <span className="text-xs text-gray-300 w-8">
                {Math.round(currentOpacity * 100)}%
              </span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 size={18} className="text-gray-300" />
              ) : (
                <Maximize2 size={18} className="text-gray-300" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X size={18} className="text-gray-300 hover:text-red-400" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div
            className="bg-white rounded-b-xl shadow-2xl overflow-hidden"
            style={{
              height: isFullscreen
                ? "calc(100% - 3.5rem)"
                : `calc(${overlayHeight}px - 3.5rem)`,
              opacity: currentOpacity,
              transition: "opacity 0.2s",
            }}
          >
            {pdfBlobUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
                style={{
                  pointerEvents: currentOpacity < 0.5 ? "none" : "auto",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Generating preview...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PDFPreviewOverlay;
