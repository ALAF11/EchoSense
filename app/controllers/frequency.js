// Controller for Frequency Screen

// Variables to track frequency and test state
var currentFrequency = 57; // Default frequency in kHz (25-75 kHz range)
var isTestingFrequency = false;
var testTimer = null;

// Import buoy and device status from previous screen
var currentBuoyStatus = 'on'; // Assuming buoy is active when coming from Status screen
var currentDeviceStatus = 'idle'; // Default device status

// Back to Main Menu
function backToHome(e) {
	Ti.API.info('Going back to Main Menu');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('Frequency screen loaded - initializing');
	
	// Set initial frequency display
	updateFrequencyDisplay();
	
	// Update status icons based on current state
	updateStatusIcons();
	
	// Show "Click to start the test" message initially
	$.clickToStartLabel.visible = true;
	
	// Hide test result labels initially
	$.testingLabel.visible = false;
	$.signalDetectedLabel.visible = false;
}

// ========== FREQUENCY SLIDER ==========
function updateFrequency(e) {
	// Get the slider value
	var sliderValue = Math.round(e.value);
	
	// Update current frequency
	currentFrequency = sliderValue;
	
	Ti.API.info('Frequency changed to: ' + currentFrequency + ' kHz');
	
	// Update the display
	updateFrequencyDisplay();
}

function updateFrequencyDisplay() {
	$.currentFrequency.text = currentFrequency + ' kHz';
}

// ========== STATUS ICONS ==========
function updateStatusIcons() {
	// Update buoy status icon based on current state
	switch(currentBuoyStatus) {
		case 'off':
			$.buoyStatusIcon.image = '/img/icon_signal_off.png';
			break;
		case 'on':
			$.buoyStatusIcon.image = '/img/icon_signal.png';
			break;
		case 'error':
			$.buoyStatusIcon.image = '/img/icon_error.png';
			break;
		case 'transmitting':
			$.buoyStatusIcon.image = '/img/icon_transmitting.png';
			break;
		default:
			$.buoyStatusIcon.image = '/img/icon_signal_off.png';
	}
	
	// Update device status icon based on current state
	switch(currentDeviceStatus) {
		case 'offline':
			$.deviceStatusIcon.image = '/img/icon_signal_off.png';
			break;
		case 'idle':
			$.deviceStatusIcon.image = '/img/icon_idle.png';
			break;
		case 'descending':
			$.deviceStatusIcon.image = '/img/icon_descending.png';
			break;
		case 'ascending':
			$.deviceStatusIcon.image = '/img/icon_ascending.png';
			break;
		default:
			$.deviceStatusIcon.image = '/img/icon_signal_off.png';
	}
}

