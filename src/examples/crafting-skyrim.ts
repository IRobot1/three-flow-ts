import { IngredientParameters } from "./crafting-system";

//
// data from https://github.com/hogart/alchemy/blob/master/src/lib/data/skyrim.js
//

export interface SkyrimParameters  {
  name: string
  effects: Array<string>
  icon: string
  note: string
}

export const skyrim: Array<SkyrimParameters> = [
  {
    name: 'Abecean Longfin',
    icon: 'http://images.uesp.net/thumb/7/7a/SR-icon-ingredient-Abecean_Longfin.png/48px-SR-icon-ingredient-Abecean_Longfin.png',
    note: 'Collected by catching Abacean Longfin fish.',
    effects: ['Weakness to Frost', 'Fortify Sneak', 'Weakness to Poison', 'Fortify Restoration']
  }, {
    name: 'Ancestor Moth Wing',
    icon: 'http://images.uesp.net/thumb/3/31/SR-icon-ingredient-Ancestor_Moth_Wing.png/48px-SR-icon-ingredient-Ancestor_Moth_Wing.png',
    note: 'Collected by catching Ancestor Moths.',
    effects: ['Damage Stamina', 'Fortify Conjuration', 'Damage Magicka Regen', 'Fortify Enchanting']
  }, {
    name: 'Bear Claws',
    icon: 'http://images.uesp.net/thumb/0/04/SR-icon-ingredient-Bear_Claws.png/48px-SR-icon-ingredient-Bear_Claws.png',
    note: 'Collected from various types of dead Bears.',
    effects: ['Restore Stamina', 'Fortify Health', 'Fortify One-handed', 'Damage Magicka Regen']
  }, {
    name: 'Bee',
    icon: 'http://images.uesp.net/thumb/b/b8/SR-icon-ingredient-Bee.png/48px-SR-icon-ingredient-Bee.png',
    note: 'Collected from beehives and by catching Bees.',
    effects: ['Restore Stamina', 'Ravage Stamina', 'Regenerate Stamina', 'Weakness to Shock']
  }, {
    name: 'Beehive Husk',
    icon: 'http://images.uesp.net/thumb/8/84/SR-icon-ingredient-Beehive_Husk.png/48px-SR-icon-ingredient-Beehive_Husk.png',
    note: 'Collected from beehives.',
    effects: ['Resist Poison', 'Fortify Light Armor', 'Fortify Sneak', 'Fortify Destruction']
  }, {
    name: 'Bleeding Crown',
    icon: 'http://images.uesp.net/thumb/a/a6/SR-icon-ingredient-Bleeding_Crown.png/48px-SR-icon-ingredient-Bleeding_Crown.png',
    note: 'Harvested from Bleeding Crown, a mushroom found in various caves.',
    effects: ['Weakness to Fire', 'Fortify Block', 'Weakness to Poison', 'Resist Magic']
  }, {
    name: 'Blisterwort',
    icon: 'http://images.uesp.net/thumb/2/2b/SR-icon-ingredient-Blisterwort.png/48px-SR-icon-ingredient-Blisterwort.png',
    note: 'Harvested from Blisterwort mushrooms found in various caves.',
    effects: ['Damage Stamina', 'Frenzy', 'Restore Health', 'Fortify Smithing']
  }, {
    name: 'Blue Butterfly Wing',
    icon: 'http://images.uesp.net/thumb/1/16/SR-icon-ingredient-Blue_Butterfly_Wing.png/48px-SR-icon-ingredient-Blue_Butterfly_Wing.png',
    note: 'Collected by catching Blue Butterflies. Often found during daylight hours near flowering plants.',
    effects: ['Damage Stamina', 'Fortify Conjuration', 'Damage Magicka Regen', 'Fortify Enchanting']
  }, {
    name: 'Blue Dartwing',
    icon: 'http://images.uesp.net/thumb/e/ee/SR-icon-ingredient-Blue_Dartwing.png/48px-SR-icon-ingredient-Blue_Dartwing.png',
    note: 'Collected by catching Dragonflies found near rivers and streams below the snow line.',
    effects: ['Resist Shock', 'Fortify Pickpocket', 'Restore Health', 'Fear']
  }, {
    name: 'Blue Mountain Flower',
    icon: 'http://images.uesp.net/thumb/3/38/SR-icon-ingredient-Blue_Mountain_Flower.png/48px-SR-icon-ingredient-Blue_Mountain_Flower.png',
    note: 'Harvested from the blue variety of Mountain Flower, found throughout Skyrim.',
    effects: ['Restore Health', 'Fortify Conjuration', 'Fortify Health', 'Damage Magicka Regen']
  }, {
    name: 'Bone Meal',
    icon: 'http://images.uesp.net/thumb/f/f9/SR-icon-ingredient-Bone_Meal.png/48px-SR-icon-ingredient-Bone_Meal.png',
    note: 'Collected from undead such as skeletons, and Draugr.',
    effects: ['Damage Stamina', 'Resist Fire', 'Fortify Conjuration', 'Ravage Stamina']
  }, {
    name: 'Briar Heart',
    icon: 'http://images.uesp.net/thumb/6/6a/SR-icon-ingredient-Briar_Heart.png/48px-SR-icon-ingredient-Briar_Heart.png',
    note: 'Collected from Forsworn Briarhearts.',
    effects: ['Restore Magicka', 'Fortify Block', 'Paralysis', 'Fortify Magicka']
  }, {
    name: 'Butterfly Wing',
    icon: 'http://images.uesp.net/thumb/f/f8/SR-icon-ingredient-Butterfly_Wing.png/48px-SR-icon-ingredient-Butterfly_Wing.png',
    note: 'Collected from catching Monarch Butterflies. Often found during daylight hours near flowering plants.',
    effects: ['Restore Health', 'Fortify Barter', 'Lingering Damage Stamina', 'Damage Magicka']
  }, {
    name: 'Canis Root',
    icon: 'http://images.uesp.net/thumb/f/f6/SR-icon-ingredient-Canis_Root.png/48px-SR-icon-ingredient-Canis_Root.png',
    note: 'Harvested from Canis Root, found in The Rift and Hjaalmarch.',
    effects: ['Damage Stamina', 'Fortify One-handed', 'Fortify Marksman', 'Paralysis']
  }, {
    name: 'Charred Skeever Hide',
    icon: 'http://images.uesp.net/thumb/7/71/SR-icon-ingredient-Charred_Skeever_Hide.png/48px-SR-icon-ingredient-Charred_Skeever_Hide.png',
    note: 'Food, collected from dead Skeevers found on roasting spits.',
    effects: ['Restore Stamina', 'Cure Disease', 'Resist Poison', 'Restore Health']
  }, {
    name: 'Chaurus Eggs',
    icon: 'http://images.uesp.net/thumb/4/47/SR-icon-ingredient-Chaurus_Eggs.png/48px-SR-icon-ingredient-Chaurus_Eggs.png',
    note: 'Collected from Chaurus Egg Sacs, found in Falmer caves.',
    effects: ['Weakness to Poison', 'Fortify Stamina', 'Damage Magicka', 'Invisibility']
  }, {
    name: 'Chaurus Hunter Antennae',
    icon: 'http://images.uesp.net/thumb/a/a2/SR-icon-ingredient-Chaurus_Hunter_Antennae.png/48px-SR-icon-ingredient-Chaurus_Hunter_Antennae.png',
    note: 'Collected from dead Chaurus Hunters and Chaurus Hunter Fledglings.',
    effects: ['Damage Stamina', 'Fortify Conjuration', 'Damage Magicka Regen', 'Fortify Enchanting']
  }, {
    name: 'Chicken\'s Egg',
    icon: 'http://images.uesp.net/thumb/d/de/SR-icon-ingredient-Chicken%27s_Egg.png/48px-SR-icon-ingredient-Chicken%27s_Egg.png',
    note: 'Food, harvested from Chicken nests in various farms.',
    effects: ['Resist Magic', 'Damage Magicka Regen', 'Waterbreathing', 'Lingering Damage Stamina']
  }, {
    name: 'Creep Cluster',
    icon: 'http://images.uesp.net/thumb/1/15/SR-icon-ingredient-Creep_Cluster.png/48px-SR-icon-ingredient-Creep_Cluster.png',
    note: 'Harvested from Creep Cluster, found in the volcanic tundra of Eastmarch.',
    effects: ['Restore Magicka', 'Damage Stamina Regen', 'Fortify Carry Weight', 'Weakness to Magic']
  }, {
    name: 'Crimson Nirnroot',
    icon: 'http://images.uesp.net/thumb/5/55/SR-icon-ingredient-Crimson_Nirnroot.png/48px-SR-icon-ingredient-Crimson_Nirnroot.png',
    note: 'Harvested from Crimson Nirnroot, found in Blackreach, needed for the quest A Return To Your Roots.',
    effects: ['Damage Health', 'Damage Stamina', 'Invisibility', 'Resist Magic']
  }, {
    name: 'Cyrodilic Spadetail',
    icon: 'http://images.uesp.net/thumb/a/a9/SR-icon-ingredient-Cyrodilic_Spadetail.png/48px-SR-icon-ingredient-Cyrodilic_Spadetail.png',
    note: 'Collected by catching Cyrodilic Spadetail fish.',
    effects: ['Damage Stamina', 'Fortify Restoration', 'Fear', 'Ravage Health']
  }, {
    name: 'Daedra Heart',
    icon: 'http://images.uesp.net/thumb/b/b1/SR-icon-ingredient-Daedra_Heart.png/48px-SR-icon-ingredient-Daedra_Heart.png',
    note: 'Collected from dead Dremora.',
    effects: ['Restore Health', 'Damage Stamina Regen', 'Damage Magicka', 'Fear']
  }, {
    name: 'Deathbell',
    icon: 'http://images.uesp.net/thumb/5/58/SR-icon-ingredient-Deathbell.png/48px-SR-icon-ingredient-Deathbell.png',
    note: 'Harvested from Deathbell, found in Hjaalmarch.',
    effects: ['Damage Health', 'Ravage Stamina', 'Slow', 'Weakness to Poison']
  }, {
    name: 'Dragon\'s Tongue',
    icon: 'http://images.uesp.net/thumb/0/0e/SR-icon-ingredient-Dragons_Tongue.png/48px-SR-icon-ingredient-Dragons_Tongue.png',
    note: 'Harvested from Dragon\'s Tongue, found in the volcanic tundra of Eastmarch.',
    effects: ['Resist Fire', 'Fortify Barter', 'Fortify Illusion', 'Fortify Two-handed']
  }, {
    name: 'Dwarven Oil',
    icon: 'http://images.uesp.net/thumb/e/e5/SR-icon-ingredient-Dwarven_Oil.png/48px-SR-icon-ingredient-Dwarven_Oil.png',
    note: 'Collected from destroyed Dwarven Automatons, found in Dwarven Ruins.',
    effects: ['Weakness to Magic', 'Fortify Illusion', 'Regenerate Magicka', 'Restore Magicka']
  }, {
    name: 'Ectoplasm',
    icon: 'http://images.uesp.net/thumb/f/f1/SR-icon-ingredient-Ectoplasm.png/48px-SR-icon-ingredient-Ectoplasm.png',
    note: 'Collected from undead Ghosts.',
    effects: ['Restore Magicka', 'Fortify Destruction', 'Fortify Magicka', 'Damage Health']
  }, {
    name: 'Elves Ear',
    icon: 'http://images.uesp.net/thumb/7/7a/SR-icon-ingredient-Elves_Ear.png/48px-SR-icon-ingredient-Elves_Ear.png',
    note: 'Harvested from Dried Elves Ear bunches found in homes and camps.',
    effects: ['Restore Magicka', 'Fortify Marksman', 'Weakness to Frost', 'Resist Fire']
  }, {
    name: 'Eye of Sabre Cat',
    icon: 'http://images.uesp.net/thumb/4/4e/SR-icon-ingredient-Eye_of_Sabre_Cat.png/48px-SR-icon-ingredient-Eye_of_Sabre_Cat.png',
    note: 'Collected from dead Sabre Cats.',
    effects: ['Restore Stamina', 'Ravage Health', 'Damage Magicka', 'Restore Health']
  }, {
    name: 'Falmer Ear',
    icon: 'http://images.uesp.net/thumb/6/6e/SR-icon-ingredient-Falmer_Ear.png/48px-SR-icon-ingredient-Falmer_Ear.png',
    note: 'Collected from dead Falmer.',
    effects: ['Damage Health', 'Frenzy', 'Resist Poison', 'Fortify Lockpicking']
  }, {
    name: 'Fire Salts',
    icon: 'http://images.uesp.net/thumb/c/cc/SR-icon-ingredient-Fire_Salts.png/48px-SR-icon-ingredient-Fire_Salts.png',
    note: 'Collected from dead Flame Atronachs, a type of daedra.',
    effects: ['Weakness to Frost', 'Resist Fire', 'Restore Magicka', 'Regenerate Magicka']
  }, {
    name: 'Fly Amanita',
    icon: 'http://images.uesp.net/thumb/7/76/SR-icon-ingredient-Fly_Amanita.png/48px-SR-icon-ingredient-Fly_Amanita.png',
    note: 'Harvested from Fly Amanita mushrooms, found in various caves.',
    effects: ['Resist Fire', 'Fortify Two-handed', 'Frenzy', 'Regenerate Stamina']
  }, {
    name: 'Frost Mirriam',
    icon: 'http://images.uesp.net/thumb/9/99/SR-icon-ingredient-Frost_Mirriam.png/48px-SR-icon-ingredient-Frost_Mirriam.png',
    note: 'Harvested from Dried Frost Mirriam bunches found in homes and camps.',
    effects: ['Resist Frost', 'Fortify Sneak', 'Ravage Magicka', 'Damage Stamina Regen']
  }, {
    name: 'Frost Salts',
    icon: 'http://images.uesp.net/thumb/5/58/SR-icon-ingredient-Frost_Salts.png/48px-SR-icon-ingredient-Frost_Salts.png',
    note: 'Collected from dead Frost Atronachs, a type of daedra.',
    effects: ['Weakness to Fire', 'Resist Frost', 'Restore Magicka', 'Fortify Conjuration']
  }, {
    name: 'Garlic',
    icon: 'http://images.uesp.net/thumb/e/e5/SR-icon-ingredient-Garlic.png/48px-SR-icon-ingredient-Garlic.png',
    note: 'Food. Can also be harvested from Garlic Braids.',
    effects: ['Resist Poison', 'Fortify Stamina', 'Regenerate Magicka', 'Regenerate Health']
  }, {
    name: 'Giant Lichen',
    icon: 'http://images.uesp.net/thumb/8/8b/SR-icon-ingredient-Giant_Lichen.png/48px-SR-icon-ingredient-Giant_Lichen.png',
    note: 'Harvested from Giant Lichen, found in Hjaalmarch.',
    effects: ['Weakness to Shock', 'Ravage Health', 'Weakness to Poison', 'Restore Magicka']
  }, {
    name: 'Giant\'s Toe',
    icon: 'http://images.uesp.net/thumb/b/bc/SR-icon-ingredient-Giants_Toe.png/48px-SR-icon-ingredient-Giants_Toe.png',
    note: 'Collected from dead Giants, which can be found in Giant Camps.',
    effects: ['Damage Stamina', 'Fortify Health', 'Fortify Carry Weight', 'Damage Stamina Regen']
  }, {
    name: 'Gleamblossom',
    icon: 'http://images.uesp.net/thumb/c/c5/SR-icon-ingredient-Gleamblossom.png/48px-SR-icon-ingredient-Gleamblossom.png',
    note: 'Harvested from the plant of the same name.',
    effects: ['Resist Magic', 'Fear', 'Regenerate Health', 'Paralysis']
  }, {
    name: 'Glow Dust',
    icon: 'http://images.uesp.net/thumb/f/f8/SR-icon-ingredient-Glow_Dust.png/48px-SR-icon-ingredient-Glow_Dust.png',
    note: 'Collected from dead Wisps and Wispmothers.',
    effects: ['Damage Magicka', 'Damage Magicka Regen', 'Fortify Destruction', 'Resist Shock']
  }, {
    name: 'Glowing Mushroom',
    icon: 'http://images.uesp.net/thumb/7/71/SR-icon-ingredient-Glowing_Mushroom.png/48px-SR-icon-ingredient-Glowing_Mushroom.png',
    note: 'Harvested from Glowing Mushrooms, found in various caves.',
    effects: ['Resist Shock', 'Fortify Destruction', 'Fortify Smithing', 'Fortify Health']
  }, {
    name: 'Grass Pod',
    icon: 'http://images.uesp.net/thumb/7/78/SR-icon-ingredient-Grass_Pod.png/48px-SR-icon-ingredient-Grass_Pod.png',
    note: 'Harvested from Spiky Grass, found in northern regions of Skyrim.',
    effects: ['Resist Poison', 'Ravage Magicka', 'Fortify Alteration', 'Restore Magicka']
  }, {
    name: 'Hagraven Claw',
    icon: 'http://images.uesp.net/thumb/3/30/SR-icon-ingredient-Hagraven_Claw.png/48px-SR-icon-ingredient-Hagraven_Claw.png',
    note: 'Collected from dead Hagravens.',
    effects: ['Resist Magic', 'Lingering Damage Magicka', 'Fortify Enchanting', 'Fortify Barter']
  }, {
    name: 'Hagraven Feathers',
    icon: 'http://images.uesp.net/thumb/d/d8/SR-icon-ingredient-Hagraven_Feathers.png/48px-SR-icon-ingredient-Hagraven_Feathers.png',
    note: 'Collected from dead Hagravens. Can also be found scattered around their sleeping areas.',
    effects: ['Damage Magicka', 'Fortify Conjuration', 'Frenzy', 'Weakness to Shock']
  }, {
    name: 'Hanging Moss',
    icon: 'http://images.uesp.net/thumb/2/22/SR-icon-ingredient-Hanging_Moss.png/48px-SR-icon-ingredient-Hanging_Moss.png',
    note: 'Harvested from Hanging Moss.',
    effects: ['Damage Magicka', 'Fortify Health', 'Damage Magicka Regen', 'Fortify One-handed']
  }, {
    name: 'Hawk Beak',
    icon: 'http://images.uesp.net/thumb/6/69/SR-icon-ingredient-Hawk_Beak.png/48px-SR-icon-ingredient-Hawk_Beak.png',
    note: 'Collected from dead Hawks.',
    effects: ['Restore Stamina', 'Resist Frost', 'Fortify Carry Weight', 'Resist Shock']
  }, {
    name: 'Hawk Feathers',
    icon: 'http://images.uesp.net/thumb/5/5c/SR-icon-ingredient-Hawk_Feathers.png/48px-SR-icon-ingredient-Hawk_Feathers.png',
    note: 'Collected from dead Hawks.',
    effects: ['Cure Disease', 'Fortify Light Armor', 'Fortify One-handed', 'Fortify Sneak']
  }, {
    name: 'Hawk\'s Egg',
    icon: 'http://images.uesp.net/thumb/4/41/SR-icon-ingredient-Hawk%27s_Egg.png/48px-SR-icon-ingredient-Hawk%27s_Egg.png',
    note: 'Harvested from Hawk nests.',
    effects: ['Resist Magic', 'Damage Magicka Regen', 'Waterbreathing', 'Lingering Damage Stamina']
  }, {
    name: 'Histcarp',
    icon: 'http://images.uesp.net/thumb/e/ec/SR-icon-ingredient-Histcarp.png/48px-SR-icon-ingredient-Histcarp.png',
    note: 'Collected by catching Histcarp fish.',
    effects: ['Restore Stamina', 'Fortify Magicka', 'Damage Stamina Regen', 'Waterbreathing']
  }, {
    name: 'Honeycomb',
    icon: 'http://images.uesp.net/thumb/e/e0/SR-icon-ingredient-Honeycomb.png/48px-SR-icon-ingredient-Honeycomb.png',
    note: 'Food. Collected from beehives.',
    effects: ['Restore Stamina', 'Fortify Block', 'Fortify Light Armor', 'Ravage Stamina']
  }, {
    name: 'Human Flesh',
    icon: 'http://images.uesp.net/thumb/9/9d/SR-icon-ingredient-Human_Flesh.png/48px-SR-icon-ingredient-Human_Flesh.png',
    note: 'Cannot be harvested or collected; with the Dawnguard plug-in installed, several respawning samples can be found in Volkihar Keep.',
    effects: ['Damage Health', 'Paralysis', 'Restore Magicka', 'Fortify Sneak']
  }, {
    name: 'Human Heart',
    icon: 'http://images.uesp.net/thumb/f/f6/SR-icon-ingredient-Human_Heart.png/48px-SR-icon-ingredient-Human_Heart.png',
    note: 'Cannot be harvested or collected; limited number of samples available.',
    effects: ['Damage Health', 'Damage Magicka', 'Damage Magicka Regen', 'Frenzy']
  }, {
    name: 'Ice Wraith Teeth',
    icon: 'http://images.uesp.net/thumb/9/95/SR-icon-ingredient-Ice_Wraith_Teeth.png/48px-SR-icon-ingredient-Ice_Wraith_Teeth.png',
    note: 'Collected from Ice Wraiths.',
    effects: ['Weakness to Frost', 'Fortify Heavy Armor', 'Invisibility', 'Weakness to Fire']
  }, {
    name: 'Imp Stool',
    icon: 'http://images.uesp.net/thumb/7/77/SR-icon-ingredient-Imp_Stool.png/48px-SR-icon-ingredient-Imp_Stool.png',
    note: 'Harvested from Imp Stool mushrooms, found in various caves.',
    effects: ['Damage Health', 'Lingering Damage Health', 'Paralysis', 'Restore Health']
  }, {
    name: 'Jazbay Grapes',
    icon: 'http://images.uesp.net/thumb/5/50/SR-icon-ingredient-Jazbay_Grapes.png/48px-SR-icon-ingredient-Jazbay_Grapes.png',
    note: 'Harvested from Jazbay vines, found in the volcanic tundra of Eastmarch.',
    effects: ['Weakness to Magic', 'Fortify Magicka', 'Regenerate Magicka', 'Ravage Health']
  }, {
    name: 'Juniper Berries',
    icon: 'http://images.uesp.net/thumb/1/10/SR-icon-ingredient-Juniper_Berries.png/48px-SR-icon-ingredient-Juniper_Berries.png',
    note: 'Harvested from Juniper shrubs, common in The Reach.',
    effects: ['Weakness to Fire', 'Fortify Marksman', 'Regenerate Health', 'Damage Stamina Regen']
  }, {
    name: 'Large Antlers',
    icon: 'http://images.uesp.net/thumb/6/69/SR-icon-ingredient-Large_Antlers.png/48px-SR-icon-ingredient-Large_Antlers.png',
    note: 'Collected from dead male Elk.',
    effects: ['Restore Stamina', 'Fortify Stamina', 'Slow', 'Damage Stamina Regen']
  }, {
    name: 'Lavender',
    icon: 'http://images.uesp.net/thumb/3/30/SR-icon-ingredient-Lavender.png/48px-SR-icon-ingredient-Lavender.png',
    note: 'Harvested from Lavender, most common in Whiterun Hold.',
    effects: ['Resist Magic', 'Fortify Stamina', 'Ravage Magicka', 'Fortify Conjuration']
  }, {
    name: 'Luna Moth Wing',
    icon: 'http://images.uesp.net/thumb/f/f6/SR-icon-ingredient-Luna_Moth_Wing.png/48px-SR-icon-ingredient-Luna_Moth_Wing.png',
    note: 'Collected by catching Luna Moths. Often found near flowers after dark.',
    effects: ['Damage Magicka', 'Fortify Light Armor', 'Regenerate Health', 'Invisibility']
  }, {
    name: 'Moon Sugar',
    icon: 'http://images.uesp.net/thumb/4/48/SR-icon-ingredient-Moon_Sugar.png/48px-SR-icon-ingredient-Moon_Sugar.png',
    note: 'Cannot be collected or harvested. Can be purchased from the Khajiit Traders.',
    effects: ['Weakness to Fire', 'Resist Frost', 'Restore Magicka', 'Regenerate Magicka']
  }, {
    name: 'Mora Tapinella',
    icon: 'http://images.uesp.net/thumb/5/51/SR-icon-ingredient-Mora_Tapinella.png/48px-SR-icon-ingredient-Mora_Tapinella.png',
    note: 'Harvested from Mora Tapinella mushrooms, found growing on dead trees.',
    effects: ['Restore Magicka', 'Lingering Damage Health', 'Regenerate Stamina', 'Fortify Illusion']
  }, {
    name: 'Mudcrab Chitin',
    icon: 'http://images.uesp.net/thumb/7/74/SR-icon-ingredient-Mudcrab_Chitin.png/48px-SR-icon-ingredient-Mudcrab_Chitin.png',
    note: 'Collected from dead Mudcrabs, found in or near bodies of water.',
    effects: ['Restore Stamina', 'Cure Disease', 'Resist Poison', 'Resist Fire']
  }, {
    name: 'Namira\'s Rot',
    icon: 'http://images.uesp.net/thumb/5/59/SR-icon-ingredient-Namira%27s_Rot.png/48px-SR-icon-ingredient-Namira%27s_Rot.png',
    note: 'Harvested from Namira\'s Rot mushrooms, found in various caves.',
    effects: ['Damage Magicka', 'Fortify Lockpicking', 'Fear', 'Regenerate Health']
  }, {
    name: 'Nightshade',
    icon: 'http://images.uesp.net/thumb/6/6f/SR-icon-ingredient-Nightshade.png/48px-SR-icon-ingredient-Nightshade.png',
    note: 'Harvested from Nightshade, found growing throughout Skyrim.',
    effects: ['Damage Health', 'Damage Magicka Regen', 'Lingering Damage Stamina', 'Fortify Destruction']
  }, {
    name: 'Nirnroot',
    icon: 'http://images.uesp.net/thumb/4/46/SR-icon-ingredient-Nirnroot.png/48px-SR-icon-ingredient-Nirnroot.png',
    note: 'Harvested from Nirnroot, found near bodies of water throughout Skyrim.',
    effects: ['Damage Health', 'Damage Stamina', 'Invisibility', 'Resist Magic']
  }, {
    name: 'Nordic Barnacle',
    icon: 'http://images.uesp.net/thumb/7/75/SR-icon-ingredient-Nordic_Barnacle.png/48px-SR-icon-ingredient-Nordic_Barnacle.png',
    note: 'Harvested from Nordic Barnacle Clusters, found in or near water.',
    effects: ['Damage Magicka', 'Waterbreathing', 'Regenerate Health', 'Fortify Pickpocket']
  }, {
    name: 'Orange Dartwing',
    icon: 'http://images.uesp.net/thumb/e/e7/SR-icon-ingredient-Orange_Dartwing.png/48px-SR-icon-ingredient-Orange_Dartwing.png',
    note: 'Collected by catching Dragonflies found near rivers and streams below the snow line.',
    effects: ['Restore Stamina', 'Ravage Magicka', 'Fortify Pickpocket', 'Lingering Damage Health']
  }, {
    name: 'Pearl',
    icon: 'http://images.uesp.net/thumb/a/ad/SR-icon-ingredient-Pearl.png/48px-SR-icon-ingredient-Pearl.png',
    note: 'Cannot be harvested or collected in the original version of the game; only readily available after the Merchant perk has been unlocked. With Dragonborn, they can be harvested from Pearl Oysters in Solstheim.',
    effects: ['Restore Stamina', 'Fortify Block', 'Restore Magicka', 'Resist Shock']
  }, {
    name: 'Pine Thrush Egg',
    icon: 'http://images.uesp.net/thumb/0/0f/SR-icon-ingredient-Pine_Thrush_Egg.png/48px-SR-icon-ingredient-Pine_Thrush_Egg.png',
    note: 'Harvested from bird nests in forested regions, in particular The Rift.',
    effects: ['Restore Stamina', 'Fortify Lockpicking', 'Weakness to Poison', 'Resist Shock']
  }, {
    name: 'Poison Bloom',
    icon: 'http://images.uesp.net/thumb/1/13/SR-icon-ingredient-Poison_Bloom.png/48px-SR-icon-ingredient-Poison_Bloom.png',
    note: 'Harvested from the plant of the same name.',
    effects: ['Damage Health', 'Slow', 'Fortify Carry Weight', 'Fear']
  }, {
    name: 'Powdered Mammoth Tusk',
    icon: 'http://images.uesp.net/thumb/c/c9/SR-icon-ingredient-Powdered_Mammoth_Tusk.png/48px-SR-icon-ingredient-Powdered_Mammoth_Tusk.png',
    note: 'Cannot be harvested or collected; only readily available after the Merchant perk has been unlocked.',
    effects: ['Restore Stamina', 'Fortify Sneak', 'Weakness to Fire', 'Fear']
  }, {
    name: 'Purple Mountain Flower',
    icon: 'http://images.uesp.net/thumb/e/e1/SR-icon-ingredient-Purple_Mountain_Flower.png/48px-SR-icon-ingredient-Purple_Mountain_Flower.png',
    note: 'Harvested from the purple variety of Mountain Flower.',
    effects: ['Restore Stamina', 'Fortify Sneak', 'Lingering Damage Magicka', 'Resist Frost']
  }, {
    name: 'Red Mountain Flower',
    icon: 'http://images.uesp.net/thumb/b/bb/SR-icon-ingredient-Red_Mountain_Flower.png/48px-SR-icon-ingredient-Red_Mountain_Flower.png',
    note: 'Harvested from the red variety of Mountain Flower.',
    effects: ['Restore Magicka', 'Ravage Magicka', 'Fortify Magicka', 'Damage Health']
  }, {
    name: 'River Betty',
    icon: 'http://images.uesp.net/thumb/2/25/SR-icon-ingredient-River_Betty.png/48px-SR-icon-ingredient-River_Betty.png',
    note: 'Collected by catching River Betty fish.',
    effects: ['Damage Health', 'Fortify Alteration', 'Slow', 'Fortify Carry Weight']
  }, {
    name: 'Rock Warbler Egg',
    icon: 'http://images.uesp.net/thumb/f/fc/SR-icon-ingredient-Rock_Warbler_Egg.png/48px-SR-icon-ingredient-Rock_Warbler_Egg.png',
    note: 'Harvested from bird nests in rocky regions, in particular The Reach.',
    effects: ['Restore Health', 'Fortify One-handed', 'Damage Stamina', 'Weakness to Magic']
  }, {
    name: 'Sabre Cat Tooth',
    icon: 'http://images.uesp.net/thumb/1/1b/SR-icon-ingredient-Sabre_Cat_Tooth.png/48px-SR-icon-ingredient-Sabre_Cat_Tooth.png',
    note: 'Collected from dead Sabre cats.',
    effects: ['Restore Stamina', 'Fortify Heavy Armor', 'Fortify Smithing', 'Weakness to Poison']
  }, {
    name: 'Salmon Roe',
    icon: 'http://images.uesp.net/thumb/2/2a/SR-icon-ingredient-Salmon_Roe.png/48px-SR-icon-ingredient-Salmon_Roe.png',
    note: 'Harvested from jumping Salmon.',
    effects: ['Restore Stamina', 'Waterbreathing', 'Fortify Magicka', 'Regenerate Magicka']
  }, {
    name: 'Salt Pile',
    icon: 'http://images.uesp.net/thumb/3/36/SR-icon-ingredient-Salt_Pile.png/48px-SR-icon-ingredient-Salt_Pile.png',
    note: 'Food. Cannot be harvested or collected, but is commonly found in barrels and sacks.',
    effects: ['Weakness to Magic', 'Fortify Restoration', 'Slow', 'Regenerate Magicka']
  }, {
    name: 'Scaly Pholiota',
    icon: 'http://images.uesp.net/thumb/1/18/SR-icon-ingredient-Scaly_Pholiota.png/48px-SR-icon-ingredient-Scaly_Pholiota.png',
    note: 'Harvested from Scaly Pholiota mushrooms, found growing on dead trees.',
    effects: ['Weakness to Magic', 'Fortify Illusion', 'Regenerate Stamina', 'Fortify Carry Weight']
  }, {
    name: 'Silverside Perch',
    icon: 'http://images.uesp.net/thumb/3/32/SR-icon-ingredient-Silverside_Perch.png/48px-SR-icon-ingredient-Silverside_Perch.png',
    note: 'Collected by catching Silverside Perch fish.',
    effects: ['Restore Stamina', 'Damage Stamina Regen', 'Ravage Health', 'Resist Frost']
  }, {
    name: 'Skeever Tail',
    icon: 'http://images.uesp.net/thumb/d/dc/SR-icon-ingredient-Skeever_Tail.png/48px-SR-icon-ingredient-Skeever_Tail.png',
    note: 'Collected from dead Skeevers.',
    effects: ['Damage Stamina Regen', 'Ravage Health', 'Damage Health', 'Fortify Light Armor']
  }, {
    name: 'Slaughterfish Egg',
    icon: 'http://images.uesp.net/thumb/8/84/SR-icon-ingredient-Slaughterfish_Egg.png/48px-SR-icon-ingredient-Slaughterfish_Egg.png',
    note: 'Collected from Slaughterfish Egg Nests, found in or near water.',
    effects: ['Resist Poison', 'Fortify Pickpocket', 'Lingering Damage Health', 'Fortify Stamina']
  }, {
    name: 'Slaughterfish Scales',
    icon: 'http://images.uesp.net/thumb/0/0f/SR-icon-ingredient-Slaughterfish_Scales.png/48px-SR-icon-ingredient-Slaughterfish_Scales.png',
    note: 'Collected from dead Slaughterfish.',
    effects: ['Resist Frost', 'Lingering Damage Health', 'Fortify Heavy Armor', 'Fortify Block']
  }, {
    name: 'Small Antlers',
    icon: 'http://images.uesp.net/thumb/4/4e/SR-icon-ingredient-Small_Antlers.png/48px-SR-icon-ingredient-Small_Antlers.png',
    note: 'Collected from dead female Elk.',
    effects: ['Weakness to Poison', 'Fortify Restoration', 'Lingering Damage Stamina', 'Damage Health']
  }, {
    name: 'Small Pearl',
    icon: 'http://images.uesp.net/thumb/8/8f/SR-icon-ingredient-Small_Pearl.png/48px-SR-icon-ingredient-Small_Pearl.png',
    note: 'Cannot be harvested or collected in the original version of the game; only readily available after the Merchant perk has been unlocked. With Dragonborn, they can be harvested from Pearl Oysters in Solstheim.',
    effects: ['Restore Stamina', 'Fortify One-handed', 'Fortify Restoration', 'Resist Frost']
  }, {
    name: 'Snowberries',
    icon: 'http://images.uesp.net/thumb/d/d3/SR-icon-ingredient-Snowberries.png/48px-SR-icon-ingredient-Snowberries.png',
    note: 'Harvested from Snowberry bushes, found in snowy regions of Skyrim.',
    effects: ['Resist Fire', 'Fortify Enchanting', 'Resist Frost', 'Resist Shock']
  }, {
    name: 'Spider Egg',
    icon: 'http://images.uesp.net/thumb/0/07/SR-icon-ingredient-Spider_Egg.png/48px-SR-icon-ingredient-Spider_Egg.png',
    note: 'Collected from spider Egg Sacs and Web Sacs.',
    effects: ['Damage Stamina', 'Damage Magicka Regen', 'Fortify Lockpicking', 'Fortify Marksman']
  }, {
    name: 'Spriggan Sap',
    icon: 'http://images.uesp.net/thumb/d/d6/SR-icon-ingredient-Spriggan_Sap.png/48px-SR-icon-ingredient-Spriggan_Sap.png',
    note: 'Cannot be harvested or collected; best source is merchants.',
    effects: ['Damage Magicka Regen', 'Fortify Enchanting', 'Fortify Smithing', 'Fortify Alteration']
  }, {
    name: 'Swamp Fungal Pod',
    icon: 'http://images.uesp.net/thumb/9/92/SR-icon-ingredient-Swamp_Fungal_Pod.png/48px-SR-icon-ingredient-Swamp_Fungal_Pod.png',
    note: 'Harvested from Swamp Fungal Pod, common in the tundra marsh of Hjaalmarch.',
    effects: ['Resist Shock', 'Lingering Damage Magicka', 'Paralysis', 'Restore Health']
  }, {
    name: 'Taproot',
    icon: 'http://images.uesp.net/thumb/7/78/SR-icon-ingredient-Taproot.png/48px-SR-icon-ingredient-Taproot.png',
    note: 'Collected from dead Spriggans.',
    effects: ['Weakness to Magic', 'Fortify Illusion', 'Regenerate Magicka', 'Restore Magicka']
  }, {
    name: 'Thistle Branch',
    icon: 'http://images.uesp.net/thumb/b/bf/SR-icon-ingredient-Thistle_Branch.png/48px-SR-icon-ingredient-Thistle_Branch.png',
    note: 'Harvested from Thistle.',
    effects: ['Resist Frost', 'Ravage Stamina', 'Resist Poison', 'Fortify Heavy Armor']
  }, {
    name: 'Torchbug Thorax',
    icon: 'http://images.uesp.net/thumb/9/99/SR-icon-ingredient-Torchbug_Thorax.png/48px-SR-icon-ingredient-Torchbug_Thorax.png',
    note: 'Collected by catching Torchbugs. Found below the snowline after dark.',
    effects: ['Restore Stamina', 'Lingering Damage Magicka', 'Weakness to Magic', 'Fortify Stamina']
  }, {
    name: 'Troll Fat',
    icon: 'http://images.uesp.net/thumb/8/8a/SR-icon-ingredient-Troll_Fat.png/48px-SR-icon-ingredient-Troll_Fat.png',
    note: 'Collected from dead Trolls.',
    effects: ['Resist Poison', 'Fortify Two-handed', 'Frenzy', 'Damage Health']
  }, {
    name: 'Tundra Cotton',
    icon: 'http://images.uesp.net/thumb/7/7e/SR-icon-ingredient-Tundra_Cotton.png/48px-SR-icon-ingredient-Tundra_Cotton.png',
    note: 'Harvested from Tundra Cotton, found in Whiterun Hold.',
    effects: ['Resist Magic', 'Fortify Magicka', 'Fortify Block', 'Fortify Barter']
  }, {
    name: 'Vampire Dust',
    icon: 'http://images.uesp.net/thumb/2/2f/SR-icon-ingredient-Vampire_Dust.png/48px-SR-icon-ingredient-Vampire_Dust.png',
    note: 'Collected from dead Vampires.',
    effects: ['Invisibility', 'Restore Magicka', 'Regenerate Health', 'Cure Disease']
  }, {
    name: 'Void Salts',
    icon: 'http://images.uesp.net/thumb/7/77/SR-icon-ingredient-Void_Salts.png/48px-SR-icon-ingredient-Void_Salts.png',
    note: 'Collected from dead Storm Atronachs.',
    effects: ['Weakness to Shock', 'Resist Magic', 'Damage Health', 'Fortify Magicka']
  }, {
    name: 'Wheat',
    icon: 'http://images.uesp.net/thumb/7/7f/SR-icon-ingredient-Wheat.png/48px-SR-icon-ingredient-Wheat.png',
    note: 'Food. Harvested from wheat bushels, found in various farms.',
    effects: ['Restore Health', 'Fortify Health', 'Damage Stamina Regen', 'Lingering Damage Magicka']
  }, {
    name: 'White Cap',
    icon: 'http://images.uesp.net/thumb/f/fa/SR-icon-ingredient-White_Cap.png/48px-SR-icon-ingredient-White_Cap.png',
    note: 'Harvested from White Cap mushrooms, found in various caves.',
    effects: ['Weakness to Frost', 'Fortify Heavy Armor', 'Restore Magicka', 'Ravage Magicka']
  }, {
    name: 'Wisp Wrappings',
    icon: 'http://images.uesp.net/thumb/9/9d/SR-icon-ingredient-Wisp_Wrappings.png/48px-SR-icon-ingredient-Wisp_Wrappings.png',
    note: 'Collected from dead Wispmothers.',
    effects: ['Restore Stamina', 'Fortify Destruction', 'Fortify Carry Weight', 'Resist Magic']
  }, {
    name: 'Yellow Mountain Flower',
    icon: 'http://images.uesp.net/thumb/6/6e/SR-icon-ingredient-Yellow_Mountain_Flower.png/48px-SR-icon-ingredient-Yellow_Mountain_Flower.png',
    note: 'Harvested from the yellow variety of Mountain Flower.',
    effects: ['Resist Poison', 'Fortify Restoration', 'Fortify Health', 'Damage Stamina Regen']
  }, {
    name: 'Ash Creep Cluster',
    icon: 'http://images.uesp.net/thumb/b/b7/DB-icon-ingredient-Ash_Creep_Cluster.png/48px-DB-icon-ingredient-Ash_Creep_Cluster.png',
    note: 'Harvested from creep cluster plants unique to Solstheim.',
    effects: ['Damage Stamina', 'Invisibility', 'Resist Fire', 'Fortify Destruction']
  }, {
    name: 'Ash Hopper Jelly',
    icon: 'http://images.uesp.net/thumb/1/10/DB-icon-ingredient-Ash_Hopper_Jelly.png/48px-DB-icon-ingredient-Ash_Hopper_Jelly.png',
    note: 'Collected from dead ash hoppers.',
    effects: ['Restore Health', 'Fortify Light Armor', 'Resist Shock', 'Weakness to Frost']
  }, {
    name: 'Ashen Grass Pod',
    icon: 'http://images.uesp.net/thumb/1/10/DB-icon-ingredient-Ashen_Grass_Pod.png/48px-DB-icon-ingredient-Ashen_Grass_Pod.png',
    note: 'Harvested from spiky grass plants unique to Solstheim.',
    effects: ['Resist Fire', 'Weakness to Shock', 'Fortify Lockpicking', 'Fortify Sneak']
  }, {
    name: 'Boar Tusk',
    icon: 'http://images.uesp.net/thumb/d/d8/DB-icon-ingredient-Boar_Tusk.png/48px-DB-icon-ingredient-Boar_Tusk.png',
    note: 'Collected from dead bristlebacks and rieklings.',
    effects: ['Fortify Stamina', 'Fortify Health', 'Fortify Block', 'Frenzy']
  }, {
    name: 'Burnt Spriggan Wood',
    icon: 'http://images.uesp.net/thumb/0/09/DB-icon-ingredient-Burnt_Spriggan_Wood.png/48px-DB-icon-ingredient-Burnt_Spriggan_Wood.png',
    note: 'Collected from dead burnt spriggans.',
    effects: ['Weakness to Fire', 'Fortify Alteration', 'Damage Magicka Regen', 'Slow']
  }, {
    name: 'Emperor Parasol Moss',
    icon: 'http://images.uesp.net/thumb/9/90/DB-icon-ingredient-Emperor_Parasol_Moss.png/48px-DB-icon-ingredient-Emperor_Parasol_Moss.png',
    note: 'Harvested from emperor parasol moss plants near Tel Mithryn.',
    effects: ['Damage Health', 'Fortify Magicka', 'Regenerate Health', 'Fortify Two-handed']
  }, {
    name: 'Felsaad Tern Feathers',
    icon: 'http://images.uesp.net/thumb/f/ff/DB-icon-ingredient-Felsaad_Tern_Feathers.png/48px-DB-icon-ingredient-Felsaad_Tern_Feathers.png',
    note: 'Collected from dead Felsaad terns.',
    effects: ['Restore Health', 'Fortify Light Armor', 'Cure Disease', 'Resist Magic']
  }, {
    name: 'Netch Jelly',
    icon: 'http://images.uesp.net/thumb/6/60/DB-icon-ingredient-Netch_Jelly.png/48px-DB-icon-ingredient-Netch_Jelly.png',
    note: 'Collected from dead netch.',
    effects: ['Paralysis', 'Fortify Carry Weight', 'Restore Stamina', 'Fear']
  }, {
    name: 'Scathecraw',
    icon: 'http://images.uesp.net/thumb/1/11/DB-icon-ingredient-Scathecraw.png/48px-DB-icon-ingredient-Scathecraw.png',
    note: 'Harvested from scathecraw plants.',
    effects: ['Ravage Health', 'Ravage Stamina', 'Ravage Magicka', 'Lingering Damage Health']
  }, {
    name: 'Spawn Ash',
    icon: 'http://images.uesp.net/thumb/6/6a/DB-icon-ingredient-Spawn_Ash.png/48px-DB-icon-ingredient-Spawn_Ash.png',
    note: 'Collected from dead ash spawn.',
    effects: ['Ravage Stamina', 'Resist Fire', 'Fortify Enchanting', 'Ravage Magicka']
  }, {
    name: 'Trama Root',
    icon: 'http://images.uesp.net/thumb/1/14/DB-icon-ingredient-Trama_Root.png/48px-DB-icon-ingredient-Trama_Root.png',
    note: 'Harvested from trama root plants.',
    effects: ['Weakness to Shock', 'Fortify Carry Weight', 'Damage Magicka', 'Slow']
  }];

