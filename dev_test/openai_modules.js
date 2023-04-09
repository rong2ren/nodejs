const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config(); // access the .env file using dotenv module
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const runPrompt = async() => {
    const response = await openai.listModels();
    console.log(response.data);
    
    //const module_details = await openai.retrieveModel("text-davinci-003");
};

runPrompt();

