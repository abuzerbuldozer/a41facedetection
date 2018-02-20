// Replace the subscriptionKey string value with your valid subscription
// key.
//gerayozkan@hotmail.com (Expire in 20.03.2018)

//Key 1: ef2844ab9ac64fe6b49fbe8ae5bce822
//Key 2: 5ea3f19f1f504401adbeb0fc42a2f653



9:10 AM
var subscriptionKey = "ef2844ab9ac64fe6b49fbe8ae5bce822";
var personGroupId = "a41_testgroup-2";
var blobImage; //blob of image
var faces; //all faces detected in image
var bytesToSend; //binary data of image
var userData = '{"name" : "", "age" : "", "email" : "", "lastDetectionDate" : "", "lastDetectionTime" : ""}';
var newPerson = false;


function detectFace(){
	$(document).ajaxStart(function() {
		  $(".loading-image").show();
	      $("#startButton").prop('disabled', true);
		  //$(".wrapper").show();
		  $("#jsonOutput").hide();
		});

	$(document).ajaxStop(function() {
	    $(".loading-image").hide();
	    $("#startButton").prop('disabled', false);
	    //$(".wrapper").fadeOut("slow");
	    $("#jsonOutput").show();
	});	
	var canvas = document.getElementById('canvas');
	bytesToSend = canvas.toDataURL('image/png');
	blobImage = makeBlob(bytesToSend);
	processBinaryImage(blobImage);
}


function processBinaryImage(blobImage) {
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";

	// Request parameters.
	var params = {
		"returnFaceId" : "true",
		"returnFaceLandmarks" : "false",
		"returnFaceAttributes" : "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
	};

	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase + "?" + $.param(params),
						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader("Content-Type",
									"application/octet-stream");
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},
						type : "POST",
						// Request body.
						data : blobImage,
						processData : false,
						success : handleFaceDetectResults
					})

			.done(function(data) {
				// Show formatted JSON on webpage.
				var newVal = $("#responseTextArea").val() + "\n ********* FACE DETECT ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );
				faces = data;
			})
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;
						alert(errorString);
					});
	
		return;
}


function handleFaceDetectResults(data){
	var faceIds = [];
	for( var i=0;i<data.length;i++  ){
		var tempFace = data[i];
		faceIds[i] = tempFace.faceId;
	}
	
	var obj = new Object();
	obj.personGroupId = personGroupId;
	obj.faceIds  = faceIds;
	obj.maxNumOfCandidatesReturned = 1;
	obj.confidenceThreshold = 0.5;
	var jsonString= JSON.stringify(obj);
	
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/identify";
	
	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase,
						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader("Content-Type",
									"application/json");
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},
						type : "POST",
						// Request body.
						data : jsonString,
						success : handleFaceIdentifyResults
					})

			.done(function(data) {
				// Show formatted JSON on webpage
				var newVal = $("#responseTextArea").val() + "\n ********* FACE IDENTIFY ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );
			})
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;
										
						var error = JSON.parse(jqXHR.responseText);
						if( jqXHR.status == 400 && error.error.code == "PersonGroupNotTrained" ){
							console.warn( "Expected error : PersonGroup " + personGroupId + " not trained.Skipping identify process.");
							trainPersonGroup(null);
							for( var i=0;i<data.length;i++  ){
								createNewPerson(data[i].faceId);
							}
						}
						else{
							alert(errorString);
							console.error( "Unexpected error : " + errorString);
						}
					});	
	
	
	
}

function handleFaceIdentifyResults(data){
	var queryResults = [];
	for( var i=0;i<data.length;i++  ){
		var tempFace = data[i];
		var tempFaceId = tempFace.faceId;
		var tempCandidates = tempFace.candidates;
		if( tempCandidates.length == 0 ){
			queryResults[i] = "Sorry, we could not recognize " + tempFaceId;
			
			createNewPerson(tempFaceId);
		}
		else{
			var candidate = tempCandidates[0];
			handleCandidateData( candidate, tempFaceId );
		}
		console.log( queryResults[i] );
	}
	

}

function createNewPerson(faceId){
//	{
//	    "name":"Person1",
//	    "userData":"User-provided data attached to the person"
//	}
	var obj = new Object();
	obj.name = "Unknown";
	obj.userData  = "";
	var jsonString= JSON.stringify(obj);
	
	
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + personGroupId + "/persons";
	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase,

						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader("Content-Type",
									"application/json");
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},

						type : "POST",

						// Request body.
						data : jsonString
//						async: false,
//						success : addFaceToPerson
					})

			.done(function(data) {
				// Show formatted JSON on webpage.
				var newVal = $("#responseTextArea").val() + "\n ********* CREATE PERSON ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );
			})
			
			.success(function(data) {
				// Show formatted JSON on webpage.
				addFaceToPerson(data.personId, faceId);				
				generateElements(data.personId, data.name, data.userData, faceId);
				newPerson = true;
			})	
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;
						alert(errorString);
					});		
	
	
	return 
}


