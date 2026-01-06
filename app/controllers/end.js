// Controller for End/Summary Screen

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('End screen loaded - initializing');
	
	// Display mission summary data from global state
	updateMissionSummary();
	
	// Set appropriate success/failure icon
	updateSuccessIcon();
}

// ========== UPDATE MISSION SUMMARY ==========
function updateMissionSummary() {
	Ti.API.info('Updating mission summary display');
	
	// Generate Mission ID (based on current date)
	var missionDate = Alloy.Globals.missionStartTime || new Date();
	var year = missionDate.getFullYear();
	var dayOfYear = Math.floor((missionDate - new Date(year, 0, 0)) / 86400000);
	var missionIdStr = 'MARS-' + year + '-' + (dayOfYear < 100 ? '0' : '') + dayOfYear;
	$.missionId.text = missionIdStr;
	
	// Total Mission Time
	var totalTime = Alloy.Globals.getElapsedMissionTime();
	$.totalMissionTime.text = Alloy.Globals.formatTime(totalTime);
	
	// Deployment Location (example coordinates - in production, would use actual GPS data)
	$.deploymentLocation.text = '37.380°N, 11.591°E';
	
	// Recovery Location
	if (Alloy.Globals.deviceRecovered) {
		// Use buoy location as recovery location
		var latStr = Math.abs(Alloy.Globals.buoyLatitude).toFixed(3) + '°' + 
		             (Alloy.Globals.buoyLatitude >= 0 ? 'N' : 'S');
		var lonStr = Math.abs(Alloy.Globals.buoyLongitude).toFixed(3) + '°' + 
		             (Alloy.Globals.buoyLongitude >= 0 ? 'E' : 'W');
		$.recoveryLocation.text = latStr + ', ' + lonStr;
		$.recoveryLocation.color = '#2495A1';
	} else if (Alloy.Globals.deviceLost) {
		// Show as unknown/lost
		$.recoveryLocation.text = 'DEVICE LOST';
		$.recoveryLocation.color = '#E74C3C';
	} else {
		// Default
		$.recoveryLocation.text = '—';
		$.recoveryLocation.color = '#8a8a8a';
	}
	
	Ti.API.info('Mission summary updated');
}

// ========== UPDATE SUCCESS ICON ==========
function updateSuccessIcon() {
	// Show appropriate icon based on device status
	if (Alloy.Globals.deviceRecovered) {
		$.successIcon.image = '/img/Recovered.png';
		Ti.API.info('Showing success icon - device recovered');
	} else if (Alloy.Globals.deviceLost) {
		$.successIcon.image = '/img/Lost.png';
		Ti.API.info('Showing error icon - device lost');
	} else {
		$.successIcon.image = '/img/Recovered.png';
		Ti.API.info('Showing default recovered icon - mission incomplete');
	}
}

// ========== DEACTIVATE BUOY ==========
function deactivateBuoy(e) {
	Ti.API.info('Deactivate buoy button pressed');
	
	// Confirm deactivation
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Deactivate Buoy?',
		message: 'This will turn off the buoy and reset all mission data. Continue?',
		buttonNames: ['Cancel', 'Deactivate'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performDeactivation();
		}
	});
	
	confirmDialog.show();
}

function performDeactivation() {
	Ti.API.info('Performing buoy deactivation');
	
	// Stop mission simulation
	Alloy.Globals.stopMissionSimulation();
	
	// Reset ALL global state
	Alloy.Globals.isBuoyActive = false;
	Alloy.Globals.buoyStatus = 'off';
	Alloy.Globals.deviceStatus = 'offline';
	
	// Reset mission state completely
	Alloy.Globals.resetMissionState();
	
	// Reset acoustic settings
	Alloy.Globals.currentFrequency = 57;
	Alloy.Globals.frequencyTested = false;
	Alloy.Globals.selectedTriggerCode = null;
	Alloy.Globals.triggerCodeTested = false;
	
	Ti.API.info('Buoy deactivated and all state reset');
	
	// Show confirmation
	var successDialog = Ti.UI.createAlertDialog({
		title: 'Buoy Deactivated',
		message: 'The buoy has been deactivated and all mission data has been reset.',
		ok: 'OK'
	});
	
	successDialog.addEventListener('click', function() {
		// Navigate back to Status screen
		navigateToStatus();
	});
	
	successDialog.show();
}

// ========== START NEW MISSION ==========
function startNewMission(e) {
	Ti.API.info('New Mission button pressed');
	
	// Confirm new mission
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Start New Mission?',
		message: 'This will keep the buoy active but reset mission data. The current frequency and trigger code will be preserved. Continue?',
		buttonNames: ['Cancel', 'Start New Mission'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performNewMission();
		}
	});
	
	confirmDialog.show();
}

function performNewMission() {
	Ti.API.info('Starting new mission');
	
	// Stop current mission simulation
	Alloy.Globals.stopMissionSimulation();
	
	// Reset mission state but KEEP buoy active and acoustic settings
	Alloy.Globals.resetMissionState();
	
	// KEEP buoy active
	Alloy.Globals.isBuoyActive = true;
	Alloy.Globals.buoyStatus = 'on';
	Alloy.Globals.deviceStatus = 'idle';
	
	// PRESERVE acoustic settings
	// Alloy.Globals.currentFrequency - keep as is
	// Alloy.Globals.frequencyTested - keep as is
	// Alloy.Globals.selectedTriggerCode - keep as is
	// Alloy.Globals.triggerCodeTested - keep as is
	
	Ti.API.info('New mission ready - buoy remains active with preserved settings');
	Ti.API.info('Frequency: ' + Alloy.Globals.currentFrequency + ' kHz');
	Ti.API.info('Trigger Code: ' + Alloy.Globals.selectedTriggerCode);
	
	// Show confirmation
	var successDialog = Ti.UI.createAlertDialog({
		title: 'Ready for New Mission',
		message: 'The system is ready for a new mission. Buoy remains active with current settings preserved.',
		ok: 'OK'
	});
	
	successDialog.addEventListener('click', function() {
		// Navigate to Frequency screen to proceed with new mission
		navigateToFrequency();
	});
	
	successDialog.show();
}

// ========== NAVIGATION ==========
function backToHome(e) {
	Ti.API.info('Going back to Main Menu');
	
	// Close current window
	$.endWindow.close();
	
	// Open Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

function navigateToStatus(e) {
	Ti.API.info('Navigating to Status screen');
	$.endWindow.close();
	
	var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	$.endWindow.close();
	
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTriggerCode(e) {
	Ti.API.info('Navigating to Trigger Code screen');
	$.endWindow.close();
	
	var triggerCodeWindow = Alloy.createController('triggercode').getView();
	triggerCodeWindow.open();
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen');
	$.endWindow.close();
	
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen');
	$.endWindow.close();
	
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

// ========== WINDOW EVENTS ==========
$.endWindow.addEventListener('open', function() {
	Ti.API.info('End window opened - initializing');
	initializeScreen();
});

$.endWindow.addEventListener('close', function() {
	Ti.API.info('End window closing - cleaning up');
	// No timers to clean up on this screen
});

// Export functions for external access
exports.backToHome = backToHome;
exports.deactivateBuoy = deactivateBuoy;
exports.startNewMission = startNewMission;
exports.navigateToStatus = navigateToStatus;
exports.navigateToFrequency = navigateToFrequency;
exports.navigateToTriggerCode = navigateToTriggerCode;
exports.navigateToMission = navigateToMission;
exports.navigateToRecapture = navigateToRecapture;