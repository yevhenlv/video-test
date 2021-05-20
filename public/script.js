const socket = io();
const videoGrid = document.getElementById('video-grid');
const videoMy = document.getElementById('video-my');
const videoPartner = document.getElementById('video-partner');
videoMy.muted = true;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000',
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(videoMy, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      call.on('stream', (userVideoStream) => {
        addVideoStream(videoMy, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  call.on('stream', (userVideoStream) => {
    addVideoStream(videoPartner, userVideoStream);
  });
};

peer.on('open', (id) => {
  socket.emit('join-room', 'sessionId', id);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
};

const muteButton = document.querySelector('#muteButton');
const stopVideo = document.querySelector('#stopVideo');
muteButton.addEventListener('click', () => {
  muteButton.classList.toggle('background__red');
  myVideoStream.getAudioTracks()[0].enabled = !myVideoStream.getAudioTracks()[0].enabled;
});

stopVideo.addEventListener('click', () => {
  myVideoStream.getVideoTracks()[0].enabled = !myVideoStream.getVideoTracks()[0].enabled;
  stopVideo.classList.toggle('background__red');
});