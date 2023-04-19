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
  /*
    //1. below code shows the way to handle request with index.ejs and search.ejs(these 2 ejs are same as index.html and search.html, it didnt use dynamic ejs)
    //not used anymore since sendFile will be faster for static html
    res.render("index");
  */
    
    //2. below code shows the way to handle request with index.html and search.html
    //res.sendFile('index.html', { root: __dirname + '/public' });

    //3. below code shows the way to handle request with main.ejs (use dynamic ejs to render different html base on the display)
    res.render('main', { display: "big" });
  });

app.get('/recommend', (req, res) => {
    /*
    //below code shows the way to handle request with index.ejs and search.ejs(these 2 ejs are same as index.html and search.html, it didnt use dynamic ejs)
    //not used anymore since sendFile will be faster for static html
    if (req.query.hasOwnProperty('prompt')){
      const userInput = req.query.prompt.trim(); // use the user's text input, for example 'mystery novels'
      res.render('search', { prompt: userInput });
    } else {
      res.render('search');
    }
    */

    //2. below code shows the way to handle request with index.html and search.html
    //res.sendFile('search.html', { root: __dirname + '/public' });

    //3. below code shows the way to handle request with main.ejs (use dynamic ejs to render different html base on the display)
    res.render('main', { display: "small" });
  });

// Route for handling search - form submission
app.post('/search', async (req, res) => {
  try {
    const userInput = req.body.prompt.trim(); // use the user's text input, for example 'mystery novels'
    if (!userInput) {
        return res.status(400).json({ error: 'userInput is required.' });
    }
    console.log("got AJAX /search POST request: " + userInput);
    const books = await searchBook(userInput); // Call the searchBook function from book_search.js
    // Render the index.ejs template with the books array -> I am no longer render the whole page since i changed it to AJAX
    //res.render('index', { books: books, userInput: userInput });
    res.json([{
        books: books,
        userInput: userInput
     }])
    
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

