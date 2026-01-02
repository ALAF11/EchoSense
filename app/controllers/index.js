// Controller for index view (Call to Action screen)

function onStartClick(e) {
	Ti.API.info('Start button clicked - navigating to Main Menu');
	
	// Close current window
	$.index.close();
	
	
	// Navigate to Main Menu
	var mainMenuWindow = Alloy.createController('mainmenu').getView();
	mainMenuWindow.open();
	
}

const isDebug = Ti.App.Properties.getBool('app.debug', false);

// Open the window
$.index.open();