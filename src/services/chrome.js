/* global chrome */

class ChromeService {
  // Check if running as Chrome extension
  isExtension() {
    return (
      typeof chrome !== "undefined" && chrome.storage && chrome.storage.local
    );
  }

  // Storage operations
  async setStorage(key, value) {
    if (!this.isExtension()) {
      // Fallback to localStorage for web app mode
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async getStorage(key) {
    if (!this.isExtension()) {
      // Fallback to localStorage for web app mode
      const item = localStorage.getItem(key);
      return Promise.resolve(item ? JSON.parse(item) : undefined);
    }
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  async removeStorage(key) {
    if (!this.isExtension()) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], resolve);
    });
  }

  async clearStorage() {
    if (!this.isExtension()) {
      localStorage.clear();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }

  // Notification operations
  showNotification(title, message, type = "basic") {
    if (!this.isExtension()) {
      // Fallback to console log or browser notification for web app mode
      console.log(`[Notification] ${title}: ${message}`);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message });
      }
      return;
    }

    const notificationId = `xertiq-${Date.now()}`;

    chrome.notifications.create(notificationId, {
      type: type,
      iconUrl: "../icons/icon48.png",
      title: title,
      message: message,
    });

    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 5000);
  }

  // Tab operations
  async openTab(url) {
    if (!this.isExtension()) {
      window.open(url, "_blank");
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      chrome.tabs.create({ url }, resolve);
    });
  }

  async getCurrentTab() {
    if (!this.isExtension()) {
      return Promise.resolve({ url: window.location.href });
    }
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]);
      });
    });
  }

  // Message passing
  sendMessage(message, responseCallback) {
    if (!this.isExtension()) {
      console.log("[Message]", message);
      if (responseCallback)
        responseCallback({
          success: false,
          message: "Not running as extension",
        });
      return;
    }
    chrome.runtime.sendMessage(message, responseCallback);
  }

  onMessage(callback) {
    if (!this.isExtension()) return;
    chrome.runtime.onMessage.addListener(callback);
  }

  // Background script communication
  async sendToBackground(action, data = {}) {
    if (!this.isExtension()) {
      console.log("[Background]", action, data);
      return Promise.resolve({
        success: false,
        message: "Not running as extension",
      });
    }
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, data }, (response) =>
        resolve(response)
      );
    });
  }

  // Network status checking
  async checkNetworkStatus() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const apiBaseUrl = 
        import.meta.env.VITE_API_BASE_URL || 
        (import.meta.env.PROD 
          ? "https://xertiq-backend.onrender.com/api" 
          : "http://localhost:3000/api");
      const response = await fetch(
        `${apiBaseUrl}/health`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Extension lifecycle
  async getExtensionInfo() {
    if (!this.isExtension()) {
      return { version: "1.0.0", name: "XertiQ Wallet (Web Mode)" };
    }
    return chrome.runtime.getManifest();
  }

  // Clipboard operations
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification("Copied!", "Text copied to clipboard");
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }

  // Download operations
  downloadFile(url, filename) {
    if (!this.isExtension()) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      return;
    }
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });
  }

  // Badge operations
  setBadgeText(text) {
    if (!this.isExtension()) return;
    chrome.action.setBadgeText({ text: text });
  }

  setBadgeColor(color) {
    if (!this.isExtension()) return;
    chrome.action.setBadgeBackgroundColor({ color: color });
  }

  // Context menu operations
  createContextMenu(id, title, contexts = ["page"]) {
    if (!this.isExtension()) return;
    chrome.contextMenus.create({
      id: id,
      title: title,
      contexts: contexts,
    });
  }

  // Window operations
  async getPopupWindow() {
    if (!this.isExtension()) {
      return Promise.resolve(window);
    }
    return new Promise((resolve) => {
      chrome.windows.getCurrent(resolve);
    });
  }

  closePopup() {
    window.close();
  }

  // Permission checking
  async hasPermission(permission) {
    if (!this.isExtension()) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      chrome.permissions.contains({ permissions: [permission] }, resolve);
    });
  }

  async requestPermission(permission) {
    if (!this.isExtension()) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      chrome.permissions.request({ permissions: [permission] }, resolve);
    });
  }
}

export default new ChromeService();
