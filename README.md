# SupersonicJS
Status: Beta v0.3.0

For the forseeable future i will probably get to Version 0.2.0 then take a break making some games and come back and have a heap of features to implement.

## Getting Started (NOTE: You should have an understanding of javascript/typescript before trying the engine. its currently more like an abstraction layer on top of WebGL.)
clone the repo 
`git clone https://github.com/Zycrasion/supersonicjs.git`
`cd supersonicjs`
now do
`npm run build`
in tsBuild/ there is the source for the engine and the test
engine source is under src/
you can copy that into your project and import from that
but currently its not on npm

The code:
in an html file somewhere have a canvas with any id like:
`<canvas id="glCanvas" width="720" height="480"></canvas>`
in a javascript file (note: i will not be going through how to browserify this)
```js
import {SupersonicJS} from "path/to/supersonic.js"

let gl, square, shader;

function main()
{
    gl = SupersonicJS.init("glCanvas", new Vector4(0,0,0,1));
    shader = new SupersonicJS.Shaders.FlatShader(gl, 1,1,1,1);
    square = new SupersonicJS.GeometryRenderable2D(gl, [
        1,1,
        -1,1,
        1,-1,
        -1,-1
    ],shader);
    draw();
}

function draw()
{
    SupersonicJS.clear(gl);
    square.draw(gl);
    requestAnimationFrame(draw)
}

main();
```

## Version 0.2.0 Roadmap
TODO: 
- [x] loading GLSL from files
- [x] parenting
- [x] Scenes

## Version 0.1.0
TODO: (DONE)
- [x] Basic Keyboard Support
- [x] Geometry Rendering With Position/Rotation/Scale
- [x] Textures
- [x] Colour for polygons and geometry


## Changelog
- ADDED Scenes
- ADDED Parenting
- ADDED Enities
- ADDED Components
- ADDED Vector.add
- ADDED Vector.sub
- ADDED Vector.mult
- ADDED ToFloatArray
- ADDED ToFloat64Array
- CHANGED WebGL Version to WebGL2
- CHANGED Shaders
- CHANGED File locations
- ADDED SquareMesh preset
- FIXED README.md typo 'VERSOIN' to 'VERSION' 
- REMOVED ROADMAPS

## Changelog (VERSION 0.1.*)
- FIXED Warnings coming from WEBGL by only drawing if shader has loaded
- ADDED Loading GLSL from files
- FIXED Filtering not working
- FIXED Images sometimes will not load because of isPowerOf2
- Added SupersonicJS main file
- Added `SupersonicJS.init()` and `.clear()`

## Changelog (VERSION 0.1.0)
- Added FlatShader Usage `new FlatShader(gl, red, green, blue, alpha)` then use like any other shader, rgb values are able to be changed on demand
- Added ImageShader, Usage `new ImageShader(gl, imagePath, uvCoordinates?, filtering?)` use like any other shader
- Added Scale Paremeter to `ProjectionMatrix.orthographic(gl, scale)`
- Added InputAxis for making easy vector addition for movement
- Added InputManager for using Input
- FIXED Images repeating when they aren't supposed to