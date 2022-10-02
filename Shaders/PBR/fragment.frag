#version 300 es
precision highp float;

struct Material
{
    sampler2D diffuse;
    vec3 specular;
    float shiny;
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
in vec3     FragPos;  
in vec2 TexCoords;

uniform vec3 uCameraPosition;
uniform Material material;
uniform Light light;

void main()
{
    vec3 textureColour = texture(material.diffuse, TexCoords).rgb;
    // ambient
    vec3 ambient = textureColour * light.ambient;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = (diff * textureColour) * light.diffuse;
    
    // specular
    vec3 viewDir = normalize(uCameraPosition - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shiny);
    vec3 specular = material.specular * spec * light.specular; 
     

    vec3 result = (ambient + diffuse + specular);
    FragColor = vec4(specular, 1.0);
} 