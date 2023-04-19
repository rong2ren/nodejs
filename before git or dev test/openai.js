//const: creates a read-only reference to a value
/*
what is Module in Node JS: 
consider modules to be the same as JavaScript libraries. 
To include a module, use the require() function.
dotenv: will allow us to load environment variables from a .env file when working locally
openai: Node.js library for the OpenAI API

axios and express: use axios to make API requests to the ChatGPT API from your server-side Node.js code, and use express to define routes and handle requests from your web application's front-end.
*/

/*
below code use the 'openai' package, which is a third-party library that provides a higher-level interface
to the OpenAI API and abstracts away some of the low-level details of making HTTP requests.
Playground: https://platform.openai.com/playground?lang=node.js
*/

// access the .env file using dotenv module
require('dotenv').config(); 

// Set up the OpenAI API client
const { Configuration, OpenAIApi } = require("openai");//import modules from OpenAI library
const configuration = new Configuration({
    apiKey : process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);//create an instance of the 'OpenAIApi' class, which provides methods for interacting with the API.

const userInput = "I enjoy reading mystery novels";
const responseFormat = `Return response in the following parsable JSON format:
{
  "N":"Book Name"
  "A":"Author"
}`;

// Generate book recommendations based on user input
async function generateBookRecommendations(userInput) {
  try {
    const prompt = `Generate book recommendations based on the following input: ${userInput}. ${responseFormat}`;
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 256,
      temperature: 0.5,
    });
    const parsableJSONresponse = completion.data.choices[0].text;
    const jsonArrayString = `[${parsableJSONresponse}]`;

    let jsonArray;
    try {
      jsonArray = JSON.parse(jsonArrayString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    jsonArray.forEach((book, index) => {
      console.log(`${index + 1}: ${book.N} by ${book.A}`);
    });

    /*
    for (let i = 0; i < jsonArray.length; i++) {
      console.log(`${i + 1}: ${jsonArray[i].N} by ${jsonArray[i].A}`);
    }
    */
    
  } catch (error) {
    if (error.response) {
      console.error("OpenAI API error:", error.response.status, error.response.data);
    } else {
      console.error("Unexpected error:", error.message);
    }
  }
}

// Call the function to generate book recommendations
generateBookRecommendations(userInput);