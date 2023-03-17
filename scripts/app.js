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

const AUDIO_DUR = 5 * 1000 + (1*1000) //seems to need a 1 second buffer?
const BACKUP_INT = 4 * 1000

// disable stop button while not recording
stop.disabled = true;

//main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    record.onclick = function() {
      // generate a new file every 5s
	  record_and_send(stream)
      audio_backup = setInterval(function() {record_and_send(stream)}, BACKUP_INT);
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
	  //stop main interval
      clearInterval(audio_backup);
      //clear remaining timers and recorders
	  for (let t in timers) {
		  clearTimeout(timers[t])
	  }
	  for (let r in recorders) {
		  recorders[r].stop()
	  }
	  
	  record.style.background = "";
      record.style.color = "";
      
      stop.disabled = true;
      record.disabled = false;
    }
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
  let timeout = setTimeout(()=> recorder.stop(), AUDIO_DUR);
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