// Controller for Trigger Code Screen

// Variables to track trigger code and test state
var selectedCode = null; // Will be 'A', 'B', or 'C'
var isTestingCode = false;
var testTimer = null;

// Import buoy and device status from previous screens
var currentBuoyStatus = 'on'; // Assuming buoy is active when coming from Frequency screen
var currentDeviceStatus = 'idle'; // Default device status

// Trigger codes definitions (Morse code)
var triggerCodes = {
	A: '-.-.',
	B: '-...-',
	C: '----.'
};

// Back to Main Menu
function backToHome(e) {
	Ti.API.info('Going back to Main Menu');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('Trigger Code screen loaded - initializing');
	
	// Update status icons based on current state
	updateStatusIcons();
	
	// Show "Click to start the test" message initially
	$.clickToStartLabel.visible = true;
	
	// Hide test components initially
	$.testingLabel.visible = false;
	$.waveformImage.visible = false;
	$.codeDetectedLabel.visible = false;
	
	// No code selected initially - all codes in default state
	resetCodeSelection();
}

// ========== CODE SELECTION ==========
function selectCode(e) {
	Ti.API.info('Code selection clicked');
	
	// Determine which code was selected based on container ID
	var containerId = e.source.id;
	
	if (containerId === 'codeAContainer') {
		selectedCode = 'A';
	} else if (containerId === 'codeBContainer') {
		selectedCode = 'B';
	} else if (containerId === 'codeCContainer') {
		selectedCode = 'C';
	} else {
		// If clicked on child element, get parent container
		var parent = e.source.parent;
		if (parent && parent.id === 'codeAContainer') {
			selectedCode = 'A';
		} else if (parent && parent.id === 'codeBContainer') {
			selectedCode = 'B';
		} else if (parent && parent.id === 'codeCContainer') {
			selectedCode = 'C';
		}
	}
	
	Ti.API.info('Selected code: ' + selectedCode);
	
	// Update UI to show selection
	updateCodeSelection();
	
	// Reset test results when changing code
	resetTestDisplay();
}

function updateCodeSelection() {
	// Reset all code options to default style
	$.codeAContainer.backgroundColor = 'rgba(56, 116, 130, 0.2)';
	$.codeAContainer.borderColor = '#387482';
	$.codeAContainer.borderWidth = 2;
	
	$.codeBContainer.backgroundColor = 'rgba(56, 116, 130, 0.2)';
	$.codeBContainer.borderColor = '#387482';
	$.codeBContainer.borderWidth = 2;
	
	$.codeCContainer.backgroundColor = 'rgba(56, 116, 130, 0.2)';
	$.codeCContainer.borderColor = '#387482';
	$.codeCContainer.borderWidth = 2;
	
	// Highlight selected code
	switch(selectedCode) {
		case 'A':
			$.codeAContainer.backgroundColor = 'rgba(56, 116, 130, 0.4)';
			$.codeAContainer.borderColor = '#46D365';
			$.codeAContainer.borderWidth = 3;
			break;
		case 'B':
			$.codeBContainer.backgroundColor = 'rgba(56, 116, 130, 0.4)';
			$.codeBContainer.borderColor = '#46D365';
			$.codeBContainer.borderWidth = 3;
			break;
		case 'C':
			$.codeCContainer.backgroundColor = 'rgba(56, 116, 130, 0.4)';
			$.codeCContainer.borderColor = '#46D365';
			$.codeCContainer.borderWidth = 3;
			break;
	}
}

