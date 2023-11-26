# Three Flow

Three Flow is a native threejs graphing library for adding to a threejs scene.  Nodes and edges are rendered using threejs objects and materials. This allows visuals to have volume, shadows, reflections and dynamic material effects.

![image](https://github.com/IRobot1/three-flow-ts/assets/25032599/777b313c-05f9-440b-98ef-ac15742e649a)

## The Very Basics
Nodes and edges can be defined in JSON and loaded into a basic diagram

```ts
const diagram: FlowDiagramParameters = {
  nodes: [
    {
      text: "1", color: 'green', y: 1,
      label: { text: "Green Center", },
      labelanchor: 'top', labeltransform: { translate: { y: -0.1 } },
    },
    {
      text: "2", color: 'red', x: 1.5,
      label: { text: "Red Right" },
    },
    {
      text: "3", color: 'gold', x: -1.5,
      label: { text: "Gold Left" },
    }
  ],
  edges: [
    { v: "1", w: "3", },
    { v: "1", w: "3", },
    { v: "2", w: "1", }
  ]
}

const flow = new FlowDiagram()
scene.add(flow);

flow.load(diagram)
```

![image](https://github.com/IRobot1/three-flow-ts/assets/25032599/c31f1f4b-428c-4b07-b4ee-8c421a347f62)

Alternatively, nodes and edges can be programmatically created using addNode and addEdge

```ts
const node4 = flow.addNode({
  text: '4', y: -0.5, color: 'blue',
  label: { text: 'Blue Square', color: 'white' }
})
flow.addEdge({ v: node4.name, w: '1' })
```
![image](https://github.com/IRobot1/three-flow-ts/assets/25032599/6e9fe656-4c49-4dae-9dcd-52977c01aade)

Yes, but how to I build a graph like the first iamge?


## Installation

To add three-flow to your existing three project

```
npm install three-flow
```
