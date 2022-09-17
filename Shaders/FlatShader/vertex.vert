#version 300 es
precision highp float;

in vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

void main() {
    mat4 mvp = uProjectionMatrix * uModelViewMatrix * uViewMatrix;
    gl_Position =  mvp * aVertexPosition;
}