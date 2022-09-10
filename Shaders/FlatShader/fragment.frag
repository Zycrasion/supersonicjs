#version 300 es
precision highp float;

uniform vec4 uColour;
out vec4 col;
void main() {
    col = uColour;
}