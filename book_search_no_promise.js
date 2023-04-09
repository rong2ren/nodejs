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
    //console.log(prompt);
    //console.log(responseString);

    // Split the response by line breaks
    const responseLines = responseString.split('\n');
    // Process each line to extract book names and authors
    const books = [];
    for (const line of responseLines) {
        // Split the line by the delimiter to extract book name and author
        const book = line.split('$');
        // Ensure that the line has the expected number of parts (i.e., book name and author)
        if (book.length === 2) {
            const name = book[0].trim();
            const author = book[1].trim();
            const coverID = await getBookDetailFromOL(name);
            console.log("name:" + name, " author:" + author + " id:" + coverID);
            books.push({ name: name, author: author, coverUrl: `https://covers.openlibrary.org/b/id/${coverID}-M.jpg` });
        } else {
            // incomplete or malformed line
            console.error('Incomplete or malformed line:', line);
        }
    }
    return books;
  }