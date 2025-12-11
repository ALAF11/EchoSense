// Controller for Status/Activate Screen

// Variables to track current status
var currentBuoyStatus = 'off'; // off, on, error, transmitting
var currentDeviceStatus = 'offline'; // offline, idle, descending, ascending
var isBuoyActive = false;

// Back to Main Menu
function backToHome(e) {
	Ti.API.info('Going back to Main Menu');
	
	// Close current window
	$.statusWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

// Toggle Buoy Activation
function toggleBuoyActivation(e) {
	Ti.API.info('Toggle Buoy Activation');
	
	if (!isBuoyActive) {
		// Activate the buoy
		isBuoyActive = true;
		currentBuoyStatus = 'on';
		currentDeviceStatus = 'idle';
		
		Ti.API.info('Buoy activated');
		
		// Update UI immediately to show red button
		updateBuoyStatusDisplay();
		updateDeviceStatusDisplay();
		updateActivateButton();
		
		// Navigate to Frequency after 2 seconds
		setTimeout(function() {
			Ti.API.info('Navigating to Frequency screen');
			navigateToFrequency();
		}, 2000);
		
	} else {
		// Deactivate the buoy
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'Deactivate Buoy?',
			message: 'Are you sure you want to turn off the buoy?',
			buttonNames: ['Cancel', 'Deactivate'],
			cancel: 0
		});
		
		confirmDialog.addEventListener('click', function(evt) {
			if (evt.index === 1) {
				isBuoyActive = false;
				currentBuoyStatus = 'off';
				currentDeviceStatus = 'offline';
				Ti.API.info('Buoy deactivated');
			}
			updateBuoyStatusDisplay();
			updateDeviceStatusDisplay();
			updateActivateButton();
		});
		
		confirmDialog.show();
		return;
	}
}

// Set Buoy Status (for manual status simulation - development only)
function setBuoyStatus(e) {
	if (!isBuoyActive) {
		Ti.API.warn('Cannot change status - Buoy is not active');
		return;
	}
	
	var statusId = e.source.id;
	
	switch(statusId) {
		case 'buoyOff':
			currentBuoyStatus = 'off';
			isBuoyActive = false;
			currentDeviceStatus = 'offline';
			break;
		case 'buoyOn':
			currentBuoyStatus = 'on';
			break;
		case 'buoyError':
			currentBuoyStatus = 'error';
			break;
		case 'buoyTransmitting':
			currentBuoyStatus = 'transmitting';
			break;
	}
	
	Ti.API.info('Buoy status changed to: ' + currentBuoyStatus);
	updateBuoyStatusDisplay();
	updateActivateButton();
}

// Update Buoy Status Display
function updateBuoyStatusDisplay() {
	// Reset all to inactive state
	$.buoyOff.children[0].opacity = 0.3;
	$.buoyOff.children[1].color = '#637B85';
	
	$.buoyOn.children[0].opacity = 0.3;
	$.buoyOn.children[1].color = '#637B85';
	
	$.buoyError.children[0].opacity = 0.3;
	$.buoyError.children[1].color = '#637B85';
	
	$.buoyTransmitting.children[0].opacity = 0.3;
	$.buoyTransmitting.children[1].color = '#637B85';
	
	// Set active status
	switch(currentBuoyStatus) {
		case 'off':
			$.buoyOff.children[0].opacity = 1.0;
			$.buoyOff.children[1].color = '#FFFFFF';
			break;
		case 'on':
			$.buoyOn.children[0].opacity = 1.0;
			$.buoyOn.children[1].color = '#FFFFFF';
			break;
		case 'error':
			$.buoyError.children[0].opacity = 1.0;
			$.buoyError.children[1].color = '#FFFFFF';
			break;
		case 'transmitting':
			$.buoyTransmitting.children[0].opacity = 1.0;
			$.buoyTransmitting.children[1].color = '#FFFFFF';
			break;
	}
}

// Update Device Status Display
function updateDeviceStatusDisplay() {
	// Reset all to inactive state
	$.deviceOffline.children[0].opacity = 0.3;
	$.deviceOffline.children[1].color = '#637B85';
	
	$.deviceIdle.children[0].opacity = 0.3;
	$.deviceIdle.children[1].color = '#637B85';
	
	$.deviceDescending.children[0].opacity = 0.3;
	$.deviceDescending.children[1].color = '#637B85';
	
	$.deviceAscending.children[0].opacity = 0.3;
	$.deviceAscending.children[1].color = '#637B85';
	
	// Set active status
	switch(currentDeviceStatus) {
		case 'offline':
			$.deviceOffline.children[0].opacity = 1.0;
			$.deviceOffline.children[1].color = '#FFFFFF';
			break;
		case 'idle':
			$.deviceIdle.children[0].opacity = 1.0;
			$.deviceIdle.children[1].color = '#FFFFFF';
			break;
		case 'descending':
			$.deviceDescending.children[0].opacity = 1.0;
			$.deviceDescending.children[1].color = '#FFFFFF';
			break;
		case 'ascending':
			$.deviceAscending.children[0].opacity = 1.0;
			$.deviceAscending.children[1].color = '#FFFFFF';
			break;
	}
}

