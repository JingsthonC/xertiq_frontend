import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth state on 401
          try {
            if (getWalletStore) {
              const store = getWalletStore();
              store.getState().logout();
            }
          } catch (err) {
            console.error("Failed to clear auth state:", err);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Method to set the store reference (called from App.jsx)
  setStoreReference(storeGetter) {
    getWalletStore = storeGetter;
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.api.post("/auth/login", { email, password });
    return response.data;
  }

  async register(data) {
    const response = await this.api.post("/auth/register", data);
    return response.data;
  }

  async logout() {
    const response = await this.api.post("/auth/logout");
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

    const response = await this.api.post("/documents/upload", formData, {
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
      `/certificates/${certificateId}/revoke`
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

  // Verification
  async verifyDocument(hash) {
    const response = await this.api.get(`/verify?doc=${hash}`);
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

  async updateTemplate(templateId, templateData) {
    const response = await this.api.put(
      `/templates/${templateId}`,
      templateData
    );
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
      }
    );
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
}

export default new ApiService();
