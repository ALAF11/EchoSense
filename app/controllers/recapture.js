// Controller for Recapture Screen

// ========== STATE VARIABLES ==========
var timeSinceResurfaceTimer = null;
var driftSimulationTimer = null;

// Update interval
var UPDATE_INTERVAL = 1000; // 1 second

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('Recapture screen loaded - initializing');
	
	// Update all displays from global state
	updateTimeSinceResurfacing();
	updateDistanceAndBearing();
	updateTargetDrift();
	updateBuoyLocation();
	updateStatusIcons();
	
	// Start the timer for time since resurfacing (UI only)
	startTimeSinceResurfaceTimer();
	
	// Simulate drift updates (in production, this would come from GPS/sensors)
	startDriftSimulation();
	
	// Listen for global mission state updates
	Ti.App.addEventListener('mission:stateUpdated', onMissionStateUpdated);
}

// ========== EVENT HANDLERS FOR GLOBAL STATE ==========
function onMissionStateUpdated() {
	// Update UI when global state changes
	updateDistanceAndBearing();
	updateTargetDrift();
	updateStatusIcons();
}

// ========== DISPLAY UPDATES ==========
function updateTimeSinceResurfacing() {
	var elapsed = Alloy.Globals.getTimeSinceResurfacing();
	$.timeSinceResurfacing.text = Alloy.Globals.formatTime(elapsed);
	$.timeSinceResurfacing.color = '#2495A1';
}

function updateDistanceAndBearing() {
	var distanceStr = Math.round(Alloy.Globals.distanceToBuoy) + ' m';
	var bearingStr = (Alloy.Globals.bearingToBuoy < 100 ? '0' : '') + Math.round(Alloy.Globals.bearingToBuoy) + '°';
	
	$.distanceBearing.text = distanceStr + ' | ' + bearingStr;
	
	// Color based on distance
	if (Alloy.Globals.distanceToBuoy < 100) {
		$.distanceBearing.color = '#46D365'; // Green - close
	} else if (Alloy.Globals.distanceToBuoy < 300) {
		$.distanceBearing.color = '#FFA726'; // Orange - medium
	} else {
		$.distanceBearing.color = '#2495A1'; // Blue - far
	}
}

function updateTargetDrift() {
	var speedStr = Alloy.Globals.driftSpeed.toFixed(1) + ' m/s';
	var directionStr = (Alloy.Globals.driftDirection < 100 ? '0' : '') + Math.round(Alloy.Globals.driftDirection) + '°';
	
	$.targetDrift.text = speedStr + ' | ' + directionStr;
	$.targetDrift.color = '#2495A1';
}

function updateBuoyLocation() {
	// Format coordinates with proper precision
	var latStr = 'N ' + Alloy.Globals.buoyLatitude.toFixed(4);
	var lonStr = 'W ' + Math.abs(Alloy.Globals.buoyLongitude).toFixed(4);
	
	$.buoyCoordinates.text = latStr + ', ' + lonStr;
}

function updateStatusIcons() {
	// Update buoy status icon
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
	
	// Update device status icon
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
			$.deviceStatusIcon.image = '/img/icon_idle.png';
	}
}

// ========== TIMERS ==========
function startTimeSinceResurfaceTimer() {
	// Update time every second
	timeSinceResurfaceTimer = setInterval(function() {
		updateTimeSinceResurfacing();
	}, UPDATE_INTERVAL);
}

function stopTimeSinceResurfaceTimer() {
	if (timeSinceResurfaceTimer) {
		clearInterval(timeSinceResurfaceTimer);
		timeSinceResurfaceTimer = null;
	}
}