function generateTargetFace(faceId){
	var targetFace;
	var faceRectangle = findFaceRectangle(faceId);
	targetFace = faceRectangle.left + "," + faceRectangle.top + "," + faceRectangle.width + "," + faceRectangle.height;
	return targetFace;
}

function findFaceRectangle(faceId){
	var faceRectangle;
	for(var i=0;i<faces.length;i++){
		var tempFace = faces[i];
		if( tempFace.faceId == faceId ){
			return tempFace.faceRectangle;
		}
	}
	
	return faceRectangle;
}

function addFaceToPerson(personId, faceId){
//	
//	"faceRectangle": {
//        "width": 78,
//        "height": 78,
//        "left": 394,
//        "top": 54
//    }
	var targetFace = generateTargetFace(faceId);
	
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + personGroupId + 
					"/persons/" + personId + "/persistedFaces?targetFace=" + targetFace;
	
	
	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase,

						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader("Content-Type",
									"application/octet-stream");
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},

						type : "POST",

						// Request body.
							data : blobImage,
							processData : false,
							success : trainPersonGroup
					})

			.done(function(data) {
				// Show formatted JSON on webpage.
				var newVal = $("#responseTextArea").val() + "\n ********* ADD PERSON FACE ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );
			})
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;
						alert(errorString);
					});		
		
	
}

function trainPersonGroup(data){
	

	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + personGroupId + "/train";
	
	
	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase,

						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},
						type : "POST"
					})

			.done(function(data) {
				// Show formatted JSON on webpage.
				var newVal = $("#responseTextArea").val() + "\n ********* TRAIN MODEL ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );
			})
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;
						alert(errorString);
					});	
	
}


function handleCandidateData(data, faceId){
	/* 
	{    
	    "personId":"25985303-c537-4467-b41d-bdb45cd95ca1",
	    "persistedFaceIds":[
	        "015839fb-fbd9-4f79-ace9-7675fc2f1dd9",
	        "fce92aed-d578-4d2e-8114-068f8af4492e",
	        "b64d5e15-8257-4af2-b20a-5a750f8940e7"
	    ],
	    "name":"Ryan",
	    "userData":"User-provided data attached to the person"
	} */
	var confidence = data.confidence;
	var personId = data.personId;
	
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + personGroupId + "/persons/" + personId;
	
	
	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase,

						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader("Content-Type",
									"application/json");
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},

						type : "GET",

						// Request body.
//						data : jsonString,
//						async: false,
						
					})

			.done(function(data) {
				// Show formatted JSON on webpage.
				var newVal = $("#responseTextArea").val() + "\n ********* GET PERSON ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );

			})
			
			.success(function(data) {
				// Show formatted JSON on webpage.
				addFaceToPerson(data.personId, faceId);				
				generateElements(data.personId, data.name, data.userData, faceId);
			})				
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;
						alert(errorString);
					});	

}



/**
 * Resets form elements, resume video
 * @returns
 */
function clearForm(){
	$("#resultRow").empty();
	$("#resultRow").hide();
	
	$("#responseTextArea").val("");
	$("#loadingBarRow").show();	
	var video = document.getElementById('video');
	var photo = document.getElementById('video');

	video.play();
}



function generateResponseResults(data, faces){
	console.log('adasd');
}
/**
 * generates form element for selected person
 * @param personId
 * @param name
 * @param userData
 * @param faceId
 * @returns
 */
