import { AmbientLight, BufferGeometry, CircleGeometry, Color, PlaneGeometry, PointLight, Scene, Shape, ShapeGeometry } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader"

import { ThreeJSApp } from "../app/threejs-app"
import {
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
  FlowNode,
} from "three-flow"
import { parse } from './mermaid/parser.js'
import { DagreLayout } from "./dagre-layout"
import { GraphLabel } from "@dagrejs/dagre"
import { basicflowchart, complexflowchart, mediumflowchart, shapesflowchart } from "./mermaid/examples"

type ShapeType = 'rectangular' | 'roundrectangle' | 'rhombus' | 'stadium' | 'subroutine' | 'database' | 'circle' | 'asymmetric' | 'hexagonal' | 'parallelogram' | 'parallelogram_alt' | 'trapezoid' | 'trapezoid_alt'

interface MermaidNode {
  id: string
  label?: { type: ShapeType, label?: string }
}

type ArrowType = '-->' | '---' | '-.->' | '<--' | '<-.-' | '--'

interface MermaidEdge {
  from: MermaidNode
  to: MermaidNode
  arrow: ArrowType
}
interface MermaidFlowchart {
  layout: { type: string, direction: string }
  edges: Array<MermaidEdge>
}

interface ShapeNodeParameters extends FlowNodeParameters {
  shape: ShapeType
}

export class MermaidExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 5

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

    const orbit = new OrbitControls(app.camera, app.domElement)
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false
    orbit.update()

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //scene.add(new AxesHelper(3))

    var dropdown = document.createElement('select')
    dropdown.id = 'myDynamicDropdown'
    document.body.appendChild(dropdown)

    // Set styles programmatically
    Object.assign(dropdown.style, {
      position: 'absolute',
      top: 0,
      border: '2px solid #0087F7',
      borderRadius: '5px',
      width: '300px',
      textAlign: 'center',
      lineHeight: '200px',
      fontSize: '20px',
      color: '#0087F7',
      margin: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    })

    // Create and append the placeholder option
    var placeholderOption = document.createElement('option')
    placeholderOption.value = ''
    placeholderOption.textContent = "Select Mermaid Flowchart"
    placeholderOption.disabled = true
    placeholderOption.selected = true
    placeholderOption.hidden = true
    dropdown.appendChild(placeholderOption)

    // Options for the dropdown
    let list = [
      { textContent: 'Basic', data: basicflowchart },
      { textContent: 'Shapes', data: shapesflowchart },
      { textContent: 'Medium', data: mediumflowchart },
      { textContent: 'Complex', data: complexflowchart },
    ]

    // Add options to the dropdown
    list.forEach((option, index) => {
      var optionElement = document.createElement('option')
      optionElement.value = index.toString()
      optionElement.textContent = option.textContent
      dropdown.appendChild(optionElement)
    })

    const loader = new FontLoader()
    loader.load("assets/helvetiker_regular.typeface.json", (font) => {

      const options: FlowDiagramOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        layout: new DagreLayout()
      }

      // Event listener for the dropdown
      const flow = new FlowDiagram(options)
      scene.add(flow)

      flow.createNode = (node: ShapeNodeParameters): MermaidShapeNode => {
        return new MermaidShapeNode(flow, node)
      }

      // make the flow interactive
      new FlowInteraction(flow, app, app.camera)

      let parsedOutput: MermaidFlowchart
      // Parse the flowchart

      dropdown.addEventListener('change', function () {
        flow.dispose()

        const index = +this.value
        const flowchart = list[index].data

        try {
          parsedOutput = parse(flowchart) as MermaidFlowchart
          console.log(parsedOutput)
        } catch (error) {
          console.error('Parsing error:', error)
        }

        parsedOutput.edges.forEach(edge => {
          const from = edge.from
          let node = flow.hasNode(from.id)
          if (!node) {
            if (!from.label) from.label = { type: 'rectangular', label: from.id }
            flow.addNode(<ShapeNodeParameters>{ text: from.id, label: { text: from.label.label, size: 0.15 }, height: 0.5, shape: from.label.type })
          }


          const to = edge.to
          if (to) {
            const edgeparams: FlowEdgeParameters = { v: from.id, w: to.id }

            node = flow.hasNode(to.id)
            if (!node) {
              if (!to.label) to.label = { type: 'rectangular', label: to.id }
              flow.addNode(<ShapeNodeParameters>{ text: to.id, label: { text: to.label.label, size: 0.15 }, height: 0.5, shape: to.label.type })
            }

            switch (edge.arrow) {
              case '-.->':
              case '-->':
                edgeparams.toarrow = { type: 'to' }
                break
              case '---':
                break
              default:
                console.warn('Unhandled edge arrow', edge.arrow)
                break
            }
            flow.addEdge(edgeparams)
          }
        })

        flow.layout(<GraphLabel>{ rankdir: parsedOutput.layout.direction, ranksep: 1 })

        console.warn(flow.save())
      })

      this.dispose = () => {
        document.body.removeChild(dropdown)
        flow.dispose()
        orbit.dispose()
      }
    })


  }

}

