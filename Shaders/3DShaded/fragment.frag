#version 300 es
precision highp float;

struct Material
{
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shiny;
};

out vec4 FragColor;

in vec3 Normal;  
in vec3 FragPos;  
  
uniform vec3 uLightPos; 
uniform vec3 uLight;
uniform vec3 uCameraPosition;
uniform Material material;

void main()
{
    // ambient
    vec3 ambient = material.ambient * uLight;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(uLightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = (diff * material.diffuse) * uLight;
    
    // specular
    vec3 viewDir = normalize(uCameraPosition - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shiny) * max(dot(viewDir, norm), 0.0);
    vec3 specular = (material.specular * spec) * uLight; 
     

    vec3 result = (ambient + diffuse + specular);
    FragColor = vec4(result, 1.0);
} 