// Import dependencies
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set up the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up the Express app
const app = express();
app.use(express.urlencoded({ extended: true }));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define the route for the home page
app.get("/", (req, res) => {
    res.render("index", { books: [], userInput: "" });
  });

// Route for handling the form submission
app.post('/search', async (req, res) => {
  try {
    const userInput = req.body.prompt; // use the user's text input, for example 'mystery novels'
    //console.log("user request: " + userInput);
    const responseFormat = `Return response in the following parsable JSON format:
      {
        "N": "Book Name",
        "A": "Author"
      }`;

    const prompt = `Generate book recommendations based on the following input: ${userInput}. ${responseFormat}`;
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 256,
        temperature: 0.5,
      });
    const parsableJSONresponse = completion.data.choices[0].text;
    const jsonArrayString = `[${parsableJSONresponse}]`;
    console.log(jsonArrayString);
    
    let jsonArray;
    try {
      jsonArray = JSON.parse(jsonArrayString);
      res.render('index', { books: jsonArray, userInput: userInput });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    
  } catch (error) {
    if (error.response) {
        console.error("OpenAI API error:", error.response.status, error.response.data);
      } else {
        console.error("Unexpected error:", error.message);
      }
    res.status(500).send('Something went wrong');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port http://localhost:${port}`));