// Update Activate Button
function updateActivateButton() {
	if (isBuoyActive) {
		$.activateButton.title = 'DEACTIVATE';
		$.activateButton.backgroundColor = '#E74C3C';
		$.activateButton.color = '#FFFFFF';
	} else {
		$.activateButton.title = 'ACTIVATE';
		$.activateButton.backgroundColor = '#FFFFFF';
		$.activateButton.color = '#2495A1';
	}
}

// Simulate Device Status Change (for testing purposes)
function simulateDeviceStatusChange(newStatus) {
	if (!isBuoyActive) {
		Ti.API.warn('Cannot change device status - Buoy is not active');
		return;
	}
	
	currentDeviceStatus = newStatus;
	Ti.API.info('Device status changed to: ' + currentDeviceStatus);
	updateDeviceStatusDisplay();
}

// Navigate to Frequency Screen
function navigateToFrequency() {
	try {
		// Create Frequency controller
		var frequencyController = Alloy.createController('frequency');
		
		// Pass current status to Frequency screen
		frequencyController.setBuoyStatus(currentBuoyStatus);
		frequencyController.setDeviceStatus(currentDeviceStatus);
		
		// Get the window and open it
		var frequencyWindow = frequencyController.getView();
		
		// Close current window
		$.statusWindow.close();
		
		// Open Frequency window
		frequencyWindow.open();
		
		Ti.API.info('Successfully navigated to Frequency screen');
	} catch(error) {
		Ti.API.error('Error navigating to Frequency: ' + error);
		
		// Show error to user
		var errorDialog = Ti.UI.createAlertDialog({
			title: 'Navigation Error',
			message: 'Could not open Frequency screen. Please try again.',
			ok: 'OK'
		});
		errorDialog.show();
	}
}

// ========== NAVIGATION FROM NAVBAR ==========
function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen from navbar');
	
	// Check if buoy is active before navigating
	if (!isBuoyActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before proceeding to other screens.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	$.statusWindow.close();
	
	// TODO: Create triggercode controller when ready
	// var triggerCodeWindow = Alloy.createController('triggercode').getView();
	// triggerCodeWindow.open();
	
	// Temporary alert
	var tempAlert = Ti.UI.createAlertDialog({
		title: 'Coming Soon',
		message: 'Trigger Code screen is not yet implemented.',
		ok: 'OK'
	});
	tempAlert.show();
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen from navbar');
	
	if (!isBuoyActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before proceeding to other screens.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	$.statusWindow.close();

	
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen from navbar');
	
	if (!isBuoyActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before proceeding to other screens.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	$.statusWindow.close();
	
	// TODO: Create recapture controller when ready
	// var recaptureWindow = Alloy.createController('recapture').getView();
	// recaptureWindow.open();
	
	// Temporary alert
	var tempAlert = Ti.UI.createAlertDialog({
		title: 'Coming Soon',
		message: 'Recapture screen is not yet implemented.',
		ok: 'OK'
	});
	tempAlert.show();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen from navbar');
	
	if (!isBuoyActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before proceeding to other screens.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	$.statusWindow.close();
	
	// TODO: Create end controller when ready
	// var endWindow = Alloy.createController('end').getView();
	// endWindow.open();
	
	// Temporary alert
	var tempAlert = Ti.UI.createAlertDialog({
		title: 'Coming Soon',
		message: 'End screen is not yet implemented.',
		ok: 'OK'
	});
	tempAlert.show();
}

// Initialize on load
Ti.API.info('Status controller loaded - initializing display');
updateBuoyStatusDisplay();
updateDeviceStatusDisplay();
updateActivateButton();

// Export functions for external access
exports.backToHome = backToHome;
exports.toggleBuoyActivation = toggleBuoyActivation;
exports.setBuoyStatus = setBuoyStatus;
exports.simulateDeviceStatusChange = simulateDeviceStatusChange;
exports.navigateToFrequency = navigateToFrequency;
exports.navigateToTriggerCode = navigateToTriggerCode;
exports.navigateToMission = navigateToMission;
exports.navigateToRecapture = navigateToRecapture;
exports.navigateToEnd = navigateToEnd;
exports.getCurrentBuoyStatus = function() { return currentBuoyStatus; };
exports.getCurrentDeviceStatus = function() { return currentDeviceStatus; };
exports.isBuoyActive = function() { return isBuoyActive; };