/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var errorElement = document.querySelector('#errorMsg');
var video = document.querySelector('video');

var isMobileDevice = !!(/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent || ''));

var ua = window.navigator.userAgent;
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
var webkit = !!ua.match(/WebKit/i);
var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);


if( !(isMobileDevice && !iOSSafari) ){
	showDialogMessage( $.i18n('msgtype-error'), $.i18n('error-mobilsafari') ,true );
}
/*
if(isMobileDevice && (window.innerHeight > window.innerWidth) ){
	  showDialogMessage( $.i18n('msgtype-error'), $.i18n('error-mobillandscape'), true );
}
*/
// Put variables in global scope to make them available to the browser console.
var facingMode = "user";
var constraints = {
  audio: false,
  video: {
	   facingMode: facingMode
	  },
  width:320,
  height:240
};

/*
$( window ).on( "orientationchange", function( event ) {
	  $( "#orientation" ).text( "This device is in " + event.orientation + " mode!" );
	  if( isMobileDevice && event.orientation == "portrait" ){
		  showDialogMessage( $.i18n('msgtype-error'), $.i18n('error-mobillandscape'), true );
	  }
	  if(event.orientation == "landscape" && !(isMobileDevice && !iOSSafari)  ){
		  hideDialogMessage();
	  }
});
*/

video.addEventListener('click', function() {

	if(isMobileDevice){
	
	  if (facingMode == "user") {
	    facingMode = "environment";
	  } else {
	    facingMode = "user";
	  }
//	  alert( facingMode );
	  constraints.video.facingMode = facingMode;
	  startVideo();

	}
	});

function startVideo(constraints){
	  navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
		    video.srcObject = stream; 
	  });
}

function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;

}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

