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


async function openlibary_search(bookName, author){
  // Fetch book information results from Open Library API
  const url = `https://openlibrary.org/search.json?author=${author}&q=${bookName}`;
  
  console.log(url);
  const openLibraryResponse = await fetch(url);
  if (!openLibraryResponse.ok) {
    throw new Error(`Failed to fetch books from Open Library API: ${openLibraryResponse.status} ${openLibraryResponse.data}`);
    return null;
  }
  const openLibraryData = await openLibraryResponse.json();
  if(openLibraryData.numFound = 0) {
    console.error("cannot find book " + bookName + " on OpenLibary");
    return null;
  }
  return openLibraryData.docs[0].cover_i || null;
  //const olid = book.key.replace('/works/', '');
}

// Function to search for books
async function searchBook(userInput) {
    const responseFormat = `First search if there is any book whose title contains the user input. If yes, find ALL books in the same series, along with a description for each book (Please return complete list of books in the same series in the order they were published).
If no, provide relevant book recommendations base on user input with a reason why each book is recommended.
If the user input contain a typo, please do your best to guess the correct search term. For example, if the user input is 'wimpy kids', consider 'Diary of a Wimpy Kid' as a possible search term and find all books in the 'Diary of a Wimpy Kid' series. Another example is if the user input is 'harry porter', consider 'Harry Potter' as a possible search term and find all books in the 'Harry Potter' series.
Return the results in the following format: Each book is on one line, and each line has the 3 fields: book name, book author, and a reason why each book is recommended or book description. Each field is separated by '$', like this: Book name $ Book author $ A reason why each book is recommended or book description.`;
    const prompt = `You are an expert in books. Generate books recommendations based on the user's input: "${userInput}". ${responseFormat}`;
    
    const GPT35TurboMessage = [
      { 
        role: "system", 
        content: "You are an expert in books. Generate books recommendations based on the user's input. First search if there is any book whose title contains the user input. If yes, find ALL books in the same series, along with a description for each book (Please return complete list of books in the same series in the order they were published). If no, provide relevant book recommendations base on user input with a reason why each book is recommended. If the user input contain a typo, please do your best to guess the correct search term. For example, if the user input is 'wimpy kids', consider 'Diary of a Wimpy Kid' as a possible search term and find all books in the 'Diary of a Wimpy Kid' series. Another example is if the user input is 'harry porter', consider 'Harry Potter' as a possible search term and find all books in the 'Harry Potter' series. Return the results in the following format: Each book is on one line, and each line has the 3 fields: book name, book author, and a reason why each book is recommended or book description. Each field is separated by '$', like this: Book name $ Book author $ A reason why each book is recommended or book description.",
      },
      { 
        role: "user", 
        content: userInput, 
      },
    ];

    
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: GPT35TurboMessage,
        max_tokens: 3796, //300 token in the prompt, maximum is 8192 for this model
        temperature: 0.4,
      });
      console.log(completion.data.id);
    const responseString = completion.data.choices[0].message.content.trim();
    console.log(responseString);
    // Split the response by line breaks
    const responseLines = responseString.split('\n');
    // Process each line to extract book names and authors
    const bookPromises = responseLines.map(async (line) => {
      try {
        // Split the line by the delimiter to extract book name and author
        const book = line.split('$');
        // Ensure that the line has the expected number of parts (i.e., book name and author)
        if (book.length >= 3) {
          const name = book[0].trim();
          const author = book[1].trim();
          const coverID = await openlibary_search(name, author); 
          const description = book[2].trim();
          //console.log(`Name: ${name}, Author: ${author}, ID: ${coverID}`);
          return {name: name, author: author, coverUrl: `https://covers.openlibrary.org/b/id/${coverID}-M.jpg`, description: description};
        } else {
          // incomplete or malformed line
          console.error('Incomplete or malformed line from OpenAI API:', book.length);
          return null;
        }
      } catch (error) {
        console.error('Failed to process:', error);
        return null;
      }
    });
  
    // Wait for all bookPromises to resolve and return the results
    const books = await Promise.all(bookPromises);// Fetch coverID concurrently
    return books.filter(book => book !== null); // Filter out null results
  }


  module.exports = {
    searchBook
  };