function resetCodeSelection() {
	$.codeAContainer.backgroundColor = 'rgba(56, 116, 130, 0.2)';
	$.codeAContainer.borderColor = '#387482';
	$.codeAContainer.borderWidth = 2;
	
	$.codeBContainer.backgroundColor = 'rgba(56, 116, 130, 0.2)';
	$.codeBContainer.borderColor = '#387482';
	$.codeBContainer.borderWidth = 2;
	
	$.codeCContainer.backgroundColor = 'rgba(56, 116, 130, 0.2)';
	$.codeCContainer.borderColor = '#387482';
	$.codeCContainer.borderWidth = 2;
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

// ========== TRIGGER CODE TEST ==========
function testTriggerCode(e) {
	Ti.API.info('Testing trigger code');
	
	// Prevent multiple simultaneous tests
	if (isTestingCode) {
		Ti.API.warn('Test already in progress');
		return;
	}
	
	// Check if a code has been selected
	if (!selectedCode) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'No Code Selected',
			message: 'Please select a trigger code before testing.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	// Check if buoy is active
	if (currentBuoyStatus === 'off') {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before testing trigger code.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	Ti.API.info('Testing code: ' + selectedCode + ' (' + triggerCodes[selectedCode] + ')');
	
	// Start testing
	isTestingCode = true;
	
	// Update UI to show testing state
	$.clickToStartLabel.visible = false;
	$.testingLabel.visible = true;
	$.waveformImage.visible = true;
	$.codeDetectedLabel.visible = false;
	$.testButton.enabled = false;
	$.testButton.opacity = 0.5;
	
	// Change buoy status to transmitting
	currentBuoyStatus = 'transmitting';
	updateStatusIcons();
	
	// Simulate acoustic signal test (in production, this would communicate with hardware)
	testTimer = setTimeout(function() {
		completeTriggerCodeTest(true); // Simulate successful detection
	}, 3000); // 3 second delay to simulate testing
}

function completeTriggerCodeTest(success) {
	Ti.API.info('Trigger code test completed. Success: ' + success);
	
	isTestingCode = false;
	
	// Clear timer if exists
	if (testTimer) {
		clearTimeout(testTimer);
		testTimer = null;
	}
	
	// Update UI based on result
	$.testingLabel.visible = false;
	$.waveformImage.visible = false;
	$.clickToStartLabel.visible = false;
	
	if (success) {
		// Show success message
		$.codeDetectedLabel.visible = true;
		$.codeDetectedLabel.text = 'CODE DETECTED!';
		$.codeDetectedLabel.color = '#46D365';
		
		// Optionally show confirmation dialog
		var successDialog = Ti.UI.createAlertDialog({
			title: 'Test Successful',
			message: 'Trigger code ' + selectedCode + ' (' + triggerCodes[selectedCode] + ') was detected successfully.',
			ok: 'OK'
		});
		successDialog.show();
		
	} else {
		// Show failure message
		$.codeDetectedLabel.visible = true;
		$.codeDetectedLabel.text = 'NO CODE DETECTED';
		$.codeDetectedLabel.color = '#E74C3C';
		
		var failureDialog = Ti.UI.createAlertDialog({
			title: 'Test Failed',
			message: 'Trigger code ' + selectedCode + ' was not detected. Please try again.',
			ok: 'OK'
		});
		failureDialog.show();
	}
	
	// Hide result after 5 seconds and show "Click to start" again
	setTimeout(function() {
		$.codeDetectedLabel.visible = false;
		$.clickToStartLabel.visible = true;
	}, 5000);
	
	// Re-enable test button
	$.testButton.enabled = true;
	$.testButton.opacity = 1.0;
	
	// Return buoy status to on
	currentBuoyStatus = 'on';
	updateStatusIcons();
}

function resetTestDisplay() {
	// Reset test display to initial state
	$.clickToStartLabel.visible = true;
	$.testingLabel.visible = false;
	$.waveformImage.visible = false;
	$.codeDetectedLabel.visible = false;
	
	// Clear any active timers
	if (testTimer) {
		clearTimeout(testTimer);
		testTimer = null;
	}
	
	isTestingCode = false;
	
	// Re-enable test button
	$.testButton.enabled = true;
	$.testButton.opacity = 1.0;
}

// ========== NAVIGATION ==========
function navigateToStatus(e) {
	Ti.API.info('Navigating to Status screen');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open Status window
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open Frequency window
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Already on Trigger Code screen');
	// Do nothing - already on this screen
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open Mission window
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open Recapture window
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open End window
	var endWindow = Alloy.createController('end').getView();
	endWindow.open();
}

function goBack(e) {
	Ti.API.info('Going back to Frequency screen');
	
	// Close current window
	$.triggerCodeWindow.close();
	
	// Open Frequency window
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function goNext(e) {
	Ti.API.info('Going to next screen (Mission)');
	
	// Validate that a code has been selected and tested
	if (!selectedCode) {
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'No Code Selected',
			message: 'It is recommended to select and test a trigger code before proceeding. Continue anyway?',
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
	
	// Check if code was tested successfully
	if (!$.codeDetectedLabel.visible || $.codeDetectedLabel.color !== '#46D365') {
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'Code Not Tested',
			message: 'It is recommended to test the trigger code before proceeding. Continue anyway?',
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
	
	// Code selected and tested successfully, proceed
	proceedToNextScreen();
}

function proceedToNextScreen() {
	// Close current window
	$.triggerCodeWindow.close();

	// Create Mission controller
	var missionController = Alloy.createController('mission');
	
	// Pass selected trigger code to Mission screen
	if (selectedCode) {
		missionController.setTriggerCode(selectedCode);
	}
	
	// Pass current buoy and device status
	missionController.setBuoyStatus(currentBuoyStatus);
	missionController.setDeviceStatus(currentDeviceStatus);
	
	// Open Mission window
	var missionWindow = missionController.getView();
	missionWindow.open();
}

// ========== WINDOW EVENTS ==========
// Initialize when window opens
$.triggerCodeWindow.addEventListener('open', function() {
	Ti.API.info('Trigger Code window opened - initializing');
	initializeScreen();
});

// Cleanup when window closes
$.triggerCodeWindow.addEventListener('close', function() {
	Ti.API.info('Trigger Code window closing - cleaning up');
	
	// Clear any active timers
	if (testTimer) {
		clearTimeout(testTimer);
		testTimer = null;
	}
	
	// Reset test state
	isTestingCode = false;
});

// ========== EXPORTS ==========
exports.setSelectedCode = function(code) {
	if (code === 'A' || code === 'B' || code === 'C') {
		selectedCode = code;
		updateCodeSelection();
	}
};

exports.setBuoyStatus = function(status) {
	currentBuoyStatus = status;
	updateStatusIcons();
};

exports.setDeviceStatus = function(status) {
	currentDeviceStatus = status;
	updateStatusIcons();
};

exports.getSelectedCode = function() {
	return selectedCode;
};