/**
 * @author Konstantin Kitmanov <doctor.hogart@gmail.com>
 * @license MIT
 */

import { min } from "rxjs";

//
// adapted from https://github.com/hogart/alchemy/blob/master/src/lib/alchemy.js
//


/**
 * Iterates over all effects on given ingredient list
 * @param {Array.<Ingredient>} ingredients
 * @param {Function} iterator receives `effect` and `ingredient`
 */
function iterateEffects(ingredients: Array<Ingredient>, iterator: (effect: Effect, index: number, ingredient: Ingredient) => void) {
  for (let ingredient of ingredients) {
    let index = 0
    for (let effect of ingredient.effects) {
      iterator(effect, index, ingredient);
    }
  }
}

// effect combinations - cancel, make something entirely different
// anti effect - negative intensity
// side effects
// category - senses
// time - speed up or slow down
// emotions
// frequency
// visibility
// brightness
// color

//Duration: Time the effect lasts.
//Intensity: Strength or magnitude of the effect.
//Range of Effect: Area covered by the effect.
//Cooldown Period: Waiting time before reuse.
//Side Effects: Unintended additional effects.
//Conditional Effects: Effects triggered under specific conditions.
// Visibility: If the effect is observable by others.
//Type of Effect: Category of the effect(healing, buff, etc.).
// Compatibility: Interactions with other effects.
//Activation Delay: Time before the effect begins.
//Removability: Whether the effect can be undone.
//Rarity: How rare and valuable the potion is.

export interface Effect {
  name: string
  // intensity: number // positive or negative
}

export interface EffectCount { effect: Effect, count: number }

export interface IngredientParameters {
  name: string
  effects: Array<Effect>
}

export interface IngredientProperties {
  count: number // number of this ingredient
  potency: number // strength
  purity: number // as a percentage from 0 to 100
  buyvalue: number
  sellvalue: number
  // rarity
  // stability
  // magic
  // harvest conditions - time of day, season, weather
  // expiration - reduce potency over time - preserve in better bottle
  // amplify
}




/**
 * Class, representing particular ingredient
 * @property {String} name
 * @property {Array.<String>} effects
 */
export class Ingredient implements IngredientParameters {
  /**
   * @param {String} name
   * @param {Array.<String>} effects
   */
  constructor(public name: string, public effects: Array<Effect>, public properties: IngredientProperties = Ingredient.newProperties()) { }


  static newProperties(): IngredientProperties {
    return { count: 1, purity: 1, potency: 1, buyvalue: 0, sellvalue: 0 }
  }

  /**
   * Returns array of effects present both in this ingredient and `other`
   * @param {Ingredient} other
   * @return {Array.<String>}
   */
  getSharedEffects(other: Ingredient): Array<Effect> {
    return this.effects.filter((effect) => {
      return other.hasEffect(effect);
    });
  }

  /**
   * Does this ingredient has given effect?
   * @param {String} effect
   * @return {Boolean}
   */
  hasEffect(effect: Effect): boolean {
    return this.effects.findIndex(e => e.name == effect.name) > -1;
  }

  /**
   * Does this ingredient has any of desired effects?
   * @param {Array.<String>} effects
   * @return {boolean}
   */
  hasSomeEffects(effects: Array<Effect>): boolean {
    return effects.some((effect) => {
      return this.hasEffect(effect);
    });
  }

  /**
   * Does this ingredient has any of desired effects?
   * @param {Array.<String>} effects
   * @return {boolean}
   */
  hasAllEffects(effects: Array<Effect>): boolean {
    return effects.every((effect) => {
      return this.hasEffect(effect);
    });
  }
}

export interface PotionProperties extends IngredientProperties {
}



export interface Recipe {
  effects: Array<Effect>  // required effects
  total?: Partial<IngredientProperties> // optional, for all ingredients, sum of these properties must exceed this value - required total
  average?: Partial<IngredientProperties> // optional, for all ingredients, average of these properties must exceed this value - required average
}

export class Potion extends Ingredient {

  constructor(name: string, effects: Array<Effect>, properties: PotionProperties = Potion.newProperties(), public recipe: Recipe) {
    super(name, effects, properties)
    if (recipe.average?.purity && recipe.average.purity > 0.5) {
      console.warn(`Average ${recipe.average.purity} is greater than 0.5, reducing`)
      recipe.average.purity *= 0.5
    }
  }

  static override newProperties(): PotionProperties {
    return { count: 1, purity: 1, potency: 1, buyvalue: 0, sellvalue: 0 }
  }

  hasAllRecipeEffects(effects: Array<Effect>): boolean {
    return this.recipe.effects.every((effect) => {
      return effects.some(item => item.name == effect.name)
    });
  }

