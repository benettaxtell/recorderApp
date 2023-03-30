// set up basic variables for app

/***
OVERALL TODO:
XX shift record/stop buttons to indicate recording (flashing on record/recording?)
XX format so start/stop are portholes in a spaceship
XX keep screen on (with empty 1sec video?)
- shift backup to every 5 minutes
- CHECK UPLOAD SIZE LIMIT
XX add confirm to stop record (can't happen with single click)
XX upload every 5 min, start new recording after 4.5 minutes
	so overlap, but no large files
***/

const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');
const token = document.querySelector('.wrapper').dataset.token;

var noSleep = new NoSleep();

let recorders = []
let timers = []
let audio_backup
let need_confirm = true;
let last_rec = false;
//EVENTUALLY WILL BE MADE LONGER
const AUDIO_DUR = 5 * 1000 + (1*1000) //seems to need a 1 second buffer?
const BACKUP_INT = 4 * 1000

// disable stop button while not recording
stop.disabled = true;
//TODO: move this into onrecord event???
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleep.enable();
}, false);
//main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');
  
  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    record.onclick = function() {
      //keep screen on
	  
      // generate a new file every 5s
	  record_and_send(stream)
      audio_backup = setInterval(function() {record_and_send(stream)}, BACKUP_INT);
      //record.style.background = "red";
	  record.classList.add('active');
      record.textContent = 'Recording...'
 
      stop.disabled = false;
      record.disabled = true;
	  
	  stop.classList.remove('active')
	  need_confirm = true;	  
	  last_rec = false;
    }

    stop.onclick = function() {
	  if (need_confirm) { 
		stop.classList.add('active')
	    stop.textContent = 'Touch again to stop'
        //stop.style.background ='red'
		need_confirm = false
	  } else {
	    
	    for (let r in recorders) {
		  if (r == recorders.length - 1){
			  last_rec = true
		  }
	      recorders[r].stop()
	    }
	    //stop main interval
        clearInterval(audio_backup);
        //clear remaining timers and recorders
	    for (let t in timers) {
	      clearTimeout(timers[t])
	    }
		
	    record.classList.remove('active');
	    //record.style.background = '';
        //record.style.color = '';
        record.textContent = 'Record'
		
	    //stop.style.background = ''
		stop.textContent = 'Stop'
        stop.classList.remove('active')
		
		stop.disabled = true;
        record.disabled = false;
		
		noSleep.disable();
	  }
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

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
  let formdata = new FormData()
  formdata.append('audio', bkp_blob)
  formdata.append('token', token)
  let xhr = new XMLHttpRequest();
  if (last_rec) {
    xhr.open('POST', '/send_last_audio', true);
    setTimeout(() => xhr.send(formdata), 500)
	last_rec = false
  } else {
    xhr.open('POST', '/send_audio', true);
    xhr.send(formdata);	
  }
  console.log("audio backed up");
  
  /*xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.responseText);
    }
  }*/
}