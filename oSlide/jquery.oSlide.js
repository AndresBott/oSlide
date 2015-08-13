/** @preserve
 * oSlide - jQuery Plugin
 * A slideshow designet for the frontside of my protfolio
 *
 * Copyright (c) 2011 Andrés Bott
 * Examples and documentation at: http://andresbott.com or http://oslide.andresbott.com
 *
 * Version: 1.0.3
 * Developed with: jQuery v1.6
 *
 * licensed under the LGPL license:
 *   http://www.gnu.org/licenses/lgpl.html
 * 	 you can use this software everywere, even in comertical and closed proyects, but this software remains open, and free even if you make changes to it
 *
 *
 *This plugin is developed with a object oriented paradigm, so it has some public methods witch you can call to interact with the plugin
 *################################################################################################
 *----->  calling the plugin:
 *
 *  $(document).ready(function() {
 *      $("#oSlideContainer").oSlide({options:"go here"});  // call the plugin
 *  
 *      var myplugin = $("#oSlideContainer").data('JsObj');  // get the plugin object instance
 *
 *      myplugin.publicMethod(); // cals a public method
 *
 *  });// close document ready
 *################################################################################################*
 */

/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];

			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}


(function($){
	var oSlide = function($container,$settings){


		var defaults = {
			debug:false,
			baseZIndex : 600,


			loadingAnimationSpeed:1200,
			loadingAnimationImages:12,

			enableNavigationControls:true,
			alwaysSowNavigationControls:false,
			allowFullScreen : true,

			thumbnails : false,
			thumbSize : 150,
			thumbNumber:4,// how many thumbnaisl to show as max




			timeBetweenAnimations:6000,
			kenBurns:35, // 0 to deactivate
			images : false,
			openingAnimation:"TV",
			imageAnimation: "fade",
			imageAnimationSpeed:1000,
			imageAnimationInSpeed:false,
			imageAnimationOutSpeed:false,

			titleAnimation:"fade",
			titleAnimationSpeed:1000,
			titleAnimationInSpeed:false,
			titleAnimationOutSpeed:false,
			titleAnimationTimeOut:400,
			titleTimeBeforeHide:5000,

			descriptionAnimation:"fade",
			descriptionAnimationSpeed:1000,
			descriptionAnimationInSpeed:false,
			descriptionAnimationOutSpeed:false,
			descriptionAnimationTimeOut:550,
			descriptionTimeBeforeHide:4800,

			captionAnimation:"fade",
			captionAnimationSpeed:550,

			// fullscreen options
			FStimeBetweenAnimations:6000,
			FSkenBurns:0, // 0 to deactivate
			FSimageAnimation: "fade",
			FSimageAnimationSpeed:1000,
			FSimageAnimationInSpeed:false,
			FSimageAnimationOutSpeed:false,

			FsdescriptionAnimation:"fade",
			FsdescriptionAnimationSpeed:1000,
			FsdescriptionAnimationInSpeed:false,
			FsdescriptionAnimationOutSpeed:false,
			FsdescriptionAnimationTimeOut:550,
			FsdescriptionTimeBeforeHide:4800,

			FscaptionAnimation:"fade",
			FscaptionAnimationSpeed:550,



		};
		var $settings = $.extend(defaults, $settings);

		//=======   Some setting adjustements  =========//
		if($settings.imageAnimationInSpeed == false){
			$settings.imageAnimationInSpeed = $settings.imageAnimationSpeed;
		}
		if($settings.imageAnimationOutSpeed == false){
			$settings.imageAnimationOutSpeed = $settings.imageAnimationSpeed;
		}


		if($settings.titleAnimationInSpeed == false){
			$settings.titleAnimationInSpeed = $settings.titleAnimationSpeed;
		}
		if($settings.titleAnimationOutSpeed == false){
			$settings.titleAnimationOutSpeed = $settings.titleAnimationSpeed;
		}


		if($settings.descriptionAnimationInSpeed == false){
			$settings.descriptionAnimationInSpeed = $settings.titleAnimationSpeed;
		}
		if($settings.descriptionAnimationOutSpeed == false){
			$settings.descriptionAnimationOutSpeed = $settings.titleAnimationSpeed;
		}
		//=======    internal usage Vars  =========//
		this.version = "1.0";
		this.Originalcontainer = $container // points to the original, in code, defined Container
		this.container = false; //points to the image container
		//this.thumbContainer = false // holds the thumbnails contaienr
		this.loading = false;
		this.loadingFrame = 0;
		this.resizeTimeout = 0; // holds the timer for calling the resize method
		this.reload = false; // used to hide the previous image faster when true (resize method changes this to true)
		this.isInImageTransition = false;
		this.thumbPreloadIndex = 0; // witch thumbnail is loading
		this.currentImageIndex = -1;
		this.nextImageIndex = 0;
		this.slideStarted = false; // controls if the loop has started
		this.mainLoopTimer = false; //holds the main timer
		this.titleTimer = false //holds the title timeout
		this.descTimer = false // holds the description Timer	
		this.imgLength = 0; // instance constant to know how many images are defiend
		this.initialDiv = false // holds the inital div without image;
		this.containerWidth = 0	 // container sizes		
		this.containerHeight = 0
		this.titleTimeout = false;
		this.descTimeout = false;
		this.isFullScreen = false; // bolean if we are in full screen or windowed
		this.fulscreenContainer = false; // holds the container for fullscreen

		this.kbStartTime = null // time calculation for ken burns


		this.options = $settings;
		this.constructor();
	}

	oSlide.prototype = {
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Protoptype constructor, the starting point																						
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		   		
		constructor: function(){

			var $this = this;
			$(this.container).css({
				"position":"relative",
				"overflow":"hidden",
				'z-index': this.options.baseZIndex
			})

			var tempcontainerWidth = $($this.Originalcontainer).width();
			var tempcontainerHeight = $($this.Originalcontainer).height();

			$this.container = $('<div class="oSlideContainer"></div>').width(tempcontainerWidth).height(tempcontainerHeight).css({
				"position":"absolute",
				"overflow":"hidden",
				'z-index': this.options.baseZIndex+1
			});
			$($this.Originalcontainer).append($this.container);

			// activating the thumbnails div
			// thumbnails not implemented yet, so deactivated
			//if ( (this.options.thumbnails == "r" || this.options.thumbnails == "l" || this.options.thumbnails == "t" || this.options.thumbnails == "b") && (false)){

			// var tempcontainerWidth = $(this.container).width();
			// var tempcontainerHeight = $(this.container).height();
//     			
			// if(this.options.thumbnails == "r" || this.options.thumbnails == "l"){
			// var restaHor = this.options.thumbSize;
			// var restaVert = 0;
			// var thumbContainerWidth = this.options.thumbSize;
			// var thumbContainerHeight = tempcontainerHeight;
			// }else{
			// var restaHor = 0;
			// var restaVert =    	this.options.thumbSize;
			// var thumbContainerWidth = tempcontainerWidth;
			// var thumbContainerHeight = this.options.thumbSize;
			// }
//     			
			// var subContainer = $('<div class="oSlideSubContainer"></div>').width(tempcontainerWidth-restaHor).height(tempcontainerHeight - restaVert).css({
			// "position":"absolute",
			// "overflow":"hidden",
			// 'z-index': this.options.baseZIndex+1
			// });
// 
//     		
			// this.thumbContainer = $('<div class="oSlideThubsContainer"></div>').width(thumbContainerWidth).height(thumbContainerHeight).css({
			// "position":"absolute",
			// "overflow":"hidden",
			// 'z-index': this.options.baseZIndex+1
			// });
			// this.container.append(subContainer).append(this.thumbContainer);
			// this.container = subContainer;
//     			
//     			
			// if(this.options.thumbnails == "l"){
			// subContainer.css("right",0);
			// }else if(this.options.thumbnails == "r"){
			// this.thumbContainer.css("right",0);
			// }else if(this.options.thumbnails == "t"){
			// subContainer.css("bottom",0);
			// }else{
			// this.thumbContainer.css("bottom",0);
			// }



			//}



			// resize TODO improve
			this.resize();
			$this.reload = false;
			$(window).resize(function(){


				clearTimeout ($this.resizeTimeout);
				$this.resizeTimeout = setTimeout(function(){
					//alert("rees")
					$this.resize();
				}, 400);


			})






			// show loading animation
			this.showLoading();

			this.imgLength =  $(this.options.images).size();

			//this.showThumbNavigationMenu();

			if(this.options.images !=false){
				// start the loop
				$this.SlideNext(function(){
					// after loading the first image, show the navigation controlls as callback function
					// if(options.enableNavigationBar==true){
					// showNavigationBar();
					// }

					if($this.options.enableNavigationControls == true){
						$this.showNavigationControls();
					}
				});

			}else{
				consoleOut("ERROR: No images declarated, hidding the divs!")
				$(this.container).remove();
			}

		},


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Log some info to the browser consoloe																					
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		    	
		consoleOut:function (message,type){
			var extendText = "oSlide: ";
			if(typeof(message) == 'undefined'){
				var message = "WARNING: a consoleOut event was called here without any message!";
			}
			if( typeof(console) !== 'undefined' && console != null && this.options.debug == true) {
				if(typeof(type) == 'undefined'){
					type = "log";
				}

				switch (type){

					case "warn":
						console.warn(extendText+message);
						break;

					case "error":
						console.error(extendText+message);
						break;

					default:
						console.log(extendText+message);
						break;

				}
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Starts the loading animation																						
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		
		showLoading : function (){
			this.consoleOut("method: showLoading() ");

			var $this = this;

			this.loading_point1 = $('<div class="oSlide-loading" style="z-index:'+ parseFloat(this.options.baseZIndex + 1 )+';" ></div>').css({
				position: "absolute",
				//display : "none",
				opacity:0,
				width: "12px",
				height:"12px",
				//background: "silver",
				borderRadius:200,


			})

			this.loading_point2 = $this.loading_point1.clone().css({left:(this.containerWidth/2) -8});
			this.loading_point3 = $this.loading_point1.clone().css({left:(this.containerWidth/2) +12});
			this.loading_point4 = $this.loading_point1.clone().css({left:(this.containerWidth/2) +32});



			$(this.container).append($this.loading_point1).append($this.loading_point2).append($this.loading_point3).append($this.loading_point4);


			function animateLoading(){

				setTimeout(function(){$this.loading_point1.css({
					left:($this.containerWidth/2) - 33,
					top: ($this.containerHeight/2) - 13,
					width:"24px",
					height:"24px",
					opacity:0
				}).animate({
					left:($this.containerWidth/2) -28,
					top: ($this.containerHeight/2) -8,
					width:"12px",
					height:"12px",
					opacity:1
				},$this.options.loadingAnimationSpeed/4).animate({opacity:0},$this.options.loadingAnimationSpeed/4); },0);

				setTimeout(function(){$this.loading_point2.css({
					left:($this.containerWidth/2) - 13,
					top: ($this.containerHeight/2) - 13,
					width:"24px",
					height:"24px",
					opacity:0
				}).animate({
					left:($this.containerWidth/2) -8,
					top: ($this.containerHeight/2) -8,
					width:"12px",
					height:"12px",
					opacity:1
				},$this.options.loadingAnimationSpeed/4).animate({opacity:0},$this.options.loadingAnimationSpeed/4);},$this.options.loadingAnimationSpeed/8);

				setTimeout(function(){$this.loading_point3.css({
					left:($this.containerWidth/2) +7,
					top: ($this.containerHeight/2) - 13,
					width:"24px",
					height:"24px",
					opacity:0
				}).animate({
					left:($this.containerWidth/2) + 12,
					top: ($this.containerHeight/2) -8,
					width:"12px",
					height:"12px",
					opacity:1
				},$this.options.loadingAnimationSpeed/4).animate({opacity:0},$this.options.loadingAnimationSpeed/4);},($this.options.loadingAnimationSpeed/8) * 2);


				setTimeout(function(){$this.loading_point4.css({
					left:($this.containerWidth/2) +27,
					top: ($this.containerHeight/2) - 13,
					width:"24px",
					height:"24px",
					opacity:0
				}).animate({
					left:($this.containerWidth/2) + 32,
					top: ($this.containerHeight/2) -8,
					width:"12px",
					height:"12px",
					opacity:1
				},$this.options.loadingAnimationSpeed/4).animate({opacity:0},$this.options.loadingAnimationSpeed/4);},($this.options.loadingAnimationSpeed/8) * 3);

				// $this.loading.animate({top: ( ($this.containerHeight/2) + 20) +"px" },$this.options.loadingAnimationSpeed/2).queue(function(){
				// $this.loading.animate({top:($this.containerHeight/2) - 8},$this.options.loadingAnimationSpeed/2);
				// $this.loading.dequeue();
				// });
			}

			animateLoading();

			if(typeof($this.loadingTimer)!="undefined"){
				clearInterval($this.loadingTimer);
			}
			$this.loadingTimer = setInterval(function(){ animateLoading() } , this.options.loadingAnimationSpeed);

		},


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Stops the loading animation																							
// 																														
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		hideLoading : function (){

			this.consoleOut(" method: hideLoading() ");
			var $this = this;

			this.loading_point1.hide();
			this.loading_point2.hide();
			this.loading_point3.hide();
			this.loading_point4.hide();
			//this.loading.hide();
			clearInterval($this.loadingTimer);
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Get the size of current image shoud have																								
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		
		getImageResize : function($index){

			var $this = this;
			var contWidth = this.containerWidth;
			var contHeight = this.containerHeight;
			var curImgAspect = $this.options.images[$index]["originalAspectRatio"];
			var ßresultingHeight = 0;
			var ßresultingWidth = 0;
			var ßkresultingHeight = 0;
			var ßkresultingWidth = 0;
			var kenBurns = 1 + ($this.options.kenBurns/100);



			this.consoleOut("method: Resize!!!! container size= "+contWidth +"x"+contHeight);

			if( (contWidth  / contHeight) < curImgAspect ){
				var adjustedByWidth = false;
			}else{
				var adjustedByWidth = true;
			}



			if(adjustedByWidth){
				// adjust image using width as reference	
				ßkresultingHeight  = ((contWidth * kenBurns) / curImgAspect);
				ßkresultingWidth = contWidth * kenBurns;

				ßresultingHeight = (contWidth/ curImgAspect);
				ßresultingWidth = contWidth ;

				var center = {
					top: Math.round((-1 * (( ßkresultingHeight - contHeight )/ 2)))+"px",
					left: Math.round((-1 * (( ßkresultingWidth - contWidth )/ 2)))+"px"
				}
			}else{
				// adjust image using height as reference		 	
				ßkresultingWidth = ((contHeight * kenBurns ) * curImgAspect);
				ßkresultingHeight  = contHeight * kenBurns;

				ßresultingWidth = (contHeight  * curImgAspect);
				ßresultingHeight  = contHeight;

			}
			var center = {
				ktop: Math.round((-1 * (( ßkresultingHeight - contHeight )/ 2))),
				kleft: Math.round((-1 * (( ßkresultingWidth - contWidth )/ 2))),
				top: Math.round((-1 * (( ßresultingHeight - contHeight )/ 2))),
				left: Math.round((-1 * (( ßresultingWidth - contWidth )/ 2)))
			}
			return {w:ßresultingWidth,h:ßresultingHeight,wk:ßkresultingWidth,hk:ßkresultingHeight,c:center};




		},
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	resize the elements to propper dimensions																									
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		
		resize : function(){
			var $this = this;

			$this.consoleOut("Resieze!!!!!");
			this.containerWidth = $(this.container).width();
			this.containerHeight = $(this.container).height();

			//$this.reload = true;

			if($this.currentImageIndex >= 0){

				//$this.reload();
				$this.reloadThisImage();
				//$this.goTo("-2")
				//var curImgSize = this.getImageResize($this.currentImageIndex);
				//alert(dump(curImgSize))
				//$($this.options.images[$this.currentImageIndex]["img"]).width(curImgSize.w).height(curImgSize.h);
			}



		},






//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	resize the elements to propper dimensions																									
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────	



//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	renders the thumbnails navigation menu																									
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		
		// showThumbNavigationMenu : function(){
		// var $this = this;
// 			
		// var thumbContainerWith = $(this.thumbContainer).width();
		// var thumbContainerHeith = $(this.thumbContainer).height();
// 			
		// //this.options.thumbNumber:4,
		// $this.thumbPreload();
		// if(this.imgLength > this.options.thumbNumber){
		// // More Slides (pictures) as space for them -> make them scrollable
		// $(this.thumbContainer).html("mas imagenes que miniaturas a mostrar");
		// }else{
		// $(this.thumbContainer).html("menos imagenes que miniaturas a mostrar");
// 				
		// var singleThumbWidth = Math.floor( thumbContainerWith /  this.options.thumbNumber);
// 				
		// var sumThumnbDiference = thumbContainerWith - (singleThumbWidth *  this.options.thumbNumber);
// 				
// 				
		// alert(singleThumbWidth +" "+ thumbContainerWith + " "+ sumThumnbDiference);
// 				
// 
// 			
		// for (var i = $this.thumbPreloadIndex - 1; i >= 0; i--){
		// //Things[i]
		// };
		// // Less or equal Slides than space for them -> not make them Slide
// 				
		// }
// 			
// 			
// 			
		// //$(this.thumbContainer).html("dddd ancho: "+thumbContainerWith+" alto: "+thumbContainerHeith)
// 			
// 			
// 
		// },		
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Preload the Thumbnails																					
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		
		// thumbPreload : function(ßcallback){
		// var $this = this;
// 			
		// var index = this.thumbPreloadIndex;
// 
		// this.consoleOut("Method: thumbnail preload index "+index  );
// 
		// if(  index < ($this.imgLength -1)){
// 							
		// $this.options.images[index]["thumbImg"] = new Image();
// 				
		// $($this.options.images[index]["thumbImg"]).load(function(){
		// $this.options.images[index]["thumbLoaded"]=true;
// 					
// 					
		// // calculate and safe the initial aspect Ration and proportions
		// $(this).removeAttr( "height" ).removeAttr( "width" ).css({"height":"","width":""});
		// $this.options.images[index]["thumbWidth"] = this.width
		// $this.options.images[index]["thumbHeight"] = this.height
		// $this.options.images[index]["thumbOriginalAspectRatio"] = this.width/this.height;
// 					
		// if(typeof(ßcallback) == "function"){
		// ßcallback();
		// }
		// $this.thumbPreloadIndex = $this.thumbPreloadIndex + 1 ;
		// $this.thumbPreload();
// 					
		// }).attr("src",this.options.images[index]["thumb"]);
		// }
// 
		// },		
// 		
// 		
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Preloads the next image and executes the callback																									
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		
		imagePreload : function (ßcallback){

			this.consoleOut("private method: imagePreload(callback)");
			var $this = this;
			if( (typeof(this.options.images[this.nextImageIndex]["loaded"]) == "undefined"  ) || (this.options.images[this.nextImageIndex]["loaded"]== false) ){
				this.showLoading();

				this.options.images[this.nextImageIndex]["img"] = new Image();

				$(this.options.images[this.nextImageIndex]["img"]).load(function(){
					$this.options.images[$this.nextImageIndex]["loaded"]=true;

					var div = $('<div id="img_index_'+$this.nextImageIndex+'"></div>');
					div.append($this.options.images[$this.nextImageIndex]["img"]);
					$this.options.images[$this.nextImageIndex]["div"] = div;

					// calculate and safe the initial aspect Ration and proportions
					$(this).removeAttr( "height" ).removeAttr( "width" ).css({"height":"","width":""});
					$this.options.images[$this.nextImageIndex]["width"] = this.width
					$this.options.images[$this.nextImageIndex]["height"] = this.height
					$this.options.images[$this.nextImageIndex]["originalAspectRatio"] = this.width/this.height;


					// add description element
					if(typeof($this.options.images[$this.nextImageIndex]["desc"]) != "undefined"){
						$this.options.images[$this.nextImageIndex]["desc"] = $('<div class="oSlideDescriptionDiv oSlideDescPosition" >'+ $this.options.images[$this.nextImageIndex]["desc"] +'</div>')
						var titlepos = 	"oSlideTitlePosition";
					}else{
						$this.options.images[$this.nextImageIndex]["desc"] = false;
						var titlepos = 	"oSlideDescPosition";
					}

					// add title element
					if(typeof($this.options.images[$this.nextImageIndex]["title"]) != "undefined"){
						$this.options.images[$this.nextImageIndex]["title"] = $('<div class="oSlideTitleDiv '+titlepos+' " >'+ $this.options.images[$this.nextImageIndex]["title"] +'</div>')
					}else{
						$this.options.images[$this.nextImageIndex]["title"] = false;
					}





					if(typeof(ßcallback) == "function"){
						ßcallback();
					}
				}).attr("src",this.options.images[this.nextImageIndex]["url"]);

			}else{
				if(typeof(ßcallback) == "function"){
					ßcallback();
				}
			}
		},



//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	make the next image visible																				
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────    	
		showNextImage:function(ßcallback){

			this.consoleOut("Show Next Image method: Current Image = "+ this.currentImageIndex + " Next Image = "+ this.nextImageIndex);
			var $this = this;

			var $callback = ßcallback;
			this.hideLoading();

			if($this.reload == true){
				$this.reload = false;
				//alert("reboot");
				$($this.options.images[$this.currentImageIndex]["div"]).remove();

			}

			var div = $this.options.images[$this.nextImageIndex]["div"];
			var sizes = $this.getImageResize($this.nextImageIndex);
			//alert(dump($this.getImageResize($this.nextImageIndex)));


			if(typeof($this.options.images[$this.currentImageIndex]) != "undefined"){
				var currentDiv = $this.options.images[$this.currentImageIndex]["div"];
				switchImages()
			}else{
				//var currentDiv = $this.initialDiv;
				//showInitialImage();
				initSwitchImages();
			}




			function timeoutToNextImage(){
				$this.isInImageTransition = false;
				$this.mainLoopTimer = setTimeout(function(){
					$callback();
				}, $this.options.timeBetweenAnimations);
			}

			function animateKenBurns(img,sizes){

				if(typeof($this.options.images[$this.nextImageIndex]["kenburns"]) != "undefined"){
					var kb = $this.options.images[$this.nextImageIndex]["kenburns"]
				}else{
					var kb = (Math.floor((Math.random()*17)+1)).toString() ;
				}
				$this.consoleOut("Ken Burns Animation:" + kb);
				if($this.options.kenBurns > 0){
					switch (kb){
						case "1": // zoom in top left
						default:
							img.css({  top : sizes.c.top, left:sizes.c.left,width:sizes.wk,height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "2": // zoom in top 
							img.css({  top : sizes.c.top, left:sizes.c.kleft,width:sizes.wk,height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "3": // zoom in top right
							img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "4": // zoom in right
							img.css({  top : sizes.c.ktop, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "5": // zoom in bottom right
							img.css({  bottom : sizes.c.top, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "6": // zoom in bottom
							img.css({  bottom : sizes.c.top, right:sizes.c.kleft, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "7":  // zoom in bottom left
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "8": // zoom in left
							img.css({  bottom : sizes.c.ktop, left:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "9": // zoom in center
							img.css({  bottom : sizes.c.ktop, left:sizes.c.kleft, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "10": // zoom out top left
							img.css({  top : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "11":  // zoom out top 
							img.css({  top : sizes.c.top, left:sizes.c.left,width:sizes.w,height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, left : sizes.c.kleft   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "12": // zoom out top right
							img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "13": // zoom out right
							img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.ktop, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "14": // zoom out bottom right
							img.css({  bottom : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "15": // zoom out bottom
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, left:sizes.c.kleft}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "16": // zoom out bottom left
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "17": // zoom out left
							img.css({  top : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.ktop, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "18": // zoom out center
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.ktop, left:sizes.c.kleft}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
							break;
						case "0":
							img.width(sizes.w).height(sizes.h).css({  top : sizes.c.top, left:sizes.c.left });
							break;
					}// end ken burns switch	

				}else{
					img.width(sizes.w).height(sizes.h);
					img.css({  top : sizes.c.top, left:sizes.c.left });
				}





				//img.transition({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed);
			}

			function addOutLink(img){
				// add outgoing link
				if(typeof($this.options.images[$this.nextImageIndex]["link"]) != "undefined"){
					var outLink = $this.options.images[$this.nextImageIndex]["link"];
					var title = $this.options.images[$this.nextImageIndex]["title"];
					var desc = $this.options.images[$this.nextImageIndex]["desc"];

					img.click(function(){
						window.location.href = outLink;
					}).css( 'cursor', 'pointer' );

					$(title).click(function(){
						window.location.href = outLink;
					}).css( 'cursor', 'pointer' );

					$(desc).click(function(){
						window.location.href = outLink;
					}).css( 'cursor', 'pointer' );


				}
			}

			function showTitles(){
				// show the and hide the title
				setTimeout(
					function(){
						$this.showTextDiv(
							$this.options.images[$this.nextImageIndex]["title"], // element
							$this.options.titleAnimationInSpeed, // show speed
							$this.options.titleAnimationOutSpeed, // hide Speed
							$this.options.titleTimeBeforeHide, // sleep time
							$this.options.titleAnimation // animation
						);
					} , $this.options.titleAnimationTimeOut );

				setTimeout(
					function(){
						$this.showTextDiv(
							$this.options.images[$this.nextImageIndex]["desc"], // element
							$this.options.descriptionAnimationInSpeed, // show speed
							$this.options.descriptionAnimationOutSpeed, // hide Speed
							$this.options.descriptionTimeBeforeHide, // sleep time
							$this.options.descriptionAnimation // animation
						);
					} , $this.options.descriptionAnimationTimeOut );
			}

			function removeTitles(){
				if(typeof($this.options.images[$this.currentImageIndex]) != "undefined"){
					$($this.options.images[$this.currentImageIndex]["title"]).stop(true).remove();
					$($this.options.images[$this.currentImageIndex]["desc"]).stop(true).remove();
				}
			}

			function switchImages(){

				//alert($this.fastResize);
				if($this.fastResize == true){
					var animateOutSpeed = 100;
					$this.fastResize = false;

				}else{
					var animateOutSpeed = $this.options.imageAnimationOutSpeed;
				}

				switch ($this.options.imageAnimation){

					case "fade":


						currentDiv.animate({   opacity:0},animateOutSpeed).queue(
							function() {
								removeTitles();
								$(this).remove();
								$($this.container).append(div);

								var img = $(div).find("img").first().css({position:"absolute"});

								addOutLink(img);

								div.css({opacity: 0}).animate({   opacity: 1  },$this.options.imageAnimationInSpeed).queue(
									function(){
										timeoutToNextImage();
										$(this).dequeue();
									}
								);

								animateKenBurns(img,sizes);


								showTitles()

								$(this).dequeue();

							}
						);



						break;



				}// end of switch					
			}

			function initSwitchImages(){
				switch ($this.options.openingAnimation){

					case "fade":
						$($this.container).append(div);
						var img = $(div).find("img").first().css({position:"absolute"});
						addOutLink(img);
						div.css({opacity: 0}).animate({   opacity: 1  },$this.options.imageAnimationInSpeed).queue(
							function(){
								timeoutToNextImage();
								$(this).dequeue();
							}
						);
						animateKenBurns(img,sizes);
						showTitles()

						break;

					case "TV":
						$($this.container).append(div);
						var img = $(div).find("img").first().css({position:"absolute"});
						addOutLink(img);
						div.css({height:0,overflow:"hidden",position:"relative",top:$this.containerHeight/2}).animate({height:$this.containerHeight,top:0} ,$this.options.imageAnimationInSpeed).queue(
							function(){
								timeoutToNextImage();
								$(div).css({"heigh":"","position":"","top":""})
								$(this).dequeue();
							}
						);
						animateKenBurns(img,sizes);
						showTitles()

						break;

				}// end of switch					
			}




		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	make the title for next image visible																				
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────    	
		showTextDiv:function($element,$showSpeed,$hideSpeed,$sleepTime,$animation){

			var $this = this;
			this.consoleOut("Show textDiv method"+ $($element).html() );

			if($element != false){

				var div = $this.options.images[$this.nextImageIndex]["div"];
				var textElement = $element;

				switch ($animation){

					case "fade":

						div.append(textElement);

						textElement.css({ opacity: 0 , 'z-index': this.options.baseZIndex+11 }).animate({ opacity: 1 },$showSpeed).queue(function(){
							// callback

							setTimeout(function(){
								textElement.animate({ opacity: 0 },$hideSpeed).queue(function(){
									$this.consoleOut("remove Element "+ $this.nextImageIndex+ "<============================================")
									$(this).remove();
								})
							},$sleepTime);


							$(this).dequeue();
						});

						break;

				}// end of switch			

			}else{

			}




		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Show next and previous arrows																								
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────    	

		showNavigationControls:function (){
			this.consoleOut("show Navigation Controls");

			var $this = this;

			var $nextButton = $('<div id="oSlideNextNavigation" class="oSlideNavigationControl"><div></div></div>')
			$this.container.append($nextButton);

			var $prewButton = $('<div id="oSlidePrewNavigation" class="oSlideNavigationControl"><div></div></div>')
			$this.container.append($prewButton);

			if($this.options.allowFullScreen == true){
				var $zoomButton = $('<div id="oSlideZoomButton"></div>');
				$this.container.append($zoomButton);
				$zoomButton.css({'z-index': this.options.baseZIndex+10 });
				$($zoomButton).click(function(){
					if($this.isFullScreen == false){
						$this.isFullScreen = true;
						$this.consoleOut("Click on navigation controls Full Screen")
						//$timeLeft = options.sleep
						//alert("fullScreen");
						$this.goFullScreen();
					}else{
						$this.isFullScreen = false;
						$this.consoleOut("Click on navigation controls Exit fullScreen")
						//$timeLeft = options.sleep
						//alert("fullScreen");
						$this.exitFullScreen();
					}

				});
			}

			$nextButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10 ,postion:"absolute",top:0,right:0}).find("div").css({"top": ( (this.containerHeight /2 )-30 ) });
			$prewButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10 ,postion:"absolute",top:0,left:0}).find("div").css({"top": ( (this.containerHeight /2 )-30 ) });

			$($nextButton).click(function(){
				$this.consoleOut("Click on navigation controls NEXT")
				//$timeLeft = options.sleep
				$this.next();
			});

			$($prewButton).click(function(){
				$this.consoleOut("Click on navigation controls Prew")
				//$timeLeft = options.sleep
				$this.previous();

			});

			if(this.options.alwaysSowNavigationControls != true){
				if($this.options.allowFullScreen == true){
					$zoomButton.hide();
					$this.container.hover(function(){
						$zoomButton.stop(true,true).fadeIn();
					}, function(){
						$zoomButton.stop(true,true).fadeOut();
					});
				}
				$nextButton.hide();
				$prewButton.hide();
				$this.container.hover(function(){
					$nextButton.stop(true,true).fadeIn();
					$prewButton.stop(true,true).fadeIn();
				}, function(){
					$nextButton.stop(true,true).fadeOut();
					$prewButton.stop(true,true).fadeOut();
				});
			}


		},




//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Load the Next image																								
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────    	
		SlideNext:function(ßcallback){



			this.consoleOut("SlideNext() $currentImage: "+this.currentImageIndex +" $nextImage: "+this.nextImageIndex );

			var $this = this;
			if(this.isInImageTransition != true){
				this.isInImageTransition = true;

				clearTimeout(this.mainLoopTimer);

				//clearTimeout(this.titleTimer);
				//clearTimeout(this.descTimer);


				if($this.slideStarted != true ){ // first time runing this instance
					$this.slideStarted = true;

					$this.nextImageIndex = 0;
					$this.currentImageIndex = -1;

				}else{

					if( ( typeof(ßcallback) == "string" ) || (typeof(ßcallback) == "number" ) ){
						var val = ßcallback;
					}

					if(val == "-1"){
						if($this.nextImageIndex == 0){
							$this.currentImageIndex = $this.nextImageIndex;
							$this.nextImageIndex = $this.imgLength -1;
						}else{
							$this.currentImageIndex = $this.nextImageIndex;
							$this.nextImageIndex = $this.nextImageIndex -1;
						}
					}else if ((typeof(val) == "number") && (val <= ($this.imgLength -1))){
						$this.currentImageIndex = $this.nextImageIndex;
						$this.nextImageIndex = val
					}else if (val == "-2"){ // reload
						$this.reload = true;
					}else{
						if($this.nextImageIndex == $this.imgLength -1){
							$this.currentImageIndex = $this.nextImageIndex;
							$this.nextImageIndex = 0;
						}else{
							$this.currentImageIndex = $this.nextImageIndex;
							$this.nextImageIndex = $this.nextImageIndex +1;
						}
					}
				}


				this.imagePreload(function(){
					//$this.imageTransition();

					$this.showNextImage(function(){
						//$this.imageTransition();
						$this.SlideNext();
					});

					if(typeof(ßcallback) == "function" ){
						ßcallback();
					}
				});


			}
		},


		next : function(){

			this.SlideNext("+1");
		},
		reloadThisImage : function(){
			this.SlideNext("-2");
		},
		previous : function(){

			this.SlideNext("-1");
		},
		goTo : function(i){

			this.SlideNext(i);
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Go fullscreen																						
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────   
		goFullScreen:function(ßcallback){

			this.consoleOut("Go FullScreen");

			var $this = this;
			$this.isFullScreen = true;
			$('body').css("overflow","hidden");

			$this.fulscreenContainer = $('<div id="oslideFullScreenContainer" style="position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:'+ parseFloat($this.options.baseZIndex + 10 )+'"></div>');
			$($this.fulscreenContainer).css({'background':"black"})
			$('body').prepend($this.fulscreenContainer);
			$($this.fulscreenContainer).append($this.container).addClass("oSlideFullScreen");
			$($this.container).css({"width":"100%","height":"100%"});

			if($this.isInImageTransition == true){
				setTimeout(function(){
					//alert("ss");
					//$this.resize();
				},$this.options.imageAnimationInSpeed + $this.options.imageAnimationOutSpeed);
			}else{
				$this.resize();
			}



		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Exit fullscreen																						
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────   
		exitFullScreen:function(ßcallback){

			this.consoleOut("Go FullScreen");

			var $this = this;
			$this.isFullScreen = false;
			$('body').css({"overflow":""});


			$($this.Originalcontainer).append($this.container);


			var tempcontainerWidth = $($this.Originalcontainer).width();
			var tempcontainerHeight = $($this.Originalcontainer).height();

			$($this.container).width(tempcontainerWidth).height(tempcontainerHeight);

			$($this.fulscreenContainer).remove();






			$this.resize();



		},


//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
	}// end of oSlide


	$.fn.oSlide = function(options){
		var elementLength = $(this).length;


		if (!elementLength) {
			return this;
		}else if(elementLength == 1){

			var element = $(this);

			// Return early if this element already has a plugin instance
			if (element.data('JsObj')) return;

			// pass options to plugin constructor
			var myplugin = new oSlide(this, options); /// odo sustituir this por element

			// Store plugin object in this element's data
			element.data('JsObj', myplugin);



		}else if(elementLength > 1){
			// ejecutar oslide con imagesnes como parametros
			var elementGroups = {};
			$(this).each(function(){
				var rel = $(this).attr('rel') || '';
				if(typeof(elementGroups[rel]) == "undefined"){
					elementGroups[rel] = new Array();
				}

				elementGroups[rel].push({
					url:$(this).attr("href"),
					thumb:$(this).children().attr("src"),
					title:$(this).attr("title"),
					desc:$(this).attr("alt"),
					link:$(this).attr("link"),
					kenburns : $(this).attr("kenburns"),
					obj:$(this)
				});
				//$(this).remove();

			});

			for(var j in elementGroups){

				var opts = {
					images:elementGroups[j]
				}
				$.extend(opts,options);

				var container = false;
				if(typeof(opts["container"]) != "undefined"){
					container = $(opts["container"]);
				}else{
					container = $(elementGroups[j][0]["obj"]).parent().empty();
				}

				// Return early if this element already has a plugin instance
				if (container.data('JsObj')) return;
				// pass options to plugin constructor
				var myplugin = new oSlide(container, opts); /// odo sustituir this por element

				// Store plugin object in this element's data
				container.data('JsObj', myplugin);
			}

		}
	};
})(jQuery);




