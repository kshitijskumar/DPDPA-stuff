// ✅ Simple configuration for skip button visibility
let showSkipButton = false;

// ✅ Platform detection function
function getPlatform() {
    if (typeof AndroidInterface !== 'undefined') return 'android';
    if (typeof window.webkit !== 'undefined' && window.webkit.messageHandlers) return 'ios';
    return 'unknown';
}

// ✅ Main function to configure skip button visibility from native
function configureConsentUI(shouldShowSkip) {
    try {
        console.log("Received skip button configuration:", shouldShowSkip);
        
        // Update global flag
        showSkipButton = shouldShowSkip;
        
        // Update UI based on configuration
        updateSkipButtonVisibility(shouldShowSkip);
        
        return "Configuration applied successfully";
        
    } catch (error) {
        console.error("Error applying configuration:", error);
        return "Error applying configuration";
    }
}

// ✅ Update skip button visibility
function updateSkipButtonVisibility(shouldShow) {
    const skipButton = document.getElementById('skipButton');
    
    if (shouldShow) {
        skipButton.classList.remove('hidden');
        console.log("Skip button shown");
    } else {
        skipButton.classList.add('hidden');
        console.log("Skip button hidden");
    }
}

// ✅ Function to manually toggle skip button (for testing or dynamic changes)
function toggleSkipButton(show) {
    updateSkipButtonVisibility(show);
    showSkipButton = show;
    console.log(`Skip button ${show ? 'shown' : 'hidden'}`);
}

// ✅ Remove focus from button after click
function removeButtonFocus(button) {
    if (button) {
        button.blur();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const acceptButton = document.querySelector('.privacy-btn.accept');
    const denyButton = document.querySelector('.privacy-btn.deny');
    const skipButton = document.getElementById('skipButton');
    
    // Accept button click event
    acceptButton.addEventListener('click', function () {
        console.log('User accepted privacy policy');
        
        try {
            AndroidInterface.acceptClicked();
            removeButtonFocus(this);
        } catch (error) {
            console.error('Error calling mobile app callback:', error);
            alert('Thank you for accepting our privacy policy!');
        }
    });

    // Deny button click event
    denyButton.addEventListener('click', function () {
        console.log('User denied privacy policy');
        
        try {
            AndroidInterface.denyClicked();
            removeButtonFocus(this);
        } catch (error) {
            console.error('Error calling mobile app callback:', error);
            alert('Privacy policy denied');
        }
    });
    
    // ✅ Skip button click event
    skipButton.addEventListener('click', function () {
        console.log('User skipped privacy policy');
        
        try {
            AndroidInterface.skipClicked();
            removeButtonFocus(this);
        } catch (error) {
            console.error('Error calling mobile app callback:', error);
            alert('Privacy policy skipped for now');
        }
    });
    
    // ✅ Log platform detection on page load
    console.log('Platform detection:', {
        platform: getPlatform(),
        isAndroid: typeof AndroidInterface !== 'undefined',
        isIOS: typeof window.webkit !== 'undefined'
    });
    
    // ✅ Log initial skip button state
    console.log("Initial skip button state: hidden");
});

