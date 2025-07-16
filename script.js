// Loader control functions
function showLoader() {
  const loader = document.getElementById('fullscreenLoader');
  if (loader) {
      loader.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

function hideLoader() {
  const loader = document.getElementById('fullscreenLoader');
  if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto'; // Restore scrolling
  }
}

// Platform notification functions
function notifyPlatform(action, data = {}) {
  const message = {
      action: action,
      data: data,
      timestamp: new Date().toISOString()
  };

  // Web notification (postMessage to parent window)
  if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
  }

  // Android notification (if WebView interface exists)
  if (typeof Android !== 'undefined' && Android.onConsentAction) {
      Android.onConsentAction(JSON.stringify(message));
  }

  // iOS notification (if WebKit interface exists)
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.consentHandler) {
      window.webkit.messageHandlers.consentHandler.postMessage(message);
  }

}

// Global function to hide loader (can be called from native platforms)
window.hideConsentLoader = function() {
  hideLoader();
};

// Global function to show loader (can be called from native platforms)
window.showConsentLoader = function() {
  showLoader();
};

// DOM Ready function
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const acceptBtn = document.getElementById('acceptBtn');
  const denyBtn = document.getElementById('denyBtn');
  const skipBtn = document.getElementById('skipButton');
  const confirmationModal = document.getElementById('confirmationModal');
  const modalClose = document.getElementById('modalClose');
  const cancelDeny = document.getElementById('cancelDeny');
  const confirmDeny = document.getElementById('confirmDeny');

  // Event listeners
  acceptBtn.addEventListener('click', function() {
      showLoader();
      notifyPlatform('accept', {
          consent: true,
          timestamp: new Date().toISOString()
      });
  });

  denyBtn.addEventListener('click', function() {
      confirmationModal.classList.remove('hidden');
  });

  skipBtn.addEventListener('click', function() {
      showLoader();
      notifyPlatform('skip', {
          consent: 'skipped',
          timestamp: new Date().toISOString()
      });
  });

  confirmDeny.addEventListener('click', function() {
      confirmationModal.classList.add('hidden');
      showLoader();
      notifyPlatform('deny', {
          consent: false,
          timestamp: new Date().toISOString()
      });
  });

  cancelDeny.addEventListener('click', function() {
      confirmationModal.classList.add('hidden');
  });

  modalClose.addEventListener('click', function() {
      confirmationModal.classList.add('hidden');
  });

  // Close modal when clicking outside
  confirmationModal.addEventListener('click', function(e) {
      if (e.target === confirmationModal) {
          confirmationModal.classList.add('hidden');
      }
  });
});

// Handle messages from parent window (for web integration)
window.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'hideLoader') {
      hideLoader();
  }
});

// Example usage and documentation
// console.log(`
// Privacy Consent Loader Integration:

// Web Integration:
// - Listen for postMessage events from this iframe
// - Call window.hideConsentLoader() to hide the loader

// Android Integration:
// - Implement Android.onConsentAction(jsonString) in your WebView
// - Call webView.loadUrl("javascript:window.hideConsentLoader()") to hide loader

// iOS Integration:
// - Add 'consentHandler' to WKWebView messageHandlers
// - Call webView.evaluateJavaScript("window.hideConsentLoader()") to hide loader

// Actions sent to platforms:
// - 'accept': User accepted privacy policy
// - 'deny': User denied privacy policy
// - 'skip': User skipped privacy policy
// `);