class MermaidShapeNode extends FlowNode {
  constructor(diagram: FlowDiagram, node: ShapeNodeParameters) {
    super(diagram, node)
  }

  private rectangularShape(width: number, height: number, radius: number): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    const shape = new Shape()
      .moveTo(-halfwidth + radius, -halfheight)
      .lineTo(halfwidth - radius, -halfheight)
      .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
      .lineTo(halfwidth, halfheight - radius)
      .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
      .lineTo(-halfwidth + radius, halfheight)
      .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
      .lineTo(-halfwidth, -halfheight + radius)
      .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)

    return shape
  }

  private stadiumShape(width: number, height: number): Shape {
    var radius = height / 2
    const shape = new Shape()
      // Start at the top of the left semi-circle
      .moveTo(-width / 2 + radius, height / 2)

      // Left semi-circle, counter-clockwise
      .absarc(-width / 2 + radius, 0, radius, Math.PI / 2, -Math.PI / 2, false)

      // Bottom line (right side)
      .lineTo(width / 2 - radius, -height / 2)

      // Right semi-circle
      .absarc(width / 2 - radius, 0, radius, -Math.PI / 2, Math.PI / 2, false)

      // Top line (left side)
      .lineTo(-width / 2 + radius, height / 2)

    return shape
  }

  private subroutineShape(width: number, height: number, holesize = 0.1, offset = 0.05): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    // Outer rectangle
    const shape = new Shape()
      .moveTo(-halfwidth, -halfheight)
      .lineTo(-halfwidth, halfheight)
      .lineTo(halfwidth, halfheight)
      .lineTo(halfwidth, -halfheight)

    const lefthole = new Shape()
      .moveTo(-halfwidth + offset + holesize, halfheight - offset)
      .lineTo(-halfwidth + offset, halfheight - offset)
      .lineTo(-halfwidth + offset, -halfheight + offset)
      .lineTo(-halfwidth + offset + holesize, -halfheight + offset)

    shape.holes.push(lefthole)

    const righthole = new Shape()
      .moveTo(halfwidth - offset, halfheight - offset)
      .lineTo(halfwidth - offset - holesize, halfheight - offset)
      .lineTo(halfwidth - offset - holesize, -halfheight + offset)
      .lineTo(halfwidth - offset, -halfheight + offset)

    shape.holes.push(righthole)

    return shape
  }

  private databaseShape(width: number, height: number, holesize = 0.1, offset = 0.03) {
    const halfwidth = width / 2
    const halfheight = height / 2

    const shape = new Shape()
      .moveTo(-halfwidth, halfheight)  // top left
      .absellipse(0, halfheight, halfwidth, holesize, Math.PI, 0, true)
      .lineTo(halfwidth, -halfheight)
      .absellipse(0, -halfheight, halfwidth, holesize, 0, Math.PI, true)

    const hole = new Shape()
      .absellipse(0, halfheight - offset, halfwidth - offset * 2, holesize, 0, Math.PI * 2, false)

    shape.holes.push(hole)

    return shape
  }

  private rhombusShape(width: number, height: number): Shape {
    const padding = 0.1
    const halfwidth = width / 2 + padding
    const halfheight = halfwidth //height / 2 + padding

    const shape = new Shape()
      .moveTo(0, -halfheight)
      .lineTo(-halfwidth, 0)
      .lineTo(0, halfheight)
      .lineTo(halfwidth, 0)

    return shape
  }

  private asymmetricShape(width: number, height: number, indent = 0.2): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    // Outer rectangle
    const shape = new Shape()
      .moveTo(-halfwidth - indent, halfheight)
      .lineTo(halfwidth, halfheight)
      .lineTo(halfwidth, -halfheight)
      .lineTo(-halfwidth - indent, -halfheight)
      .lineTo(-halfwidth, 0)

    return shape
  }

  private hexagonalShape(width: number, height: number, outdent = 0.2): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    // Outer rectangle
    const shape = new Shape()
      .moveTo(-halfwidth, halfheight)
      .lineTo(halfwidth, halfheight)
      .lineTo(halfwidth + outdent, 0)
      .lineTo(halfwidth, -halfheight)
      .lineTo(-halfwidth, -halfheight)
      .lineTo(-halfwidth - outdent, 0)

    return shape
  }

  private parallelogramShape(width: number, height: number, offset = 0.1): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    // Outer rectangle
    const shape = new Shape()
      .moveTo(-halfwidth + offset, halfheight)
      .lineTo(halfwidth + offset, halfheight)
      .lineTo(halfwidth - offset, -halfheight)
      .lineTo(-halfwidth - offset, -halfheight)

    return shape
  }

  private trapazoidShape(width: number, height: number, offset = 0.1): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    // Outer rectangle
    const shape = new Shape()
      .moveTo(-halfwidth + offset, halfheight)
      .lineTo(halfwidth - offset, halfheight)
      .lineTo(halfwidth + offset, -halfheight)
      .lineTo(-halfwidth - offset, -halfheight)

    return shape
  }

  override  createGeometry(): BufferGeometry {
    const shapenode = this.node as ShapeNodeParameters
    let result: BufferGeometry

    switch (shapenode.shape) {
      case 'roundrectangle':
        result = new ShapeGeometry(this.rectangularShape(this.width, this.height, 0.1))
        break
      case 'stadium':
        result = new ShapeGeometry(this.stadiumShape(this.width, this.height))
        break
      case 'subroutine':
        result = new ShapeGeometry(this.subroutineShape(this.width + 0.2, this.height))
        break
      case 'database':
        result = new ShapeGeometry(this.databaseShape(this.width, this.height))
        break
      case 'rhombus':
        result = new ShapeGeometry(this.rhombusShape(this.width, this.height))
        break
      case 'circle':
        result = new CircleGeometry(this.width / 2)
        break
      case 'asymmetric':
        result = new ShapeGeometry(this.asymmetricShape(this.width, this.height))
        break
      case 'hexagonal':
        result = new ShapeGeometry(this.hexagonalShape(this.width, this.height))
        break
      case 'parallelogram':
        result = new ShapeGeometry(this.parallelogramShape(this.width, this.height))
        break
      case 'parallelogram':
        result = new ShapeGeometry(this.parallelogramShape(this.width, this.height))
        break
      case 'parallelogram_alt':
        result = new ShapeGeometry(this.parallelogramShape(this.width, this.height, -0.1))
        break
      case 'trapezoid':
        result = new ShapeGeometry(this.trapazoidShape(this.width, this.height))
        break
      case 'trapezoid_alt':
        result = new ShapeGeometry(this.trapazoidShape(this.width, this.height, -0.1))
        break
      case 'rectangular':
        result = new PlaneGeometry(this.width, this.height)
        break
      default:
        console.warn('Unhandled mermaid shape', shapenode.shape)
        result = new BufferGeometry()
        break
    }
    return result
  }

}
