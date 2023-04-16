/*
The new GPT-3.5-Turbo model can now accept a series of messages as input, 
unlike the previous version that only allowed a single text prompt. 
This capability unlocks some interesting features, 
such as the ability to store prior responses or query with a predefined set of instructions with context. 
*/
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
    console.error(`Failed to fetch books from Open Library API: ${openLibraryResponse.status} ${openLibraryResponse.data}`);
    return null;
  }
  const openLibraryData = await openLibraryResponse.json();
  
  if(openLibraryData.numFound == 0 || openLibraryData.docs.length == 0) {
    console.error("cannot find book " + bookName + " on OpenLibary");
    return null;
  } 
  
  for(var i = 0; i < openLibraryData.docs.length; i++){
    if(openLibraryData.docs[i].cover_i) {
      return openLibraryData.docs[i].cover_i;
    }
  }
  return null;

  //return openLibraryData.docs[0].cover_i || null;
  //const olid = book.key.replace('/works/', '');
}

// Function to search for books
async function searchBook(userInput) {
  
    const responseRequirement = `First search if there is any book whose title contains the user input. If yes, find ALL books in the same series, along with a description for each book (Please return complete list of books in the same series in the order they were published).
If no, provide relevant book recommendations base on user input with a reason why each book is recommended.
If the user input contain a typo, please do your best to guess the correct search term. For example, if the user input is 'wimpy kids', consider 'Diary of a Wimpy Kid' as a possible search term and find all books in the 'Diary of a Wimpy Kid' series. Another example is if the user input is 'harry porter', consider 'Harry Potter' as a possible search term and find all books in the 'Harry Potter' series.
Return the results in the following format: Each book is on one line, and each line has the 3 fields: book name, book author, and a reason why each book is recommended or book description. Each field is separated by '$', like this: Book name $ Book author $ A reason why each book is recommended or book description.`;
    
    //const prompt = `You are an expert in books. Generate books recommendations based on the user's input: "${userInput}". ${responseRequirement}`;
    
    const responseFormat = `Please provide the recommendations in the following format: Each book should be on one line, and each line should only include three fields separated by '$': the book name, the book author, and a reason why each book is recommended, like this: Book name $ Book author $ A reason why this book is recommended. Please make sure not to include a number bullet in front of the book name.`;
    
    const GPT35TurboMessage = [
      { 
        role: "user", 
        content: `You are an expert in books. Generate book recommendations based on user input. ${responseFormat}`,
      },
      { 
        role: "user", 
        content: `Generate books recommendations based on the user input: "${userInput}". ${responseFormat}`, 
      },
    ];
    
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: GPT35TurboMessage,
        max_tokens: 3796, //300 token in the prompt, maximum is 8192 for this model
        temperature: 0.4,
      });
    const responseString = completion.data.choices[0].message.content.trim();
    // Split the response by line breaks
    //const responseLines = responseString.split('\n');
    const responseLines = responseString.split(/\r?\n/).filter(line => line.trim() !== '');//remove empty lines
    //console.log(responseLines);
    // Process each line to extract book names and authors
    console.log(`book recommendation base on: ${userInput}`);
    const bookPromises = responseLines.map(async (line) => {
      try {
        // Split the line by the delimiter to extract book name and author
        const book = line.split('$');
        // Ensure that the line has the expected number of parts (i.e., book name and author)
        if (book.length >= 3) {
          const name = book[0].trim();
          const author = book[1].trim();
          const coverID = await openlibary_search(name, author); 
          //`https://covers.openlibrary.org/b/id/${coverID}-M.jpg`
          const description = book[2].trim();
          
          console.log(`Name: ${name}, Author: ${author}, ID: ${coverID}`);
          return {name: name, author: author, coverUrl: `https://covers.openlibrary.org/b/id/${coverID}-M.jpg`, description: description};
        } else {
          // incomplete or malformed line
          //console.error('Incomplete or malformed line from OpenAI API:', book.length);
          //return null;
        }
      } catch (error) {
        console.error('Failed to process in searchBook module:', error);
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