const socket = io();
const videoMy = document.getElementById('video-my');
const videoPartner = document.getElementById('video-partner');

videoMy.muted = true; // TODO change to false is nesessary

if (!window.Audio) console.log('Audio is not supported');
if (!(!!document.createElement('video').canPlayType)) console.log('Video is not supported');
if (!(!!window.RTCPeerConnection)) console.log('Video conference is not supported')

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000',
  config: {
    // iceServers: [   
    //   {
    //     url:'stun:stun01.sipphone.com',
    //   },
    //   {
    //     url: 'turn:numb.viagenie.ca',
    //     credential: 'muazkh',
    //     username: 'webrtc@live.com',
    //   },
    // ],
   iceTransportPolicy: 'all',
  }
});

let currentStreamId = null;
let currentStream = null;
let audioEnabled = true;
let videoEnabled = true;

peer.on('open', (id) => {
  currentStreamId = id;
  socket.emit('join-room', 'sessionId', id);
});

peer.on('error', (call) => {
  console.log('error', call);
});

const initConnection = (isFirst) => {
  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      devices.forEach((device) => {
        console.log(device)
      });
    }).catch(function(err) {
      console.log(err.name + ':' + err.message);
    });

  navigator.mediaDevices.getUserMedia({
    audio: {
      noiseSuppression: true,
      echoCancellation: true,
      sampleRate: 128000,
    },
    video: {
      width: {
        max: 360,
        ideal: 360,
      },
      height: {
        max: 180,
        ideal: 360,
      },
    },
  })
  .then((stream) => {
    currentStream = stream;
    addVideoStream(videoMy, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      call.on('stream', (userVideoStream) => {
        addVideoStream(videoMy, userVideoStream);
      });
    });
  
    if (isFirst) {
      socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
      });
    }
  })
  .catch((e) => {
    console.log(e);
  });
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  call.on('stream', (userVideoStream) => {
    addVideoStream(videoPartner, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
};

const muteButton = document.querySelector('#muteButton');
const stopVideo = document.querySelector('#stopVideo');

muteButton.addEventListener('click', () => {
  audioEnabled = !audioEnabled;
  currentStream.getAudioTracks().forEach((track) => {
    track.enabled = !audioEnabled;
  });
  
  muteButton.classList.toggle('background__red');
});

stopVideo.addEventListener('click', () => {
  if (videoEnabled) {
    videoEnabled = false;
    currentStream.getVideoTracks().forEach((track) => {
      track.stop();
    });
  } else {
    videoEnabled = true;
    initConnection(false);
  }
  
  stopVideo.classList.toggle('background__red');
});

initConnection(true);

// переключать сервера с дефолтных на купленные если есть проблема
// выключать камеру если отключили видео +
// качество видео и аудио +
// поддержка видео аудио +