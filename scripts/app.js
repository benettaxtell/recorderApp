// set up basic variables for app

/***
OVERALL TODO:
-shift record/stop buttons to indicate recording (flashing on record/recording?)
-format so start/stop are portholes in a spaceship
-keep screen on (with empty 1sec video?)
-shift backup to every 5 minutes
-CHECK UPLOAD SIZE LIMIT
-add confirm to stop record (can't happen with single click)
- upload every 5 min, start new recording after 4.5 minutes
	so overlap, but no large files
***/

const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');

let recorders = []
let timers = []
let audio_backup
//let next_audio
// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

//let audioCtx;
//const canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);
    const mediaRecorderB = new MediaRecorder(stream);

    //visualize(stream);

    record.onclick = function() {
      // generate a new file every 5s
	  record_and_send(stream)
      audio_backup = setInterval(function() {record_and_send(stream)}, 4000);
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      //mediaRecorder.stop();
      clearInterval(audio_backup);
	  for (let r in recorders) {
		  recorders[r].stop()
	  }
	  for (let t in timers) {
		  clearTimeout(timers[t])
	  }
	  //console.log(mediaRecorder.state);
      //console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    //mediaRecorder.onstop = function(e) {
      //console.log("data available after MediaRecorder.stop() called.");
	  
      //clearInterval(audio_backup);
    //}
	
	//TODO: here chunks is updated, chunks can be turned into an audio file
	//TODO: every 5 minutes, copy chunks (so it can keep updating), get the blob
	//into audio file and push that to server. DO NOT OVERWRITE.
    //mediaRecorder.ondataavailable = function(e) {
    //  chunks.push(e.data);
	  
	//  pushAudio(chunks)
    //}


  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

//TODO UPDATE WITH THIS TO MAKE NEW RECORDER EVERY 4.5 min for 5 min
function record_and_send(stream) {
  const recorder = new MediaRecorder(stream);
  recorders.push(recorder)
  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = e => pushAudio(chunks);
  let timeout = setTimeout(()=> recorder.stop(), 6000); // we'll have a 5s media file
  timers.push(timeout)
  recorder.start();
}

function pushAudio(all_chunks) {
  let bkp_blob = new Blob(all_chunks, { 'type' : 'audio/wav' });
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/send_audio', true);
  
  /*xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.responseText);
    }
  }*/
  
  let formdata = new FormData()
  formdata.append('audio', bkp_blob)
  xhr.send(formdata);
  console.log("audio backed up");

}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();