function generateElements(personId,name, userData, faceId){
	newPerson
//	var img = $("<img id='img" + personId + "' class='img-thumbnail' width='150px' height='150px'></img>");
	var canvas = $("<canvas id='newCanvas" + personId +  "' class='thumbnailCanvas' ></canvas>");
	var img = drawThumbnail(canvas, faceId);
	
	var usrObj = (userData == null) ? null : JSON.parse(userData);
	
	var rowid = 'row' + personId ;
	
	
	
	
	$('#resultRow').append("<div class='row' id='" + rowid  +  "' style='margin-left: 0px;'>");
	
	var txtMsg = newPerson ? "Hello stranger, can you give us some information about you?" : "Hello " + name + "!";	
	$("#" + rowid ).append("<div class='row msgRow'>").append("<div class='col-xs-12 col-sm-3 col-lg-3>").append("<p>" + txtMsg + "</p>");
	$("#" + rowid ).append("<div class='row dataRow'>");
	
	var dataRow = $( "#" + rowid ).find('div.dataRow');
	dataRow.append("<div class='col-xs-4 col-sm-4 col-lg-3 thumbnailDiv'>");
		dataRow.find('div.thumbnailDiv').append( img );
		dataRow.find('div.thumbnailDiv').append( canvas );

	dataRow.append("<div  class='col-xs-6 col-sm-8 col-lg-9 dataDiv'>");
	var dataDiv = dataRow.find("div.dataDiv")
		dataDiv.append("<form class='form-horizontal'>");
		var form = dataDiv.find("form");
		form.append("<div class='form-group'>");
		form.append("<div class='form-group'>");
		form.append("<div class='form-group'>");
		form.append("<div class='form-group'>");
		
		
		
		var tmpFormElement = dataRow.find("div.form-group")[0];
		tmpFormElement.append( $('<label>', {
															        for:'name' + personId,
															        text: 'Name:'
															    }).get(0)
															);			
		tmpFormElement.append( $('<input>', {
															        type: 'text',
																	id:'name' + personId,
															        val: name,
															        name:'name',
															        class:'form-control my-form-control'
															    }).get(0)
															);
		
		tmpFormElement = dataRow.find("div.form-group")[1];
		tmpFormElement.append( $('<label>', {
															        for:'surname' + personId,
															        text: 'Surname:'
															    }).get(0)
															);	
		tmpFormElement.append( $('<input>', {
															        type: 'text',
																	id:'surname' + personId,
															        val: (usrObj == null || !usrObj[0].surname) ? "" : usrObj[0].surname,
															        name:'surname',
															        class:'form-control my-form-control'
															    }).get(0)
															);
		
		tmpFormElement = dataRow.find("div.form-group")[2];
		tmpFormElement.append( $('<label>', {
															        for:'age' + personId,
															        text: 'Age:'
															    }).get(0)
															);			
		tmpFormElement.append( $('<input>', {
															        type: 'text',
																	id:'age' + personId,
															        val: (usrObj == null || !usrObj[1].age) ? "" : usrObj[1].age,
															        name:'age',
															        class:'form-control my-form-control'
															    }).get(0)
															);
		
		
		
		tmpFormElement = dataRow.find("div.form-group")[3];
		tmpFormElement.append( $('<label>', {
	        text: ''
	    }).get(0)
	);			
		tmpFormElement.append($('<button/>', {
															        id: 'btn'+personId,
															        click: function () { saveInfo( $(this), personId );return false; },
																	text: 'Save Info',
															        class:'btn btn-primary',
															        style:'width:100%'
															    }).get(0)
															);
//		<button type="button" class="btn btn-default">Default</button>

	displayResults();
}

/**
 * draws thumbnail image for the given faceId
 * @param faceId
 * @param personId
 * @returns
 */
function drawThumbnail(canvasElement, faceId){
	var canvas = canvasElement.get(0);
//	var newImg = imageElement.get(0);

	
    var context = canvas.getContext('2d');
    var img 	= document.getElementById('photo'); //gets detection image
    var faceRectangle = findFaceRectangle(faceId); //find faceRectangle by given faceId
	var size = (faceRectangle.width>faceRectangle.height) ? faceRectangle.width : faceRectangle.height; //turn faceRectangle to square

    canvas.width = size;
    canvas.height = size;

      
	  var newImg = new Image;
	  newImg.setAttribute('class','img-responsive thumbnailImg');
	  newImg.onload = function() {
		    context.drawImage(img,faceRectangle.left,faceRectangle.top,size,size,0,0,size,size);	
	  };
	  newImg.src = canvas.toDataURL('image/png');  
	  
	  return newImg;

}


/**
 * display resultrow
 * @param data
 * @returns
 */
function displayResults(){	
	$("#resultRow").show();
	$("#loadingBarRow").hide();	
}


function clearphotos() {
	
	$('#resultRow').$("[canvas.thumbnailCanvas],[img.thumbnailImg]").each( function( index, listItem ) {
		 
	    this === listItem; // true
	    var context = this.getContext('2d');
	    context.fillStyle = "#AAA";
	    context.fillRect(0, 0, this.width, this.height);
	    clearphoto(this);
	},
    function clearphoto(canvas){
    	var id = canvas.id;
    	varimgId = "img" + id.substring(2);
    	var img = $('#'+varimgId);
    	var data = canvas.get(0).toDataURL('image/png');
    	img.get(0).setAttribute('src', data);
    }
	);

  }


function saveInfo(me,personId){
    var form = me.parents('form:first');
    var formData = form.serializeArray();
    updatePerson( personId,formData );
}


