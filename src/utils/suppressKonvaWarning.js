/**
 * Suppress Konva's false positive Brave Shield warning
 * This warning appears even in Chrome when privacy extensions are enabled
 * Must be imported BEFORE any Konva components
 */

if (typeof window !== "undefined" && window.console) {
  // Store original console.error
  const originalError = window.console.error.bind(window.console);
  
  // Override console.error to filter out Konva's false positive warning
  window.console.error = function (...args) {
    try {
      // Convert all arguments to string for checking
      const message = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return arg.message;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" ");
      
      // Check if this is the false positive Brave Shield warning
      const isBraveShieldWarning = 
        message.includes("Brave shield") ||
        message.includes("Brave Shield") ||
        message.includes("breaks KonvaJS internals") ||
        (message.includes("Konva") && message.includes("shield"));
      
      if (isBraveShieldWarning) {
        // Silently ignore this false positive warning
        return;
      }
    } catch (e) {
      // If filtering fails, just pass through to original
    }
    
    // Call original console.error for all other messages
    originalError.apply(window.console, args);
  };
  
  // Also override console.warn in case Konva uses that
  const originalWarn = window.console.warn.bind(window.console);
  window.console.warn = function (...args) {
    try {
      const message = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return arg.message;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" ");
      
      const isBraveShieldWarning = 
        message.includes("Brave shield") ||
        message.includes("Brave Shield") ||
        message.includes("breaks KonvaJS internals");
      
      if (isBraveShieldWarning) {
        return;
      }
    } catch (e) {
      // Pass through if filtering fails
    }
    
    originalWarn.apply(window.console, args);
  };
}

export default {};

