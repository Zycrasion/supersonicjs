# SupersonicJS
Status: Beta v0.1.0

This is going to be a Javascript Game Engine.

## Version 0.1.0
TODO: (DONE)
- [x] Basic Keyboard Support
- [x] Geometry Rendering With Position/Rotation/Scale
- [x] Textures
- [x] Colour for polygons and geometry

## Changelog (VERSION 0.1.0)
- Added FlatShader Usage `new FlatShader(gl, red, green, blue, alpha)` then use like any other shader, rgb values are able to be changed on demand
- Added ImageShader, Usage `new ImageShader(gl, imagePath, uvCoordinates?, filtering?)` use like any other shader
- Added Scale Paremeter to `ProjectionMatrix.orthographic(gl, scale)`
- Added InputAxis for making easy vector addition for movement
- Added InputManager for using Input
- FIXED Images repeating when they aren't supposed to