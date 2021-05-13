//=============================================================================
// Custom.js
//=============================================================================

/*:
 * @plugindesc Ultimate customization!
 * @author MarcoMarcPolo

 * @param Title screen options
 * @default ---------------------------------

 * @param Continue
 * @parent Title screen options
 * @desc Settings for the "Continue" option of the title screen.
 * @type struct<Continue>
 * @default {"Enabled":"true"}

 * @param Parameters
 * @parent Title screen options
 * @desc Settings for the "Parameters" option of the title screen.
 * @type struct<Parameters>
 * @default {"Enabled":"true"}

 * @param Platform options
 * @default ---------------------------------

 * @param Mobile Device?
 * @parent Platform options
 * @desc Variable name to use to store the answer to "Is the game being run on a mobile platform?".
 * @type string
 * @default IS_MOBILE

 * @param Controls switch name
 * @parent Platform options
 * @desc Variable name to use to name the switch for showing/hiding controls screen.
 * @type string
 * @default SHOW_CONTROLS

 * @param Settings switch name
 * @parent Platform options
 * @desc Variable name to use to name the switch for showing/hiding the settings menu.
 * @type string
 * @default SHOW_OPTIONS

 * @param Game settings
 * @default ---------------------------------

 * @param Number of saves
 * @parent Game settings
 * @desc Number of slots for saves.
 * @type number
 * @default 20

 * @param Auto-load?
 * @parent Game settings
 * @desc Auto-load last saved file when choosing the "continue" option.
 * @type boolean
 * @default true

 * @param Auto-save with exit?
 * @parent Game settings
 * @desc Auto-save last saved file when choosing quitting the game.
 * @type boolean
 * @default true

 * @help Texte d'aide du plugin de test.
 */
 
/*~struct~Continue:

 * @param Enabled
 * @desc Show or hide the "Continue" option in the title screen.
 * @type boolean
 * @default true

*/ 

/*~struct~Parameters:

 * @param Enabled
 * @desc Show or hide the "Parameters" option in the title screen.
 * @type boolean
 * @default true

*/

var parameters = PluginManager.parameters('Custom');
var controls_switch__name = parameters['Controls switch name'] || 'SHOW_CONTROLS';
var settings_switch__name = parameters['Settings switch name'] || 'SHOW_OPTIONS';

function changeDataSystem(type, name, value) {
	if ('switch' == type) {
		var index = $dataSystem['switches'].indexOf(name);
		if (-1 !== index) {
			$gameSwitches.setValue(index, value);
		}
	}
}

(function() {

	
	Window_TitleCommand.prototype.makeCommandList = function() {
		this.addCommand(TextManager.newGame, 'newGame');
		// Adding "Continue" option
		if ('true' == JSON.parse(parameters['Continue']).Enabled) {
			this.addCommand('{continue}', 'continue', this.isContinueEnabled());
		}
		// Adding "Settings" option
		if ('true' == JSON.parse(parameters['Parameters']).Enabled) {
			this.addCommand(TextManager.options, 'options');
		}

	}
	// Changing maximum number of save slots
	DataManager.maxSavefiles = function() {
		return parameters['Number of saves'] || 4;
	};
	// Adding auto-load behaviour
	if ('true' == parameters['Auto-load?']) {
		function Custom_Scene_File() {}
		Custom_Scene_File.prototype = Object.create(Scene_MenuBase.prototype);
		Custom_Scene_File.prototype.constructor = Scene_File;

		Scene_File.prototype.start = function() {
			if ('load' == this.mode() && DataManager.loadGame(DataManager.latestSavefileId())) {
				this.onLoadSuccess();
				// Updating switches
				Scene_Load._loadSuccess = true;
				changeDataSystem('switch', controls_switch__name, false);
			} else {
				Custom_Scene_File.prototype.start();
			}
		};
	}
	// Adding auto-save behaviour
	if ('true' == parameters['Auto-save with exit?']) {
		Scene_GameEnd.prototype.commandToTitle = function() {
			var index_save = DataManager.latestSavefileId();
			$gameSystem.onBeforeSave();
			if (DataManager.saveGame(index_save)) {
				StorageManager.cleanBackup(index_save);
			}
			this.fadeOutAll();
			SceneManager.goto(Scene_Title);
		};
	};
})();

(function(){

	// Overriding list of commands in the main menu
	Window_MenuCommand.prototype.makeCommandList = function() {
		this.addMainCommands();
		this.addFormationCommand();
		this.addOriginalCommands();
		this.addOptionsCommand();
		this.addSaveCommand();
		this.addControlsCommand();			// Adding option to view controls
		this.addGameEndCommand();
	};

	// Customizing the controls menu
	Window_MenuCommand.prototype.addControlsCommand = function() {
		this.addCommand('{show_controls}', 'controls');
	};

	// Overriding behaviour for customization
	Scene_Menu.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_MenuCommand(0, 0);
		this._commandWindow.setHandler('item',      this.commandItem.bind(this));
		this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
		this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
		this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
		this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
		this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
		this._commandWindow.setHandler('save',      this.commandSave.bind(this));
		this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
	    this._commandWindow.setHandler('controls',  this.commandLoad.bind(this));		// Adding behaviour to controls command
		this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
		this.addWindow(this._commandWindow);
	};
	
	// Overriding list of commands in the main menu
	Scene_Menu.prototype.commandLoad = function() {
		changeDataSystem('switch', controls_switch__name, true);
		changeDataSystem('switch', settings_switch__name, true);
		this.popScene();
	}

	// Overriding list of commands in the "Settings" menu
	Window_Options.prototype.makeCommandList = function() {
		this.addVolumeOptions();
	};

	// Overriding list of commands for the volume section of the "Settings" menu
	Window_Options.prototype.addVolumeOptions = function() {
		this.addCommand(TextManager.bgmVolume, 'bgmVolume');
		this.addCommand(TextManager.seVolume, 'seVolume');
	};

})();
