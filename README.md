# dronez
Dronez programming game.

This project was developed using vite, typescript and three.js


## How to run?

### Development
Creates a local host that runs the current code (use while in develop)

```
npm install
npm run dev
```

### Production
Create a ./dist folder with the minified code 
```
npm run build
```

# About the code
We create a scene using three.js and load some random building and a UAV (unmanned aerial vehicle) model into the game.

* `main.ts` - Here you got the `dronezGame` class that create the basic stuff three.js needs to render.
We also initalize the game Engine, load the game configuration and "play" the commands.
* `world.ts` - Another class that manages the "world" - ground. building, uavs, game engine and everything else
* `uav.ts` - class to manage each UAV movement
* `resources.ts` - helpers to load different models and textures


## Game configuration
* GameConfig - here you pass the canvas element you want to draw on (notice that `index.html`) has a canvas element in it. In this config object we also describe the size of the map (how big is the grid) and how big is each tile on the grid.
* Commands - list of commands intended to each UAV (has to have the UAVId)

# What's missing
[] HTTP Requests
[] Commands need more work
[]
