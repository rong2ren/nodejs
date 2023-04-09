// Import dependencies
//const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set up the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getBookDetailFromOL(bookName){
  // Fetch book information results from Open Library API
  console.log(`https://openlibrary.org/search.json?title=${bookName}`);
  const openLibraryResponse = await fetch(`https://openlibrary.org/search.json?title=${bookName}`);
  if (!openLibraryResponse.ok) {
    throw new Error('Failed to fetch books from Open Library API for book: ' + bookName);
  }
  const openLibraryData = await openLibraryResponse.json();
  const coverID = openLibraryData.docs[0]?.cover_i || null;
  //const olid = book.key.replace('/works/', '');
  return coverID;
}

// Function to search for books
async function searchBook(userInput) {
    //console.log("ask open ai to search for book recommendations by user request: " + userInput);
    const responseFormat = `
    Return result in this format:
    book name 1 $ book author 1
    book name 2 $ book author 2
    ...
    `;
    const prompt = `Generate book recommendations based on the following input: ${userInput}. ${responseFormat}`;
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 256,
        temperature: 0.5,
      });
    const responseString = completion.data.choices[0].text.trim();

    // Split the response by line breaks
    const responseLines = responseString.split('\n');
    // Process each line to extract book names and authors
    const bookPromises = responseLines.map(async (line) => {
      try {
        // Split the line by the delimiter to extract book name and author
        const book = line.split('$');
        // Ensure that the line has the expected number of parts (i.e., book name and author)
        if (book.length === 2) {
          const name = book[0].trim();
          const author = book[1].trim();
          const coverID = await getBookDetailFromOL(name); // Fetch coverID concurrently
          console.log(`Name: ${name}, Author: ${author}, ID: ${coverID}`);
          return { name: name, author: author, coverUrl: `https://covers.openlibrary.org/b/id/${coverID}-M.jpg` };
        } else {
          // incomplete or malformed line
          console.error('Incomplete or malformed line from OpenAI API:', line);
          return null;
        }
      } catch (error) {
        console.error('Failed to process book:', error);
        return null;
      }
    });
  
    // Wait for all bookPromises to resolve and return the results
    const books = await Promise.all(bookPromises);
    return books.filter(book => book !== null); // Filter out null results
  }


  module.exports = {
    searchBook
  };