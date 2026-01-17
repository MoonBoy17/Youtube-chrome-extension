document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    // Load saved state
    chrome.storage.local.get(['extensionEnabled'], (result) => {
        const isEnabled = result.extensionEnabled !== false; // Default true
        updateUI(isEnabled);
    });

    // Handle toggle change
    toggleSwitch.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ extensionEnabled: isEnabled });
        updateUI(isEnabled);
    });

    function updateUI(isEnabled) {
        toggleSwitch.checked = isEnabled;
        if (isEnabled) {
            statusText.textContent = 'ACTIVE';
            statusText.classList.remove('disabled');
            statusDot.classList.remove('disabled');
        } else {
            statusText.textContent = 'DISABLED';
            statusText.classList.add('disabled');
            statusDot.classList.add('disabled');
        }
    }
});
