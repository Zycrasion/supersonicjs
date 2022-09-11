#version 300 es
precision highp float;

layout (location = 0) in vec4 aVertexPosition;
layout (location = 1) in vec4 aNormal;


uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 CameraMatrix;

void main() {
    mat4 mvp = uProjectionMatrix  *  CameraMatrix ;

    gl_Position =  mvp *  uModelViewMatrix * aVertexPosition;
}