// ========== FREQUENCY TEST ==========
function testFrequency(e) {
	Ti.API.info('Testing frequency: ' + currentFrequency + ' kHz');
	
	// Prevent multiple simultaneous tests
	if (isTestingFrequency) {
		Ti.API.warn('Test already in progress');
		return;
	}
	
	// Check if buoy is active
	if (currentBuoyStatus === 'off') {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before testing frequency.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	// Start testing
	isTestingFrequency = true;
	
	// Update UI to show testing state
	$.clickToStartLabel.visible = false;  // Hide "Click to start" message
	$.testingLabel.visible = true;
	$.signalDetectedLabel.visible = false;
	$.testButton.enabled = false;
	$.testButton.opacity = 0.5;
	
	// Change buoy status to transmitting
	currentBuoyStatus = 'transmitting';
	updateStatusIcons();
	
	// Simulate acoustic signal test (in production, this would communicate with hardware)
	testTimer = setTimeout(function() {
		completeFrequencyTest(true); // Simulate successful detection
	}, 2000); // 2 second delay to simulate testing
}

function completeFrequencyTest(success) {
	Ti.API.info('Frequency test completed. Success: ' + success);
	
	isTestingFrequency = false;
	
	// Clear timer if exists
	if (testTimer) {
		clearTimeout(testTimer);
		testTimer = null;
	}
	
	// Update UI based on result
	$.testingLabel.visible = false;
	$.clickToStartLabel.visible = false;  // Keep "Click to start" hidden
	
	if (success) {
		// Show success message
		$.signalDetectedLabel.visible = true;
		$.signalDetectedLabel.text = 'SIGNAL DETECTED!';
		$.signalDetectedLabel.color = '#46D365';
		
		// Optionally show confirmation dialog
		var successDialog = Ti.UI.createAlertDialog({
			title: 'Test Successful',
			message: 'Acoustic signal at ' + currentFrequency + ' kHz was detected successfully.',
			ok: 'OK'
		});
		successDialog.show();
		
	} else {
		// Show failure message
		$.signalDetectedLabel.visible = true;
		$.signalDetectedLabel.text = 'NO SIGNAL DETECTED';
		$.signalDetectedLabel.color = '#E74C3C';
		
		var failureDialog = Ti.UI.createAlertDialog({
			title: 'Test Failed',
			message: 'No acoustic signal detected at ' + currentFrequency + ' kHz. Please try again.',
			ok: 'OK'
		});
		failureDialog.show();
	}
	
	// Hide result after 5 seconds and show "Click to start" again
	setTimeout(function() {
		$.signalDetectedLabel.visible = false;
		$.clickToStartLabel.visible = true;  // Show "Click to start" again
	}, 5000);
	
	// Re-enable test button
	$.testButton.enabled = true;
	$.testButton.opacity = 1.0;
	
	// Return buoy status to on
	currentBuoyStatus = 'on';
	updateStatusIcons();
}

// ========== NAVIGATION ==========
function navigateToStatus(e) {
	Ti.API.info('Navigating to Status screen');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open Status window
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open Trigger Code window
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open Mission window
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open Recapture window
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open End window
	var endWindow = Alloy.createController('end').getView();
	endWindow.open();
}

function goBack(e) {
	Ti.API.info('Going back to Status screen');
	
	// Close current window
	$.frequencyWindow.close();
	
	// Open Status window
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function goNext(e) {
	Ti.API.info('Going to next screen (Trigger Code)');
	
	// Validate that frequency has been set and tested
	if (!$.signalDetectedLabel.visible || $.signalDetectedLabel.color !== '#46D365') {
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'Frequency Not Tested',
			message: 'It is recommended to test the frequency before proceeding. Continue anyway?',
			buttonNames: ['Cancel', 'Continue'],
			cancel: 0
		});
		
		confirmDialog.addEventListener('click', function(evt) {
			if (evt.index === 1) {
				// User confirmed, proceed
				proceedToNextScreen();
			}
		});
		
		confirmDialog.show();
		return;
	}
	
	// Frequency tested successfully, proceed
	proceedToNextScreen();
}

function proceedToNextScreen() {
	// Close current window
	$.frequencyWindow.close();
	
	// Open Trigger Code window
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

// ========== WINDOW EVENTS ==========
// Initialize when window opens
$.frequencyWindow.addEventListener('open', function() {
	Ti.API.info('Frequency window opened - initializing');
	initializeScreen();
});

// Cleanup when window closes
$.frequencyWindow.addEventListener('close', function() {
	Ti.API.info('Frequency window closing - cleaning up');
	
	// Clear any active timers
	if (testTimer) {
		clearTimeout(testTimer);
		testTimer = null;
	}
	
	// Reset test state
	isTestingFrequency = false;
});

// ========== EXPORTS ==========
exports.setFrequency = function(frequency) {
	currentFrequency = frequency;
	$.frequencySlider.value = frequency;
	updateFrequencyDisplay();
};

exports.setBuoyStatus = function(status) {
	currentBuoyStatus = status;
	updateStatusIcons();
};

exports.setDeviceStatus = function(status) {
	currentDeviceStatus = status;
	updateStatusIcons();
};