// Controller for End Screen (Mission Summary)

// ========== MISSION DATA VARIABLES ==========
var missionData = {
	missionId: 'MARS-2025-016',
	totalTime: '01 : 27 : 54',
	deployLocation: '37.380°N, 11.591°E',
	recoveryLocation: '37.385°N, 11.598°E',
	seaState: '2-3 (moderate)',
	weather: 'Clear sky | wind 8-12 knots',
	currentSpeed: '0.3 m/s NE',
	missions: [
		{ number: 1, time: '00 : 58 : 34' },
		{ number: 2, time: '01 : 54 : 23' },
		{ number: 3, time: '01 : 27 : 54' },
		{ number: 4, time: '02 : 33 : 56' }
	]
};

// ========== INITIALIZATION ==========
function initializeScreen() {
	Ti.API.info('End screen loaded - initializing');
	
	// Load mission data from previous screens or storage
	loadMissionData();
	
	// Update all displays
	updateMissionSummaryDisplay();
	updateMissionDataDisplay();
}

// ========== DATA LOADING ==========
function loadMissionData() {
	// In production, this would load from:
	// - Titanium Properties
	// - Database
	// - Passed parameters from previous screen
	
	// For now, use default data
	Ti.API.info('Loading mission data: ' + JSON.stringify(missionData));
}

// ========== DISPLAY UPDATES ==========
function updateMissionSummaryDisplay() {
	// Update Mission Summary Card
	$.missionIdValue.text = missionData.missionId;
	$.totalTimeValue.text = missionData.totalTime;
	$.deployLocationValue.text = missionData.deployLocation;
	$.recoveryLocationValue.text = missionData.recoveryLocation;
	$.seaStateValue.text = missionData.seaState;
	$.weatherValue.text = missionData.weather;
	$.currentSpeedValue.text = missionData.currentSpeed;
	
	Ti.API.info('Mission summary display updated');
}

function updateMissionDataDisplay() {
	// Update Mission Data Card
	if (missionData.missions && missionData.missions.length > 0) {
		if (missionData.missions[0]) {
			$.mission1Time.text = missionData.missions[0].time;
		}
		if (missionData.missions[1]) {
			$.mission2Time.text = missionData.missions[1].time;
		}
		if (missionData.missions[2]) {
			$.mission3Time.text = missionData.missions[2].time;
		}
		if (missionData.missions[3]) {
			$.mission4Time.text = missionData.missions[3].time;
		}
	}
	
	Ti.API.info('Mission data display updated');
}

// ========== BUTTON ACTIONS ==========
function desactivateSystem(e) {
	Ti.API.info('Desactivate button pressed');
	
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Desactivate System?',
		message: 'This will turn off the buoy and deep-sea device. Are you sure?',
		buttonNames: ['Cancel', 'Desactivate'],
		cancel: 0
	});
	
	confirmDialog.addEventListener('click', function(evt) {
		if (evt.index === 1) {
			performDesactivation();
		}
	});
	
	confirmDialog.show();
}

function performDesactivation() {
	Ti.API.info('Performing system desactivation');
	
	// In production, this would:
	// - Send command to buoy to turn off
	// - Clear mission data from storage
	// - Reset all states
	
	// Show success message
	var successDialog = Ti.UI.createAlertDialog({
		title: 'System Desactivated',
		message: 'The buoy and deep-sea device have been turned off successfully.',
		ok: 'OK'
	});
	
	successDialog.addEventListener('click', function() {
		// Return to main menu
		backToMainMenu();
	});
	
	successDialog.show();
}

function startNewMission(e) {
	Ti.API.info('New Mission button pressed');
	
	var confirmDialog = Ti.UI.createAlertDialog({
		title: 'Start New Mission?',
		message: 'This will clear the current mission data and start a new mission. Continue?',
		buttonNames: ['Cancel', 'Start New'],
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
	
	// In production, this would:
	// - Clear current mission data
	// - Reset all timers and states
	// - Initialize new mission ID
	
	// Navigate to main menu or status screen
	$.endWindow.close();
	
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

// ========== NAVIGATION ==========
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

function backToMainMenu(e) {
	Ti.API.info('Going back to Main Menu');
	
	$.endWindow.close();
	
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
}

// ========== WINDOW EVENTS ==========
$.endWindow.addEventListener('open', function() {
	Ti.API.info('End window opened - initializing');
	initializeScreen();
});

$.endWindow.addEventListener('close', function() {
	Ti.API.info('End window closing - cleaning up');
});

// ========== EXPORTS ==========
exports.setMissionData = function(data) {
	missionData = data;
	updateMissionSummaryDisplay();
	updateMissionDataDisplay();
};

exports.getMissionData = function() {
	return missionData;
};