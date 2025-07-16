let showSkipButton = false;

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

  try {
    // :white_check_mark: iOS
    if (window.webkit?.messageHandlers?.nativeApp) {
      window.webkit.messageHandlers.nativeApp.postMessage(payload);
    }
    // :white_check_mark: Android
    else if (typeof AndroidInterface !== 'undefined') {
      const methodName = `${eventType}Clicked`;
      if (typeof AndroidInterface[methodName] === 'function') {
        AndroidInterface[methodName]();
      }
    }
    // :white_check_mark: Web fallback
    else if (typeof window.postMessage === 'function') {
      window.postMessage(payload, '*');
    }
  } catch (error) {
    console.error(`Error during ${eventType} click`, error);
    alert(`Privacy policy ${eventType}`);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const acceptButton = document.querySelector('.privacy-btn.accept');
  const denyButton = document.querySelector('.privacy-btn.deny');
  const skipButton = document.getElementById('skipButton');

  if (acceptButton) {
    acceptButton.addEventListener('click', function () {
      notifyPlatform('accept');
      removeButtonFocus(this);
    });
  }

  if (denyButton) {
    denyButton.addEventListener('click', function () {
      notifyPlatform('deny');
      removeButtonFocus(this);
    });
  }

  if (skipButton) {
    skipButton.addEventListener('click', function () {
      notifyPlatform('skip');
      removeButtonFocus(this);
    });
  }

  console.log('Platform:', getPlatform());
});
