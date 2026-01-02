// Alloy.js - Global Variables and Configuration
// This file contains all global state that persists across screens

// ========== ACOUSTIC CONFIGURATION ==========
// Frequency configuration (25-75 kHz range)
Alloy.Globals.currentFrequency = 57; // Default frequency in kHz
Alloy.Globals.frequencyTested = false; // Whether frequency has been successfully tested

// Trigger code configuration
Alloy.Globals.selectedTriggerCode = null; // Selected code: 'A', 'B', or 'C'
Alloy.Globals.triggerCodeTested = false; // Whether trigger code has been successfully tested

// Trigger codes definitions (Morse code)
Alloy.Globals.triggerCodes = {
	A: '-.-.',
	B: '-...-',
	C: '----.'
};

// ========== DEVICE STATUS ==========
// Buoy status: 'off', 'on', 'error', 'transmitting'
Alloy.Globals.buoyStatus = 'off';
Alloy.Globals.isBuoyActive = false;

// Device status: 'offline', 'idle', 'descending', 'ascending'
Alloy.Globals.deviceStatus = 'offline';

// ========== MISSION STATE ==========
// Mission timing
Alloy.Globals.missionActive = false;
Alloy.Globals.missionStartTime = null; // Date object when mission starts
Alloy.Globals.missionElapsedTime = 0; // Elapsed time in seconds

// Device position and movement
Alloy.Globals.currentDepth = 0; // meters
Alloy.Globals.currentDistance = 0; // meters from buoy
Alloy.Globals.maxDepth = 245; // Maximum depth in meters

// Mission rates
Alloy.Globals.DESCENT_RATE = 1.0; // meters per second
Alloy.Globals.ASCENT_RATE = 0.8; // meters per second
Alloy.Globals.ASCENT_THRESHOLD = 10; // Device goes to idle when less than 10m

// Acoustic trigger state
Alloy.Globals.acousticTriggerActivated = false;
Alloy.Globals.acousticTriggerTime = null; // When the acoustic trigger was activated

// ========== RESURFACING STATE ==========
// Resurfacing timing
Alloy.Globals.resurfaceStartTime = null; // Date object when device starts ascending
Alloy.Globals.resurfaceEndTime = null; // Date object when device reaches surface
Alloy.Globals.totalResurfacingTime = 0; // Total time in seconds from ascending to surface

// Location data
Alloy.Globals.buoyLatitude = 54.0822; // Example coordinates
Alloy.Globals.buoyLongitude = -118.2437;
Alloy.Globals.boatLatitude = 54.1000; // Example boat position
Alloy.Globals.boatLongitude = -118.2000;

// Drift and distance data
Alloy.Globals.distanceToBuoy = 0; // meters
Alloy.Globals.bearingToBuoy = 0; // degrees
Alloy.Globals.driftSpeed = 0.6; // m/s
Alloy.Globals.driftDirection = 105; // degrees

// Recovery state
Alloy.Globals.deviceRecovered = false;
Alloy.Globals.deviceLost = false;

// ========== GLOBAL TIMERS ==========
Alloy.Globals.missionSimulationTimer = null;

/**
 * Start global mission simulation timer
 */
Alloy.Globals.startMissionSimulation = function() {
	Ti.API.info('Starting GLOBAL mission simulation timer');
	
	// Clear any existing timer
	if (Alloy.Globals.missionSimulationTimer) {
		clearInterval(Alloy.Globals.missionSimulationTimer);
	}
	
	// Start timer that runs every second
	Alloy.Globals.missionSimulationTimer = setInterval(function() {
		Alloy.Globals.updateMissionState();
	}, 1000);
	
	Ti.API.info('GLOBAL mission simulation timer started');
};

/**
 * Stop global mission simulation timer
 */
Alloy.Globals.stopMissionSimulation = function() {
	Ti.API.info('Stopping GLOBAL mission simulation timer');
	
	if (Alloy.Globals.missionSimulationTimer) {
		clearInterval(Alloy.Globals.missionSimulationTimer);
		Alloy.Globals.missionSimulationTimer = null;
	}
	
	Ti.API.info('GLOBAL mission simulation timer stopped');
};

// ========== MISSION CONTROL FUNCTIONS ==========
/**
 * Start the mission - called when ACTIVATE button is pressed
 */
