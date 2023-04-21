const { openAICompletion, openAIChatCompletion } = require('./openai_client'); // Import the searchBook function from book_search.js


async function openlibary_search(bookName, author){
  // Fetch book information results from Open Library API
  const url = `https://openlibrary.org/search.json?author=${author}&q=${bookName}`;
  
  //console.log(url);
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
// step 1: ask ChatGPT give book recommendations base on userInput
// step 2: call openlibaray API to get book details (for example, cover image)
async function searchBook(userInput) {
  
    const responseRequirement = `First search if there is any book whose title contains the user input. If yes, find ALL books in the same series, along with a description for each book (Please return complete list of books in the same series in the order they were published).
If no, provide relevant book recommendations base on user input with a reason why each book is recommended.
If the user input contain a typo, please do your best to guess the correct search term. For example, if the user input is 'wimpy kids', consider 'Diary of a Wimpy Kid' as a possible search term and find all books in the 'Diary of a Wimpy Kid' series. Another example is if the user input is 'harry porter', consider 'Harry Potter' as a possible search term and find all books in the 'Harry Potter' series.
Return the results in the following format: Each book is on one line, and each line has the 3 fields: book name, book author, and a reason why each book is recommended or book description. Each field is separated by '$', like this: Book name $ Book author $ A reason why each book is recommended or book description.`;
    
    //const prompt = `You are an expert in books. Generate books recommendations based on the user's input: "${userInput}". ${responseRequirement}`;
    //const responseString = openAICompletion("text-davinci-003", prompt, 256, 0.5);

    const responseFormat = `Please provide the recommendations in the following format: Each book should be on one line, and each line should only include three fields separated by '$': the book name, the book author, and a reason why each book is recommended, like this: Book name $ Book author $ A reason why this book is recommended. Please make sure not to include a number bullet in front of the book name.`;
    
    const GPT35TurboMessage = [
      { 
        role: "user", 
        content: `You are an expert in books. You love to give book recommendations based on their needs. ${responseFormat}`,
      },
      { 
        role: "user", 
        content: `Generate books recommendations based on the user input: "${userInput}". ${responseFormat}`, 
      },
    ];
    const responseString = await openAIChatCompletion("gpt-3.5-turbo", GPT35TurboMessage, 3796, 0.4);
    // Split the response by line breaks
    const responseLines = responseString.split(/\r?\n/).filter(line => line.trim() !== '');//remove empty lines
    // Process each line to extract book names and authors
    console.log(`Start processing list of books return from ChatGPT...`);
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
          
          console.log(`Name: ${name}, Author: ${author}, ID: ${coverID}`);
          
          var coverUrl;
          if (coverID === null || coverID === undefined) {
            coverUrl = ''
          } else {
            coverUrl = `https://covers.openlibrary.org/b/id/${coverID}-M.jpg`;
          }
          return {name: name, author: author, coverUrl: coverUrl, description: description};
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