function updatePerson(personId,formData){
//	{
//	    "name":"Person1",
//	    "userData":"User-provided data attached to the person"
//	}
	var obj = new Object();
	obj.name = "";
	obj.userData = new Array();
	
//	 obj.toJSON = function(key)  
//	 {  
//	    var replacement = new Object();  
//	    for (var val in this)  
//	    {  
//	    	console.log(val);
//	        if (typeof (this[val]) === 'string') { 
//	            replacement[val] = this[val].replace(/["]/g, '\\"'); 
//	        }
//	        else if (  Array.isArray(this[val]) ) {
//	        	var tmp = this[val];
//	        	for( var i=0;i<tmp.length;i++ ){
//	        		tmp[i] = tmp[i].replace(/["]/g, '\\"'); 
//	        	}
//	    	}
//	        else {
//	            replacement[val] = this[val]  
//	        }
//	    }  
//	    return replacement;  
//	};	
	
	var str = "";
	var name = "";
	var userData = "";
	for( var i=0;i<formData.length;i++ ){
		var data = formData[i];


		if( data.name == "name"){
			name =  '"' + data.name + '":"' + data.value + '"';
			obj.name = data.value.replace(/["]/g, '\\"');
		}	
		else {
			userData = userData + (!userData ? '"[' : ''); 
			userData = userData + '{\\"' + data.name + '\\":\\"' + data.value + '\\"}';
			userData = userData + ((i < formData.length-1) ? ',' : ']"'); 
			
			var tmpobj = new Object();
			tmpobj.name = data.name;
			tmpobj.value = data.value.replace(/["]/g, '\\"');
			obj.userData.push(tmpobj);
		}
	}
	obj.userData.push({"name":"lastDetectionDate","value":getDateStr()});

	
	str = '{' + name + ',userData :' + userData + '}';
	console.log( JSON.stringify(obj, stringifyReplacer) );
	
	obj.userData = formData;
//	var jsonString= JSON.stringify(obj);
//	jsonString = str;
	var jsonString = str;
	
	
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + personGroupId + "/persons/" + personId;
	// Perform the REST API call.
	$
			.ajax(
					{
						url : uriBase,

						// Request headers.
						beforeSend : function(xhrObj) {
							xhrObj.setRequestHeader("Content-Type",
									"application/json");
							xhrObj.setRequestHeader(
									"Ocp-Apim-Subscription-Key",
									subscriptionKey);
						},

						type : "PATCH",

						// Request body.
						data : jsonString
//						async: false,
//						success : addFaceToPerson
					})

			.done(function(data) {
				// Show formatted JSON on webpage.
				var newVal = $("#responseTextArea").val() + "\n ********* UPDATE PERSON ******** \n" +JSON.stringify(data, null, 2) + "\n************************** \n";
				$("#responseTextArea").val( newVal );
			})
			
			.success(function(data) {
				// Show formatted JSON on webpage.
				console.log('Person succesfully created');
			})	
			
			.fail(
					function(jqXHR, textStatus, errorThrown) {
						// Display error message.
						var errorString = (errorThrown === "") ? "Error. "
								: errorThrown + " (" + jqXHR.status + "): ";
						errorString += (jqXHR.responseText === "") ? ""
								: (jQuery.parseJSON(jqXHR.responseText).message) ? jQuery
										.parseJSON(jqXHR.responseText).message
										: jQuery.parseJSON(jqXHR.responseText).error.message;

										
						var error = JSON.parse(jqXHR.responseText);
						if( jqXHR.status == 400 && error.error.code == "PersonGroupNotTrained" ){
							console.warn( "Expected error : PersonGroup " + personGroupId + " do not contain any person.No need to train,");
						}	
						else{
							alert(errorString);
						}
					});		
	
	
	return 
}

function getDateStr(){
	var today = new Date();
	var day = (today.getDate()<10)?"0"+today.getDate() : today.getDate();
	var month = ((today.getMonth() + 1)<10)?"0"+(today.getMonth() + 1) : (today.getMonth() + 1);
	var year = today.getFullYear();
	var hours = (today.getHours()<10)?"0"+today.getHours() : today.getHours();
	var mins = (today.getMinutes()<10)?"0"+today.getMinutes() : today.getMinutes();
	var seconds = (today.getSeconds()<10)?"0"+today.getSeconds() : today.getSeconds();
	var dateStr = "" + day + "/" + month + "/" + year + " " + hours + ":" + mins + ":" + seconds;
	return dateStr;
}


//escape json strings
function escapeSpecialCharacters(string)
{
return string
.replace(/[']/g, "\\'")
.replace(/["]/g, '\\"')
.replace(/[&]/g, "\\&")
.replace(/[\n]/g, "\\n")
.replace(/[\r]/g, "\\r")
.replace(/[\t]/g, "\\t")
.replace(/[\b]/g, "\\b")
.replace(/[\v]/g, "\\v")
.replace(/[\f]/g, "\\f");
}

// replacer handler for JSON stringify
function stringifyReplacer(key, value)
{
if (typeof value === 'string') {
return escapeSpecialCharacters(value);
}

return value;
}
