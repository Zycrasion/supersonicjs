#version 300 es
precision highp float;

struct Material
{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};

struct Light
{
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

out vec4 FragColor;

in vec3 Normal;  
in vec3 FragPos;  
in vec2 TexCoords;
uniform vec3 uCameraPosition;

uniform Material material;
uniform Light light;

void main()
{
    float result = texture(material.diffuse, TexCoords).r;
    FragColor = vec4(vec3(result) , 1.0);
} 