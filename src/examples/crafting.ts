import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram } from "three-flow";
import { Ingredient, IngredientUtils } from "./crafting-system";
import { skyrim } from './crafting-skyrim'

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

    //   requestAnimationFrame(() => {

    const params0 = skyrim[0]
    const params1 = skyrim[4]
    const params2 = skyrim.find(c => c.name == 'Elves Ear')!

    const ingredient0 = new Ingredient(params0.name, params0.effects, {amount:1, purity:1, potency:1})
    const ingredient1 = new Ingredient(params1.name, params1.effects, { amount: 1, purity: 1, potency: 1 })
    const ingredient3 = new Ingredient(params2.name, params2.effects, { amount: 1, purity: 1, potency: 1 })

    ingredient0.properties.amount = 1
    if (ingredient0.properties['amount']) console.warn(ingredient0.properties.amount)

    const allingredients: Array<Ingredient> = []
    skyrim.forEach(p => { allingredients.push(new Ingredient(p.name, p.effects, { amount: 1, purity: 1, potency: 1 })) })

    console.warn('Has Shared Effect', ingredient0.getSharedEffects(ingredient1))
    console.warn('Has Effect Fortify Sneak', ingredient0.hasEffect('Fortify Sneak'))
    console.warn('Has Some Effects', ingredient0.hasSomeEffects(['Fortify Sneak', 'test']))

    console.warn('possible potions', IngredientUtils.getSharedEffects([ingredient0, ingredient1, ingredient3]))
    console.warn('effects for ingredients', IngredientUtils.getEffectsForIngredients([ingredient0, ingredient1, ingredient3]))
    console.warn('ingredients with any effects', IngredientUtils.getIngredientsWithAnyEffects(ingredient0, allingredients))
    console.warn('ingredients with effects', IngredientUtils.getIngredientsWithEffects(['Fortify Sneak'], allingredients))
    //    })

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
