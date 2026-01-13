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
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
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
import PurchaseCredits from "./pages/PurchaseCredits";
import PaymentSuccess from "./pages/PaymentSuccess";
import SmartTemplateEditor from "./pages/SmartTemplateEditor";
import HolderDashboard from "./pages/HolderDashboard";
import IssuerDashboard from "./pages/IssuerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import EmbeddableVerify from "./components/EmbeddableVerify";

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
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const location = useLocation();
  const { isAuthenticated, userRole, user } = useWalletStore();
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // SUPER_ADMIN can ONLY access /super-admin routes
  // If they try to access any other route, redirect them
  if (isSuperAdmin) {
    // Allow access to super-admin routes (including sub-routes)
    if (location.pathname.startsWith("/super-admin")) {
      return children;
    }
    // Redirect all other routes to super-admin
    return <Navigate to="/super-admin/platform-overview" replace />;
  }

  // If route has specific role requirements and user doesn't match, redirect
  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    // Redirect to appropriate dashboard based on role
    if (normalizedRole === "ISSUER") {
      return <Navigate to="/issuer-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public route wrapper for authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole, user } = useWalletStore();
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  if (isAuthenticated) {
    // Redirect SUPER_ADMIN to super admin dashboard, others to regular dashboard
    return (
      <Navigate to={isSuperAdmin ? "/super-admin" : "/dashboard"} replace />
    );
  }
  return children;
};

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, userRole, user } = useWalletStore();
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  if (isAuthenticated) {
    return (
      <Navigate to={isSuperAdmin ? "/super-admin" : "/dashboard"} replace />
    );
  }
  return <Navigate to="/login" replace />;
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
      path: "/embed/verify",
      element: <EmbeddableVerify />, // Embeddable verification widget
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute
          allowedRoles={["USER", "HOLDER", "ISSUER", "ADMIN", "VALIDATOR"]}
        >
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/batch-upload",
      element: (
        <ProtectedRoute allowedRoles={["ISSUER"]}>
          <BatchUpload />
        </ProtectedRoute>
      ),
    },
    {
      path: "/certificate-generator",
      element: (
        <ProtectedRoute allowedRoles={["ISSUER"]}>
          <CertificateGenerator />
        </ProtectedRoute>
      ),
    },
    {
      path: "/designer-comparison",
      element: (
        <ProtectedRoute allowedRoles={["ISSUER"]}>
          <DesignerComparison />
        </ProtectedRoute>
      ),
    },
    {
      path: "/purchase-credits",
      element: (
        <ProtectedRoute
          allowedRoles={["USER", "HOLDER", "ISSUER", "ADMIN", "VALIDATOR"]}
        >
          <PurchaseCredits />
        </ProtectedRoute>
      ),
    },
    {
      path: "/payment/success",
      element: (
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      ),
    },
    {
      path: "/smart-template-editor",
      element: (
        <ProtectedRoute>
          <SmartTemplateEditor />
        </ProtectedRoute>
      ),
    },
    {
      path: "/holder-dashboard",
      element: (
        <ProtectedRoute allowedRoles={["USER", "HOLDER"]}>
          <HolderDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/issuer-dashboard",
      element: (
        <ProtectedRoute allowedRoles={["ISSUER"]}>
          <IssuerDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/super-admin",
      element: (
        <ProtectedRoute>
          <SuperAdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/super-admin/:tab",
      element: (
        <ProtectedRoute>
          <SuperAdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/",
      element: <RootRedirect />,
    },
    {
      path: "*",
      element: <RootRedirect />,
    },
  ]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-lightest flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-dark mt-4 text-lg">
            Initializing XertiQ Wallet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
