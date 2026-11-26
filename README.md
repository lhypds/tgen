
tgen
====


`tgen` provides basic string generation functions.  
User also can create fucntions base on it.  

Example:  
<img width="600" alt="image" src="https://github.com/user-attachments/assets/e665c826-925e-46eb-abff-0e20e7b55b48" />


Functions
---------

function1: Replacer  
Provide a string template with {{key}} placeholders.  
Generate a string by replacing each {{key}} with the corresponding values from the parameters.  

Example:  
`template`: "Today's weather is {{weather}}."  
input (json):  
{
    "weather": "sunny"
}
result: "Today's weather is sunny."  

function2: Extractor & Replacer  
Provide a string 1, and template 1, and template 2.  
Read parameters from template 1, and generate a string based on template 2.  

Example:  
`template1`: "{{capital}} is {{country}}'s capital."  
`template2`: "The capital of {{country}} is {{capital}}."  
input: "Paris is France's capital."  
result: "The capital of France is Paris."  


Placeholders & Escape Characters
--------------------------------

Placeholders use double curly braces: `{{key}}` (spaces are allowed: `{{ key }}`).  
Keys may contain letters, digits, `_` and `$`, and must not start with a digit.  
Single braces are plain text, so JSON can be used in templates directly.  

Example:  
template: `{"user": {"name": "{{name}}"}}`  
input: `{"name": "Bob"}`  
result: `{"user": {"name": "Bob"}}`  

To output a literal `{{`, write `\{{` in the template.  


Useful Features
---------------

Sharing functions with user pre-filled parameters.  
Use a share button to generate a URL that encodes the function and its parameters.  

AI placeholders (brain button): paste plain text into the Replacer's template and press the brain button.  
AI (OpenAI) finds the parts that vary (names, dates, IDs...) and rewrites them as `{{key}}` placeholders, filling the input with the original values.  
Needs `OPENAI_API_KEY` in `.env` (`OPENAI_MODEL` optional, default `gpt-4o-mini`) (see `.env.example`). The `/api/brain` endpoint is served by `npm run dev` and `npm run preview` (a static `dist/` alone has no brain).


Running with pm2
----------------

`./setup.sh`: pull, create `.env` (asks for `HOST` and `OPENAI_API_KEY`), install and build.  
`./start.sh`: start (or reload) under pm2. It runs `vite preview` on `PORT`, named `PM2_NAME`.  
`./stop.sh`: stop it.  
`./restart.sh`: pull, install, build and restart (for redeploys).  

Behind a reverse proxy, put the public hostname in `HOST` (comma-separate several), or Vite will refuse the requests.  