Alloy.Globals.startMission = function() {
	Ti.API.info('Starting mission from global state');
	
	// Set mission as active
	Alloy.Globals.missionActive = true;
	Alloy.Globals.missionStartTime = new Date();
	
	// Set device to descending
	Alloy.Globals.deviceStatus = 'descending';
	
	// Reset depth and distance
	Alloy.Globals.currentDepth = 0;
	Alloy.Globals.currentDistance = 0;
	
	// Reset acoustic trigger state
	Alloy.Globals.acousticTriggerActivated = false;
	Alloy.Globals.acousticTriggerTime = null;
	
	// Reset resurfacing state
	Alloy.Globals.resurfaceStartTime = null;
	Alloy.Globals.resurfaceEndTime = null;
	Alloy.Globals.totalResurfacingTime = 0;
	
	// Start the global simulation timer
	Alloy.Globals.startMissionSimulation();
	
	Ti.API.info('Mission started - device is descending');
};

/**
 * Activate acoustic trigger - initiates device ascent
 */
Alloy.Globals.activateAcousticTrigger = function() {
	Ti.API.info('Activating acoustic trigger from global state');
	
	if (!Alloy.Globals.missionActive) {
		Ti.API.warn('Cannot activate acoustic trigger - mission not active');
		return false;
	}
	
	if (Alloy.Globals.deviceStatus !== 'descending' && Alloy.Globals.deviceStatus !== 'idle') {
		Ti.API.warn('Cannot activate acoustic trigger - device not in correct state');
		return false;
	}
	
	// Mark acoustic trigger as activated
	Alloy.Globals.acousticTriggerActivated = true;
	Alloy.Globals.acousticTriggerTime = new Date();
	
	// MARCA TEMPO DE INÍCIO DO RESURFACING - QUANDO COMEÇA O ASCENDING
	Alloy.Globals.resurfaceStartTime = new Date();
	Ti.API.info('======================================');
	Ti.API.info('RESURFACING TIMER STARTED!');
	Ti.API.info('Device begins ascending at: ' + Alloy.Globals.resurfaceStartTime);
	Ti.API.info('======================================');
	
	// Change device status to ascending
	Alloy.Globals.deviceStatus = 'ascending';
	
	Ti.API.info('Acoustic trigger activated - device is ascending');
	return true;
};

/**
 * Update mission simulation - should be called periodically
 */
Alloy.Globals.updateMissionState = function() {
	if (!Alloy.Globals.missionActive) {
		return;
	}
	
	switch(Alloy.Globals.deviceStatus) {
		case 'descending':
			// Increase depth
			Alloy.Globals.currentDepth += Alloy.Globals.DESCENT_RATE;
			
			// Calculate distance from buoy (increases as device descends)
			Alloy.Globals.currentDistance = Alloy.Globals.currentDepth * 1.3; // Approximate drift
			
			// Check if reached maximum depth
			if (Alloy.Globals.currentDepth >= Alloy.Globals.maxDepth) {
				Alloy.Globals.currentDepth = Alloy.Globals.maxDepth;
				Alloy.Globals.deviceStatus = 'idle';
				Ti.API.info('Device reached maximum depth: ' + Alloy.Globals.maxDepth + 'm');
			}
			break;
			
		case 'ascending':
			// Decrease depth
			Alloy.Globals.currentDepth -= Alloy.Globals.ASCENT_RATE;
			
			// Update distance (may increase initially due to currents)
			Alloy.Globals.currentDistance = Alloy.Globals.currentDepth * 1.5;
			
			// Check if near surface
			if (Alloy.Globals.currentDepth <= Alloy.Globals.ASCENT_THRESHOLD) {
				Alloy.Globals.currentDepth = Math.max(0, Alloy.Globals.currentDepth);
				Alloy.Globals.deviceStatus = 'idle';
				
				// PARA O TIMER DE RESURFACING - CHEGOU À SUPERFÍCIE
				if (!Alloy.Globals.resurfaceEndTime) {
					Alloy.Globals.resurfaceEndTime = new Date();
					
					// Calcula tempo total de resurfacing
					if (Alloy.Globals.resurfaceStartTime) {
						Alloy.Globals.totalResurfacingTime = Math.floor(
							(Alloy.Globals.resurfaceEndTime - Alloy.Globals.resurfaceStartTime) / 1000
						);
					}
					
					Ti.API.info('======================================');
					Ti.API.info('DEVICE REACHED SURFACE!');
					Ti.API.info('Resurfacing ended at: ' + Alloy.Globals.resurfaceEndTime);
					Ti.API.info('Total resurfacing time: ' + Alloy.Globals.totalResurfacingTime + 's');
					Ti.API.info('Current depth: ' + Alloy.Globals.currentDepth + 'm');
					Ti.API.info('======================================');
					
					// Fire event for UI updates
					Ti.App.fireEvent('device:resurfaced');
				}
			}
			break;
			
		case 'idle':
			// Device is waiting (either at depth or at surface)
			// No depth changes
			break;
	}
	
	// Update distance and bearing for recapture screen
	Alloy.Globals.distanceToBuoy = Alloy.Globals.currentDistance;
	
	// Calculate bearing (simplified - in production would use GPS)
	Alloy.Globals.bearingToBuoy = 72 + (Math.random() - 0.5) * 2;
	if (Alloy.Globals.bearingToBuoy < 0) Alloy.Globals.bearingToBuoy += 360;
	if (Alloy.Globals.bearingToBuoy >= 360) Alloy.Globals.bearingToBuoy -= 360;
	
	// Fire event for UI updates
	Ti.App.fireEvent('mission:stateUpdated');
};

