// Controller for Mission Screen

// ========== MISSION STATE VARIABLES ==========
var missionActive = false;
var missionStartTime = null;
var elapsedTimeTimer = null;
var simulationTimer = null;

// Device state tracking
var currentDepth = 0; // meters
var currentDistance = 0; // meters from buoy
var deviceStatus = 'idle'; // idle, descending, ascending
var selectedTriggerCode = 'A'; // Default trigger code

// Buoy status
var currentBuoyStatus = 'on'; // off, on, error, transmitting

// Mission parameters
var MAX_DEPTH = 245; // Maximum depth in meters (from your screenshot)
var ASCENT_THRESHOLD = 10; // When device is less than 10m, it goes to idle
var DESCENT_RATE = 1.0; // meters per second
var ASCENT_RATE = 0.8; // meters per second
var UPDATE_INTERVAL = 1000; // Update every 1 second

// Acoustic trigger state
var acousticTriggerActivated = false;

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('Mission screen loaded - initializing');
	
	// Update UI displays
	updateDepthDisplay();
	updateDistanceDisplay();
	updateElapsedTimeDisplay();
	updateDeviceStatusDisplay();
	updateBuoyStatusIcon();
	updateTriggerCodeDisplay();
	
	// Check if coming from previous screens with active mission
	// In production, this would load saved state
}

// ========== DISPLAY UPDATES ==========
function updateDepthDisplay() {
	if (currentDepth < 10) {
		$.depthValue.text = '<10m';
		$.depthValue.color = '#2495A1'; // Blue when near surface
	} else {
		$.depthValue.text = Math.round(currentDepth) + 'm';
		
		// Color based on depth
		if (currentDepth < 50) {
			$.depthValue.color = '#2495A1'; // Blue
		} else if (currentDepth < 150) {
			$.depthValue.color = '#FFA726'; // Orange
		} else {
			$.depthValue.color = '#2495A1'; // Blue
		}
	}
}

function updateDistanceDisplay() {
	$.distanceValue.text = Math.round(currentDistance) + 'm';
	
	// Color based on distance
	if (currentDistance < 100) {
		$.distanceValue.color = '#2495A1'; // Blue
	} else if (currentDistance < 300) {
		$.distanceValue.color = '#FFA726'; // Orange
	} else {
		$.distanceValue.color = '#E74C3C'; // Red
	}
}

function updateElapsedTimeDisplay() {
	if (!missionStartTime) {
		$.elapsedTimeValue.text = '00:00:00';
		return;
	}
	
	var now = new Date();
	var elapsed = Math.floor((now - missionStartTime) / 1000); // seconds
	
	var hours = Math.floor(elapsed / 3600);
	var minutes = Math.floor((elapsed % 3600) / 60);
	var seconds = elapsed % 60;
	
	// Format as HH:MM:SS
	var timeString = 
		(hours < 10 ? '0' : '') + hours + ':' +
		(minutes < 10 ? '0' : '') + minutes + ':' +
		(seconds < 10 ? '0' : '') + seconds;
	
	$.elapsedTimeValue.text = timeString;
}

function updateDeviceStatusDisplay() {
	switch(deviceStatus) {
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
			$.buoyStatusIcon.image = '/img/icon_signal.png';
	}
}

function updateTriggerCodeDisplay() {
	$.selectedCodeLabel.text = selectedTriggerCode;
}

// ========== MISSION SIMULATION ==========
function startMissionSimulation() {
	Ti.API.info('Starting mission simulation');
	
	missionActive = true;
	missionStartTime = new Date();
	
	// Start with device descending
	deviceStatus = 'descending';
	currentDepth = 0;
	currentDistance = 0;
	
	// Update initial display
	updateDeviceStatusDisplay();
	
	// Start the elapsed time timer
	startElapsedTimeTimer();
	
	// Start the simulation timer
	simulationTimer = setInterval(function() {
		updateMissionSimulation();
	}, UPDATE_INTERVAL);
}

function updateMissionSimulation() {
	if (!missionActive) {
		return;
	}
	
	// Update based on device status
	switch(deviceStatus) {
		case 'descending':
			// Increase depth
			currentDepth += DESCENT_RATE;
			
			// Calculate distance from buoy (increases as device descends)
			currentDistance = currentDepth * 1.3; // Approximate drift
			
			// Check if reached maximum depth
			if (currentDepth >= MAX_DEPTH) {
				currentDepth = MAX_DEPTH;
				deviceStatus = 'idle';
				Ti.API.info('Device reached maximum depth: ' + MAX_DEPTH + 'm');
			}
			break;
			
		case 'ascending':
			// Decrease depth
			currentDepth -= ASCENT_RATE;
			
			// Update distance (may increase initially due to currents)
			currentDistance = currentDepth * 1.5;
			
			// Check if near surface
			if (currentDepth <= ASCENT_THRESHOLD) {
				currentDepth = Math.max(0, currentDepth);
				deviceStatus = 'idle';
				Ti.API.info('Device reached surface - ready for recapture');
				
				// Show success notification
				showRecaptureReadyNotification();
			}
			break;
			
		case 'idle':
			// Device is waiting (either at depth or at surface)
			// No depth changes
			break;
	}
	
	// Update displays
	updateDepthDisplay();
	updateDistanceDisplay();
	updateDeviceStatusDisplay();
}

