const express = require('express')
const fileupload = require('express-fileupload')
const path = require('path');
const fs = require('fs');

const app = express();
var server = require('http').createServer(app, function (req, res) {
  //res.writeHead(200, {'Content-Type': 'text/plain'});
  //res.write('Hello World!');
  //res.end(););
  console.log(req.get('host'))
  console.log(req.originalUrl)
})
const port = 80

const requestHandler = (request, response) => {
  console.log(request.url)
  response.end('Hello Node.js Server!')
}
app.use(express.static(__dirname));
//console.log(__dirname)
//console.log(__dirname+'/../languagehead.com/RBrecorder')
app.use(express.static(__dirname+'/../public/RBrecorder'));
app.use(fileupload());

app.get('/test', (request, response) => {
  response.sendFile('testrec210323.html', {'root': __dirname + '/../public/RBrecorder/'})
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
      moveAudio(request.files.audio, request.body.token)
	  
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
      moveAudio(request.files.audio, request.body.token)
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
var listener = server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
  console.log(listener.address().port)
  console.log(listener.address())
})

function moveAudio(audio, token) {
  count += 5
  //console.log(count)
  audio.mv('./' + token + '_' + prefix + '_backup_' + count + 'min.wav' )
}
