      var clientId = '464627085914-lfj4ile380lp6nd6ikttbsgtrclq3m56.apps.googleusercontent.com';
      var apiKey = 'AIzaSyBnTLTORenEukV07j7vOzen3YqQUcP3ZuU';
      var scopes = 'https://www.googleapis.com/auth/drive.file';

      function handleClientLoad() {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth, 1);
      }
      
      function checkAuth() {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
      }
      
      function handleAuthResult(authResult) {
        var authorizeButton = document.getElementById('authorize-button');
        if (authResult) {
          authorizeButton.style.visibility = 'hidden';
          makeApiCall(authResult);
        } else {
          authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
        }
      }

      function handleAuthClick(event) {
        // TODO: find out why this window doesn't close after the OAuth flow is complete
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
      }

      function processResponse(data) {
        var success = document.getElementById("success");
        var url  = document.getElementById("url");
        success.style.display = "block";
      }
      
      function makeApiCall(authResult) {
        gapi.client.load('drive', 'v1', function() {
          if(window.webkitIntent) {
            var data = window.webkitIntent.data;
            if(data.constructor.name == "Blob") {
              insertFileData(data, authResult, processResponse);
            }
            else if(typeof(data) == "string" ) {
              if(data.indexOf("http") == 0) {
                // Data is at a URL so fetch it.
                loadFile(data, function(fileData) {
                  insertFileData(fileData, authResult, processResponse);
                }, true);
              }
              else {
                var saveImg = document.getElementById("save-img");
                saveImg.src = window.webkitIntent.data;
                var meta = {
                  'title': "Test Image " + (new Date()).toJSON(),
                  'mimeType': window.webkitIntent.type
                };
              insertBase64Data(data.replace(/data:image\/([^;]*);base64,/,""), window.webkitIntent.type, meta, authResult, processResponse);
              }
            }
          }
        });
      }
  
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  function insertBase64Data(data, contentType, metadata, authRequest,  callback) {
    var multipartRequestBody =
         delimiter +
              'Content-Type: application/json\r\n\r\n' +
              JSON.stringify(metadata) +
              delimiter +
              'Content-Type: ' + contentType + '\r\n' +
              'Content-Transfer-Encoding: base64\r\n' +
              '\r\n' +
              data +
              close_delim;

          var request = gapi.client.request({
              'path': '/upload/drive/v1/files',
              'method': 'POST',
              'params': {'uploadType': 'multipart', "access_token": authRequest.access_token },
              'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
              },
              'body': multipartRequestBody});
       if (!callback) {
         callback = function(file) {
         console.log(file.id);
      };
    }
    request.execute(callback);
  }
      
      function insertFileData(fileData, authRequest, callback) {


        var reader = new FileReader();
        reader.readAsBinaryString(fileData);
        reader.onload = function(e) {
          // TODO: how to set the correct values to these fields?
          var contentType = fileData.type || 'application/octet-stream';
          var metadata = {
            'title': fileData.fileName || "Test Image " + (new Date()).toJSON(),
            'mimeType': contentType
          };
    
          var base64Data = btoa(reader.result);
          insertBase64Data(base64Data, contentType, metadata, authRequest, callback);
        }
      }

