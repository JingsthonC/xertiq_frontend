/**
 * XertiQ Verification Widget
 * Embeddable JavaScript widget for document verification
 * No iframes - Direct DOM injection
 *
 * Usage:
 * <div id="xertiq-verify-widget" data-doc="YOUR_DOC_ID"></div>
 * <script src="https://your-domain.com/xertiq-widget.js"></script>
 *
 * Or programmatic:
 * XertiQWidget.init({
 *   container: 'xertiq-verify-widget',
 *   docId: 'cert_certificate_Name_123_abc',
 *   apiUrl: 'https://your-api-domain.com'
 * });
 */

(function () {
  "use strict";

  // Widget namespace
  window.XertiQWidget = window.XertiQWidget || {};

  // Default configuration
  const defaultConfig = {
    // Use localhost:3000 by default, or current origin if not file://
    apiUrl:
      window.location.protocol === "file:"
        ? "http://localhost:3000/api"
        : window.location.origin + "/api",
    container: "xertiq-verify-widget",
    theme: "light",
    width: "100%",
    maxWidth: "800px",
  };

  // Asset URLs (hosted on CDN)
  const assets = {
    logo: "https://xertiq-frontend.vercel.app/xertiq_logo.png",
  };

  // Widget state
  let config = { ...defaultConfig };
  let containerElement = null;
  let verificationData = null;
  let loading = false;
  let error = "";

  // Styles for the widget
  const styles = `
    .xertiq-widget-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #EFECE3;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .xertiq-widget-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .xertiq-widget-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .xertiq-widget-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .xertiq-widget-title {
      font-size: 24px;
      font-weight: bold;
      color: #4A70A9;
      margin-bottom: 8px;
    }

    .xertiq-widget-subtitle {
      font-size: 14px;
      color: #4A70A9;
    }

    .xertiq-widget-search-form {
      background: white;
      border: 1px solid rgba(143, 171, 212, 0.4);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }

    .xertiq-widget-form-group {
      margin-bottom: 16px;
    }

    .xertiq-widget-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #4A70A9;
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
      background: #EFECE3;
      border: 2px solid rgba(143, 171, 212, 0.6);
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      color: #000000;
      outline: none;
      transition: all 0.3s;
    }

    .xertiq-widget-input:focus {
      border-color: #4A70A9;
      box-shadow: 0 0 0 3px rgba(74, 112, 169, 0.1);
    }

    .xertiq-widget-input::placeholder {
      color: #8FABD4;
    }

    .xertiq-widget-button {
      background: linear-gradient(135deg, #4A70A9, #3A5A89);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .xertiq-widget-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(74, 112, 169, 0.4);
    }

    .xertiq-widget-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .xertiq-widget-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: xertiq-spin 0.6s linear infinite;
    }

    @keyframes xertiq-spin {
      to { transform: rotate(360deg); }
    }

    .xertiq-widget-error {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .xertiq-widget-error-title {
      font-weight: 600;
      color: #c33;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .xertiq-widget-error-message {
      color: #d44;
      font-size: 14px;
    }

    .xertiq-widget-result {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .xertiq-widget-result-header {
      padding: 20px;
      color: white;
      text-align: center;
    }

    .xertiq-widget-result-header.valid {
      background: linear-gradient(135deg, #4caf50, #45a049);
    }

    .xertiq-widget-result-header.invalid {
      background: linear-gradient(135deg, #f44336, #e53935);
    }

    .xertiq-widget-result-body {
      padding: 24px;
    }

    .xertiq-widget-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
      margin: 0 auto 16px;
      display: block;
    }

    .xertiq-widget-holder-name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin-bottom: 8px;
    }

    .xertiq-widget-doc-title {
      font-size: 14px;
      color: #666;
      text-align: center;
      margin-bottom: 20px;
    }

    .xertiq-widget-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .xertiq-widget-detail-item {
      background: #EFECE3;
      border-radius: 8px;
      padding: 12px;
    }

    .xertiq-widget-detail-label {
      font-size: 12px;
      color: #4A70A9;
      margin-bottom: 4px;
    }

    .xertiq-widget-detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .xertiq-widget-verification-status {
      background: #e8f5e9;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }

    .xertiq-widget-status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 12px;
    }

    .xertiq-widget-status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .xertiq-widget-status-label {
      color: #666;
    }

    .xertiq-widget-status-icon {
      width: 16px;
      height: 16px;
      display: inline-block;
    }

    .xertiq-widget-status-icon.valid {
      color: #4caf50;
    }

    .xertiq-widget-status-icon.invalid {
      color: #f44336;
    }

    .xertiq-widget-doc-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #EFECE3;
      border: 1px solid rgba(143, 171, 212, 0.6);
      border-radius: 8px;
      padding: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s;
      margin-bottom: 16px;
    }

    .xertiq-widget-doc-link:hover {
      background: white;
      border-color: #4A70A9;
    }

    .xertiq-widget-doc-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .xertiq-widget-doc-icon {
      width: 32px;
      height: 32px;
      background: #4A70A9;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .xertiq-widget-back-button {
      width: 100%;
      background: rgba(74, 112, 169, 0.1);
      color: #3A5A89;
      border: 1px solid rgba(74, 112, 169, 0.4);
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .xertiq-widget-back-button:hover {
      background: rgba(74, 112, 169, 0.2);
    }

    .xertiq-widget-branding {
      text-align: center;
      margin-top: 24px;
      padding: 16px 0;
    }

    .xertiq-widget-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 8px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid rgba(143, 171, 212, 0.3);
    }

    .xertiq-widget-badge-icon {
      width: 14px;
      height: 14px;
      color: #4A70A9;
    }

    .xertiq-widget-badge-text {
      font-size: 12px;
      font-weight: 500;
      color: #4A70A9;
    }

    .xertiq-widget-badge-link {
      font-size: 12px;
      font-weight: 700;
      color: #3A5A89;
      text-decoration: none;
      transition: color 0.3s;
    }

    .xertiq-widget-badge-link:hover {
      color: #4A70A9;
    }

    .xertiq-widget-tagline {
      font-size: 10px;
      color: #8FABD4;
      margin-top: 8px;
    }

    @media (max-width: 640px) {
      .xertiq-widget-container {
        padding: 16px;
      }

      .xertiq-widget-input-group {
        flex-direction: column;
      }

      .xertiq-widget-input {
        min-width: 100%;
      }

      .xertiq-widget-details-grid {
        grid-template-columns: 1fr;
      }

      .xertiq-widget-status-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  // SVG Icons
  const icons = {
    shield:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    search:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    check:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    externalLink:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    shieldSmall:
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  };

  // API Functions
  async function verifyDocument(query) {
    const apiUrl = config.apiUrl || window.location.origin + "/api";
    const response = await fetch(
      `${apiUrl}/verify?doc=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Verification request failed");
    }

    return await response.json();
  }

  // Render Functions
  function renderSearchForm(searchQuery = "") {
    return `
      <div class="xertiq-widget-search-form">
        <form id="xertiq-search-form">
          <div class="xertiq-widget-form-group">
            <label class="xertiq-widget-label">Document ID or Hash</label>
            <div class="xertiq-widget-input-group">
              <input 
                type="text" 
                id="xertiq-search-input"
                class="xertiq-widget-input" 
                placeholder="Enter document ID or hash..."
                value="${searchQuery}"
                ${loading ? "disabled" : ""}
              />
              <button 
                type="submit" 
                class="xertiq-widget-button"
                ${loading ? "disabled" : ""}
              >
                ${
                  loading
                    ? '<div class="xertiq-widget-spinner"></div><span>Verifying...</span>'
                    : icons.search + "<span>Verify</span>"
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  function renderError() {
    return `
      <div class="xertiq-widget-error">
        <div class="xertiq-widget-error-title">Verification Failed</div>
        <div class="xertiq-widget-error-message">${error}</div>
      </div>
    `;
  }

  function renderVerificationResult() {
    if (!verificationData) return "";

    const isValid = verificationData.valid;
    const holder = verificationData.holder || {};
    const document = verificationData.document || {};
    const university = verificationData.university || {};
    const verification = verificationData.verification || {};
    const access = verificationData.access || {};

    return `
      <div class="xertiq-widget-result">
        <div class="xertiq-widget-result-header ${
          isValid ? "valid" : "invalid"
        }">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${isValid ? icons.check : icons.x}
            <h2 style="font-size: 20px; font-weight: bold; margin: 0;">
              ${isValid ? "✓ Verified" : "✗ Invalid"}
            </h2>
          </div>
        </div>

        ${
          isValid
            ? `
          <div class="xertiq-widget-result-body">
            ${
              university.logo
                ? `
              <img src="${university.logo}" alt="${
                university.name || "University"
              }" class="xertiq-widget-logo" />
            `
                : ""
            }
            
            <div class="xertiq-widget-holder-name">${
              holder.name || "Certificate Holder"
            }</div>
            <div class="xertiq-widget-doc-title">${
              document.title || "Certificate"
            }</div>

            <div class="xertiq-widget-details-grid">
              ${
                holder.dateIssued
                  ? `
                <div class="xertiq-widget-detail-item">
                  <div class="xertiq-widget-detail-label">Issued</div>
                  <div class="xertiq-widget-detail-value">
                    ${new Date(holder.dateIssued).toLocaleDateString()}
                  </div>
                </div>
              `
                  : ""
              }
              ${
                document.issuer
                  ? `
                <div class="xertiq-widget-detail-item">
                  <div class="xertiq-widget-detail-label">Issuer</div>
                  <div class="xertiq-widget-detail-value">${document.issuer}</div>
                </div>
              `
                  : ""
              }
            </div>

            ${
              verification.summary
                ? `
              <div class="xertiq-widget-verification-status">
                <div class="xertiq-widget-status-grid">
                  ${[
                    "identityHashValid",
                    "merkleProofValid",
                    "blockchainValid",
                    "overallValid",
                  ]
                    .map((key) => {
                      const labels = {
                        identityHashValid: "Identity",
                        merkleProofValid: "Merkle",
                        blockchainValid: "Blockchain",
                        overallValid: "Overall",
                      };
                      const isValid = verification.summary[key];
                      return `
                      <div class="xertiq-widget-status-item">
                        <span class="xertiq-widget-status-label">${
                          labels[key]
                        }:</span>
                        <span class="xertiq-widget-status-icon ${
                          isValid ? "valid" : "invalid"
                        }">
                          ${isValid ? "✓" : "✗"}
                        </span>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            ${
              access.displayDocument && access.displayDocument !== "null"
                ? `
              <a href="${access.displayDocument}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-doc-link">
                <div class="xertiq-widget-doc-info">
                  <div class="xertiq-widget-doc-icon">${icons.file}</div>
                  <div>
                    <div style="font-weight: 600; font-size: 14px; color: #333;">View Document</div>
                    <div style="font-size: 12px; color: #666;">PDF File</div>
                  </div>
                </div>
                ${icons.externalLink}
              </a>
            `
                : ""
            }

            <button class="xertiq-widget-back-button" id="xertiq-back-button">
              Verify Another Document
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  function renderWidget() {
    return `
      <div class="xertiq-widget-container">
        <div class="xertiq-widget-header">
          <div class="xertiq-widget-icon"><img src="${assets.logo}" alt="XertiQ" /></div>
          <div class="xertiq-widget-title">Document Verification</div>
          <div class="xertiq-widget-subtitle">Verify blockchain-secured documents</div>
        </div>

        ${!verificationData ? renderSearchForm() : ""}
        ${error ? renderError() : ""}
        ${verificationData ? renderVerificationResult() : ""}

        <div class="xertiq-widget-branding">
          <div class="xertiq-widget-badge">
            <img src="${assets.logo}" alt="XertiQ" style="width: 16px; height: 16px; object-fit: contain;" />
            <span class="xertiq-widget-badge-text">Powered by:</span>
            <a href="https://xertiq.com" target="_blank" rel="noopener noreferrer" class="xertiq-widget-badge-link">
              XertiQ
            </a>
          </div>
          <div class="xertiq-widget-tagline">Blockchain-Secured Document Verification</div>
        </div>
      </div>
    `;
  }

  function attachEventListeners() {
    const form = containerElement.querySelector("#xertiq-search-form");
    const input = containerElement.querySelector("#xertiq-search-input");
    const backButton = containerElement.querySelector("#xertiq-back-button");

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          await handleVerification(query);
        }
      });
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        verificationData = null;
        error = "";
        render();
      });
    }
  }

  async function handleVerification(query) {
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
        error = "";
      } else {
        error = "Document not found or invalid";
        verificationData = null;
      }
    } catch (err) {
      console.error("Verification failed:", err);
      error = "Failed to verify document. Please try again.";
      verificationData = null;
    } finally {
      loading = false;
      render();
    }
  }

  function render() {
    if (!containerElement) return;

    containerElement.innerHTML = renderWidget();
    attachEventListeners();
  }

  function injectStyles() {
    const styleId = "xertiq-widget-styles";
    if (document.getElementById(styleId)) return;

    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Public API
  window.XertiQWidget.init = function (options = {}) {
    config = { ...defaultConfig, ...options };

    // Find container
    const containerId = config.container || "xertiq-verify-widget";
    containerElement =
      typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;

    if (!containerElement) {
      console.error(
        `XertiQ Widget: Container element "${containerId}" not found`,
      );
      return;
    }

    // Inject styles
    injectStyles();

    // Auto-verify if docId is provided
    if (config.docId) {
      handleVerification(config.docId);
    } else {
      render();
    }
  };

  // Auto-initialize if widget container exists
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  function autoInit() {
    const widgets = document.querySelectorAll('[id^="xertiq-verify-widget"]');
    widgets.forEach((widget) => {
      const docId =
        widget.getAttribute("data-doc") ||
        widget.getAttribute("data-document-id");
      const apiUrl = widget.getAttribute("data-api-url");

      window.XertiQWidget.init({
        container: widget.id || widget,
        docId: docId,
        apiUrl: apiUrl,
      });
    });
  }
})();
