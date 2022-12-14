#version 300 es
precision highp float;

struct Material
{
    vec3 ambient;
    vec3 diffuse;
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
in vec3 FragPos;  
uniform vec3 uCameraPosition;

uniform Material material;
uniform Light light;

void main()
{
    // ambient
    vec3 ambient = material.ambient * light.ambient;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = (diff * material.diffuse) * light.diffuse;
    
    // specular
    vec3 viewDir = normalize(uCameraPosition - FragPos);
    vec3 reflectDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(norm, reflectDir), 0.0), material.shiny) * max(dot(viewDir, norm), 0.0);
    vec3 specular = (material.specular * spec) * light.specular; 
     

    vec3 result = (ambient + diffuse + specular);
    FragColor = vec4(result, 1.0);
} 