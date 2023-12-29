/**
 * @author Konstantin Kitmanov <doctor.hogart@gmail.com>
 * @license MIT
 */

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
    for (let  effect of ingredient.effects) {
      iterator(effect, index, ingredient);
    }
  }
}

export interface Effect {
  name: string
}

export interface EffectCount { effect: Effect, count: number }

export interface IngredientParameters {
  name: string
  effects: Array<Effect>
}

export interface IngredientProperties {
  amount: number // number of this ingredient
  potency: number
  purity: number // as a percentage from 0 to 100
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
  constructor(public name: string, public effects: Array<Effect>, public properties: IngredientProperties) { }

  /**
   * Returns array of effects present both in this ingredient and `other`
   * @param {Ingredient} other
   * @return {Array.<String>}
   */
  getSharedEffects(other: Ingredient): Array<Effect> {
    return this.effects.filter((effect) => {
      return other.hasEffect(effect.name);
    });
  }

  /**
   * Does this ingredient has given effect?
   * @param {String} effect
   * @return {Boolean}
   */
  hasEffect(effect: string): boolean {
    return this.effects.findIndex(e => e.name == effect) > -1;
  }

  /**
   * Does this ingredient has any of desired effects?
   * @param {Array.<String>} effects
   * @return {boolean}
   */
  hasSomeEffects(effects: Array<string>): boolean {
    return effects.some((effect) => {
      return this.hasEffect(effect);
    });
  }
}

interface PotionProperties extends IngredientProperties {
}

export class Potion extends Ingredient {

  constructor(name: string, effects: Array<Effect>, properties: PotionProperties) {
    super(name, effects, properties)
  }

}

export class Crafting {
  constructor(public potions: Array<Potion>) {  }
  combineIngredients(ingredients: Ingredient[]): Potion {
    let totalPotency = ingredients.reduce((sum, ingredient) => sum + ingredient.properties.potency, 0);
    let averagePurity = ingredients.reduce((sum, ingredient) => sum + ingredient.properties.purity, 0) / ingredients.length;

    let effects = [...IngredientUtils.getEffectsForIngredients(ingredients), this.combinedEffect(totalPotency, averagePurity)]
    return new Potion('fred', effects, { amount: 1, purity: averagePurity, potency: totalPotency });
  }

  // overridable
  combinedEffect(totalPotency: number, averagePurity: number): Effect {
    // Simplified logic to determine potion effects based on potency and purity
    if (averagePurity < 50) {
      return { name: "Unstable Potion" };
    } else if (totalPotency > 15) {
      return { name: "Powerful Healing" };
    } else if (totalPotency > 10) {
      return { name: "Moderate Healing" };
    } else {
      return { name: "Mild Healing" };
    }
  }
}

export class IngredientUtils {
  /**
   * Given ingredient list, determine which effect(s) potion would have
   * @param {Array.<Ingredient>} ingredients
   * @return {Array.<String>}
   */
  private static getEffectsMap(ingredients: Array<Ingredient>): Map<string, EffectCount> {
    let effectsMap = new Map<string, EffectCount>()

    iterateEffects(ingredients, (effect) => {
      if (!effectsMap.has(effect.name))
        effectsMap.set(effect.name, { effect, count: 0 });
      effectsMap.get(effect.name)!.count++
    });
    return effectsMap
  }

  /**
   * Given ingredient list, determine which effect(s) meet common count
   * @param {Array.<Ingredient>} ingredients
   * @return {Array.<String>}
   */
  static getEffectsForIngredients(ingredients: Array<Ingredient>, commonCount: number = ingredients.length - 1): Array<Effect> {
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
  static getTopEffects(ingredients: Array<Ingredient>, top : number = 4): Array<Effect> {
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
  static getIngredientsWithEffects(desiredEffects: Array<string>, ingredients: Array<Ingredient>): Array<Ingredient> {
    return ingredients.filter((/** @type {Ingredient} */ingredient) => {
      return ingredient.hasSomeEffects(desiredEffects);
    });
  }
}