// ========== DRIFT SIMULATION ==========
function startDriftSimulation() {
	// Simulate drift changes over time (in production, this would be GPS data)
	driftSimulationTimer = setInterval(function() {
		// Simulate slight changes in distance and bearing
		Alloy.Globals.distanceToBuoy += (Math.random() - 0.5) * 5; // Random change +/- 2.5m
		Alloy.Globals.distanceToBuoy = Math.max(0, Alloy.Globals.distanceToBuoy); // Don't go negative
		
		Alloy.Globals.bearingToBuoy += (Math.random() - 0.5) * 2; // Random change +/- 1 degree
		if (Alloy.Globals.bearingToBuoy < 0) Alloy.Globals.bearingToBuoy += 360;
		if (Alloy.Globals.bearingToBuoy >= 360) Alloy.Globals.bearingToBuoy -= 360;
		
		// Update drift
		Alloy.Globals.driftSpeed += (Math.random() - 0.5) * 0.1; // Random change in drift speed
		Alloy.Globals.driftSpeed = Math.max(0, Math.min(2.0, Alloy.Globals.driftSpeed)); // Keep between 0-2 m/s
		
		Alloy.Globals.driftDirection += (Math.random() - 0.5) * 5; // Random change in drift direction
		if (Alloy.Globals.driftDirection < 0) Alloy.Globals.driftDirection += 360;
		if (Alloy.Globals.driftDirection >= 360) Alloy.Globals.driftDirection -= 360;
		
		// Update displays
		updateDistanceAndBearing();
		updateTargetDrift();
	}, 5000); // Update every 5 seconds
}

function stopDriftSimulation() {
	if (driftSimulationTimer) {
		clearInterval(driftSimulationTimer);
		driftSimulationTimer = null;
	}
}

// ========== ACTION BUTTONS ==========
function markAsRecovered(e) {
	Ti.API.info('Mark device as recovered');
	
	// Confirm action
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Mark as Recovered?',
		message: 'Confirm that the deep-sea device has been successfully recovered.',
		buttonNames: ['Cancel', 'Confirm Recovery'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performMarkAsRecovered();
		}
	});
	
	confirmDialog.show();
}

function performMarkAsRecovered() {
	Ti.API.info('Device marked as recovered');
	
	// End mission with recovered status
	Alloy.Globals.endMission('recovered');
	
	// Stop all timers
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	
	// Show success message
	var successDialog = Ti.UI.createAlertDialog({
		title: 'Device Recovered!',
		message: 'The deep-sea device has been successfully marked as recovered. Proceeding to summary...',
		ok: 'OK'
	});
	
	successDialog.addEventListener('click', function() {
		// Navigate to End/Summary screen
		navigateToEnd();
	});
	
	successDialog.show();
}

function markAsLost(e) {
	Ti.API.info('Mark device as lost');
	
	// Confirm action with warning
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Mark as Lost?',
		message: 'WARNING: This will mark the device as lost. This action should only be taken if recovery is impossible. Continue?',
		buttonNames: ['Cancel', 'Mark as Lost'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performMarkAsLost();
		}
	});
	
	confirmDialog.show();
}

function performMarkAsLost() {
	Ti.API.info('Device marked as lost');
	
	// End mission with lost status
	Alloy.Globals.endMission('lost');
	
	// Stop all timers
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	
	// Update device status
	Alloy.Globals.deviceStatus = 'offline';
	updateStatusIcons();
	
	// Show confirmation message
	var lostDialog = Ti.UI.createAlertDialog({
		title: 'Device Marked as Lost',
		message: 'The device has been marked as lost. Last known position and mission data have been saved.',
		ok: 'OK'
	});
	
	lostDialog.addEventListener('click', function() {
		// Navigate to End/Summary screen
		navigateToEnd();
	});
	
	lostDialog.show();
}

// ========== NAVIGATION ==========
function backToHome(e) {
	Ti.API.info('Going back to Main Menu');
	
	// Stop all timers
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	
	// Remove event listeners
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	
	// Close current window
	$.recaptureWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

function navigateToStatus(e) {
	Ti.API.info('Navigating to Status screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	$.recaptureWindow.close();
	
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	$.recaptureWindow.close();
	
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	$.recaptureWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	$.recaptureWindow.close();
	
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	$.recaptureWindow.close();
	
	// TODO: Create end controller when ready
	var tempAlert = Ti.UI.createAlertDialog({
		title: 'Coming Soon',
		message: 'End/Summary screen is not yet implemented.',
		ok: 'OK'
	});
	tempAlert.show();
}

function goBack(e) {
	Ti.API.info('Going back to Mission screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
	$.recaptureWindow.close();
	
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

// ========== WINDOW EVENTS ==========
$.recaptureWindow.addEventListener('open', function() {
	Ti.API.info('Recapture window opened - initializing');
	initializeScreen();
});

$.recaptureWindow.addEventListener('close', function() {
	Ti.API.info('Recapture window closing - cleaning up');
	
	// Clean up all timers
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	
	// Remove event listeners
	Ti.App.removeEventListener('mission:stateUpdated', onMissionStateUpdated);
});