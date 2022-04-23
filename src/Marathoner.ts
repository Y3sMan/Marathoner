import {on, Game, printConsole, Form, once, Spell, hooks, Utility, CombatEvent} from "skyrimPlatform";
import { HasFloatValue, SetFloatValue, GetIntValue, SetIntValue, GetFloatValue } from "@skyrim-platform/papyrus-util/StorageUtil"

var init = 0
const const_speed_key = ".marathoner.player.speed.const"
const mult_key = '.marathoner.player.speed.mult'
// ---------------------SHORTCUT FUNCTIONS-----------------------------
function player() {
		return Game.getPlayer();
	}
const AddSpeedSpell = async () => {
		await Utility.wait(1.0);
		const fSpeedMultMult = GetFloatValue(null, mult_key, 95)
		const iSpeed = GetFloatValue(null, const_speed_key, 95) * (fSpeedMultMult - 1)
		const fSpeedSpell =  Game.getFormFromFile(0x802, "Marathoner.esp").getFormID()
		const spllSpeed = Spell.from(Game.getFormEx(fSpeedSpell))
		spllSpeed.setNthEffectMagnitude(0, iSpeed)
		player().addSpell(spllSpeed, false)
	}
const SetSprintDrain = function(){
	if ( GetIntValue(null, '.marathoner.main.bNoCombatSprint', 0) == 1){
		if ( isInCombat()){
			Game.setGameSettingFloat('fsprintStaminadrainmult', GetFloatValue(null, ".marathoner.player.staminadrainmult.const", 4.15) )
		}
		else{
			Game.setGameSettingFloat('fsprintStaminadrainmult', 0)
		}
	}
	else{
		Game.setGameSettingFloat('fsprintStaminadrainmult', GetFloatValue(null, ".marathoner.player.staminadrainmult.const", 4.15) )
	}
}
//----------------------MAIN------------------------------------------

once('scriptInit', (event) => {
	init = GetIntValue(null, ".marathoner.init", 0)
	if ( init == 1 ){ return; }
		if (!HasFloatValue(null, const_speed_key)) {
			SetFloatValue(null, const_speed_key, player().getActorValue("speedmult"));
			SetFloatValue(null, ".marathoner.player.staminadrainmult.const", Game.getGameSettingFloat('fsprintStaminadrainmult'));
			printConsole(`Marathoner has been initialized; you're default Speed is ${player().getActorValue("speedmult")}\nand your default fsprintStaminadrainmult is ${Game.getGameSettingFloat('fsprintStaminadrainmult')}`)
		}
	init = GetIntValue(null, ".marathoner.init", 0)
	if ( init == 1 ) { return; }
	AddSpeedSpell()
	SetSprintDrain()
	SetIntValue(null, ".marathoner.init", 1)
});
on('newGame', () => {
	
	AddSpeedSpell()
	SetSprintDrain()
});
on('loadGame', () => {
	if (!HasFloatValue(null, const_speed_key)) {
		SetFloatValue(null, const_speed_key, player().getActorValue("speedmult"));
	}
	
	AddSpeedSpell()
	SetSprintDrain()
});
once('update', () => {
	const player = Game.getPlayer();
	if (!player) {return;}
	player.registerForModEvent('Marathoner_MCM_Close', 'OnMarathonMCMClose')	

});

hooks.sendPapyrusEvent.add(
	{
		enter() {
			const fSpeedSpell =  Game.getFormFromFile(0x802, "Marathoner.esp")?.getFormID()
			const spllSpeed = Spell.from(Game.getFormEx(fSpeedSpell))
			player().removeSpell(spllSpeed)
			AddSpeedSpell()
			SetSprintDrain()
			printConsole(`The Marathoner spell has updated and your new speed is ${player()?.getActorValue('speedmult') * (GetFloatValue(null, mult_key, 0))}`)
		},
	},
	0x14,
	0x14,
	'OnMarathonMCMClose'
);
on('combatState', (event) => {
	const fSpeedSpell =  Game.getFormFromFile(0x802, "Marathoner.esp")?.getFormID()
	const spllSpeed = Spell.from(Game.getFormEx(fSpeedSpell))
	if (isInCombat()){
		if ( !event.isCombat) {return;}
		player().removeSpell(spllSpeed)
		SetSprintDrain()
	}
	else if (!isInCombat()){
		AddSpeedSpell()
		SetSprintDrain()
	}
});
const isInCombat = function () { 
	if (player()?.getCombatState() == 1 ) { return true }
	return false
}