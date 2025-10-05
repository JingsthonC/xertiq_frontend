// XertiQ Wallet Chrome Extension Background Service Worker
console.log('XertiQ Wallet background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('XertiQ Wallet extension installed');
    chrome.storage.local.set({
      xertiqWallet: {
        isAuthenticated: false,
        user: null,
        token: null,
        theme: 'dark'
      }
    });
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'GET_AUTH_STATE':
      chrome.storage.local.get(['xertiqWallet'], (result) => {
        sendResponse(result.xertiqWallet || { isAuthenticated: false });
      });
      return true;

    case 'SET_AUTH_STATE':
      chrome.storage.local.set({
        xertiqWallet: { ...request.data, lastUpdated: Date.now() }
      }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'CLEAR_AUTH_STATE':
      chrome.storage.local.remove(['xertiqWallet'], () => {
        sendResponse({ success: true });
      });
      return true;

    case 'OPEN_VERIFICATION_PAGE':
      chrome.tabs.create({
        url: `${request.baseUrl}/verify?doc=${request.docId}`
      });
      sendResponse({ success: true });
      return true;

    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});
