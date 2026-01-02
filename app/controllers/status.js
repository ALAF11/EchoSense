// Controller for Status/Activate Screen

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
	
	if (!Alloy.Globals.isBuoyActive) {
		// Activate the buoy AND START THE MISSION
		Alloy.Globals.isBuoyActive = true;
		Alloy.Globals.buoyStatus = 'on';
		Alloy.Globals.deviceStatus = 'idle';
		
		Ti.API.info('Buoy activated');
		
		// Update UI immediately to show red button
		updateBuoyStatusDisplay();
		updateDeviceStatusDisplay();
		updateActivateButton();
		
		// Start the mission immediately
		Alloy.Globals.startMission();
		
		// Navigate to Frequency after 2 seconds
		setTimeout(function() {
			Ti.API.info('Navigating to Frequency screen');
			navigateToFrequency();
		}, 2000);
		
	} else {
		// Deactivate the buoy
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'Deactivate Buoy?',
			message: 'Are you sure you want to turn off the buoy? This will stop the mission.',
			buttonNames: ['Cancel', 'Deactivate'],
			cancel: 0
		});
		
		confirmDialog.addEventListener('click', function(evt) {
			if (evt.index === 1) {
				Alloy.Globals.isBuoyActive = false;
				Alloy.Globals.buoyStatus = 'off';
				Alloy.Globals.deviceStatus = 'offline';
				
				// Reset mission state
				Alloy.Globals.resetMissionState();
				
				Ti.API.info('Buoy deactivated and mission reset');
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
	if (!Alloy.Globals.isBuoyActive) {
		Ti.API.warn('Cannot change status - Buoy is not active');
		return;
	}
	
	var statusId = e.source.id;
	
	switch(statusId) {
		case 'buoyOff':
			Alloy.Globals.buoyStatus = 'off';
			Alloy.Globals.isBuoyActive = false;
			Alloy.Globals.deviceStatus = 'offline';
			break;
		case 'buoyOn':
			Alloy.Globals.buoyStatus = 'on';
			break;
		case 'buoyError':
			Alloy.Globals.buoyStatus = 'error';
			break;
		case 'buoyTransmitting':
			Alloy.Globals.buoyStatus = 'transmitting';
			break;
	}
	
	Ti.API.info('Buoy status changed to: ' + Alloy.Globals.buoyStatus);
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
	switch(Alloy.Globals.buoyStatus) {
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
	switch(Alloy.Globals.deviceStatus) {
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
	if (Alloy.Globals.isBuoyActive) {
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
	if (!Alloy.Globals.isBuoyActive) {
		Ti.API.warn('Cannot change device status - Buoy is not active');
		return;
	}
	
	Alloy.Globals.deviceStatus = newStatus;
	Ti.API.info('Device status changed to: ' + Alloy.Globals.deviceStatus);
	updateDeviceStatusDisplay();
}

// Navigate to Frequency Screen
function navigateToFrequency() {
	try {
		// Close current window
		$.statusWindow.close();
		
		// Open Frequency window
		var frequencyWindow = Alloy.createController('frequency').getView();
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
	if (!Alloy.Globals.isBuoyActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before proceeding to other screens.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	$.statusWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen from navbar');
	
	if (!Alloy.Globals.isBuoyActive) {
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
	
	if (!Alloy.Globals.isBuoyActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Buoy Not Active',
			message: 'Please activate the buoy before proceeding to other screens.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	$.statusWindow.close();
	
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen from navbar');
	
	if (!Alloy.Globals.isBuoyActive) {
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