import axios from "axios";

// Default to Render backend URL if VITE_API_BASE_URL is not set
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://xertiq-backend.onrender.com/api"
    : "http://localhost:3000/api");

// Credit cost constants
export const CREDIT_COSTS = {
  generatePDF: 2,
  uploadToIPFS: 1,
  uploadToBlockChain: 3,
  validateCertificate: 1,
};

// Import the store to access token directly
let getWalletStore = null;

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        try {
          // Get token from Zustand store if available
          if (getWalletStore) {
            const store = getWalletStore();
            const token = store.getState().token;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (error) {
          console.error("Failed to get auth token:", error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Track ongoing refresh to avoid parallel refresh calls
    this._refreshing = false;
    this._refreshQueue = [];

    // Add response interceptor for error handling + silent token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Attempt silent refresh on 401 "Token expired" (but not on the refresh endpoint itself)
        if (
          error.response?.status === 401 &&
          error.response?.data?.message === "Token expired" &&
          !originalRequest._retried &&
          !originalRequest.url.includes("/auth/refresh")
        ) {
          originalRequest._retried = true;

          // If a refresh is already in flight, queue this request
          if (this._refreshing) {
            return new Promise((resolve, reject) => {
              this._refreshQueue.push({ resolve, reject });
            }).then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            });
          }

          this._refreshing = true;

          try {
            const store = getWalletStore?.()?.getState();
            const storedRefreshToken = store?.refreshToken;

            if (!storedRefreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await this.api.post("/auth/refresh", {
              refreshToken: storedRefreshToken,
            });

            const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

            // Update store with new tokens
            store.setToken(newAccessToken);
            if (newRefreshToken) {
              store.setAuth(store.user, newAccessToken, newRefreshToken);
            }

            // Flush queued requests
            this._refreshQueue.forEach(({ resolve }) => resolve(newAccessToken));
            this._refreshQueue = [];

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed — force logout
            this._refreshQueue.forEach(({ reject }) => reject(refreshError));
            this._refreshQueue = [];
            try {
              getWalletStore?.()?.getState().logout();
            } catch {}
            return Promise.reject(refreshError);
          } finally {
            this._refreshing = false;
          }
        }

        // Non-recoverable 401 — clear auth state
        if (error.response?.status === 401 && !originalRequest._retried) {
          try {
            getWalletStore?.()?.getState().logout();
          } catch {}
        }

        // Handle 403 verification/approval codes
        if (error.response?.status === 403) {
          const code = error.response.data?.code;
          if (code === "EMAIL_NOT_VERIFIED" && window.location.pathname !== "/verify-pending") {
            window.location.href = "/verify-pending";
          } else if (code === "ISSUER_NOT_APPROVED" && window.location.pathname !== "/approval-pending") {
            window.location.href = "/approval-pending";
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Method to set the store reference (called from App.jsx)
  setStoreReference(storeGetter) {
    getWalletStore = storeGetter;
  }

  // Auth endpoints
  async login(email, password, turnstileToken = null) {
    const response = await this.api.post("/auth/login", { email, password, turnstileToken });
    return response.data;
  }

  async register(data) {
    const response = await this.api.post("/auth/register", data);
    return response.data;
  }

  async logout(refreshToken = null) {
    const body = refreshToken ? { refreshToken } : {};
    const response = await this.api.post("/auth/logout", body);
    return response.data;
  }

  async verifyEmail(token, email) {
    const response = await this.api.get(`/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
    return response.data;
  }

  async resendVerification(email) {
    const response = await this.api.post("/auth/resend-verification", { email });
    return response.data;
  }

  async forgotPassword(email) {
    const response = await this.api.post("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(token, email, newPassword) {
    const response = await this.api.post("/auth/reset-password", { token, email, newPassword });
    return response.data;
  }

  // Credits endpoints
  async getCredits() {
    const response = await this.api.get("/credits");
    return response.data;
  }

  async getCreditBalance() {
    const response = await this.api.get("/credits/balance");
    // Handle both response formats: { success, credits } or { success, data: { credits } }
    if (response.data.data) {
      return {
        success: response.data.success,
        credits: response.data.data.credits,
      };
    }
    return response.data;
  }

  async getWalletInfo() {
    const response = await this.api.get("/credits/wallet");
    return response.data;
  }

  async getTransactionHistory(params = {}) {
    const { limit = 20, offset = 0 } = params;
    const response = await this.api.get("/credits/transactions", {
      params: { limit, offset },
    });
    return response.data;
  }

  // Credit defaults (admin)
  async getCreditDefaults() {
    const response = await this.api.get("/credit-defaults");
    return response.data;
  }

  async updateCreditDefaults(payload) {
    const response = await this.api.put("/credit-defaults/update", payload);
    return response.data;
  }

  async purchaseCredits(amount) {
    const response = await this.api.post("/credits/purchase", { amount });
    return response.data;
  }

  async checkSufficientCredits(operation, count = 1) {
    const cost = (CREDIT_COSTS[operation] || 0) * count;
    const balance = await this.getCreditBalance();

    return {
      sufficient: balance.credits >= cost,
      cost,
      balance: balance.credits,
      operation,
      count,
    };
  }

  async verifyPayMongoPaymentStatus(checkoutId) {
    const response = await this.api.get(
      `/payments/paymongo/status/${checkoutId}`,
    );
    return response.data;
  }

  // Documents endpoints
  async getDocuments() {
    const response = await this.api.get("/documents");
    return response.data;
  }

  async uploadDocument(file, metadata) {
    const formData = new FormData();
    formData.append("document", file);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async deleteDocument(documentId) {
    const response = await this.api.delete(`/documents/${documentId}`);
    return response.data;
  }

  // Certificates endpoints
  async getCertificates() {
    const response = await this.api.get("/certificates");
    return response.data;
  }

  async issueCertificate(documentId, recipientData) {
    const response = await this.api.post("/certificates/issue", {
      documentId,
      ...recipientData,
    });
    return response.data;
  }

  async revokeCertificate(certificateId) {
    const response = await this.api.post(
      `/certificates/${certificateId}/revoke`,
    );
    return response.data;
  }

  // Batch operations
  async createBatch(formData) {
    const response = await this.api.post("/batch/process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getBatchDetails(batchId) {
    const response = await this.api.get(`/batch/${batchId}`);
    return response.data;
  }

  async getBatches() {
    const response = await this.api.get("/batch");
    return response.data;
  }

  // Document type operations
  async getDocumentTypes() {
    const response = await this.api.get("/batch/document-types");
    // API returns { success: true, documentTypes: [...] }
    return response.data.documentTypes || response.data;
  }

  async downloadSampleCsv(docType) {
    const response = await this.api.get(
      `/batch/document-types/${docType}/sample-csv`,
      {
        responseType: "text",
      },
    );
    return response.data;
  }

  // Verification
  async verifyDocument(hash, accessKey = null) {
    const params = new URLSearchParams({ doc: hash });
    if (accessKey) {
      params.append("key", accessKey);
    }
    const response = await this.api.get(`/verify?${params.toString()}`);
    return response.data;
  }

  async verifyByQR(qrData) {
    const response = await this.api.post("/verify/qr", { qrData });
    return response.data;
  }

  // Templates endpoints
  async saveTemplateToBackend(templateData) {
    const response = await this.api.post("/templates", templateData);
    return response.data;
  }

  async getPublicTemplates() {
    const response = await this.api.get("/templates/public");
    return response.data;
  }

  async getMyTemplates() {
    const response = await this.api.get("/templates/my-templates");
    return response.data;
  }

  async getTemplateById(templateId) {
    const response = await this.api.get(`/templates/${templateId}`);
    return response.data;
  }

  async updateTemplate(templateId, templateData, templateFile = null) {
    let response;

    // If file is provided, use FormData
    if (templateFile) {
      const formData = new FormData();

      // Add file
      formData.append("templateFile", templateFile);

      // Add other template data as JSON string if provided
      if (templateData) {
        if (typeof templateData === "object") {
          formData.append("templateData", JSON.stringify(templateData));
        } else {
          formData.append("templateData", templateData);
        }

        // Add other fields if they exist
        if (templateData.name) formData.append("name", templateData.name);
        if (templateData.description !== undefined)
          formData.append("description", templateData.description);
        if (templateData.isPublic !== undefined)
          formData.append("isPublic", templateData.isPublic);
        if (templateData.category)
          formData.append("category", templateData.category);
        if (templateData.tags)
          formData.append("tags", JSON.stringify(templateData.tags));
        if (templateData.thumbnail)
          formData.append("thumbnail", templateData.thumbnail);
      }

      response = await this.api.put(`/templates/${templateId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // No file, use regular JSON
      response = await this.api.put(`/templates/${templateId}`, templateData);
    }

    return response.data;
  }

  async deleteTemplateFromBackend(templateId) {
    const response = await this.api.delete(`/templates/${templateId}`);
    return response.data;
  }

  async toggleTemplateVisibility(templateId, isPublic) {
    const response = await this.api.patch(
      `/templates/${templateId}/visibility`,
      {
        isPublic,
      },
    );
    return response.data;
  }

  // Admin endpoints
  async get(endpoint) {
    const response = await this.api.get(endpoint);
    return response.data;
  }

  async post(endpoint, data) {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  async patch(endpoint, data) {
    const response = await this.api.patch(endpoint, data);
    return response.data;
  }

  async delete(endpoint) {
    const response = await this.api.delete(endpoint);
    return response.data;
  }

  // Validator endpoints
  async verifyDocumentByHash(hash) {
    const response = await this.api.get(`/validator/verify/${hash}`);
    return response.data;
  }

  async verifyDocumentByQR(qrData) {
    const response = await this.api.post("/validator/verify-qr", { qrData });
    return response.data;
  }

  // Holder endpoints
  async getHolderDocuments(params = {}) {
    const { page = 1, limit = 10, status, type } = params;
    const response = await this.api.get("/holder/documents", {
      params: { page, limit, status, type },
    });
    return response.data;
  }

  async getHolderStats() {
    const response = await this.api.get("/holder/stats");
    return response.data;
  }

  // Holder key management
  async getDocumentKeys(docId) {
    const response = await this.api.get(`/holder/documents/${docId}/keys`);
    return response.data;
  }

  async generateDocumentKey(docId) {
    const response = await this.api.post(`/holder/documents/${docId}/keys`);
    return response.data;
  }

  async deleteDocumentKey(docId, key) {
    const response = await this.api.delete(`/holder/documents/${docId}/keys`, {
      data: { key },
    });
    return response.data;
  }

  // Holder visibility management
  async getDocumentVisibility(docId) {
    const response = await this.api.get(
      `/holder/documents/${docId}/visibility`,
    );
    return response.data;
  }

  async toggleDocumentVisibility(docId, isVisible, note = null) {
    const response = await this.api.patch(
      `/holder/documents/${docId}/visibility`,
      {
        isVisible,
        note,
      },
    );
    return response.data;
  }

  // Issuer endpoints
  async getIssuerDocuments(params = {}) {
    const { page = 1, limit = 10, batchId, holderEmail } = params;
    const response = await this.api.get("/issuer/documents", {
      params: { page, limit, batchId, holderEmail },
    });
    return response.data;
  }

  async getIssuerHolders(params = {}) {
    const { page = 1, limit = 50 } = params;
    const response = await this.api.get("/issuer/holders", {
      params: { page, limit },
    });
    return response.data;
  }

  async getIssuerStats() {
    const response = await this.api.get("/issuer/stats");
    return response.data;
  }

  // Super Admin endpoints
  async getSuperAdminStats() {
    const response = await this.api.get("/super-admin/stats");
    return response.data;
  }

  async getSuperAdminIssuers(params = {}) {
    const { page = 1, limit = 20, search } = params;
    const response = await this.api.get("/super-admin/issuers", {
      params: { page, limit, search },
    });
    return response.data;
  }

  async getSuperAdminHolders(params = {}) {
    const { page = 1, limit = 20, search } = params;
    const response = await this.api.get("/super-admin/holders", {
      params: { page, limit, search },
    });
    return response.data;
  }

  async getSuperAdminDocuments(params = {}) {
    const { page = 1, limit = 50, search, issuerId } = params;
    const response = await this.api.get("/super-admin/documents", {
      params: { page, limit, search, issuerId },
    });
    return response.data;
  }

  async getSuperAdminRevenue(params = {}) {
    const { startDate, endDate } = params;
    const response = await this.api.get("/super-admin/revenue", {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getSuperAdminUsers(params = {}) {
    const { page = 1, limit = 50, role, search } = params;
    const response = await this.api.get("/super-admin/users", {
      params: { page, limit, role, search },
    });
    return response.data;
  }

  async getSuperAdminAnalytics() {
    const response = await this.api.get("/super-admin/analytics");
    return response.data;
  }

  async getSuperAdminUserActivity(userId, params = {}) {
    const { page = 1, limit = 50, action, resource } = params;
    const response = await this.api.get(
      `/super-admin/users/${userId}/activity`,
      {
        params: { page, limit, action, resource },
      },
    );
    return response.data;
  }

  async updateSuperAdminUserCredits(userId, credits, reason) {
    const response = await this.api.patch(
      `/super-admin/users/${userId}/credits`,
      {
        credits,
        reason,
      },
    );
    return response.data;
  }

  async getSuperAdminPendingIssuers(params = {}) {
    const { page = 1, limit = 20 } = params;
    const response = await this.api.get("/super-admin/pending-issuers", {
      params: { page, limit },
    });
    return response.data;
  }

  async approveSuperAdminIssuer(userId) {
    const response = await this.api.patch(`/super-admin/issuers/${userId}/approve`);
    return response.data;
  }

  async rejectSuperAdminIssuer(userId, reason) {
    const response = await this.api.patch(`/super-admin/issuers/${userId}/reject`, { reason });
    return response.data;
  }

  async getSuperAdminPackages() {
    const response = await this.api.get("/super-admin/packages");
    return response.data;
  }

  async updateSuperAdminPackages(packages) {
    const response = await this.api.put("/super-admin/packages", { packages });
    return response.data;
  }

  async getSuperAdminAuthConfig() {
    const response = await this.api.get("/super-admin/auth-config");
    return response.data;
  }

  async updateSuperAdminAuthConfig(config) {
    const response = await this.api.put("/super-admin/auth-config", config);
    return response.data;
  }

  // Helper method to manually set token (useful for testing)
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  // ==================== API Key Management ====================

  /**
   * Get all API keys for the authenticated user
   */
  async getApiKeys() {
    const response = await this.api.get("/issuer/api-keys");
    return response.data;
  }

  /**
   * Create a new API key
   * @param {Object} data - Key configuration
   * @param {string} data.name - Key name
   * @param {string[]} data.permissions - Permissions array
   * @param {string} data.expiresAt - Optional expiration date
   * @param {string[]} data.ipAllowlist - Optional IP allowlist
   * @param {number} data.rateLimit - Rate limit (requests per window)
   * @param {number} data.rateLimitWindow - Rate limit window in ms
   */
  async createApiKey(data) {
    const response = await this.api.post("/issuer/api-keys", data);
    return response.data;
  }

  /**
   * Update an API key
   * @param {string} keyId - API key ID
   * @param {Object} data - Updated configuration
   */
  async updateApiKey(keyId, data) {
    const response = await this.api.patch(`/issuer/api-keys/${keyId}`, data);
    return response.data;
  }

  /**
   * Revoke an API key
   * @param {string} keyId - API key ID
   */
  async revokeApiKey(keyId) {
    const response = await this.api.delete(`/issuer/api-keys/${keyId}`);
    return response.data;
  }

  /**
   * Get API key usage statistics
   * @param {string} keyId - API key ID
   * @param {number} days - Number of days to fetch (default 30)
   */
  async getApiKeyUsage(keyId, days = 30) {
    const response = await this.api.get(`/issuer/api-keys/${keyId}/usage`, {
      params: { days },
    });
    return response.data;
  }

  /**
   * Configure webhook for an API key
   * @param {string} keyId - API key ID
   * @param {Object} data - Webhook configuration
   * @param {string} data.url - Webhook URL (must be HTTPS)
   * @param {string[]} data.events - Events to subscribe to
   */
  async configureWebhook(keyId, data) {
    const response = await this.api.post(`/issuer/api-keys/${keyId}/webhook`, data);
    return response.data;
  }

  /**
   * Delete webhook configuration
   * @param {string} keyId - API key ID
   */
  async deleteWebhook(keyId) {
    const response = await this.api.delete(`/issuer/api-keys/${keyId}/webhook`);
    return response.data;
  }

  /**
   * Get webhook deliveries for an API key
   * @param {string} keyId - API key ID
   * @param {Object} params - Query parameters
   */
  async getWebhookDeliveries(keyId, params = {}) {
    const { page = 1, limit = 20, status } = params;
    const response = await this.api.get(`/issuer/api-keys/${keyId}/webhook/deliveries`, {
      params: { page, limit, status },
    });
    return response.data;
  }

  /**
   * Manually retry a failed webhook delivery
   * @param {string} keyId - API key ID
   * @param {string} deliveryId - Delivery ID
   */
  async retryWebhookDelivery(keyId, deliveryId) {
    const response = await this.api.post(`/issuer/api-keys/${keyId}/webhook/deliveries/${deliveryId}/retry`);
    return response.data;
  }

  /**
   * Test webhook configuration
   * @param {string} keyId - API key ID
   */
  async testWebhook(keyId) {
    const response = await this.api.post(`/issuer/api-keys/${keyId}/webhook/test`);
    return response.data;
  }
}

export default new ApiService();
