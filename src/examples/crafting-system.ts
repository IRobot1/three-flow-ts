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
function iterateEffects(ingredients: Array<Ingredient>, iterator: (effect: string, index: number, ingredient: Ingredient) => void) {
  for (let ingredient of ingredients) {
    for (let [index, effect] of ingredient.effects.entries()) {
      iterator(effect, index, ingredient);
    }
  }
}

export interface EffectParameters {
  name: string
}

export interface IngredientParameters {
  name: string
  effects: Array<string>
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
  constructor(public name: string, public effects: Array<string>, public properties: IngredientProperties) { }

  /**
   * Returns array of effects present both in this ingredient and `other`
   * @param {Ingredient} other
   * @return {Array.<String>}
   */
  getSharedEffects(other: Ingredient): Array<string> {
    return this.effects.filter((effect) => {
      return other.hasEffect(effect);
    });
  }

  /**
   * Does this ingredient has given effect?
   * @param {String} effect
   * @return {Boolean}
   */
  hasEffect(effect: string): boolean {
    return this.effects.indexOf(effect) > -1;
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


export class Potion extends Ingredient {
  
  constructor(name: string, effects: Array<string>, properties: IngredientProperties) {
    super(name, effects, properties)
  }

  combineIngredients(ingredients: Ingredient[]): this {
    this.properties.potency = ingredients.reduce((sum, ingredient) => sum + ingredient.properties.potency, 0);
    this.properties.purity = ingredients.reduce((sum, ingredient) => sum + ingredient.properties.purity, 0) / ingredients.length;

    this.effects = this.determineEffects(this.properties.potency, this.properties.purity);
    return this
  }

  private determineEffects(totalPotency: number, averagePurity: number): string[] {
    // Simplified logic to determine potion effects based on potency and purity
    if (averagePurity < 50) {
      return ["Unstable Potion"];
    } else if (totalPotency > 15) {
      return ["Powerful Healing"];
    } else if (totalPotency > 10) {
      return ["Moderate Healing"];
    } else {
      return ["Mild Healing"];
    }
  }
}

export class IngredientUtils {

  /**
   * Given ingredient list, return list of all possible potions
   * @param {Array.<Ingredient>} currentIngredients collection of ingredients
   */
  static getSharedEffects(currentIngredients: Array<Ingredient>): any {
    let effects: any = {};
    let potions: any = {};

    iterateEffects(currentIngredients, (effect, index, ingredient) => {
      if (!effects[effect]) {
        effects[effect] = [ingredient];
      } else {
        if (effects[effect].indexOf(ingredient) === -1) { // some ingredients have same effect twice
          effects[effect].push(ingredient);
        }

        if (effects[effect].length === 2) {
          potions[effect] = effects[effect];
        } else if (effects[effect].length > 2) {
          potions[effect].push(ingredient);
        }
      }
    });

    return potions;
  }

  /**
   * Given ingredient list, determine which effect(s) potion would have
   * @param {Array.<Ingredient>} ingredients
   * @return {Array.<String>}
   */
  static getEffectsForIngredients(ingredients: Array<Ingredient>): Array<string> {
    let effects: any = {};
    let resultingEffects: Array<string> = [];

    iterateEffects(ingredients, (effect) => {
      if (!effects[effect]) {
        effects[effect] = true;
      } else {
        resultingEffects.push(effect);
      }
    });

    return resultingEffects;
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
