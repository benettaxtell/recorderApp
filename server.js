const express = require('express')
const fileupload = require('express-fileupload')
const path = require('path');
const fs = require('fs');

const app = express();
var server = require('http').createServer(app);

const port = 8000

const requestHandler = (request, response) => {
  console.log(request.url)
  response.end('Hello Node.js Server!')
}
app.use(express.static(__dirname));
app.use(fileupload());

app.get('/', (request, response) => {
  response.sendFile(__dirname+'/index.html')
})
let count = 0
app.post('/send_audio', async (request, response) => {
  try {
	if (!request.files) {
      response.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      // to retrieve the uploaded file
      let audio = request.files.audio

      // use the mv() method to place the file in
      // upload directory (i.e. "uploads")
	  
	  //TODO: add time diff to name
	  count += 5
      audio.mv('./backup_' + count + 'min.wav' )//request.files.bkp_count + 

      //send response
      response.send({
        status: true,
        message: 'File is uploaded'
      })
    }
  } catch (err) {
    response.status(500).send(err)
  }
})

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