function stopMissionSimulation() {
	Ti.API.info('Stopping mission simulation');
	
	missionActive = false;
	
	// Clear timers
	if (simulationTimer) {
		clearInterval(simulationTimer);
		simulationTimer = null;
	}
	
	stopElapsedTimeTimer();
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
	if (!missionActive) {
		// Start mission simulation for testing purposes
		var confirmDialog = Ti.UI.createAlertDialog({
			title: 'Start Mission?',
			message: 'No active mission detected. Start a simulated mission for testing?',
			buttonNames: ['Cancel', 'Start Mission'],
			cancel: 0
		});
		
		confirmDialog.addEventListener('click', function(evt) {
			if (evt.index === 1) {
				startMissionSimulation();
			}
		});
		
		confirmDialog.show();
		return;
	}
	
	// Check device status
	if (deviceStatus !== 'descending' && deviceStatus !== 'idle') {
		var alertDialog = Ti.UI.createAlertDialog({
			title: 'Invalid State',
			message: 'Acoustic trigger can only be activated when device is descending or at depth.',
			ok: 'OK'
		});
		alertDialog.show();
		return;
	}
	
	// Confirm activation
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Activate Acoustic Trigger?',
		message: 'This will send the trigger code "' + selectedTriggerCode + '" to initiate device ascent.',
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
	Ti.API.info('Performing acoustic trigger with code: ' + selectedTriggerCode);
	
	acousticTriggerActivated = true;
	
	// Update button state
	$.activateButton.enabled = false;
	$.activateButton.opacity = 0.5;
	$.activateButton.backgroundColor = '#46D365';
	$.activateButton.color = '#ffffffff'; 
	$.activateButton.title = 'ACTIVATED ACOUSTIC TRIGGER';
	
	// Change buoy status to transmitting
	currentBuoyStatus = 'transmitting';
	updateBuoyStatusIcon();
	
	// Simulate acoustic transmission (in production, this would communicate with hardware)
	setTimeout(function() {
		// Transmission complete
		currentBuoyStatus = 'on';
		updateBuoyStatusIcon();
		
		// Initiate ascent
		if (deviceStatus === 'descending' || deviceStatus === 'idle') {
			deviceStatus = 'ascending';
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
	
	// Stop all timers and simulation
	stopMissionSimulation();
	
	// Reset states
	deviceStatus = 'offline';
	currentBuoyStatus = 'off';
	
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
	
	// Stop any active timers
	stopMissionSimulation();
	
	// Close current window
	$.missionWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

function navigateToStatus(e) {
	Ti.API.info('Navigating to Status screen');
	stopMissionSimulation();
	$.missionWindow.close();
	
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	stopMissionSimulation();
	$.missionWindow.close();
	
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen');
	stopMissionSimulation();
	$.missionWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen');
	
	// Don't stop simulation - pass state to Recapture screen
	$.missionWindow.close();
	
	// TODO: Create recapture controller when ready
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen');
	stopMissionSimulation();
	$.missionWindow.close();
	
	// TODO: Create end controller when ready
	var endWindow = Alloy.createController('end').getView();
	endWindow.open();
}

function goBack(e) {
	Ti.API.info('Going back to Trigger Code screen');
	stopMissionSimulation();
	$.missionWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function goNext(e) {
	Ti.API.info('Going to next screen (Recapture)');
	
	// Check if device is ready for recapture
	if (deviceStatus === 'ascending' || (deviceStatus === 'idle' && currentDepth < ASCENT_THRESHOLD)) {
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
	
	// Clean up all timers
	stopMissionSimulation();
});

// ========== EXPORTS ==========
exports.setTriggerCode = function(code) {
	selectedTriggerCode = code;
	updateTriggerCodeDisplay();
};

exports.setBuoyStatus = function(status) {
	currentBuoyStatus = status;
	updateBuoyStatusIcon();
};

exports.setDeviceStatus = function(status) {
	deviceStatus = status;
	updateDeviceStatusDisplay();
};

exports.startMission = function() {
	startMissionSimulation();
};

exports.getCurrentDepth = function() {
	return currentDepth;
};

exports.getCurrentDistance = function() {
	return currentDistance;
};

exports.getDeviceStatus = function() {
	return deviceStatus;
};