
async function openlibaray_search(query){
    const url = `https://openlibrary.org/search.json?q=${query}`;
    
    // Fetch book information results from Open Library API
    // Make a GET request to the Open Library API
    fetch(url)
      .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
      .then(data => {
        console.log(data); // Data returned from the API
        return data;
    })
        .catch(error => {
        console.error(error); // Handle any errors that occurred during the API request
    });
  
  }
  
  async function getBookDetailFromISBN(isbn){
    // Fetch book information results from Open Library API
    const openLibraryResponse = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!openLibraryResponse.ok) {
      console.error('Failed to fetch books from Open Library API for isbn: ' + isbn);
    }
    const openLibraryData = await openLibraryResponse.json();
    const coverID = openLibraryData.covers[0] || null;
    console.log("coverID:" + coverID);
    return coverID;
  }
