// Controller for Recapture Screen

// ========== STATE VARIABLES ==========
var resurfaceStartTime = null;
var timeSinceResurfaceTimer = null;

// Device and buoy state
var currentBuoyStatus = 'on'; // off, on, error, transmitting
var currentDeviceStatus = 'idle'; // offline, idle, descending, ascending

// Location data
var buoyLatitude = 54.0822; // Example coordinates (from your screenshot)
var buoyLongitude = -118.2437;
var boatLatitude = 54.1000; // Example boat position
var boatLongitude = -118.2000;

// Drift and distance data
var distanceToBuoy = 420; // meters
var bearingToBuoy = 72; // degrees
var driftSpeed = 0.6; // m/s
var driftDirection = 105; // degrees

// Mission state
var deviceRecovered = false;
var deviceLost = false;

// Update interval
var UPDATE_INTERVAL = 1000; // 1 second

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('Recapture screen loaded - initializing');
	
	// Set resurface start time (would come from mission data)
	if (!resurfaceStartTime) {
		resurfaceStartTime = new Date();
	}
	
	// Update all displays
	updateTimeSinceResurfacing();
	updateDistanceAndBearing();
	updateTargetDrift();
	updateBuoyLocation();
	updateStatusIcons();
	
	// Start the timer for time since resurfacing
	startTimeSinceResurfaceTimer();
	
	// Simulate drift updates (in production, this would come from GPS/sensors)
	startDriftSimulation();
}

// ========== DISPLAY UPDATES ==========
function updateTimeSinceResurfacing() {
	if (!resurfaceStartTime) {
		$.timeSinceResurfacing.text = '00:00:00';
		return;
	}
	
	var now = new Date();
	var elapsed = Math.floor((now - resurfaceStartTime) / 1000); // seconds
	
	var hours = Math.floor(elapsed / 3600);
	var minutes = Math.floor((elapsed % 3600) / 60);
	var seconds = elapsed % 60;
	
	// Format as HH:MM:SS
	var timeString = 
		(hours < 10 ? '0' : '') + hours + ':' +
		(minutes < 10 ? '0' : '') + minutes + ':' +
		(seconds < 10 ? '0' : '') + seconds;
	
	$.timeSinceResurfacing.text = timeString;
	$.timeSinceResurfacing.color = '#2495A1';
}

function updateDistanceAndBearing() {
	var distanceStr = Math.round(distanceToBuoy) + ' m';
	var bearingStr = (bearingToBuoy < 100 ? '0' : '') + Math.round(bearingToBuoy) + '°';
	
	$.distanceBearing.text = distanceStr + ' | ' + bearingStr;
	
	// Color based on distance
	if (distanceToBuoy < 100) {
		$.distanceBearing.color = '#46D365'; // Green - close
	} else if (distanceToBuoy < 300) {
		$.distanceBearing.color = '#FFA726'; // Orange - medium
	} else {
		$.distanceBearing.color = '#2495A1'; // Blue - far
	}
}

function updateTargetDrift() {
	var speedStr = driftSpeed.toFixed(1) + ' m/s';
	var directionStr = (driftDirection < 100 ? '0' : '') + Math.round(driftDirection) + '°';
	
	$.targetDrift.text = speedStr + ' | ' + directionStr;
	$.targetDrift.color = '#2495A1';
}

function updateBuoyLocation() {
	// Format coordinates with proper precision
	var latStr = 'N ' + buoyLatitude.toFixed(4);
	var lonStr = 'W ' + Math.abs(buoyLongitude).toFixed(4);
	
	$.buoyCoordinates.text = latStr + ', ' + lonStr;
}

function updateStatusIcons() {
	// Update buoy status icon
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
	
	// Update device status icon
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
var driftSimulationTimer = null;

function startDriftSimulation() {
	// Simulate drift changes over time (in production, this would be GPS data)
	driftSimulationTimer = setInterval(function() {
		// Simulate slight changes in distance and bearing
		distanceToBuoy += (Math.random() - 0.5) * 5; // Random change +/- 2.5m
		distanceToBuoy = Math.max(0, distanceToBuoy); // Don't go negative
		
		bearingToBuoy += (Math.random() - 0.5) * 2; // Random change +/- 1 degree
		if (bearingToBuoy < 0) bearingToBuoy += 360;
		if (bearingToBuoy >= 360) bearingToBuoy -= 360;
		
		// Update drift
		driftSpeed += (Math.random() - 0.5) * 0.1; // Random change in drift speed
		driftSpeed = Math.max(0, Math.min(2.0, driftSpeed)); // Keep between 0-2 m/s
		
		driftDirection += (Math.random() - 0.5) * 5; // Random change in drift direction
		if (driftDirection < 0) driftDirection += 360;
		if (driftDirection >= 360) driftDirection -= 360;
		
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
	
	deviceRecovered = true;
	
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
	
	deviceLost = true;
	
	// Stop all timers
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	
	// Update device status
	currentDeviceStatus = 'offline';
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
	$.recaptureWindow.close();
	
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	$.recaptureWindow.close();
	
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	$.recaptureWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	$.recaptureWindow.close();
	
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

function navigateToEnd(e) {
	Ti.API.info('Navigating to End screen');
	stopTimeSinceResurfaceTimer();
	stopDriftSimulation();
	$.recaptureWindow.close();
	
	// TODO: Create end controller when ready
	// var endWindow = Alloy.createController('end').getView();
	// endWindow.open();
	
	// Temporary alert
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
});

// ========== EXPORTS ==========
exports.setResurfaceTime = function(time) {
	resurfaceStartTime = time;
	updateTimeSinceResurfacing();
};

exports.setBuoyStatus = function(status) {
	currentBuoyStatus = status;
	updateStatusIcons();
};

exports.setDeviceStatus = function(status) {
	currentDeviceStatus = status;
	updateStatusIcons();
};

exports.setBuoyLocation = function(lat, lon) {
	buoyLatitude = lat;
	buoyLongitude = lon;
	updateBuoyLocation();
};

exports.setBoatLocation = function(lat, lon) {
	boatLatitude = lat;
	boatLongitude = lon;
};

exports.setDistanceBearing = function(distance, bearing) {
	distanceToBuoy = distance;
	bearingToBuoy = bearing;
	updateDistanceAndBearing();
};

exports.setDrift = function(speed, direction) {
	driftSpeed = speed;
	driftDirection = direction;
	updateTargetDrift();
};

exports.getRecoveryStatus = function() {
	return {
		recovered: deviceRecovered,
		lost: deviceLost
	};
};