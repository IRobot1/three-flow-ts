import { AmbientLight, AxesHelper, Color, PointLight, PropertyBinding, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram } from "three-flow";
import { Effect, Ingredient, IngredientParameters, IngredientProperties, IngredientUtils, Potion, PotionProperties, Recipe } from "./crafting-system";
import { skyrim } from './crafting-skyrim'
import { effectsNames, ingredientNames, potionNames } from "./crafting-data";

export class CraftingExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

    scene.background = new Color(0x444444)

    const ambient = new AmbientLight()
    ambient.intensity = 1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //scene.add(new AxesHelper(3))

    //const flow = new FlowDiagram()
    //scene.add(flow);

    requestAnimationFrame(() => {

      const params0 = skyrim[0]
      const params1 = skyrim[4]
      const params2 = skyrim.find(c => c.name == 'Elves Ear')!

      const ingredient0 = new Ingredient(params0.name, params0.effects.map(name => <Effect>{ name }))
      const ingredient1 = new Ingredient(params1.name, params1.effects.map(name => <Effect>{ name }))
      const ingredient3 = new Ingredient(params2.name, params2.effects.map(name => <Effect>{ name }))

      const allingredients: Array<Ingredient> = []
      skyrim.forEach(p => { allingredients.push(new Ingredient(p.name, p.effects.map(name => <Effect>{ name }))) })

      //console.warn('Has Shared Effect', ingredient0.getSharedEffects(ingredient1))
      //console.warn('Has Effect Fortify Sneak', ingredient0.hasEffect({ name: 'Fortify Sneak' }))
      //console.warn('Has Some Effects', ingredient0.hasSomeEffects([{ name: 'Fortify Sneak' }, { name: 'test' }]))

      //console.warn('effects for ingredients', IngredientUtils.getEffectsForIngredients([ingredient0, ingredient1, ingredient3], 2))
      //console.warn('top common effects for ingredients', IngredientUtils.getTopEffects([ingredient0, ingredient1, ingredient3]))
      //console.warn('ingredients with any effects', IngredientUtils.getIngredientsWithAnyEffects(ingredient0, allingredients))
      //console.warn('ingredients with effects', IngredientUtils.getIngredientsWithEffects([{ name: 'Fortify Sneak' }], allingredients))
      //    })

      //const potionprops = Potion.newProperties()
      //potionprops.potency = 2

      //const combined = IngredientUtils.getCombinedEffects([ingredient0, ingredient1])
      //const recipe: Recipe = {
      //  effects: combined, total: { potency: 1 }, average: { purity: 1 }
      //}
      //const potions: Array<Potion> = [
      //  new Potion('fred', [{ name: 'Fortify Sneak' }], potionprops, recipe)
      //]

      //const potion = potions[0]
      //const ingredients = [ingredient0, ingredient1]


      //console.warn('required effects', IngredientUtils.getCombinedEffects([ingredient0, ingredient1]).map(e => e.name))
      //console.warn('make from ingredients', potion.makeFromIngredients(ingredients))

      //    const effects = Array.from(IngredientUtils.getEffectsMap(allingredients).values()).map(v => v.effect.name)
      //  console.warn(effects)

      //  const names = skyrim.map(i => i.name)
      //console.warn(names)

      const effectscount = effectsNames.length
      const randomEffects: Array<Array<Effect>> = []
      for (let i = 0; i < 100; i++) {
        const count = 3 + Math.trunc(Math.random() * 6)
        const xeffects: Array<Effect> = []
        for (let j = 0; j < count; j++) {
          const index = Math.trunc(Math.random() * effectscount)
          const name = effectsNames[index]
          xeffects.push({ name })
        }
        randomEffects.push(xeffects)
      }

      const ingredientcount = ingredientNames.length
      const randomIngredients: Array<Ingredient> = []
      for (let i = 0; i < 100; i++) {
        let index = Math.trunc(Math.random() * ingredientcount)
        const name = ingredientNames[index]

        //index = Math.trunc(Math.random() * effectscount)
        const effects = randomEffects[i]

        const properties: IngredientProperties = {
          count: 1, potency: Math.random(), purity: Math.random(), buyvalue: 1, sellvalue: 2
        }
        randomIngredients.push(new Ingredient(name, effects, properties))
      }


      const randomRecipes: Array<Recipe> = []
      for (let i = 0; i < 100; i++) {
        let index = Math.trunc(Math.random() * randomEffects.length - 1)
        const effects = randomEffects[index]

        randomRecipes.push({ effects, total: { potency: Math.random() }, average: { purity: Math.random()/2 } })
      }

      const potioncount = potionNames.length
      const randomPotions: Array<Potion> = []
      for (let i = 0; i < 100; i++) {
        let index = Math.trunc(Math.random() * potioncount)
        const name = potionNames[index]

        const properties: IngredientProperties = {
          count: 1, potency: Math.random()*2, purity: Math.random()*2, buyvalue: 2, sellvalue: 4
        }
        randomPotions.push(new Potion(name, [], properties, randomRecipes[i]))
      }

      for (let i = 0; i < 100; i++) {
        let potionIndex = Math.trunc(Math.random() * randomPotions.length - 1)

        const potion = randomPotions[potionIndex]
        console.log(`Making potion ${potion.name} with required effects ${potion.recipe.effects.map(e => e.name)}`)

        let max = 3
        let count = 0
        let done = false
        while (!done) {
          const ingredients: Array<Ingredient> = []
          const maxIngredients = max

          // put together some random ingredients
          for (let j = 0; j < maxIngredients; j++) {
            let index = Math.trunc(Math.random() * randomIngredients.length - 1)
            ingredients.push(randomIngredients[index])
          }

          if (potion.makeFromIngredients(ingredients)) {
            console.log(`Successfully made using ${ingredients.map(i => i.name)} with ${ingredients.length} ingredients after ${count} tries`)
            done = true
          }
          count++
          if (count % 100 == 0) {
            max++
            console.warn('increasing ingredient max to ', max)
            if (max > 100) {
              console.warn(`Failed to make recipe ${potion.recipe.effects.map(e => e.name)} with ${ingredients.length} properties`, potion.recipe)//ingredients effects ${IngredientUtils.getEffectsForIngredients(ingredients, 1).map(e => e.name)}`)
              done = true
              console.warn(`Checking`, potion.makeFromIngredients(randomIngredients))
            }
          }
        }
      }
    })

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
