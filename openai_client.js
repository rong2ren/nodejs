/*
The new GPT-3.5-Turbo model can now accept a series of messages as input, 
unlike the previous version that only allowed a single text prompt. 
This capability unlocks some interesting features, 
such as the ability to store prior responses or query with a predefined set of instructions with context. 
*/
// Import dependencies
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set up the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function openAICompletion(model, prompt, max_token, temperature){
    console.log(`Send request to ChatGPT Compleition API: ` + model);
    const completion = await openai.createCompletion({
      model: model,//"text-davinci-003"
      prompt: prompt,
      max_tokens: max_token,
      temperature: temperature,
    });
    console.log(`ChatGPT Chat Compleition API replied!`);
    return completion.data.choices[0].text.trim();
}

async function openAIChatCompletion(model, messages, max_token, temperature){
    console.log(`Send request to ChatGPT Chat Compleition API: ` + model);
    const completion = await openai.createChatCompletion({
        model: model,//"gpt-3.5-turbo"
        messages: messages,
        max_tokens: max_token, //300 token in the prompt, maximum is 8192 for this model
        temperature: temperature,
      });
    console.log(`ChatGPT Chat Compleition API replied!`);
    //console.log(completion.data);
    return completion.data.choices[0].message.content.trim();
}

module.exports = {
    openAICompletion, openAIChatCompletion
  };