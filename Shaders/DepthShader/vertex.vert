#version 300 es
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec3 aTextureCoordinate;

uniform mat4 lightSpaceMatrix;
uniform mat4 uModelViewMatrix;

void main()
{
    gl_Position = lightSpaceMatrix * uModelViewMatrix * vec4(aPos, 1.0);
}