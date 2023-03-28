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
app.use(express.static(__dirname+'/public_html'));
app.use(fileupload());

app.get('/', (request, response) => {
  response.sendFile(__dirname+'/public_html/testrec210323.html')
})
let count = 0
let prefix = 1
app.post('/send_audio', async (request, response) => {
  try {
	if (!request.files) {
      response.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      moveAudio(request.files.audio)
	  
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

app.post('/send_last_audio', async (request, response) => {
  try {
	if (!request.files) {
      response.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      moveAudio(request.files.audio) 

      //reset for next recording
	  count = 0
	  prefix += 1
      console.log('counters reset for next recording')
   
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

function moveAudio(audio) {
  count += 5
  //console.log(count)
  audio.mv('./'+prefix + '_backup_' + count + 'min.wav' )
}