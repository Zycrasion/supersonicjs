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

float LinearizeDepth(float depth, float near_plane, float far_plane)
{
    float z = depth * 2.0 - 1.0; // Back to NDC 
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));	
}

void main()
{
    vec3 textureColour = texture(material.diffuse, TexCoords).rgb;
    if (texture(material.diffuse, TexCoords).a == 0.0)
    {
        discard;    
    }

    vec3 specularColour = texture(material.specular, TexCoords).rgb;
    // ambient
    vec3 ambient = textureColour * light.ambient;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = (diff * textureColour) * light.diffuse;
    
    // specular
    vec3 viewDir = normalize(uCameraPosition -  FragPos);
    vec3 reflectDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(norm, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * specularColour;  
    

    vec3 result = (ambient + diffuse + specular);   
    FragColor = vec4(result, 1.0);
} 