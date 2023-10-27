/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class M4HActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.m4h || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    // "types": ["character", "npc", "bug", "sensor", "mine", "turret"],
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    this._prepareBugData(actorData);
    this._prepareSensorData(actorData);
    this._prepareMineData(actorData);
    this._prepareTurretData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // MAIN STATS
    const mainStats = {insight:{tier:0}, mastery:{tier:0}, resolve:{tier:0}, toughness:{tier:0}, quickness:{tier:0}, finesse:{tier:0}};
    for (let [key, item] of actorData.items.entries())
    {
      if (item.type == 'perk')
      {
        mainStats[item.system.stat].tier = mainStats[item.system.stat].tier >= item.system.tier.value ? mainStats[item.system.stat].tier : item.system.tier.value;
      } 
    }
    for (let [key, stat] of Object.entries(mainStats))
    {
      stat.base = 50 + 5 * stat.tier;
      stat.mods = 0;
      stat.total = stat.base + stat.mods;
    }
    systemData.mainStats = mainStats;

    // DERIVED STATS
    systemData.health.max = Math.floor(systemData.mainStats.toughness.total / 2 + 10);

    systemData.stamina.max = Math.floor(((systemData.mainStats.toughness.total + systemData.mainStats.resolve.total) / 2 + 15));
    systemData.stamina.regen = Math.floor((systemData.mainStats.toughness.total + systemData.mainStats.finesse.total) / 10 - 5);

    systemData.initiative = {value: Math.floor((systemData.mainStats.quickness.total + systemData.mainStats.insight.total) / 2)};
    
    systemData.defense = {value: Math.floor((systemData.mainStats.quickness.total + systemData.mainStats.mastery.total) / 2 - 10)};

    systemData.speed = {value: Math.floor((systemData.mainStats.quickness.total + systemData.mainStats.finesse.total) / 15)};

    systemData.heat.base = 50 - (systemData.mainStats.finesse.total - 50);

    // WEAPON PROFICIENCIES
    systemData.weaponProf = {
      melee:{
        blunt:systemData.mainStats.toughness.total >= systemData.mainStats.finesse.total - 10 ? systemData.mainStats.toughness.total : systemData.mainStats.finesse.total - 10,
        blade:systemData.mainStats.finesse.total >= systemData.mainStats.toughness.total - 10 ? systemData.mainStats.finesse.total : systemData.mainStats.toughness.total - 10
      },
      ranged:{
        base:systemData.mainStats.quickness.total,
        prototype:systemData.mainStats.mastery.total >= systemData.mainStats.quickness.total - 5 ? systemData.mainStats.mastery.total : systemData.mainStats.quickness.total - 5,
        guided:systemData.mainStats.resolve.total >= systemData.mainStats.quickness.total - 5 ? systemData.mainStats.resolve.total : systemData.mainStats.quickness.total - 5,
        highCaliber:systemData.mainStats.toughness.total >= systemData.mainStats.quickness.total - 5 ? systemData.mainStats.toughness.total : systemData.mainStats.quickness.total - 5,
        precision:systemData.mainStats.finesse.total >= systemData.mainStats.quickness.total - 5 ? systemData.mainStats.finesse.total : systemData.mainStats.quickness.total - 5,
      }
    };

    // OTHER STATS
    systemData.microbots = {speed:Math.floor(systemData.mainStats.resolve.total / 5)}

    let i = 0;
    for (let [key, item] of actorData.items.entries())
    {
      if (item.type == 'perk')
      {
        i++;
      } 
    }
    systemData.tier = Math.floor(i/5) + 1;

    let shareValue = 500;
    for (let [key, item] of actorData.items.entries())
    {
      if (item.type !== 'perk' && item.type !== 'action')
      {
        shareValue += Math.floor(item.system.price.value / (item.type == 'implant' ? 2 : 4))
      } 
    }
    systemData.shares.value = Math.floor(shareValue * (systemData.tier / 2) * (systemData.reputation.value / 50 + 1));

    console.log(systemData); 

    // // Loop through ability scores, and add their modifiers to our sheet output.
    // for (let [key, ability] of Object.entries(systemData.abilities)) {
    //   // Calculate the modifier using d20 rules.
    //   ability.mod = Math.floor((ability.value - 10) / 2);
    // }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    // systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  _prepareBugData(actorData) {
    if (actorData.type !== 'bug') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
  }

  _prepareSensorData(actorData) {
    if (actorData.type !== 'sensor') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
  }

  _prepareMineData(actorData) {
    if (actorData.type !== 'mine') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
  }

  _prepareTurretData(actorData) {
    if (actorData.type !== 'turret') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);
    this._getBugRollData(data);
    this._getSensorRollData(data);
    this._getMineRollData(data);
    this._getTurretRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    // if (data.abilities) {
    //   for (let [k, v] of Object.entries(data.abilities)) {
    //     data[k] = foundry.utils.deepClone(v);
    //   }
    // }

    // Add level for easier access, or fall back to 0.
    // if (data.attributes.level) {
    //   data.lvl = data.attributes.level.value ?? 0;
    // }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  _getBugRollData(data) {
    if (this.type !== 'bug') return;

    // Process additional NPC data here.
  }

  _getSensorRollData(data) {
    if (this.type !== 'sensor') return;

    // Process additional NPC data here.
  }

  _getMineRollData(data) {
    if (this.type !== 'mine') return;

    // Process additional NPC data here.
  }

  _getTurretRollData(data) {
    if (this.type !== 'turret') return;

    // Process additional NPC data here.
  }

}