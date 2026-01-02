// Controller for Main Menu

// Back to Home (Call to Action)
function backToHome(e) {
	Ti.API.info('Going back to Call to Action screen');
	
	// Fechar a janela atual
	$.mainmenu.close();

    var indexWindow = Alloy.createController('index').getView();
	indexWindow.open();
}

// Navigation Functions
function navigateToStatus(e) {
	Ti.API.info('Navigating to Status/Activate screen');
	
    $.mainmenu.close();
	
    var statusWindow = Alloy.createController('status').getView();
	statusWindow.open();
}

function navigateToFrequency(e) {
	Ti.API.info('Navigating to Frequency screen');
	
    $.mainmenu.close();
	
	var frequencyWindow = Alloy.createController('frequency').getView();
	frequencyWindow.open();
}

function navigateToTrigger(e) {
	Ti.API.info('Navigating to Trigger Code screen');

	$.mainmenu.close();
	
	var triggerWindow = Alloy.createController('triggercode').getView();
	triggerWindow.open();
	
}

function navigateToMission(e) {
	Ti.API.info('Navigating to Mission screen');
	
	$.mainmenu.close();
	
	var missionWindow = Alloy.createController('mission').getView();
	missionWindow.open();
	
}

function navigateToRecapture(e) {
	Ti.API.info('Navigating to Recapture screen');
	
	$.mainmenu.close();
	
	var recaptureWindow = Alloy.createController('recapture').getView();
	recaptureWindow.open();
}

function navigateToSummary(e) {
	Ti.API.info('Navigating to Summary screen');
	
	// TODO: Criar e abrir a janela de Summary
	// var summaryWindow = Alloy.createController('summary').getView();
	// summaryWindow.open();
	
	alert('Navigating to: Summary');
}

