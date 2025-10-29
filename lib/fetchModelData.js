var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/

// No external dependencies needed for this file. No longer needed.

function fetchModel(url) {
  // Return a new promise.
  return new Promise(function (resolve, reject) {
    console.log(url);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    // Setup our listener to process completed requests.
    xhr.onload = function () {
      // Process the response.
      if (xhr.status >= 200 && xhr.status < 300) {
        // Parse the JSON response.
        try {
          const getResponseObject = JSON.parse(xhr.responseText);
          // On Success return:
          resolve({ data: getResponseObject });
        // If JSON.parse fails, it will throw an exception.  
        } catch (e) {
          reject({ status: xhr.status, statusText: "Invalid JSON: " + e.message });
        }
      // This is called even on 404 etc
      // so check the status.
      } else {
        reject({ status: xhr.status, statusText: xhr.statusText });
      }
    };

    // Setup our listener to process errors.
    xhr.onerror = function () {
      reject({ status: xhr.status || 0, statusText: "Network Error" });
    };

    // Send the request.
    xhr.send();
  });
}

// Allow this function to be imported by other files.
export default fetchModel;
