// Controller for Frequency Screen

// Variables to track test state
var isTestingFrequency = false;
var testTimer = null;

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
	
	// Set initial frequency display from global state
	$.frequencySlider.value = Alloy.Globals.currentFrequency;
	updateFrequencyDisplay();
	
	// Update status icons based on global state
	updateStatusIcons();
	
	// Show "Click to start the test" message initially
	$.clickToStartLabel.visible = true;
	
	// Hide test result labels initially
	$.testingLabel.visible = false;
	$.signalDetectedLabel.visible = false;
	
	// If frequency was already tested, show the result
	if (Alloy.Globals.frequencyTested) {
		$.signalDetectedLabel.visible = true;
		$.signalDetectedLabel.text = 'SIGNAL DETECTED!';
		$.signalDetectedLabel.color = '#46D365';
		$.clickToStartLabel.visible = false;
	}
}

// ========== FREQUENCY SLIDER ==========
function updateFrequency(e) {
	// Get the slider value
	var sliderValue = Math.round(e.value);
	
	// Update global frequency
	Alloy.Globals.currentFrequency = sliderValue;
	
	// Mark as not tested when frequency changes
	Alloy.Globals.frequencyTested = false;
	
	Ti.API.info('Frequency changed to: ' + Alloy.Globals.currentFrequency + ' kHz');
	
	// Update the display
	updateFrequencyDisplay();
	
	// Reset test display since frequency changed
	resetTestDisplay();
}

function updateFrequencyDisplay() {
	$.currentFrequency.text = Alloy.Globals.currentFrequency + ' kHz';
}

// ========== STATUS ICONS ==========
function updateStatusIcons() {
	// Update buoy status icon based on global state
	switch(Alloy.Globals.buoyStatus) {
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
	
	// Update device status icon based on global state
	switch(Alloy.Globals.deviceStatus) {
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
	Ti.API.info('Testing frequency: ' + Alloy.Globals.currentFrequency + ' kHz');
	
	// Prevent multiple simultaneous tests
	if (isTestingFrequency) {
		Ti.API.warn('Test already in progress');
		return;
	}
	
	// Check if buoy is active
	if (Alloy.Globals.buoyStatus === 'off') {
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
	$.clickToStartLabel.visible = false;
	$.testingLabel.visible = true;
	$.signalDetectedLabel.visible = false;
	$.testButton.enabled = false;
	$.testButton.opacity = 0.5;
	
	// Change buoy status to transmitting
	Alloy.Globals.buoyStatus = 'transmitting';
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
	$.clickToStartLabel.visible = false;
	
	if (success) {
		// Mark frequency as tested in global state
		Alloy.Globals.frequencyTested = true;
		
		// Show success message
		$.signalDetectedLabel.visible = true;
		$.signalDetectedLabel.text = 'SIGNAL DETECTED!';
		$.signalDetectedLabel.color = '#46D365';
		
		// Optionally show confirmation dialog
		var successDialog = Ti.UI.createAlertDialog({
			title: 'Test Successful',
			message: 'Acoustic signal at ' + Alloy.Globals.currentFrequency + ' kHz was detected successfully.',
			ok: 'OK'
		});
		successDialog.show();
		
	} else {
		// Mark frequency as not tested
		Alloy.Globals.frequencyTested = false;
		
		// Show failure message
		$.signalDetectedLabel.visible = true;
		$.signalDetectedLabel.text = 'NO SIGNAL DETECTED';
		$.signalDetectedLabel.color = '#E74C3C';
		
		var failureDialog = Ti.UI.createAlertDialog({
			title: 'Test Failed',
			message: 'No acoustic signal detected at ' + Alloy.Globals.currentFrequency + ' kHz. Please try again.',
			ok: 'OK'
		});
		failureDialog.show();
	}
	
	// Hide failure result after 5 seconds and show "Click to start" again
	if (!success) {
		setTimeout(function() {
			$.signalDetectedLabel.visible = false;
			$.clickToStartLabel.visible = true;
		}, 5000);
	}
	// Keep success result visible
	
	// Re-enable test button
	$.testButton.enabled = true;
	$.testButton.opacity = 1.0;
	
	// Return buoy status to on
	Alloy.Globals.buoyStatus = 'on';
	updateStatusIcons();
}

function resetTestDisplay() {
	// Reset test display to initial state
	$.clickToStartLabel.visible = true;
	$.testingLabel.visible = false;
	$.signalDetectedLabel.visible = false;
	
	// Clear any active timers
	if (testTimer) {
		clearTimeout(testTimer);
		testTimer = null;
	}
	
	isTestingFrequency = false;
	
	// Re-enable test button
	$.testButton.enabled = true;
	$.testButton.opacity = 1.0;
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
	if (!Alloy.Globals.frequencyTested) {
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