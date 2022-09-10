#version 300 es
precision highp float;

in highp vec2 vTextureCoord;

uniform sampler2D uSampler;
out vec4 col;

void main(void) {
    col = texture(uSampler, vTextureCoord);
}