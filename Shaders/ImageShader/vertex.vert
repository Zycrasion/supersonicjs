#version 300 es
precision highp float;

in vec4 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out highp vec2 vTextureCoord;

void main(void) {
    mat4 mvp = uProjectionMatrix * uModelViewMatrix * uViewMatrix;
    gl_Position =  mvp * aVertexPosition;
    vTextureCoord = aTextureCoord;
}