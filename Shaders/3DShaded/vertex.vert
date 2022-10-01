#version 300 es
layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec3 aNormal;

out vec3 FragPos;
out vec3 Normal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uCameraMatrix;

void main()
{

    mat4 mvp = uProjectionMatrix  *  uCameraMatrix ;

    FragPos = vec3(uModelViewMatrix * vec4(aVertexPosition, 1.0));
    Normal = mat3(transpose(inverse(uModelViewMatrix))) * aNormal;  
    
    gl_Position =  mvp * uModelViewMatrix * vec4(FragPos,1.0f);

    // gl_Position = uModelViewMatrix * uProjectionMatrix * vec4(aVertexPosition, 1.0);
}