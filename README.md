
tgen
====


`tgen` provides basic string generation functions.  
User also can create fucntions base on it.  

Example:  
<img width="600" alt="image" src="https://github.com/user-attachments/assets/e665c826-925e-46eb-abff-0e20e7b55b48" />


Functions
---------

function1: Replacer  
Provide a string template with {} and text.  
Generate a string by replacing the {} with the corresponding values from the parameters.  

Example:  
`template`: "Today's weather is {weather}."  
input (json):  
{
    "weather": "sunny"
}
result: "Today's weather is sunny."  

function2: Extractor & Replacer  
Provide a string 1, and template 1, and template 2.  
Read parameters from template 1, and generate a string based on template 2.  

Example:  
`template1`: "{capital} is {country}'s capital."  
`template2`: "The capital of {country} is {capital}."  
input: "Paris is France's capital."  
result: "The capital of France is Paris."  


Escape Characters
-----------------

To include literal curly braces in the output, use double curly braces in the template.  

Example:  
template: "The set is represented as {{a, b, c}}."  
result: "The set is represented as {a, b, c}."  


Useful Features
---------------

Sharing functions with user pre-filled parameters.  
Use a share button to generate a URL that encodes the function and its parameters.  
