# XertiQ Wallet - Chrome Extension

A blockchain-based document verification and certificate issuance wallet built as a Chrome Extension using React, Vite, and Tailwind CSS.

## ��� Features

- **Document Verification**: Verify document authenticity on Solana blockchain
- **Certificate Management**: Issue and manage digital certificates
- **Wallet Interface**: MetaMask-style wallet for document operations
- **Solana Integration**: Connected to Solana Devnet for development
- **Chrome Extension**: Seamless browser integration
- **Dual Mode**: Issuer and Holder roles

## ��� Quick Start

### Prerequisites

- Node.js 18+ 
- Chrome Browser
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/xertiq/xertiq.git
cd xertiq/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the Chrome Extension**
```bash
npm run build
```

4. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" 
   - Select the `dist` folder from this project
   - The XertiQ Wallet extension will appear in your extensions

## ���️ Development

### Development Server
```bash
npm run dev
```
This starts the Vite development server at `http://localhost:5173`

### Building for Production
```bash
npm run build
```
Builds the extension files to the `dist` directory.

### VS Code Tasks
The project includes VS Code tasks for:
- `Build Chrome Extension` - Builds the extension
- `Development Server` - Starts dev server
- `Install Dependencies` - Installs npm packages

Access via `Ctrl+Shift+P` → "Tasks: Run Task"

## ��� Project Structure

```
frontend/
├── public/
│   ├── icons/           # Extension icons (16px, 48px, 128px)
│   └── vite.svg
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── StatusIndicators.jsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Transaction.jsx
│   ├── services/       # API and Chrome services
│   │   ├── api.js
│   │   └── chrome.js
│   ├── store/          # Zustand state management
│   │   └── wallet.js
│   ├── hooks/          # Custom React hooks
│   │   └── useAuth.js
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind CSS styles
├── background.js       # Chrome Extension background script
├── manifest.json       # Chrome Extension manifest
├── index.html          # Main popup HTML
├── verify.html         # Verification page HTML
└── package.json
```

## ��� Chrome Extension Configuration

### Manifest V3
The extension uses Manifest V3 with the following permissions:
- `storage` - For persistent data
- `activeTab` - For current tab access
- `scripting` - For content scripts

### Host Permissions
- `http://localhost:3001/*` - Backend API access
- `https://api.devnet.solana.com/*` - Solana Devnet access

## ��� Backend Integration

The extension connects to the XertiQ backend API:

### API Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration  
- `GET /documents` - Get user documents
- `GET /certificates` - Get user certificates
- `GET /transactions` - Get blockchain transactions
- `POST /verify` - Verify document authenticity

### Environment Configuration
Update API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## ��� Design System

### Colors
- Primary: Blue (#3B82F6) to Purple (#8B5CF6) gradient
- Background: Dark theme with glass morphism effects
- Text: White/gray scale for dark theme

### Responsive Design
- Optimized for 380x600px Chrome Extension popup
- Responsive components using Tailwind CSS
- Mobile-first approach

## ��� Security Features

- JWT token authentication
- Chrome Extension storage API
- Content Security Policy (CSP)
- Secure API communication
- Solana wallet integration

## ��� Testing

### Local Testing
1. Build the extension: `npm run build`
2. Load in Chrome: Load `dist` folder as unpacked extension
3. Click extension icon to open wallet
4. Test authentication and features

### Development Testing
1. Start dev server: `npm run dev`
2. Open `http://localhost:5173` in browser
3. Test components and functionality
4. Hot reload for rapid development

## ��� Deployment

### Chrome Web Store
1. Build production version: `npm run build`
2. Zip the `dist` folder
3. Upload to Chrome Web Store Developer Dashboard
4. Follow Chrome Web Store review process

### Enterprise Distribution
1. Build and package extension
2. Deploy via Google Admin Console
3. Force-install for organization users

## ��� Troubleshooting

### Common Issues

1. **Extension not loading**
   - Ensure manifest.json is valid
   - Check Chrome DevTools for errors
   - Verify all files exist in dist folder

2. **API connection errors**
   - Check backend server is running
   - Verify API URL in services/api.js
   - Check Chrome Extension host permissions

3. **Build failures**
   - Ensure Node.js 18+ is installed
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript/linting errors

### Debug Mode
Enable Chrome DevTools for extension:
1. Right-click extension icon
2. Select "Inspect popup"
3. Use DevTools for debugging

## ��� License

This project is licensed under the MIT License - see the LICENSE file for details.

## ��� Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## ��� Support

- Documentation: [XertiQ Docs](https://docs.xertiq.com)
- Issues: [GitHub Issues](https://github.com/xertiq/xertiq/issues)
- Discord: [XertiQ Community](https://discord.gg/xertiq)

---

Built with ❤️ by the XertiQ Team
