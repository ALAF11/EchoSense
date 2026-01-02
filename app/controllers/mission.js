// Controller for Mission Screen

// ========== MISSION STATE VARIABLES ==========
var elapsedTimeTimer = null;
var deviceResurfaceNotified = false;

// Update interval
var UPDATE_INTERVAL = 1000; // 1 second

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('Mission screen loaded - initializing');
	
	// Update UI displays from global state
	updateDepthDisplay();
	updateDistanceDisplay();
	updateElapsedTimeDisplay();
	updateDeviceStatusDisplay();
	updateBuoyStatusIcon();
	updateTriggerCodeDisplay();
	
	// Update button state if acoustic trigger already activated
	if (Alloy.Globals.acousticTriggerActivated) {
		$.activateButton.enabled = false;
		$.activateButton.opacity = 0.5;
		$.activateButton.backgroundColor = '#46D365';
		$.activateButton.color = '#ffffffff'; 
		$.activateButton.title = 'ACTIVATED ACOUSTIC TRIGGER';
	}
	
	// Start the elapsed time timer (UI only)
	startElapsedTimeTimer();
	
	// Listen for global mission state updates
	Ti.App.addEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.addEventListener('device:resurfaced', onDeviceResurfaced);
}

// ========== EVENT HANDLERS FOR GLOBAL STATE ==========
function onMissionStateUpdated() {
	// Update UI when global state changes
	updateDepthDisplay();
	updateDistanceDisplay();
	updateDeviceStatusDisplay();
}

function onDeviceResurfaced() {
	// Show notification only once
	if (!deviceResurfaceNotified) {
		deviceResurfaceNotified = true;
		showRecaptureReadyNotification();
	}
}

// ========== DISPLAY UPDATES ==========
function updateDepthDisplay() {
	if (Alloy.Globals.currentDepth < 10) {
		$.depthValue.text = '<10m';
		$.depthValue.color = '#2495A1'; // Blue when near surface
	} else {
		$.depthValue.text = Math.round(Alloy.Globals.currentDepth) + 'm';
		
		// Color based on depth
		if (Alloy.Globals.currentDepth < 50) {
			$.depthValue.color = '#2495A1'; // Blue
		} else if (Alloy.Globals.currentDepth < 150) {
			$.depthValue.color = '#FFA726'; // Orange
		} else {
			$.depthValue.color = '#2495A1'; // Blue
		}
	}
}

function updateDistanceDisplay() {
	$.distanceValue.text = Math.round(Alloy.Globals.currentDistance) + 'm';
	
	// Color based on distance
	if (Alloy.Globals.currentDistance < 100) {
		$.distanceValue.color = '#2495A1'; // Blue
	} else if (Alloy.Globals.currentDistance < 300) {
		$.distanceValue.color = '#FFA726'; // Orange
	} else {
		$.distanceValue.color = '#E74C3C'; // Red
	}
}

function updateElapsedTimeDisplay() {
	var elapsed = Alloy.Globals.getElapsedMissionTime();
	$.elapsedTimeValue.text = Alloy.Globals.formatTime(elapsed);
}

function updateDeviceStatusDisplay() {
	switch(Alloy.Globals.deviceStatus) {
		case 'idle':
			$.deviceStatusValue.text = 'IDLE';
			$.deviceStatusValue.color = '#2495A1'; 
			break;
		case 'descending':
			$.deviceStatusValue.text = 'DESCENDING';
			$.deviceStatusValue.color = '#2495A1'; 
			break;
		case 'ascending':
			$.deviceStatusValue.text = 'ASCENDING';
			$.deviceStatusValue.color = '#2495A1'; 
			break;
		case 'offline':
			$.deviceStatusValue.text = 'OFFLINE';
			$.deviceStatusValue.color = '#8a8a8aff'; 
			break;
	}
}

function updateBuoyStatusIcon() {
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
			$.buoyStatusIcon.image = '/img/icon_signal.png';
	}
}

function updateTriggerCodeDisplay() {
	if (Alloy.Globals.selectedTriggerCode) {
		$.selectedCodeLabel.text = Alloy.Globals.selectedTriggerCode;
	} else {
		$.selectedCodeLabel.text = '-';
	}
}

// ========== ELAPSED TIME TIMER ==========
function startElapsedTimeTimer() {
	// Update elapsed time every second
	elapsedTimeTimer = setInterval(function() {
		updateElapsedTimeDisplay();
	}, 1000);
}

function stopElapsedTimeTimer() {
	if (elapsedTimeTimer) {
		clearInterval(elapsedTimeTimer);
		elapsedTimeTimer = null;
	}
}

// ========== ACOUSTIC TRIGGER ==========
function activateAcousticTrigger(e) {
	Ti.API.info('Activating acoustic trigger');
	
	// Check if mission is active
	if (!Alloy.Globals.missionActive) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Mission Not Active',
			message: 'No active mission detected. Please activate the buoy first.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	// Check device status
	if (Alloy.Globals.deviceStatus !== 'descending' && Alloy.Globals.deviceStatus !== 'idle') {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Invalid State',
			message: 'Acoustic trigger can only be activated when device is descending or at depth.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	// Check if already activated
	if (Alloy.Globals.acousticTriggerActivated) {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Already Activated',
			message: 'Acoustic trigger has already been activated. Device is ascending.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	// Confirm activation
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Activate Acoustic Trigger?',
		message: 'This will send the trigger code "' + (Alloy.Globals.selectedTriggerCode || 'None') + '" to initiate device ascent.',
		buttonNames: ['Cancel', 'Activate'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performAcousticTrigger();
		}
	});
	
	confirmDialog.show();
}

