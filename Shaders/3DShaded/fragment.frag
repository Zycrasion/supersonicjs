#version 300 es
precision highp float;
out vec4 FragColor;

in vec3 Normal;  
in vec3 FragPos;  
  
uniform vec3 uLightPos; 
uniform vec3 uColour;
uniform vec3 uLight;
uniform vec3 uCameraPosition;

void main()
{
    // ambient
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * uLight;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(uLightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * uLight;
    
    // specular
    float specularStrength = 1.f;
    vec3 viewDir = normalize(uCameraPosition - FragPos);
    vec3 reflectDir = reflect(-uLightPos, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
    vec3 specular = specularStrength * spec * uLight; 
     

    vec3 result = (ambient + diffuse + specular) * uColour;
    FragColor = vec4(result, 1.0);
} 