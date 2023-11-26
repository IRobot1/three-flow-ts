# Three Flow

Three Flow is a native threejs graphing library for adding to a threejs scene.  Nodes and edges are rendered using threejs objects and materials. This allows visuals to have volume, shadows, reflections and dynamic material effects.

![image](https://github.com/IRobot1/three-flow-ts/assets/25032599/777b313c-05f9-440b-98ef-ac15742e649a)

This library is still under active development.  Updates and improvements may have breaking changes.

Demo (this repo hosted) coming soon

## Documentation

[Getting Start](https://github.com/IRobot1/three-flow-ts/wiki/Getting-Started)

[Features](https://github.com/IRobot1/three-flow-ts/wiki/Features)

[Learn](https://github.com/IRobot1/three-flow-ts/wiki/Learn)

## Installation

To add three-flow to your existing three project

```
npm install three-flow
```

## Local Development
This repo uses Angular to host the examples and manage three-flow library. three-flow does not depend on Angular.

Download or clone repo.  

```
npm install
ng serve -o
```
# Roadmap
The following are planned features in no particular order

## General
* lil-gui for all classes and properties
* 

## Node
* suppoort for radius as alternative to width and height
* 

## Edge
* label and styling
* curved version of split 
* bezier path instead of spline points
* 

## Interactive
* global enable/disable resizable, draggable and scalable
* interactive connectors - enable/disable, connected/disconnected, drag to create edge
* select and drag multiple nodes
* interactive edge - hover, active, select - only when geometry

## Routes
* Currently derives from node - simplified version that doesn't require disabling node features to work
* 

## Arrows
* better support