function performAcousticTrigger() {
	Ti.API.info('Performing acoustic trigger with code: ' + Alloy.Globals.selectedTriggerCode);
	
	// Update button state
	$.activateButton.enabled = false;
	$.activateButton.opacity = 0.5;
	$.activateButton.backgroundColor = '#46D365';
	$.activateButton.color = '#ffffffff'; 
	$.activateButton.title = 'ACTIVATED ACOUSTIC TRIGGER';
	
	// Change buoy status to transmitting
	Alloy.Globals.buoyStatus = 'transmitting';
	updateBuoyStatusIcon();
	
	// Simulate acoustic transmission (in production, this would communicate with hardware)
	setTimeout(function() {
		// Transmission complete
		Alloy.Globals.buoyStatus = 'on';
		updateBuoyStatusIcon();
		
		// Activate acoustic trigger using global function
		var success = Alloy.Globals.activateAcousticTrigger();
		
		if (success) {
			updateDeviceStatusDisplay();
			
			Ti.API.info('Device status changed to ascending');
			
			// Show success notification
			var successDialog = Ti.UI.createAlertDialog({
				title: 'Trigger Successful',
				message: 'Acoustic trigger code sent successfully. Device is now ascending.',
				ok: 'OK'
			});
			successDialog.show();
		}
	}, 2000); // 2 second delay to simulate transmission
}

// ========== EMERGENCY ABORT ==========
function emergencyAbort(e) {
	Ti.API.info('Emergency abort requested');
	
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Emergency Abort?',
		message: 'This will immediately stop the mission and abort all operations. Continue?',
		buttonNames: ['Cancel', 'Abort Mission'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performEmergencyAbort();
		}
	});
	
	confirmDialog.show();
}

function performEmergencyAbort() {
	Ti.API.info('Performing emergency abort');
	
	// Stop elapsed time timer
	stopElapsedTimeTimer();
	
	// Reset global mission state (this stops global simulation)
	Alloy.Globals.resetMissionState();
	
	// Update displays
	updateDeviceStatusDisplay();
	updateBuoyStatusIcon();
	
	// Show abort confirmation
	var abortDialog = Ti.UI.createAlertDialog({
		title: 'Mission Aborted',
		message: 'The mission has been aborted. All operations have been stopped.',
		ok: 'OK'
	});
	
	abortDialog.addEventListener('click', function() {
		// Return to main menu
		backToHome();
	});
	
	abortDialog.show();
}

// ========== NOTIFICATIONS ==========
function showRecaptureReadyNotification() {
	var readyDialog = Ti.UI.createAlertDialog({
		title: 'Device Ready for Recapture',
		message: 'The device has surfaced and is ready for recapture. Proceed to Recapture screen?',
		buttonNames: ['Stay Here', 'Go to Recapture'],
		cancel: 0
	});
	
	readyDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			navigateToRecapture();
		}
	});
	
	readyDialog.show();
}

// ========== NAVIGATION ==========
function backToHome(e) {
	Ti.API.info('Going back to Main Menu');
	
	// Stop elapsed time timer
	stopElapsedTimeTimer();
	
	// Remove event listeners
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	
	// Close current window
	$.missionWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

function navigateToStatus(e) {
	Ti.API.info('Navigating to Status screen');
	stopElapsedTimeTimer();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	$.missionWindow.close();
	
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	stopElapsedTimeTimer();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	$.missionWindow.close();
	
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen');
	stopElapsedTimeTimer();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	$.missionWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen');
	
	// Don't stop simulation - it continues in background
	stopElapsedTimeTimer();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	$.missionWindow.close();
	
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen');
	stopElapsedTimeTimer();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	$.missionWindow.close();
	
	// TODO: Create end controller when ready
	var tempAlert = Ti.UI.createAlertDialog({
		title: 'Coming Soon',
		message: 'End screen is not yet implemented.',
		ok: 'OK'
	});
	tempAlert.show();
}

function goBack(e) {
	Ti.API.info('Going back to Trigger Code screen');
	stopElapsedTimeTimer();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	$.missionWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function goNext(e) {
	Ti.API.info('Going to next screen (Recapture)');
	
	// Check if device is ready for recapture
	if (Alloy.Globals.deviceStatus === 'ascending' || 
	    (Alloy.Globals.deviceStatus === 'idle' && Alloy.Globals.currentDepth < Alloy.Globals.ASCENT_THRESHOLD)) {
		navigateToRecapture();
	} else {
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'Device Not Ready',
			message: 'Device is not yet ready for recapture. Proceed anyway?',
			buttonNames: ['Cancel', 'Continue'],
			cancel: 0
		});
		
		confirmDialog.addEventListener('click', function(evt) {
			if (evt.index === 1) {
				navigateToRecapture();
			}
		});
		
		confirmDialog.show();
	}
}

// ========== WINDOW EVENTS ==========
$.missionWindow.addEventListener('open', function() {
	Ti.API.info('Mission window opened - initializing');
	initializeScreen();
});

$.missionWindow.addEventListener('close', function() {
	Ti.API.info('Mission window closing - cleaning up');
	
	// Clean up timers
	stopElapsedTimeTimer();
	
	// Remove event listeners
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	Ti.App.removeEventListener('device:resurfaced', onDeviceResurfaced);
	
	// Reset resurface notification flag
	deviceResurfaceNotified = false;
});