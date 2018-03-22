/**
 * 
 */

var video = document.querySelector('video');
canvas = document.getElementById('canvas');
var width = 640;
var height = 0;

function startDetection(event){
	clearForm();
	takepicture();
	detectFace();
}



function makeBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}



//Fill the photo with an indication that none has been
//captured.

function clearphoto() {
var context = canvas.getContext('2d');
context.fillStyle = "#AAA";
context.fillRect(0, 0, canvas.width, canvas.height);

var data = canvas.toDataURL('image/png');
photo.setAttribute('src', data);
}

//Capture a photo by fetching the current contents of the video
//and drawing it into a canvas, then converting that to a PNG
//format data URL. By drawing it on an offscreen canvas and then
//drawing that to the screen, we can change its size and/or apply
//other changes before drawing it.

function takepicture() {
var context = canvas.getContext('2d');
if (canvas && canvas.width) {
 canvas.width = width;
 canvas.height = height;
 context.drawImage(video, 0, 0, width,height);

 var data = canvas.toDataURL('image/png');
 photo.setAttribute('src', data);
// var txt = "canvas.width:" + canvas.width  + "\ncanvas.height:" + canvas.height + "\nimgwidht:" + $("#photo").width() + "\nimgheight:" + $("#photo").height();
 $("#photo").show();
 $("#photo").css('zIndex', 9999);
 $("#video").css('zIndex', -9999);

 //$(".video").hide();
 //$(".startbutton").hide();
 video.pause();
} else {
 clearphoto();
 alert('Can not take photo!');
}
}