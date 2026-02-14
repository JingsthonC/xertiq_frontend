// Suppress Konva's false positive Brave Shield warning - runs before any JS loads
;(function () {
  if (typeof window !== "undefined" && window.console) {
    var originalError = window.console.error.bind(window.console)
    window.console.error = function () {
      var message = Array.prototype.slice.call(arguments).join(" ")
      if (
        message.includes("Brave shield") ||
        message.includes("Brave Shield") ||
        message.includes("breaks KonvaJS internals")
      ) {
        return // Suppress false positive
      }
      originalError.apply(window.console, arguments)
    }
  }
})()
