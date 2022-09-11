#version 300 es
precision highp float;
out vec4 FragColor;

in vec3 Normal;  
in vec3 FragPos;  
  
uniform vec3 uLightPos; 
uniform vec3 uColour;
uniform vec3 uLight;

void main()
{
    // ambient
    float ambientStrength = 0.2;
    vec3 ambient = ambientStrength * uLight;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(uLightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * uLight;
            
    vec3 result = (ambient + diffuse) * uColour;
    FragColor = vec4(result, 1.0);
} 