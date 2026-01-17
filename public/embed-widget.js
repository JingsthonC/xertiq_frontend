/**
 * XertiQ Verification Widget
 * Standalone embeddable widget matching Verify.jsx exactly
 *
 * Usage - Auto-init:
 * <div id="xertiq-verify-widget" data-doc="YOUR_DOC_ID"></div>
 * <script src="https://xertiq-frontend.vercel.app/embed-widget.js"></script>
 *
 * Usage - Programmatic:
 * XertiQWidget.init({
 *   container: 'my-widget-container',
 *   docId: 'cert_certificate_Name_123_abc'
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
  };

  // Widget state
  let config = { ...defaultConfig };
  let containerElement = null;
  let verificationData = null;
  let loading = false;
  let error = "";
  let searchQuery = "";
  let copied = false;
  let showDocumentPreview = false;
  let showBatchTransaction = false;
  let showHolderTransaction = false;

  // SVG Icons (inline to avoid external dependencies)
  const icons = {
    shield:
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    checkCircle:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    alertCircle:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    search:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    loader:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    check:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    externalLink:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    fileText:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    download:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    hash: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',
    graduationCap:
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>',
    chevronDown:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    chevronUp:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  };

  // Inject CSS styles matching Verify.jsx
  const injectStyles = () => {
    if (document.getElementById("xertiq-widget-styles")) return;

    const styleElement = document.createElement("style");
    styleElement.id = "xertiq-widget-styles";
    styleElement.textContent = `
      /* Base Widget Styles */
      .xertiq-widget-container {
        width: 100%;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        padding: 1rem;
        box-sizing: border-box;
        background: #f7fafc;
        min-height: 200px;
      }

      .xertiq-widget-inner {
        max-width: 64rem;
        margin: 0 auto;
      }

      /* Header */
      .xertiq-widget-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .xertiq-widget-icon {
        width: 64px;
        height: 64px;
        background: #2d3748;
        border-radius: 1rem;
        display: inline-flex;
        align-items: center;
        justify-center;
        margin-bottom: 1rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .xertiq-widget-icon svg {
        color: white;
      }

      .xertiq-widget-title {
        font-size: 1.875rem;
        font-weight: bold;
        color: #2d3748;
        margin: 0 0 0.5rem 0;
      }

      .xertiq-widget-subtitle {
        font-size: 0.875rem;
        color: #4a5568;
        margin: 0;
      }

      /* Search Form */
      .xertiq-widget-search-card {
        background: white;
        border: 1px solid rgba(74, 85, 104, 0.4);
        border-radius: 1rem;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }

      .xertiq-widget-form-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      .xertiq-widget-input-group {
        display: flex;
        gap: 1rem;
        flex-direction: column;
      }

      @media (min-width: 640px) {
        .xertiq-widget-input-group {
          flex-direction: row;
        }
      }

      .xertiq-widget-input {
        flex: 1;
        background: #f7fafc;
        border: 2px solid rgba(74, 85, 104, 0.6);
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        color: #000000;
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s;
      }

      .xertiq-widget-input:focus {
        ring: 2px;
        ring-color: rgba(45, 55, 72, 0.4);
        border-color: rgba(45, 55, 72, 0.6);
      }

      .xertiq-widget-input::placeholder {
        color: #718096;
      }

      .xertiq-widget-button {
        background: #2d3748;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        transition: background 0.2s;
      }

      .xertiq-widget-button:hover:not(:disabled) {
        background: #1a202c;
      }

      .xertiq-widget-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .xertiq-widget-button svg {
        flex-shrink: 0;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .xertiq-widget-spinner {
        animation: spin 1s linear infinite;
      }

      /* Error Message */
      .xertiq-widget-error {
        background: #fff5f5;
        border: 1px solid #feb2b2;
        border-radius: 1rem;
        padding: 1rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .xertiq-widget-error svg {
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .xertiq-widget-error-text {
        color: #c53030;
        font-size: 0.875rem;
        margin: 0;
      }

      /* Status Header */
      .xertiq-widget-status-header {
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .xertiq-widget-status-header.valid {
        background: #f0fff4;
        border: 1px solid #9ae6b4;
      }

      .xertiq-widget-status-header.invalid {
        background: #fff5f5;
        border: 1px solid #feb2b2;
      }

      .xertiq-widget-status-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .xertiq-widget-status-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0 0 0.25rem 0;
      }

      .xertiq-widget-status-title.valid {
        color: #22543d;
      }

      .xertiq-widget-status-title.invalid {
        color: #742a2a;
      }

      .xertiq-widget-status-subtitle {
        font-size: 0.875rem;
        margin: 0;
      }

      .xertiq-widget-status-subtitle.valid {
        color: #276749;
      }

      .xertiq-widget-status-subtitle.invalid {
        color: #9b2c2c;
      }

      /* Certificate Card */
      .xertiq-widget-certificate {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        margin-bottom: 1.5rem;
      }

      .xertiq-widget-cert-header {
        background: linear-gradient(to right, #2d3748, #1a202c);
        padding: 1.5rem;
        color: white;
        text-align: center;
      }

      .xertiq-widget-cert-header-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .xertiq-widget-cert-header-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
      }

      /* University Section */
      .xertiq-widget-university {
        padding: 2rem;
        border-bottom: 1px solid #e2e8f0;
        text-align: center;
      }

      .xertiq-widget-university-logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 1rem;
        object-fit: contain;
      }

      .xertiq-widget-university-logo-placeholder {
        width: 80px;
        height: 80px;
        background: linear-gradient(to bottom right, #2d3748, #1a202c);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
      }

      .xertiq-widget-university-logo-placeholder svg {
        color: white;
      }

      .xertiq-widget-university-name {
        font-size: 1.875rem;
        font-weight: bold;
        color: #1a202c;
        margin: 0 0 0.25rem 0;
      }

      .xertiq-widget-university-domain {
        font-size: 0.875rem;
        color: #718096;
        margin: 0;
      }

      /* Details Grid */
      .xertiq-widget-details-section {
        padding: 2rem;
        background: #f7fafc;
      }

      .xertiq-widget-details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      @media (min-width: 640px) {
        .xertiq-widget-details-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .xertiq-widget-detail-box {
        background: white;
        border-radius: 0.75rem;
        padding: 1rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }

      .xertiq-widget-detail-box.full-width {
        grid-column: 1 / -1;
      }

      .xertiq-widget-detail-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 0.25rem 0;
      }

      .xertiq-widget-detail-value {
        font-size: 1.125rem;
        font-weight: bold;
        color: #1a202c;
        margin: 0;
        word-break: break-all;
      }

      .xertiq-widget-detail-value.mono {
        font-family: monospace;
        font-size: 1rem;
      }

      /* Files Section */
      .xertiq-widget-files-section {
        padding: 2rem;
        background: white;
        border-top: 1px solid #e2e8f0;
      }

      .xertiq-widget-section-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: #1a202c;
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .xertiq-widget-file-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .xertiq-widget-file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f7fafc;
        border: 1px solid rgba(74, 85, 104, 0.6);
        border-radius: 0.75rem;
        padding: 1rem;
        text-decoration: none;
        transition: all 0.2s;
      }

      .xertiq-widget-file-item:hover {
        background: white;
      }

      .xertiq-widget-file-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .xertiq-widget-file-icon {
        width: 40px;
        height: 40px;
        background: #2d3748;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .xertiq-widget-file-icon svg {
        color: white;
      }

      .xertiq-widget-file-name {
        font-weight: 600;
        color: #1a202c;
        margin: 0 0 0.125rem 0;
        font-size: 0.875rem;
      }

      .xertiq-widget-file-item:hover .xertiq-widget-file-name {
        color: #2d3748;
      }

      .xertiq-widget-file-size {
        font-size: 0.75rem;
        color: #718096;
        margin: 0;
      }

      .xertiq-widget-file-external {
        color: #a0aec0;
        transition: color 0.2s;
      }

      .xertiq-widget-file-item:hover .xertiq-widget-file-external {
        color: #2d3748;
      }

      /* Accordion Styles */
      .xertiq-widget-accordion {
        background: white;
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1rem;
        border: 1px solid #e2e8f0;
      }

      .xertiq-widget-accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        cursor: pointer;
        transition: background 0.2s;
      }

      .xertiq-widget-accordion-header:hover {
        background: rgba(0, 0, 0, 0.02);
      }

      .xertiq-widget-accordion-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .xertiq-widget-accordion-icon {
        width: 40px;
        height: 40px;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .xertiq-widget-accordion-icon.purple {
        background: linear-gradient(135deg, #3834A8, #2A1B5D);
      }

      .xertiq-widget-accordion-icon.amber {
        background: linear-gradient(135deg, #f59e0b, #ea580c);
      }

      .xertiq-widget-accordion-icon.teal {
        background: linear-gradient(135deg, #14b8a6, #10b981);
      }

      .xertiq-widget-accordion-icon svg {
        color: white;
      }

      .xertiq-widget-accordion-title {
        font-weight: 600;
        color: #1a202c;
        margin: 0 0 0.125rem 0;
        font-size: 0.9rem;
      }

      .xertiq-widget-accordion-subtitle {
        font-size: 0.75rem;
        color: #718096;
        margin: 0;
      }

      .xertiq-widget-accordion-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .xertiq-widget-accordion-btn {
        padding: 0.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .xertiq-widget-accordion-btn:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .xertiq-widget-accordion-content {
        border-top: 1px solid #e2e8f0;
        background: #f7fafc;
        padding: 1rem;
      }

      .xertiq-widget-iframe-container {
        background: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .xertiq-widget-iframe {
        width: 100%;
        height: 500px;
        border: none;
      }

      .xertiq-widget-iframe.pdf {
        height: 600px;
      }

      .xertiq-widget-accordion-footer {
        margin-top: 1rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .xertiq-widget-accordion-url {
        flex: 1;
        min-width: 0;
        font-size: 0.75rem;
        color: #718096;
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .xertiq-widget-accordion-actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .xertiq-widget-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      }

      .xertiq-widget-action-btn.outline {
        background: rgba(56, 52, 168, 0.1);
        color: #3834A8;
      }

      .xertiq-widget-action-btn.outline:hover {
        background: rgba(56, 52, 168, 0.2);
      }

      .xertiq-widget-action-btn.outline.amber {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }

      .xertiq-widget-action-btn.outline.amber:hover {
        background: rgba(245, 158, 11, 0.2);
      }

      .xertiq-widget-action-btn.outline.teal {
        background: rgba(20, 184, 166, 0.1);
        color: #0d9488;
      }

      .xertiq-widget-action-btn.outline.teal:hover {
        background: rgba(20, 184, 166, 0.2);
      }

      .xertiq-widget-action-btn.solid {
        background: #3834A8;
        color: white;
      }

      .xertiq-widget-action-btn.solid:hover {
        background: #2A1B5D;
      }

      .xertiq-widget-action-btn.solid.amber {
        background: #f59e0b;
      }

      .xertiq-widget-action-btn.solid.amber:hover {
        background: #d97706;
      }

      .xertiq-widget-action-btn.solid.teal {
        background: #14b8a6;
      }

      .xertiq-widget-action-btn.solid.teal:hover {
        background: #0d9488;
      }

      /* Info Card */
      .xertiq-widget-info-card {
        background: white;
        border: 1px solid rgba(74, 85, 104, 0.5);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }

      /* Hash Box */
      .xertiq-widget-hash-box {
        background: #f7fafc;
        border-radius: 0.75rem;
        padding: 1rem;
        border: 1px solid rgba(74, 85, 104, 0.4);
        margin-bottom: 1rem;
      }

      .xertiq-widget-hash-box:last-child {
        margin-bottom: 0;
      }

      .xertiq-widget-hash-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }

      .xertiq-widget-hash-label {
        font-size: 0.875rem;
        color: #2d3748;
        margin: 0;
      }

      .xertiq-widget-copy-btn {
        padding: 0.25rem;
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: 0.25rem;
        transition: background 0.2s;
      }

      .xertiq-widget-copy-btn:hover {
        background: white;
      }

      .xertiq-widget-copy-btn svg {
        display: block;
      }

      .xertiq-widget-hash-value {
        color: #000000;
        font-family: monospace;
        font-size: 0.875rem;
        word-break: break-all;
        margin: 0;
      }

      /* Blockchain Info */
      .xertiq-widget-blockchain-value {
        color: #000000;
        font-size: 0.875rem;
        font-weight: 500;
        margin: 0;
      }

      .xertiq-widget-explorer-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(45, 55, 72, 0.1);
        border: 1px solid rgba(45, 55, 72, 0.4);
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        color: #1a202c;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        transition: background 0.2s;
      }

      .xertiq-widget-explorer-link:hover {
        background: rgba(45, 55, 72, 0.2);
      }

      /* Verification Steps */
      .xertiq-widget-step {
        background: #f7fafc;
        border-radius: 0.75rem;
        padding: 1rem;
        border: 1px solid rgba(74, 85, 104, 0.4);
        margin-bottom: 1rem;
      }

      .xertiq-widget-step:last-child {
        margin-bottom: 0;
      }

      .xertiq-widget-step-content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .xertiq-widget-step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: bold;
        flex-shrink: 0;
      }

      .xertiq-widget-step-number.valid {
        background: #48bb78;
        color: white;
      }

      .xertiq-widget-step-number.invalid {
        background: #f56565;
        color: white;
      }

      .xertiq-widget-step-info {
        flex: 1;
        min-width: 0;
      }

      .xertiq-widget-step-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }

      .xertiq-widget-step-name {
        color: #000000;
        font-weight: 600;
        font-size: 0.875rem;
        margin: 0;
      }

      .xertiq-widget-step-status {
        flex-shrink: 0;
        margin-left: 0.5rem;
      }

      .xertiq-widget-step-message {
        font-size: 0.875rem;
        margin: 0;
      }

      .xertiq-widget-step-message.valid {
        color: #276749;
      }

      .xertiq-widget-step-message.invalid {
        color: #9b2c2c;
      }

      /* Summary Grid */
      .xertiq-widget-summary-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 640px) {
        .xertiq-widget-summary-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .xertiq-widget-summary-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f7fafc;
        border-radius: 0.75rem;
        padding: 0.75rem;
        border: 1px solid rgba(74, 85, 104, 0.4);
      }

      .xertiq-widget-summary-label {
        color: #2d3748;
        font-size: 0.875rem;
        margin: 0;
      }

      .xertiq-widget-summary-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .xertiq-widget-summary-text {
        font-size: 0.875rem;
        font-weight: 500;
        margin: 0;
      }

      .xertiq-widget-summary-text.valid {
        color: #276749;
      }

      .xertiq-widget-summary-text.invalid {
        color: #9b2c2c;
      }

      /* Footer */
      .xertiq-widget-footer {
        text-align: center;
        margin-top: 3rem;
        padding: 1rem 0;
      }

      .xertiq-widget-powered-by {
        display: inline-flex;
        align-items: center;
        justify-center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(4px);
        border-radius: 9999px;
        padding: 0.625rem 1.25rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(74, 85, 104, 0.3);
        margin-bottom: 0.5rem;
      }

      .xertiq-widget-powered-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #2d3748;
        margin: 0;
      }

      .xertiq-widget-brand-link {
        font-size: 0.875rem;
        font-weight: bold;
        color: #1a202c;
        text-decoration: none;
        transition: color 0.2s;
      }

      .xertiq-widget-brand-link:hover {
        color: #2d3748;
      }

      .xertiq-widget-tagline {
        font-size: 0.75rem;
        color: #718096;
        margin: 0;
      }

      @media (min-width: 640px) {
        .xertiq-widget-title {
          font-size: 2.25rem;
        }
        .xertiq-widget-icon {
          width: 80px;
          height: 80px;
        }
      }
    `;

    document.head.appendChild(styleElement);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      copied = true;
      render();
      setTimeout(() => {
        copied = false;
        render();
      }, 2000);
    });
  };

  // Verify document
  const verifyDocument = async (query) => {
    if (!query) {
      error = "Please enter a document ID or hash";
      render();
      return;
    }

    loading = true;
    error = "";
    render();

    try {
      const response = await fetch(
        `${config.apiUrl}/verify?doc=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to verify document");
      }

      const data = await response.json();

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
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("xertiq-search-input");
    if (input) {
      verifyDocument(input.value);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Render widget
  const render = () => {
    if (!containerElement) return;

    let html = '<div class="xertiq-widget-inner">';

    // Header
    html += `
      <div class="xertiq-widget-header">
        <div class="xertiq-widget-icon">
          ${icons.shield}
        </div>
        <h1 class="xertiq-widget-title">Document Verification</h1>
        <p class="xertiq-widget-subtitle">Verify blockchain-secured documents instantly</p>
      </div>
    `;

    // Search form (show only if no verification data)
    if (!verificationData) {
      html += `
        <div class="xertiq-widget-search-card">
          <form id="xertiq-verify-form">
            <label class="xertiq-widget-form-label">Document ID or Hash</label>
            <div class="xertiq-widget-input-group">
              <input
                type="text"
                class="xertiq-widget-input"
                id="xertiq-search-input"
                placeholder="Enter document ID or verification hash..."
                ${loading ? "disabled" : ""}
                value="${searchQuery}"
              />
              <button
                type="submit"
                class="xertiq-widget-button"
                ${loading ? "disabled" : ""}
              >
                ${
                  loading
                    ? `<span class="xertiq-widget-spinner">${icons.loader}</span>`
                    : icons.search
                }
                <span>${loading ? "Verifying..." : "Verify"}</span>
              </button>
            </div>
          </form>
        </div>
      `;
    }

    // Error message
    if (error) {
      html += `
        <div class="xertiq-widget-error">
          ${icons.alertCircle}
          <p class="xertiq-widget-error-text">${error}</p>
        </div>
      `;
    }

    // Verification results
    if (verificationData && verificationData.valid) {
      const data = verificationData;

      // Status header
      html += `
        <div class="xertiq-widget-status-header valid">
          <div class="xertiq-widget-status-content">
            ${icons.checkCircle}
            <div>
              <h2 class="xertiq-widget-status-title valid">✓ Valid Verification Code</h2>
              <p class="xertiq-widget-status-subtitle valid">
                The following details are confirmed by verify.demo-university.com
              </p>
            </div>
          </div>
        </div>
      `;

      // Certificate card
      html += '<div class="xertiq-widget-certificate">';

      // Certificate header
      html += `
        <div class="xertiq-widget-cert-header">
          <div class="xertiq-widget-cert-header-content">
            ${icons.checkCircle}
            <h2 class="xertiq-widget-cert-header-title">Valid Verification Code</h2>
          </div>
        </div>
      `;

      // University section
      const universityName =
        data.university?.name || data.document?.issuer || "Demo University";
      const universityDomain = data.university?.name
        ? `verify.${data.university.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.com`
        : "verify.demo-university.com";

      html += `
        <div class="xertiq-widget-university">
          ${
            data.university?.logo
              ? `<img src="${data.university.logo}" alt="${universityName}" class="xertiq-widget-university-logo" />`
              : `<div class="xertiq-widget-university-logo-placeholder">${icons.graduationCap}</div>`
          }
          <h1 class="xertiq-widget-university-name">${universityName}</h1>
          <p class="xertiq-widget-university-domain">The following details are confirmed by: ${universityDomain}</p>
        </div>
      `;

      // Details grid
      html += '<div class="xertiq-widget-details-section">';
      html += '<div class="xertiq-widget-details-grid">';

      // Student name
      html += `
        <div class="xertiq-widget-detail-box">
          <p class="xertiq-widget-detail-label">Name</p>
          <p class="xertiq-widget-detail-value">
            ${data.holder?.name || data.document?.studentName || "N/A"}
          </p>
        </div>
      `;

      // Student number
      if (data.holder?.studentNumber) {
        html += `
          <div class="xertiq-widget-detail-box">
            <p class="xertiq-widget-detail-label">Student Number</p>
            <p class="xertiq-widget-detail-value">${data.holder.studentNumber}</p>
          </div>
        `;
      }

      // Degree
      if (data.document?.degree) {
        html += `
          <div class="xertiq-widget-detail-box">
            <p class="xertiq-widget-detail-label">Degree</p>
            <p class="xertiq-widget-detail-value">${data.document.degree}</p>
          </div>
        `;
      }

      // Batch number
      if (data.batch?.batchId) {
        html += `
          <div class="xertiq-widget-detail-box">
            <p class="xertiq-widget-detail-label">Batch Number</p>
            <p class="xertiq-widget-detail-value mono">${data.batch.batchId}</p>
          </div>
        `;
      }

      // Document code
      html += `
        <div class="xertiq-widget-detail-box full-width">
          <p class="xertiq-widget-detail-label">Document Code / Serial Number</p>
          <p class="xertiq-widget-detail-value mono">${data.docId}</p>
        </div>
      `;

      // Grade
      if (data.document?.grade) {
        html += `
          <div class="xertiq-widget-detail-box">
            <p class="xertiq-widget-detail-label">Grade</p>
            <p class="xertiq-widget-detail-value">${data.document.grade}</p>
          </div>
        `;
      }

      // Date of graduation
      if (data.document?.issuedAt) {
        html += `
          <div class="xertiq-widget-detail-box">
            <p class="xertiq-widget-detail-label">Date of Graduation</p>
            <p class="xertiq-widget-detail-value">${formatDate(
              data.document.issuedAt,
            )}</p>
          </div>
        `;
      }

      html += "</div>"; // End details grid
      html += "</div>"; // End details section

      // Viewable files with Accordions
      if (data.access) {
        html += '<div class="xertiq-widget-files-section">';
        html += `
          <h3 class="xertiq-widget-section-title">
            ${icons.fileText}
            <span>Document Access & Blockchain Links</span>
          </h3>
        `;

        // Original Document Accordion
        if (
          data.access.canonicalDocument &&
          !data.access.canonicalDocument.includes("/null")
        ) {
          html += `
            <div class="xertiq-widget-accordion" id="doc-accordion">
              <div class="xertiq-widget-accordion-header" onclick="XertiQWidget.toggleAccordion('document')">
                <div class="xertiq-widget-accordion-left">
                  <div class="xertiq-widget-accordion-icon purple">
                    ${icons.fileText}
                  </div>
                  <div>
                    <p class="xertiq-widget-accordion-title">Original Document (IPFS)</p>
                    <p class="xertiq-widget-accordion-subtitle">${showDocumentPreview ? "Click to hide preview" : "Click to view document"}</p>
                  </div>
                </div>
                <div class="xertiq-widget-accordion-right">
                  <a href="${data.access.canonicalDocument}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-accordion-btn" onclick="event.stopPropagation()" title="Open in new tab">
                    ${icons.externalLink}
                  </a>
                  <a href="${data.access.canonicalDocument}" download class="xertiq-widget-accordion-btn" onclick="event.stopPropagation()" title="Download">
                    ${icons.download}
                  </a>
                  <div class="xertiq-widget-accordion-btn">
                    ${showDocumentPreview ? icons.chevronUp : icons.chevronDown}
                  </div>
                </div>
              </div>
              ${
                showDocumentPreview
                  ? `
                <div class="xertiq-widget-accordion-content">
                  <div class="xertiq-widget-iframe-container">
                    <iframe src="${data.access.canonicalDocument}#toolbar=1&navpanes=0&scrollbar=1" class="xertiq-widget-iframe pdf" title="Document Preview"></iframe>
                  </div>
                  <div class="xertiq-widget-accordion-footer">
                    <span class="xertiq-widget-accordion-url">${data.access.canonicalDocument}</span>
                    <div class="xertiq-widget-accordion-actions">
                      <button class="xertiq-widget-action-btn outline" onclick="XertiQWidget.copy('${data.access.canonicalDocument}')">
                        ${copied ? icons.check : icons.copy}
                        <span>${copied ? "Copied!" : "Copy URL"}</span>
                      </button>
                      <a href="${data.access.canonicalDocument}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-action-btn solid">
                        ${icons.externalLink}
                        <span>Open in IPFS</span>
                      </a>
                    </div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `;
        }

        // Batch Transaction Accordion (Solana)
        if (data.access.blockchainExplorer) {
          html += `
            <div class="xertiq-widget-accordion" id="batch-accordion">
              <div class="xertiq-widget-accordion-header" onclick="XertiQWidget.toggleAccordion('batch')">
                <div class="xertiq-widget-accordion-left">
                  <div class="xertiq-widget-accordion-icon amber">
                    ${icons.hash}
                  </div>
                  <div>
                    <p class="xertiq-widget-accordion-title">Batch Transaction (Solana)</p>
                    <p class="xertiq-widget-accordion-subtitle">${showBatchTransaction ? "Click to hide explorer" : "Click to view on Solana Explorer"}</p>
                  </div>
                </div>
                <div class="xertiq-widget-accordion-right">
                  <a href="${data.access.blockchainExplorer}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-accordion-btn" onclick="event.stopPropagation()" title="Open in new tab">
                    ${icons.externalLink}
                  </a>
                  <button class="xertiq-widget-accordion-btn" onclick="event.stopPropagation(); XertiQWidget.copy('${data.access.blockchainExplorer}')" title="Copy URL">
                    ${copied ? icons.check : icons.copy}
                  </button>
                  <div class="xertiq-widget-accordion-btn">
                    ${showBatchTransaction ? icons.chevronUp : icons.chevronDown}
                  </div>
                </div>
              </div>
              ${
                showBatchTransaction
                  ? `
                <div class="xertiq-widget-accordion-content">
                  <div class="xertiq-widget-iframe-container">
                    <iframe src="${data.access.blockchainExplorer}" class="xertiq-widget-iframe" title="Solana Explorer - Batch Transaction"></iframe>
                  </div>
                  <div class="xertiq-widget-accordion-footer">
                    <span class="xertiq-widget-accordion-url">${data.access.blockchainExplorer}</span>
                    <div class="xertiq-widget-accordion-actions">
                      <button class="xertiq-widget-action-btn outline amber" onclick="XertiQWidget.copy('${data.access.blockchainExplorer}')">
                        ${copied ? icons.check : icons.copy}
                        <span>${copied ? "Copied!" : "Copy URL"}</span>
                      </button>
                      <a href="${data.access.blockchainExplorer}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-action-btn solid amber">
                        ${icons.externalLink}
                        <span>Open in Solana Explorer</span>
                      </a>
                    </div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `;
        }

        // Holder Transaction Accordion (Solana)
        if (data.access.holderExplorerUrl) {
          html += `
            <div class="xertiq-widget-accordion" id="holder-accordion">
              <div class="xertiq-widget-accordion-header" onclick="XertiQWidget.toggleAccordion('holder')">
                <div class="xertiq-widget-accordion-left">
                  <div class="xertiq-widget-accordion-icon teal">
                    ${icons.user}
                  </div>
                  <div>
                    <p class="xertiq-widget-accordion-title">Holder Transaction (Solana)</p>
                    <p class="xertiq-widget-accordion-subtitle">${showHolderTransaction ? "Click to hide explorer" : "Click to view individual holder record"}</p>
                  </div>
                </div>
                <div class="xertiq-widget-accordion-right">
                  <a href="${data.access.holderExplorerUrl}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-accordion-btn" onclick="event.stopPropagation()" title="Open in new tab">
                    ${icons.externalLink}
                  </a>
                  <button class="xertiq-widget-accordion-btn" onclick="event.stopPropagation(); XertiQWidget.copy('${data.access.holderExplorerUrl}')" title="Copy URL">
                    ${copied ? icons.check : icons.copy}
                  </button>
                  <div class="xertiq-widget-accordion-btn">
                    ${showHolderTransaction ? icons.chevronUp : icons.chevronDown}
                  </div>
                </div>
              </div>
              ${
                showHolderTransaction
                  ? `
                <div class="xertiq-widget-accordion-content">
                  <div class="xertiq-widget-iframe-container">
                    <iframe src="${data.access.holderExplorerUrl}" class="xertiq-widget-iframe" title="Solana Explorer - Holder Transaction"></iframe>
                  </div>
                  <div class="xertiq-widget-accordion-footer">
                    <span class="xertiq-widget-accordion-url">${data.access.holderExplorerUrl}</span>
                    <div class="xertiq-widget-accordion-actions">
                      <button class="xertiq-widget-action-btn outline teal" onclick="XertiQWidget.copy('${data.access.holderExplorerUrl}')">
                        ${copied ? icons.check : icons.copy}
                        <span>${copied ? "Copied!" : "Copy URL"}</span>
                      </button>
                      <a href="${data.access.holderExplorerUrl}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-action-btn solid teal">
                        ${icons.externalLink}
                        <span>Open in Solana Explorer</span>
                      </a>
                    </div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `;
        }

        // Display document link (simple, not accordion)
        if (
          data.access.displayDocument &&
          !data.access.displayDocument.includes("/null")
        ) {
          const fileName =
            data.document?.title || `${data.holder?.name || "Document"}.pdf`;
          html += `
            <a href="${data.access.displayDocument}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-file-item" style="margin-top: 0.75rem;">
              <div class="xertiq-widget-file-content">
                <div class="xertiq-widget-file-icon" style="background: linear-gradient(135deg, #10b981, #059669);">${icons.fileText}</div>
                <div>
                  <p class="xertiq-widget-file-name">Display Document with QR Code</p>
                  <p class="xertiq-widget-file-size">Version with embedded verification QR</p>
                </div>
              </div>
              <span class="xertiq-widget-file-external">${icons.externalLink}</span>
            </a>
          `;
        }

        html += "</div>"; // End files section
      }

      html += "</div>"; // End certificate card

      // Merkle hashes
      if (data.merkleHashes) {
        html += `
          <div class="xertiq-widget-info-card">
            <h3 class="xertiq-widget-section-title">
              ${icons.hash}
              <span>Merkle Hashes</span>
            </h3>
        `;

        if (data.merkleHashes.personal) {
          html += `
            <div class="xertiq-widget-hash-box">
              <div class="xertiq-widget-hash-header">
                <p class="xertiq-widget-hash-label">Personal Merkle Hash</p>
                <button class="xertiq-widget-copy-btn" onclick="XertiQWidget.copy('${
                  data.merkleHashes.personal
                }')">
                  ${copied ? icons.check : icons.copy}
                </button>
              </div>
              <p class="xertiq-widget-hash-value">${
                data.merkleHashes.personal
              }</p>
            </div>
          `;
        }

        if (data.merkleHashes.root) {
          html += `
            <div class="xertiq-widget-hash-box">
              <div class="xertiq-widget-hash-header">
                <p class="xertiq-widget-hash-label">Root Merkle Hash</p>
                <button class="xertiq-widget-copy-btn" onclick="XertiQWidget.copy('${
                  data.merkleHashes.root
                }')">
                  ${copied ? icons.check : icons.copy}
                </button>
              </div>
              <p class="xertiq-widget-hash-value">${data.merkleHashes.root}</p>
            </div>
          `;
        }

        html += "</div>"; // End merkle hashes card
      }

      // Blockchain information
      if (data.verification) {
        html += `
          <div class="xertiq-widget-info-card">
            <h3 class="xertiq-widget-section-title">
              ${icons.hash}
              <span>Blockchain Information</span>
            </h3>
        `;

        if (data.verification.blockchain_network) {
          html += `
            <div class="xertiq-widget-hash-box">
              <p class="xertiq-widget-hash-label">Network</p>
              <p class="xertiq-widget-blockchain-value">${data.verification.blockchain_network}</p>
            </div>
          `;
        }

        if (data.verification.transaction_signature) {
          html += `
            <div class="xertiq-widget-hash-box">
              <div class="xertiq-widget-hash-header">
                <p class="xertiq-widget-hash-label">Transaction Signature</p>
                <button class="xertiq-widget-copy-btn" onclick="XertiQWidget.copy('${
                  data.verification.transaction_signature
                }')">
                  ${copied ? icons.check : icons.copy}
                </button>
              </div>
              <p class="xertiq-widget-hash-value">${
                data.verification.transaction_signature
              }</p>
            </div>
          `;
        }

        if (data.verification.explorer_url) {
          html += `
            <a href="${data.verification.explorer_url}" target="_blank" rel="noopener noreferrer" class="xertiq-widget-explorer-link">
              ${icons.externalLink}
              <span>View on Blockchain Explorer</span>
            </a>
          `;
        }

        html += "</div>"; // End blockchain card
      }

      // Verification steps
      if (data.verification?.steps) {
        html += `
          <div class="xertiq-widget-info-card">
            <h3 class="xertiq-widget-section-title">
              ${icons.shield}
              <span>Verification Process</span>
            </h3>
        `;

        data.verification.steps.forEach((step) => {
          const isValid = step.status === "valid";
          html += `
            <div class="xertiq-widget-step">
              <div class="xertiq-widget-step-content">
                <div class="xertiq-widget-step-number ${
                  isValid ? "valid" : "invalid"
                }">
                  ${step.step}
                </div>
                <div class="xertiq-widget-step-info">
                  <div class="xertiq-widget-step-header">
                    <h4 class="xertiq-widget-step-name">${step.name}</h4>
                    <span class="xertiq-widget-step-status">
                      ${isValid ? icons.checkCircle : icons.alertCircle}
                    </span>
                  </div>
                  <p class="xertiq-widget-step-message ${
                    isValid ? "valid" : "invalid"
                  }">
                    ${
                      step.details?.message ||
                      (isValid
                        ? "Verification successful"
                        : "Verification failed")
                    }
                  </p>
                </div>
              </div>
            </div>
          `;
        });

        html += "</div>"; // End verification steps card
      }

      // Summary
      if (data.verification?.summary) {
        html += `
          <div class="xertiq-widget-info-card">
            <h3 class="xertiq-widget-section-title">Verification Summary</h3>
            <div class="xertiq-widget-summary-grid">
        `;

        const summaryItems = [
          { key: "identityHashValid", label: "Identity Hash" },
          { key: "merkleProofValid", label: "Merkle Proof" },
          { key: "blockchainValid", label: "Blockchain" },
          { key: "overallValid", label: "Overall Status" },
        ];

        summaryItems.forEach(({ key, label }) => {
          const isValid = data.verification.summary[key];
          html += `
            <div class="xertiq-widget-summary-item">
              <span class="xertiq-widget-summary-label">${label}:</span>
              <div class="xertiq-widget-summary-status">
                ${isValid ? icons.checkCircle : icons.alertCircle}
                <span class="xertiq-widget-summary-text ${
                  isValid ? "valid" : "invalid"
                }">
                  ${isValid ? "Valid" : "Invalid"}
                </span>
              </div>
            </div>
          `;
        });

        html += "</div></div>"; // End summary grid and card
      }
    }

    // Footer
    html += `
      <div class="xertiq-widget-footer">
        <div class="xertiq-widget-powered-by">
          ${icons.shield}
          <span class="xertiq-widget-powered-label">Powered by:</span>
          <a href="https://xertiq.com" target="_blank" rel="noopener noreferrer" class="xertiq-widget-brand-link">
            XertiQ
          </a>
        </div>
        <p class="xertiq-widget-tagline">Blockchain-Secured Document Verification</p>
      </div>
    `;

    html += "</div>"; // End inner

    containerElement.innerHTML = html;

    // Attach event listeners
    const form = document.getElementById("xertiq-verify-form");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    const input = document.getElementById("xertiq-search-input");
    if (input) {
      input.addEventListener("input", (e) => {
        searchQuery = e.target.value;
      });
    }
  };

  // Public API
  window.XertiQWidget.init = (options = {}) => {
    config = { ...defaultConfig, ...options };

    // Get container element
    const containerId = config.container;
    containerElement = document.getElementById(containerId);

    if (!containerElement) {
      console.error(
        `XertiQ Widget: Container element "${containerId}" not found`,
      );
      return;
    }

    // Add container class
    containerElement.classList.add("xertiq-widget-container");

    // Inject styles
    injectStyles();

    // Check for data-doc attribute for auto-verification
    const autoDoc = containerElement.getAttribute("data-doc");
    if (autoDoc) {
      verifyDocument(autoDoc);
    } else if (config.docId) {
      verifyDocument(config.docId);
    } else {
      render();
    }
  };

  window.XertiQWidget.copy = copyToClipboard;

  // Toggle accordion sections
  window.XertiQWidget.toggleAccordion = (section) => {
    if (section === "document") {
      showDocumentPreview = !showDocumentPreview;
    } else if (section === "batch") {
      showBatchTransaction = !showBatchTransaction;
    } else if (section === "holder") {
      showHolderTransaction = !showHolderTransaction;
    }
    render(); // Re-render to update the UI
  };

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const defaultContainer = document.getElementById("xertiq-verify-widget");
      if (defaultContainer) {
        window.XertiQWidget.init();
      }
    });
  } else {
    // DOM already loaded
    const defaultContainer = document.getElementById("xertiq-verify-widget");
    if (defaultContainer) {
      window.XertiQWidget.init();
    }
  }
})();

//test
