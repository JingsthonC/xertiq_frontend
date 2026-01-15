/**
 * XertiQ Verification Widget
 * Embeddable JavaScript widget for document verification (HubSpot-style)
 * No iframes - Direct DOM injection for seamless integration
 *
 * Usage - Auto-init (Recommended):
 * <div id="xertiq-verify-widget" data-doc="YOUR_DOC_ID"></div>
 * <script src="https://xertiq-frontend.vercel.app/embed-widget.js"></script>
 *
 * Usage - Programmatic:
 * XertiQWidget.init({
 *   container: 'my-widget-container',
 *   docId: 'cert_certificate_Name_123_abc',
 *   apiUrl: 'https://xertiq-backend.onrender.com/api'
 * });
 */

(function () {
  "use strict";

  // Widget namespace
  window.XertiQWidget = window.XertiQWidget || {};

  // Default configuration
  const defaultConfig = {
    apiUrl: "https://xertiq-backend.onrender.com/api",
    container: "xertiq-verify-widget",
    theme: "light",
    width: "100%",
    maxWidth: "800px",
  };

  // Widget state
  let config = { ...defaultConfig };
  let containerElement = null;
  let verificationData = null;
  let loading = false;
  let error = "";

  // Inject CSS styles
  const injectStyles = () => {
    if (document.getElementById("xertiq-widget-styles")) return;

    const styleElement = document.createElement("style");
    styleElement.id = "xertiq-widget-styles";
    styleElement.textContent = `
      .xertiq-widget-container {
        width: 100%;
        max-width: ${config.maxWidth};
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .xertiq-widget-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
      }
      
      .xertiq-widget-header {
        text-align: center;
        margin-bottom: 24px;
      }
      
      .xertiq-widget-icon {
        width: 56px;
        height: 56px;
        background: #2d3748;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }
      
      .xertiq-widget-title {
        font-size: 24px;
        font-weight: bold;
        color: #2d3748;
        margin: 0 0 8px 0;
      }
      
      .xertiq-widget-subtitle {
        font-size: 14px;
        color: #718096;
        margin: 0;
      }
      
      .xertiq-widget-form {
        margin-bottom: 16px;
      }
      
      .xertiq-widget-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #2d3748;
        margin-bottom: 8px;
      }
      
      .xertiq-widget-input-group {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      
      .xertiq-widget-input {
        flex: 1;
        min-width: 200px;
        background: #f7fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        color: #2d3748;
        outline: none;
        transition: all 0.2s;
      }
      
      .xertiq-widget-input:focus {
        border-color: #2d3748;
        background: white;
      }
      
      .xertiq-widget-input::placeholder {
        color: #a0aec0;
      }
      
      .xertiq-widget-button {
        background: #2d3748;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        white-space: nowrap;
      }
      
      .xertiq-widget-button:hover:not(:disabled) {
        background: #1a202c;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .xertiq-widget-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .xertiq-widget-error {
        background: #fff5f5;
        border: 1px solid #feb2b2;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        display: flex;
        align-items: start;
        gap: 12px;
      }
      
      .xertiq-widget-error-text {
        color: #c53030;
        font-size: 14px;
        margin: 0;
      }
      
      .xertiq-widget-result {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .xertiq-widget-status {
        padding: 20px;
        text-align: center;
        color: white;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .xertiq-widget-status-valid {
        background: #48bb78;
      }
      
      .xertiq-widget-status-invalid {
        background: #f56565;
      }
      
      .xertiq-widget-details {
        padding: 24px;
      }
      
      .xertiq-widget-holder-info {
        text-align: center;
        margin-bottom: 24px;
      }
      
      .xertiq-widget-holder-logo {
        width: 64px;
        height: 64px;
        object-fit: contain;
        margin: 0 auto 12px;
      }
      
      .xertiq-widget-holder-name {
        font-size: 20px;
        font-weight: bold;
        color: #2d3748;
        margin: 0 0 4px 0;
      }
      
      .xertiq-widget-holder-title {
        font-size: 14px;
        color: #718096;
        margin: 0;
      }
      
      .xertiq-widget-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .xertiq-widget-info-box {
        background: #f7fafc;
        border-radius: 8px;
        padding: 12px;
      }
      
      .xertiq-widget-info-label {
        font-size: 11px;
        color: #718096;
        margin: 0 0 4px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .xertiq-widget-info-value {
        font-size: 14px;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
      }
      
      .xertiq-widget-verification-checks {
        background: #f0fff4;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }
      
      .xertiq-widget-check-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e6ffed;
      }
      
      .xertiq-widget-check-item:last-child {
        border-bottom: none;
      }
      
      .xertiq-widget-check-label {
        font-size: 13px;
        color: #2d3748;
      }
      
      .xertiq-widget-check-icon {
        width: 16px;
        height: 16px;
      }
      
      .xertiq-widget-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        text-decoration: none;
        transition: all 0.2s;
        margin-bottom: 16px;
      }
      
      .xertiq-widget-link:hover {
        background: white;
        border-color: #2d3748;
      }
      
      .xertiq-widget-link-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .xertiq-widget-link-icon {
        width: 32px;
        height: 32px;
        background: #2d3748;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .xertiq-widget-link-text {
        font-size: 14px;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
      }
      
      .xertiq-widget-link-subtext {
        font-size: 12px;
        color: #718096;
        margin: 0;
      }
      
      .xertiq-widget-branding {
        text-align: center;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }
      
      .xertiq-widget-branding-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 12px;
        color: #718096;
      }
      
      .xertiq-widget-branding-link {
        color: #2d3748;
        font-weight: 600;
        text-decoration: none;
      }
      
      .xertiq-widget-branding-link:hover {
        text-decoration: underline;
      }
      
      .xertiq-widget-branding-subtext {
        font-size: 10px;
        color: #a0aec0;
        margin: 8px 0 0 0;
      }
      
      .xertiq-widget-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: xertiq-spin 0.6s linear infinite;
      }
      
      @keyframes xertiq-spin {
        to { transform: rotate(360deg); }
      }
      
      @media (max-width: 640px) {
        .xertiq-widget-container {
          padding: 12px;
        }
        
        .xertiq-widget-card {
          padding: 16px;
        }
        
        .xertiq-widget-input-group {
          flex-direction: column;
        }
        
        .xertiq-widget-input {
          width: 100%;
          min-width: 100%;
        }
        
        .xertiq-widget-button {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(styleElement);
  };

  // API call to verify document
  const verifyDocument = async (query) => {
    const response = await fetch(
      `${config.apiUrl}/verify?doc=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to verify document");
    }

    return response.json();
  };

  // Render widget UI
  const render = () => {
    if (!containerElement) return;

    let html = "";

    // Show search form
    if (!verificationData) {
      html = `
        <div class="xertiq-widget-card">
          <div class="xertiq-widget-header">
            <div class="xertiq-widget-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h1 class="xertiq-widget-title">Document Verification</h1>
            <p class="xertiq-widget-subtitle">Verify blockchain-secured documents</p>
          </div>
          
          <form class="xertiq-widget-form" id="xertiq-verify-form">
            <label class="xertiq-widget-label">Document ID or Hash</label>
            <div class="xertiq-widget-input-group">
              <input
                type="text"
                class="xertiq-widget-input"
                id="xertiq-search-input"
                placeholder="Enter document ID or hash..."
                ${loading ? "disabled" : ""}
              />
              <button
                type="submit"
                class="xertiq-widget-button"
                ${loading ? "disabled" : ""}
              >
                ${
                  loading
                    ? '<span class="xertiq-widget-spinner"></span>'
                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>'
                }
                <span>${loading ? "Verifying..." : "Verify"}</span>
              </button>
            </div>
          </form>
        </div>
      `;
    }

    // Show error
    if (error) {
      html += `
        <div class="xertiq-widget-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c53030" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p class="xertiq-widget-error-text">${error}</p>
        </div>
      `;
    }

    // Show verification result
    if (verificationData && verificationData.valid) {
      const data = verificationData;
      html += `
        <div class="xertiq-widget-result">
          <div class="xertiq-widget-status xertiq-widget-status-valid">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>✓ Verified</span>
          </div>
          
          <div class="xertiq-widget-details">
            <div class="xertiq-widget-holder-info">
              ${
                data.university?.logo
                  ? `<img src="${data.university.logo}" alt="${data.university.name}" class="xertiq-widget-holder-logo" />`
                  : ""
              }
              <h3 class="xertiq-widget-holder-name">${
                data.holder?.name || "Certificate Holder"
              }</h3>
              <p class="xertiq-widget-holder-title">${
                data.document?.title || "Certificate"
              }</p>
            </div>
            
            <div class="xertiq-widget-grid">
              ${
                data.holder?.dateIssued
                  ? `
                <div class="xertiq-widget-info-box">
                  <p class="xertiq-widget-info-label">Issued</p>
                  <p class="xertiq-widget-info-value">${new Date(
                    data.holder.dateIssued
                  ).toLocaleDateString()}</p>
                </div>
              `
                  : ""
              }
              ${
                data.document?.issuer
                  ? `
                <div class="xertiq-widget-info-box">
                  <p class="xertiq-widget-info-label">Issuer</p>
                  <p class="xertiq-widget-info-value">${data.document.issuer}</p>
                </div>
              `
                  : ""
              }
            </div>
            
            ${
              data.verification?.summary
                ? `
              <div class="xertiq-widget-verification-checks">
                ${[
                  "identityHashValid",
                  "merkleProofValid",
                  "blockchainValid",
                  "overallValid",
                ]
                  .map((key) => {
                    const labels = {
                      identityHashValid: "Identity Hash",
                      merkleProofValid: "Merkle Proof",
                      blockchainValid: "Blockchain",
                      overallValid: "Overall Status",
                    };
                    const isValid = data.verification.summary[key];
                    return `
                    <div class="xertiq-widget-check-item">
                      <span class="xertiq-widget-check-label">${
                        labels[key]
                      }</span>
                      <svg class="xertiq-widget-check-icon" viewBox="0 0 24 24" fill="none" stroke="${
                        isValid ? "#48bb78" : "#f56565"
                      }" stroke-width="2">
                        ${
                          isValid
                            ? '<polyline points="20 6 9 17 4 12"></polyline>'
                            : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
                        }
                      </svg>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            `
                : ""
            }
            
            ${
              data.access?.displayDocument
                ? `
              <a href="${data.access.displayDocument}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-link">
                <div class="xertiq-widget-link-content">
                  <div class="xertiq-widget-link-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p class="xertiq-widget-link-text">View Document</p>
                    <p class="xertiq-widget-link-subtext">PDF File</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            `
                : ""
            }
            
            <button
              class="xertiq-widget-button"
              style="width: 100%; background: rgba(45, 55, 72, 0.1); color: #2d3748; justify-content: center;"
              onclick="XertiQWidget.reset()"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      `;
    }

    // Add branding
    html += `
      <div class="xertiq-widget-branding">
        <div class="xertiq-widget-branding-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>Powered by: <a href="https://xertiq.com" target="_blank" rel="noopener noreferrer" class="xertiq-widget-branding-link">XertiQ</a></span>
        </div>
        <p class="xertiq-widget-branding-subtext">Blockchain-Secured Document Verification</p>
      </div>
    `;

    containerElement.innerHTML = html;

    // Attach event listeners
    const form = document.getElementById("xertiq-verify-form");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const input = document.getElementById("xertiq-search-input");
    const query = input?.value.trim();

    if (!query) {
      error = "Please enter a document ID or hash";
      render();
      return;
    }

    loading = true;
    error = "";
    render();

    try {
      const data = await verifyDocument(query);

      if (data.valid) {
        verificationData = data;
      } else {
        error = "Document not found or invalid";
      }
    } catch (err) {
      console.error("Verification failed:", err);
      error = "Failed to verify document. Please try again.";
    } finally {
      loading = false;
      render();
    }
  };

  // Reset widget
  window.XertiQWidget.reset = () => {
    verificationData = null;
    error = "";
    loading = false;
    render();
  };

  // Initialize widget
  window.XertiQWidget.init = (options = {}) => {
    // Merge config
    config = { ...defaultConfig, ...options };

    // Find container
    const containerId = config.container;
    containerElement = document.getElementById(containerId);

    if (!containerElement) {
      console.error(
        `XertiQ Widget: Container element #${containerId} not found`
      );
      return;
    }

    // Add container class
    containerElement.className = "xertiq-widget-container";

    // Inject styles
    injectStyles();

    // Check for auto-verification
    const autoDocId = containerElement.getAttribute("data-doc") || config.docId;

    if (autoDocId) {
      // Auto-verify on init
      setTimeout(async () => {
        loading = true;
        render();

        try {
          const data = await verifyDocument(autoDocId);

          if (data.valid) {
            verificationData = data;
          } else {
            error = "Document not found or invalid";
          }
        } catch (err) {
          console.error("Auto-verification failed:", err);
          error = "Failed to verify document";
        } finally {
          loading = false;
          render();
        }
      }, 100);
    }

    // Initial render
    render();
  };

  // Auto-initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.getElementById(defaultConfig.container)) {
        window.XertiQWidget.init();
      }
    });
  } else {
    // DOM already loaded
    if (document.getElementById(defaultConfig.container)) {
      window.XertiQWidget.init();
    }
  }
})();
