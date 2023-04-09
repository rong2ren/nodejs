// Import dependencies
const express = require('express');
const { searchBook } = require('./book_search'); // Import the searchBook function from book_search.js


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
    const userInput = req.body.prompt.trim(); // use the user's text input, for example 'mystery novels'
    if (!userInput) {
        return res.status(400).json({ error: 'userInput is required.' });
      }
    const books = await searchBook(userInput); // Call the searchBook function from book_search.js
    // Render the index.ejs template with the books array
    res.render('index', { books: books, userInput: userInput });
    
  } catch (error) {
    if (error.response) {
        console.error("OpenAI API error:", error.response.status, error.response.data);
      } else {
        console.error("Unexpected error:", error.message);
      }
    //res.status(500).send('Opps!Something went wrong..');
    return res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port http://localhost:${port}`));

