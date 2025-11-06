// import React, { useEffect, useState } from "react";
// import {
//   createBrowserRouter,
//   RouterProvider,
//   Navigate,
// } from "react-router-dom";
// import useWalletStore from "./store/wallet";
// import chromeService from "./services/chrome";
// import apiService from "./services/api";

// // Components
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import BatchUpload from "./pages/BatchUpload";
// import Verify from "./pages/Verify";
// import LoadingSpinner from "./components/LoadingSpinner";

// // Detect if running as Chrome extension
// const isExtension = () => {
//   return (
//     typeof window !== "undefined" &&
//     typeof window.chrome !== "undefined" &&
//     window.chrome.runtime &&
//     window.chrome.runtime.id
//   );
// };

// // Get appropriate container class based on context
// const getContainerClass = () => {
//   const isExt = isExtension();
//   return isExt
//     ? "w-[357px] h-[600px] bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] overflow-hidden"
//     : "w-full h-screen bg-gray-50";
// };

// // Protected route wrapper
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useWalletStore();
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// // Public route wrapper for authenticated users
// const PublicRoute = ({ children }) => {
//   const { isAuthenticated } = useWalletStore();
//   return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
// };

// function App() {
//   const [isInitializing, setIsInitializing] = useState(true);
//   const { isAuthenticated, setAuth } = useWalletStore();

//   useEffect(() => {
//     // Set store reference in API service
//     apiService.setStoreReference(() => useWalletStore);

//     const initializeApp = async () => {
//       try {
//         // Check for stored authentication
//         const storedAuth = await chromeService.getStorage(
//           "xertiq-wallet-storage"
//         );

//         if (storedAuth?.state?.token && storedAuth?.state?.user) {
//           setAuth(storedAuth.state.user, storedAuth.state.token);
//           // Set the token in API service
//           apiService.setAuthToken(storedAuth.state.token);
//         }

//         // Check network connectivity
//         const isOnline = await chromeService.checkNetworkStatus();
//         if (!isOnline) {
//           console.warn("Backend API not reachable");
//         }

//         // Initialize Chrome extension features
//         const extensionInfo = await chromeService.getExtensionInfo();
//         console.log("XertiQ Wallet Extension v" + extensionInfo.version);
//       } catch (error) {
//         console.error("Failed to initialize app:", error);
//       } finally {
//         setIsInitializing(false);
//       }
//     };

//     initializeApp();
//   }, [setAuth]);

//   // Create router configuration
//   const router = createBrowserRouter([
//     {
//       path: "/login",
//       element: (
//         <PublicRoute>
//           <Login />
//         </PublicRoute>
//       ),
//     },
//     {
//       path: "/register",
//       element: (
//         <PublicRoute>
//           <Register />
//         </PublicRoute>
//       ),
//     },
//     {
//       path: "/verify",
//       element: <Verify />, // Public route - no authentication required
//     },
//     {
//       path: "/dashboard",
//       element: (
//         <ProtectedRoute>
//           <Dashboard />
//         </ProtectedRoute>
//       ),
//     },
//     {
//       path: "/batch-upload",
//       element: (
//         <ProtectedRoute>
//           <BatchUpload />
//         </ProtectedRoute>
//       ),
//     },
//     {
//       path: "/",
//       element: (
//         <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
//       ),
//     },
//     {
//       path: "*",
//       element: (
//         <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
//       ),
//     },
//   ]);

//   if (isInitializing) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
//         <div className="text-center">
//           <LoadingSpinner size="lg" />
//           <p className="text-white mt-4 text-lg">
//             Initializing XertiQ Wallet...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={getContainerClass()}>
//       <RouterProvider router={router} />
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import useWalletStore from "./store/wallet";
import chromeService from "./services/chrome";
import apiService from "./services/api";

// Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BatchUpload from "./pages/BatchUpload";
import Verify from "./pages/Verify";
import CertificateGenerator from "./pages/CertificateGenerator";
import DesignerComparison from "./pages/DesignerComparison";
import LoadingSpinner from "./components/LoadingSpinner";

// Detect if running as Chrome extension
const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

// Get appropriate container class based on context
const getContainerClass = () => {
  const isExt = isExtension();
  return isExt
    ? "w-[360px] h-[600px] overflow-y-auto overflow-x-hidden"
    : "w-full h-screen bg-gray-50";
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useWalletStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route wrapper for authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useWalletStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, setAuth } = useWalletStore();

  useEffect(() => {
    // Set store reference in API service
    apiService.setStoreReference(() => useWalletStore);

    const initializeApp = async () => {
      try {
        // Check for stored authentication
        const storedAuth = await chromeService.getStorage(
          "xertiq-wallet-storage"
        );

        if (storedAuth?.state?.token && storedAuth?.state?.user) {
          setAuth(storedAuth.state.user, storedAuth.state.token);
          // Set the token in API service
          apiService.setAuthToken(storedAuth.state.token);
        }

        // Check network connectivity
        const isOnline = await chromeService.checkNetworkStatus();
        if (!isOnline) {
          console.warn("Backend API not reachable");
        }

        // Initialize Chrome extension features
        const extensionInfo = await chromeService.getExtensionInfo();
        console.log("XertiQ Wallet Extension v" + extensionInfo.version);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [setAuth]);

  // Create router configuration
  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          <Register />
        </PublicRoute>
      ),
    },
    {
      path: "/verify",
      element: <Verify />, // Public route - no authentication required
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/batch-upload",
      element: (
        <ProtectedRoute>
          <BatchUpload />
        </ProtectedRoute>
      ),
    },
    {
      path: "/certificate-generator",
      element: (
        <ProtectedRoute>
          <CertificateGenerator />
        </ProtectedRoute>
      ),
    },
    {
      path: "/designer-comparison",
      element: (
        <ProtectedRoute>
          <DesignerComparison />
        </ProtectedRoute>
      ),
    },
    {
      path: "/",
      element: (
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      ),
    },
    {
      path: "*",
      element: (
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      ),
    },
  ]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">
            Initializing XertiQ Wallet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