/**
 * Get elapsed mission time in seconds
 */
Alloy.Globals.getElapsedMissionTime = function() {
	if (!Alloy.Globals.missionStartTime) {
		return 0;
	}
	
	var now = new Date();
	return Math.floor((now - Alloy.Globals.missionStartTime) / 1000);
};

/**
 * Get time since resurfacing started (ascending) in seconds
 * Returns elapsed time during ascending, or total time if already surfaced
 */
Alloy.Globals.getTimeSinceResurfacing = function() {
	if (!Alloy.Globals.resurfaceStartTime) {
		// Device hasn't started ascending yet
		return 0;
	}
	
	// Se já chegou à superfície, retorna o tempo total fixo
	if (Alloy.Globals.resurfaceEndTime) {
		return Alloy.Globals.totalResurfacingTime;
	}
	
	// Se ainda está a subir, calcula tempo em tempo real
	var now = new Date();
	var elapsed = Math.floor((now - Alloy.Globals.resurfaceStartTime) / 1000);
	
	return elapsed;
};

/**
 * End mission - called when device is recovered or lost
 */
Alloy.Globals.endMission = function(status) {
	Ti.API.info('Ending mission with status: ' + status);
	
	Alloy.Globals.missionActive = false;
	
	// Stop global simulation timer
	Alloy.Globals.stopMissionSimulation();
	
	if (status === 'recovered') {
		Alloy.Globals.deviceRecovered = true;
	} else if (status === 'lost') {
		Alloy.Globals.deviceLost = true;
	}
	
	Ti.API.info('Mission ended');
};

/**
 * Reset all mission state - used for starting a new mission
 */
Alloy.Globals.resetMissionState = function() {
	Ti.API.info('Resetting all mission state');
	
	// Stop global simulation timer
	Alloy.Globals.stopMissionSimulation();
	
	// Reset mission state
	Alloy.Globals.missionActive = false;
	Alloy.Globals.missionStartTime = null;
	Alloy.Globals.missionElapsedTime = 0;
	
	// Reset device position
	Alloy.Globals.currentDepth = 0;
	Alloy.Globals.currentDistance = 0;
	
	// Reset device status
	Alloy.Globals.deviceStatus = 'offline';
	
	// Reset acoustic trigger
	Alloy.Globals.acousticTriggerActivated = false;
	Alloy.Globals.acousticTriggerTime = null;
	
	// Reset resurfacing
	Alloy.Globals.resurfaceStartTime = null;
	Alloy.Globals.resurfaceEndTime = null;
	Alloy.Globals.totalResurfacingTime = 0;
	
	// Reset recovery state
	Alloy.Globals.deviceRecovered = false;
	Alloy.Globals.deviceLost = false;
	
	Ti.API.info('Mission state reset complete');
};

/**
 * Format time in HH:MM:SS format
 */
Alloy.Globals.formatTime = function(seconds) {
	var hours = Math.floor(seconds / 3600);
	var minutes = Math.floor((seconds % 3600) / 60);
	var secs = seconds % 60;
	
	return (hours < 10 ? '0' : '') + hours + ':' +
	       (minutes < 10 ? '0' : '') + minutes + ':' +
	       (secs < 10 ? '0' : '') + secs;
};

// ========== LOGGING ==========
Ti.API.info('Alloy.js loaded - Global state initialized');