  makeFromIngredients(ingredients: Ingredient[]): boolean {
    let effects = IngredientUtils.getCombinedEffects(ingredients)
    if (!this.hasAllRecipeEffects(effects)) {
      //console.warn(`Recipe ${this.name} has ${effects.map(e => e.name)}, requires ${this.recipe.effects.map(e => e.name)}`)
      return false
    }

    let meets = true
    for (const key in this.recipe.total) {
      if (this.recipe.total.hasOwnProperty(key)) {
        // @ts-ignore
        const total = ingredients.reduce((sum, ingredient) => sum + ingredient.properties[key], 0);

        // @ts-ignore
        const required = this.recipe.total[key]

        if (total < required) {
          //console.warn(`Recipe ${this.name} required average for ${key}: ${total}<${required}`)
          meets = false
        }
      }
    }
    if (!meets) return false

    meets = true
    for (const key in this.recipe.average) {
      if (this.recipe.average.hasOwnProperty(key)) {
        // @ts-ignore
        const average = ingredients.reduce((sum, ingredient) => sum + ingredient.properties[key], 0) / ingredients.length;

        // @ts-ignore
        const required = this.recipe.average[key]

        if (average < required) {
         // console.warn(`Recipe ${this.name} required average for ${key}: ${average}<${required}`)
          meets = false
        }
      }
    }

//      console.warn(`Recipe ${this.name} has ${effects.map(e => e.name)}, requires ${this.recipe.effects.map(e => e.name)}`)
    return meets
  }

}


export class IngredientUtils {
  /**
   * Given ingredient list, determine which effect(s) potion would have
   * @param {Array.<Ingredient>} ingredients
   * @return {Array.<String>}
   */
  static getEffectsMap(ingredients: Array<Ingredient>): Map<string, EffectCount> {
    let effectsMap = new Map<string, EffectCount>()

    iterateEffects(ingredients, (effect) => {
      if (!effectsMap.has(effect.name))
        effectsMap.set(effect.name, { effect, count: 0 });
      effectsMap.get(effect.name)!.count++
    });
    return effectsMap
  }

  static getCombinedEffects(ingredients: Array<Ingredient>): Array<Effect> {
    let effectsMap = this.getEffectsMap(ingredients)

    // return effects that have a minimum overlap 
    return Array.from(effectsMap.entries())
      .map(([_, value]) => value.effect);
  }

  /**
   * Given ingredient list, determine which effect(s) meet common count
   * @param {Array.<Ingredient>} ingredients
   * @return {Array.<String>}
   */
  static getEffectsForIngredients(ingredients: Array<Ingredient>, commonCount: number = ingredients.length): Array<Effect> {
    let effectsMap = this.getEffectsMap(ingredients)

    // return effects that have a minimum overlap 
    return Array.from(effectsMap.entries())
      .filter(([key, value]) => value.count >= commonCount)
      .map(([_, value]) => value.effect);
  }

  /**
 * Given ingredient list, determine top most common effect(s)
 * @param {Array.<Ingredient>} ingredients
 * @return {Array.<String>}
 */
  static getTopEffects(ingredients: Array<Ingredient>, top: number = 4): Array<Effect> {
    let effectsMap = this.getEffectsMap(ingredients)

    // Get top 3 keys with the highest values
    return Array.from(effectsMap)
      .sort((a, b) => b[1].count - a[1].count) // Sort by value in descending order
      .slice(0, top)                 // Get top entries
      .map(([_, value]) => value.effect);     // Extract keys
  }

  /**
   * What potions can you make from this `givenIngredient` and other ingredients
   * @param {Ingredient} givenIngredient
   * @param {Array.<Ingredient>} otherIngredients overall ingredients list
   */
  static getIngredientsWithAnyEffects(givenIngredient: Ingredient, otherIngredients: Array<Ingredient>): Array<Ingredient> {
    let suitableIngredients: Array<Ingredient> = [];

    iterateEffects(otherIngredients, (effect, index, ingredient) => {
      if (ingredient.name !== givenIngredient.name && suitableIngredients.indexOf(ingredient) === -1) { // do not compare ingredient with itself
        if (givenIngredient.getSharedEffects(ingredient).length) {
          suitableIngredients.push(ingredient);
        }
      }
    });

    return suitableIngredients;
  }

  /**
   * Given desired effects, what possible ingredients do you need to make it?
   * @param {Array.<String>} desiredEffects
   * @param {Array.<Ingredient>} ingredients
   * @return {Array.<Ingredient>}
   */
  static getIngredientsWithEffects(desiredEffects: Array<Effect>, ingredients: Array<Ingredient>): Array<Ingredient> {
    return ingredients.filter((/** @type {Ingredient} */ingredient) => {
      return ingredient.hasSomeEffects(desiredEffects);
    });
  }
}
