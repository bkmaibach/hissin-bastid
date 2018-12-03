$(document).ready(function() {
  // Place JavaScript code here...
  // bindAddAssignmentForm();
  console.log("Javascript ready");
});

// function bindAddAssignmentForm(): void {
//   if ($("#addAssignment")) {
//     $("#addAssignment").on("submit", (event) => {

//       // Stop it from submitting
//       event.preventDefault();


//       // Turn the inputs into a payload
//       const elements = this.elements;

//       const payload = {
//         course: $("input[name=course]").val(),
//         name: $("input[name=assignmentName]").val(),
//         dueDate: <string>$("input[name=dueDate]").val() + <string>$("input[name=dueTime]").val(),
//         url: $("input[name=url]").val(),
//         note: $("input[name=url]").val()

//       };

//       const path = "/api/assignments";
//       const method = "post";

//       // Call the API
//       // request(undefined, path, method, undefined, payload, (statusCode, responsePayload) => {
//       //   // Display an error on the form if needed
//       //   if (statusCode !== 200) {

//       //     // Try to get the error from the api, or set a default error message
//       //     const error = "An error has occurred, please try again";

//       //   } else {
//       //     // If successful, send to form response processor
//       //     // formResponseProcessor(formId,payload,responsePayload);
//       //   }

//       // });
//     });
//   }
// }

// // Interface for making API calls
// function request ( headers: string, path: string, method: string, queryStringObject: string, payload: any, callback: (statusCode: number, response: any) => void ) {

//   // // Set defaults
//   // headers = typeof(headers) == 'object' && headers !== null ? headers : {};
//   // path = typeof(path) == 'string' ? path : '/';
//   // method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
//   // queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
//   // payload = typeof(payload) == 'object' && payload !== null ? payload : {};
//   // callback = typeof(callback) == 'function' ? callback : false;

//   // // For each query string parameter sent, add it to the path
//   // var requestUrl = path+'?';
//   // var counter = 0;
//   // for(var queryKey in queryStringObject){
//   //    if(queryStringObject.hasOwnProperty(queryKey)){
//   //      counter++;
//   //      // If at least one query string parameter has already been added, preprend new ones with an ampersand
//   //      if(counter > 1){
//   //        requestUrl+='&';
//   //      }
//   //      // Add the key and value
//   //      requestUrl+=queryKey+'='+queryStringObject[queryKey];
//   //    }
//   // }

//   // // Form the http request as a JSON type
//   // var xhr = new XMLHttpRequest();
//   // xhr.open(method, requestUrl, true);
//   // xhr.setRequestHeader("Content-type", "application/json");

//   // // For each header sent, add it to the request
//   // for(var headerKey in headers){
//   //    if(headers.hasOwnProperty(headerKey)){
//   //      xhr.setRequestHeader(headerKey, headers[headerKey]);
//   //    }
//   // }

//   // // If there is a current session token set, add that as a header
//   // if(app.config.sessionToken){
//   //   xhr.setRequestHeader("token", app.config.sessionToken.id);
//   // }

//   // // When the request comes back, handle the response
//   // xhr.onreadystatechange = function() {
//   //     if(xhr.readyState == XMLHttpRequest.DONE) {
//   //       var statusCode = xhr.status;
//   //       var responseReturned = xhr.responseText;

//   //       // Callback if requested
//   //       if(callback){
//   //         try{
//   //           var parsedResponse = JSON.parse(responseReturned);
//   //           callback(statusCode,parsedResponse);
//   //         } catch(e){
//   //           callback(statusCode,false);
//   //         }

//   //       }
//   //     }
//   // }

//   // // Send the payload as JSON
//   // var payloadString = JSON.stringify(payload);
//   // xhr.send(payloadString);

// }