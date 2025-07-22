let showSkipButton = false;

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

// Global function to hide loader (can be called from native platforms)
window.hideConsentLoader = function() {
    hideLoader();
};

// Global function to show loader (can be called from native platforms)
window.showConsentLoader = function() {
    showLoader();
};

function getPlatform() {
  if (typeof AndroidInterface !== 'undefined') return 'android';
  if (window.webkit?.messageHandlers) return 'ios';
  return 'web';
}

function configureConsentUI(shouldShowSkip) {
  try {
    console.log("Received skip button configuration:", shouldShowSkip);
    showSkipButton = shouldShowSkip;
    updateSkipButtonVisibility(shouldShowSkip);
    return "Configuration applied successfully";
  } catch (error) {
    console.error("Error applying configuration:", error);
    return "Error applying configuration";
  }
}

function updateSkipButtonVisibility(shouldShow) {
  const skipButton = document.getElementById('skipButton');
  if (skipButton) {
    skipButton.classList.toggle('hidden', !shouldShow);
    console.log(`Skip button ${shouldShow ? 'shown' : 'hidden'}`);
  }
}

function toggleSkipButton(show) {
  updateSkipButtonVisibility(show);
  showSkipButton = show;
  console.log(`Skip button manually ${show ? 'shown' : 'hidden'}`);
}

function removeButtonFocus(button) {
  if (button) button.blur();
}

function notifyPlatform(eventType) {
  const payload = { message: `privacy_${eventType}` };
  
  // Enhanced message format with timestamp
  const message = {
    action: eventType,
    data: {
      consent: eventType === 'accept' ? true : eventType === 'deny' ? false : 'skipped',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  try {
    // :white_check_mark: iOS
    if (window.webkit?.messageHandlers?.nativeApp) {
      window.webkit.messageHandlers.nativeApp.postMessage(payload);
    }
    // :white_check_mark: iOS - New consent handler interface
    if (window.webkit?.messageHandlers?.consentHandler) {
      window.webkit.messageHandlers.consentHandler.postMessage(message);
    }

    if (eventType === 'accept' && window.webKit?.messageHandlers?.acceptClicked) {
        window.webKit.messageHandlers.acceptClicked.postMessage(null);
    }

    if (eventType === 'deny' && window.webKit?.messageHandlers?.denyClicked) {
        window.webKit.messageHandlers.denyClicked.postMessage(message);
    }
    // :white_check_mark: Android - Fixed to use original naming convention
    else if (typeof AndroidInterface !== 'undefined') {
      if (eventType === 'accept') {
        AndroidInterface.acceptClicked();
      } else if (eventType === 'deny') {
        AndroidInterface.denyClicked();
      } else if (eventType === 'skip') {
        AndroidInterface.skipClicked();
      }
    }
    // :white_check_mark: Android - New consent handler interface
    if (typeof Android !== 'undefined' && Android.onConsentAction) {
      Android.onConsentAction(JSON.stringify(message));
    }
    // :white_check_mark: Web fallback
    else if (typeof window.postMessage === 'function') {
      window.postMessage(payload, '*');
    }
    // :white_check_mark: Web notification (postMessage to parent window)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  } catch (error) {
    console.error(`Error during ${eventType} click`, error);
    alert(`Privacy policy ${eventType}`);
  }
  
  // Console log for debugging
  console.log('Privacy Consent Action:', message);
}

function showConfirmationModal() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function hideConfirmationModal() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

function handleDenyConfirmation() {
  hideConfirmationModal();
  showLoader();
  // Execute the original deny logic
  notifyPlatform('deny');
}

document.addEventListener('DOMContentLoaded', function () {
  const acceptButton = document.querySelector('.privacy-btn.accept');
  const denyButton = document.querySelector('.privacy-btn.deny');
  const skipButton = document.getElementById('skipButton');
  
  // Modal elements
  const modal = document.getElementById('confirmationModal');
  const modalClose = document.getElementById('modalClose');
  const confirmDeny = document.getElementById('confirmDeny');
  const cancelDeny = document.getElementById('cancelDeny');

  if (acceptButton) {
    acceptButton.addEventListener('click', function () {
      showLoader();
      notifyPlatform('accept');
      removeButtonFocus(this);
    });
  }

  if (denyButton) {
    denyButton.addEventListener('click', function () {
      showConfirmationModal();
      removeButtonFocus(this);
    });
  }

  // :white_check_mark: Skip button functionality preserved
  if (skipButton) {
    skipButton.addEventListener('click', function () {
      showLoader();
      notifyPlatform('skip');
      removeButtonFocus(this);
    });
  }

  // Modal event listeners
  if (modalClose) {
    modalClose.addEventListener('click', function () {
      hideConfirmationModal();
    });
  }

  if (confirmDeny) {
    confirmDeny.addEventListener('click', function () {
      handleDenyConfirmation();
    });
  }

  if (cancelDeny) {
    cancelDeny.addEventListener('click', function () {
      hideConfirmationModal();
    });
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        hideConfirmationModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      hideConfirmationModal();
    }
  });

  console.log('Platform:', getPlatform());
});
