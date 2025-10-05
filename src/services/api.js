import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  async purchaseCredits(amount) {
    const response = await this.api.post("/credits/purchase", { amount });
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
