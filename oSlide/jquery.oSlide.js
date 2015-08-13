/** @preserve
 * oSlide - jQuery Plugin
 * A slideshow designet for the frontside of my protfolio
 *
 * Copyright (c) 2011 Andrés Bott
 * Examples and documentation at: http://andresbott.com or http://oslide.andresbott.com
 * 
 * Version: 1.0.1
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
   	   		loadingAnimationSpeed:80,
   	   		loadingAnimationImages:12,
   	   		
   	   		enableNavigationControls:true,
   	   		alwaysSowNavigationControls:false,
   	   		
   	   		timeBetweenAnimations:6000,
   	   		kenBurns:0, // 0 to deactivate
   	   		images : false,
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
		this.container = $container
		this.loading = false; 
		this.loadingFrame = 0;
		this.resizeTimeout = false;
		this.isInImageTransition = false;
		this.currentImageIndex = -1;
		this.nextImageIndex = 0;
		this.slideStarted = false; // controls if the loop has started
		this.mainLoopTimer = false; //holds the main timer	
		this.imgLength = 0; // instance constant to know how many images are defiend
		this.initialDiv = false // holds the inital div without image;
		this.containerWidth = 0	 // container sizes		
		this.containerHeight = 0


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
    			'z-index': this.options.baseZIndex,
    		})
    		
  		
    		this.showLoading();
   		
    		this.resize();
    		$(window).resize(function(){
    			if($this.resizeTimeout == false){
    				$this.resizeTimeout = true;
    				setTimeout(function(){
 						$this.resize();
    					$this.resizeTimeout = false;
    				},500)
    			}
    		})
    		
    		this.imgLength =  $(this.options.images).size();
    		
    		
    		this.initialDiv =  $('<div style ="background:red; position:absolute;top:0px; left:0px; width: 100%; height: 100000px"></div>');
    		this.container.append(this.initialDiv);

    		

					
					
					
    		
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
		
			// add a div for the loading animation
			if(this.loading==false){
				$(this.container).append(
					this.loading = $('<div id="oSlide-loading" style="z-index:'+ parseFloat(this.options.baseZIndex + 1 )+'; overflow : hidden; display : none " ></div>')
				);

				$(this.loading).append(
					this.loadingImg = $('<div id="oSlide-loading-image" style="position:absolute;top:0px; left:0px;" ></div>')
				);
			 }

			if(typeof(this.loadingTimer)!="undefined"){
				clearInterval(this.loadingTimer);
			}

			this.loading.show();
			var $this = this;
			this.loadingTimer = setInterval(function(){ $this.animateLoading() } , this.options.loadingAnimationSpeed);
		},


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Stops the loading animation																							
// 																														
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		hideLoading : function (){
			this.consoleOut(" method: hideLoading() ");
			this.loading.hide();
			clearInterval(this.loadingTimer);
		},
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	animate the loading 																									
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		animateLoading : function (){
			//this.consoleOut("method: animeate Loading ");
			if (!this.loading.is(':visible')){
				clearInterval(this.loadingTimer);
				return;
			}

			this.loadingImg.css('top', (this.loadingFrame * -40) + 'px');
			this.loadingFrame = (this.loadingFrame + 1) % this.options.loadingAnimationImages;
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
					left: Math.round((-1 * (( ßresultingWidth - contWidth )/ 2))),
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
			   					
			this.containerWidth = $(this.container).width();			
			this.containerHeight = $(this.container).height();
			
			if($this.currentImageIndex >= 0){
				var curImgSize = this.getImageResize($this.currentImageIndex);
				alert(dump(curImgSize))
				//$($this.options.images[$this.currentImageIndex]["img"]).width(curImgSize.w).height(curImgSize.h);
			}
			
			

		},

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
//	inserts the image and deletes the previous controlling the timers																									
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		

	imageTransition: function ()	{
		this.consoleOut("method: imageTransition()");
		
		var $this = this;



		
		this.showNextImage(function(){
			//$this.imageTransition();

			if($this.slideStarted != true ){ // first time runing this instance
				$this.slideStarted = true;
				//this.currentImageIndex = -1;
				//this.nextImageIndex = 0;
				if($this.imgLength > 1){
					$this.nextImageIndex = 1;
					$this.currentImageIndex = 0;
					$this.SlideNext();
				}
			}else{
				// if last image
				if($this.nextImageIndex == $this.imgLength -1){
					$this.currentImageIndex = $this.nextImageIndex;	
					$this.nextImageIndex = 0;									
				}else{
					$this.currentImageIndex = $this.nextImageIndex;	
					$this.nextImageIndex = $this.nextImageIndex +1;						
				}
				$this.SlideNext();
			}
			
			
		});
					

						
		//this.transitionToImage( $this.currentImageIndex , $this.nextImageIndex , this.options.animation )

			// if($nextImage==$imagenes.length-1){
				// $currentImage = $nextImage;
				// $nextImage = 0;
			// }else{
				// $currentImage = $nextImage;
				// $nextImage = $nextImage +1;
			// }
			
			// $startTimeMS = (new Date()).getTime();
			// if( ($mouseIsOverContainer == false && options.mouseOverStopSlide == true)  ||  (options.mouseOverStopSlide == false ) ){
				// $mainLoopTimer =  setTimeout( $thisObj.SlideNext,options.sleep);
			// }
			
			
			
			
			// if($MainLoopTimer=="inactive" && $eventMouseOver==false){
				// $MainLoopTimer="active";
				
				
			// }
		  
			
	},
		

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	transition to another image																								
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────		

	transitionToImage : function ($currentImage,$nextImage,$animation){
		this.consoleOut("private method: transitionToImage("+$currentImage+","+$nextImage+","+$animation+")");


alert("si lees esto algo esta mal")
			// if($loopStarted!=true){ // first time run
				// var ßfirstrunDummy = $('<div><div style="opacity:0; filter:alpha(opacity=0); position:absolute;" ></div></div>');
				// var fadeSpeed = 1;
				// var currenImageElement= ßfirstrunDummy;
				// $($oSlideDiv).append(ßfirstrunDummy);
				// $loopStarted = true;
			// }else{
				// var fadeSpeed = options.fade_time;
				// var currenImageElement = $imagenes[$currentImage]["node"];
			// }
			
			//var currentImageNode = $(currenImageElement).children().first();	

			
			// if(typeof($imagenes[$nextImage]["link"])!="undefined"){
				// // has link
// 				
				// //$imagenes[$nextImage]["node"] = $('<div></div>');
				// $imagenes[$nextImage]["node"] = $('<a href="'+$imagenes[$nextImage]["link"]+'" ></a>');
			// }else{
				// $imagenes[$nextImage]["node"] = $('<div></div>');
			// }
// 
			// var ßtmpDivNode = $(' <div id="oSilideImg_'+$nextImage+'"  style="opacity:0; filter:alpha(opacity=0); position:absolute; overflow:hidden; text-align:center" ></div>');
			// $(ßtmpDivNode).width($container_width).height($container_height);
			// $($imagenes[$nextImage]["node"]).append(ßtmpDivNode);
			// $(ßtmpDivNode).append($imagenes[$nextImage]["img"]);
// 
// 
			// $($oSlideDiv).append( $imagenes[$nextImage]["node"] );
// 
			// var imageSizes = imgResize($imagenes[$nextImage]["img"],$container_height,$container_width,$imagenes[$nextImage]["width"]/$imagenes[$nextImage]["height"]);
			// var nextImageNode = $($imagenes[$nextImage]["node"]).children().first();
// 			

		
/* ############################################################################################################################3 */
/* ##   Starting the transition definitions*/
/* ############################################################################################################################3 */

	
		switch ($animation){
		  
		case "crosfade":
			
			// $(nextImageNode).animate({opacity:1},options.fade_time*2,function(){
				// $(currenImageElement).remove();
// 				
				// $isInTransition = false;
// 				
// 				
// 				
				// if(options.enableNavigationBar == true){
						// $($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
						// $($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
				// }
// 
			// });

		break;


		case "slideright":
			if(options.logicSliding == true && $slidingBack == true){
				$slidingBack = false;
				transitionToImage($currentImage,$nextImage,"slideleft");
				break;
			}
			
			$(currentImageNode).animate({ "left": $container_width},{ duration: options.fade_time   ,queue : false,  complete: function() {
							$(currenImageElement).remove();	
			}});
	
			$(nextImageNode).css({opacity:1,"left": (-1 *$container_width)}).animate({ "left":0},{ duration: options.fade_time ,queue : false,  complete: function() {
	
					$isInTransition = false;
					if(options.enableNavigationBar == true){
							$($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
							$($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
					}
	
			}});		
		
		break;
		
				
		case "slideleft":
			if(options.logicSliding == true && $slidingBack == true){
				$slidingBack = false;
				transitionToImage($currentImage,$nextImage,"slideright");
				break;
			}
			
			removeCaption(function(){
				$(currentImageNode).animate({ "left":(-1 * $container_width)},{ duration: options.fade_time   ,queue : false,  complete: function() {
								$(currenImageElement).remove();	
	
				}});
		
				$(nextImageNode).css({opacity:1,"left":$container_width}).animate({ "left":0},{ duration: options.fade_time ,queue : false,  complete: function() {
		
						$isInTransition = false;
						insertCaption();
						if(options.enableNavigationBar == true){
								$($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
								$($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
						}
		
				}});					
			});
	
		
		break;
		
		case "slidedown":
			if(options.logicSliding == true && $slidingBack == true){
				$slidingBack = false;
				transitionToImage($currentImage,$nextImage,"slideup");
				break;
			}
			
			$(currentImageNode).animate({ "top":$container_height},{ duration: options.fade_time   ,queue : false,  complete: function() {
							$(currenImageElement).remove();	
			}});
	
			$(nextImageNode).css({opacity:1,"top":(-1*$container_height)}).animate({ "top":0},{ duration: options.fade_time ,queue : false,  complete: function() {
	
					$isInTransition = false;
					if(options.enableNavigationBar == true){
							$($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
							$($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
					}
	
			}});
		break;
		
		case "slideup":
		if(options.logicSliding == true && $slidingBack == true){
			$slidingBack = false;
			transitionToImage($currentImage,$nextImage,"slidedown");
			break;
		}
		$(currentImageNode).animate({ "top":(-1*$container_height)},{ duration: options.fade_time ,queue : false,  complete: function() {
						$(currenImageElement).remove();	
		}});
		$(nextImageNode).css({opacity:1,  "top":($container_height )  }).animate({ "top":0},{ duration: options.fade_time ,queue : false,  complete: function() {

				$isInTransition = false;
				if(options.enableNavigationBar == true){
						$($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
						$($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
				}

		}});
		break;		
					  
		default: // "fade"

			currentImageNode.fadeOut(fadeSpeed /2,function (){
				$(currenImageElement).remove();
				$(nextImageNode).animate({opacity:1},options.fade_time/2,function(){
						$($oSlideDiv).addClass("oSlideFadeColorBackround");
						if(options.fadeColorBrackgroundColor != false){
								$($oSlideDiv).css("background",options.fadeColorBrackgroundColor);
						}

						$isInTransition = false;
						if(options.enableNavigationBar == true){
								$($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
								$($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
						}						

					
				});

		
			});
			break;
				    
		}// end switch

	},// end function


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	make the next image visible																				
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────    	
		showNextImage:function(ßcallback){
			this.consoleOut("Show Next Image method: Current Image = "+ this.currentImageIndex + " Next Image = "+ this.nextImageIndex);
			var $this = this;
			
			
			if(typeof($this.options.images[$this.currentImageIndex]) != "undefined"){
				var currentDiv = $this.options.images[$this.currentImageIndex]["div"];
			}else{
				var currentDiv = $this.initialDiv;
			}
			

			var $callback = ßcallback;
			this.hideLoading();
		
		
			var div = $this.options.images[$this.nextImageIndex]["div"];
			var sizes = $this.getImageResize($this.nextImageIndex);
			//alert(dump($this.getImageResize($this.nextImageIndex)));
			
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
				
			

				
				
				if($this.options.kenBurns > 0){
					switch (kb){
						case "1": // zoom in top left
						default:
							img.css({  top : sizes.c.top, left:sizes.c.left,width:sizes.wk,height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;
						case "2": // zoom in top 
							img.css({  top : sizes.c.top, left:sizes.c.kleft,width:sizes.wk,height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;
						case "3": // zoom in top right
							img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "4": // zoom in right
							img.css({  top : sizes.c.ktop, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "5": // zoom in bottom right
							img.css({  bottom : sizes.c.top, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;			
						case "6": // zoom in bottom
							img.css({  bottom : sizes.c.top, right:sizes.c.kleft, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "7":  // zoom in bottom left
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;		
						case "8": // zoom in left
							img.css({  bottom : sizes.c.ktop, left:sizes.c.left, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "9": // zoom in center
							img.css({  bottom : sizes.c.ktop, left:sizes.c.kleft, width:sizes.wk, height:sizes.hk }).transition({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "10": // zoom out top left
							img.css({  top : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, left : sizes.c.left   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;
						case "11":  // zoom out top 
							img.css({  top : sizes.c.top, left:sizes.c.left,width:sizes.w,height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, left : sizes.c.kleft   }, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;
						case "12": // zoom out top right
							img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "13": // zoom out right
							img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.ktop, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "14": // zoom out bottom right
							img.css({  bottom : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, right:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;			
						case "15": // zoom out bottom
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, left:sizes.c.kleft}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "16": // zoom out bottom left
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;		
						case "17": // zoom out left
							img.css({  top : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.ktop, left:sizes.c.left}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
						break;	
						case "18": // zoom out center
							img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).transition({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.ktop, left:sizes.c.kleft}, $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed,"linear");
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
					img.click(function(){
						window.location.href = $this.options.images[$this.nextImageIndex]["link"];
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

			switch (this.options.imageAnimation){
			  
				case "fade":
							

						currentDiv.transit({   opacity:0},this.options.imageAnimationOutSpeed).queue(
							function() {
								$(this).remove();
								$($this.container).append(div);
								
								var img = $(div).find("img").first().css({position:"absolute"});
								
								addOutLink(img);
					
								div.css({opacity: 0}).transition({   opacity: 1  },$this.options.imageAnimationInSpeed).queue(
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
					textElement.css({ opacity: 0 }).transition({ opacity: 1 },$showSpeed).queue(function(){
						// callback
						setTimeout(function(){
							textElement.transition({ opacity: 0 },$hideSpeed).queue(function(){
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
		
		$nextButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10, "top": ( (this.containerHeight /2 )-30 ) });
		$prewButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10, "top": ( (this.containerHeight /2 )-30 ) })

		$($nextButton).click(function(){
			$this.consoleOut("Click on navigation controls NEXT")
			//$timeLeft = options.sleep
			$this.SlideNext();
		});
		
		$($prewButton).click(function(){
			$this.consoleOut("Click on navigation controls Prew")
			//$timeLeft = options.sleep
			$this.SlidePrew();

		});
		
		if(this.options.alwaysSowNavigationControls != true){
			$nextButton.hide();
			$prewButton.hide();
		}

		$this.container.hover(function(){
			$nextButton.stop(true,true).fadeIn();
			$prewButton.stop(true,true).fadeIn();
		}, function(){
			$nextButton.stop(true,true).fadeOut();
			$prewButton.stop(true,true).fadeOut();
		});
	},
	
	
	
								
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														
//	Load the Next image																								
// 																													
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────    	
	 	SlideNext:function(ßcallback){

			this.consoleOut(" public method: SlideNext() $nextImage: "+this.nextImageIndex+" $currentImage: "+this.currentImageIndex );
			
			var $this = this;
			if(this.isInImageTransition != true){
				this.isInImageTransition = true;

				clearTimeout(this.mainLoopTimer);
	
				this.imagePreload(function(){
					$this.imageTransition();
					if(typeof(ßcallback) == "function" ){
						ßcallback();
					}
				});
			}
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
					obj:$(this),
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






//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################
//########################################################################################################################################################################################################

// Delegate .transition() calls to .animate()
// if the browser can't do CSS transitions.
if (!$.support.transition)
  $.fn.transition = $.fn.animate;



/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */

(function($) {
  $.transit = {
    version: "0.9.9",

    // Map of $.css() keys to values for 'transitionProperty'.
    // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
    propertyMap: {
      marginLeft    : 'margin',
      marginRight   : 'margin',
      marginBottom  : 'margin',
      marginTop     : 'margin',
      paddingLeft   : 'padding',
      paddingRight  : 'padding',
      paddingBottom : 'padding',
      paddingTop    : 'padding'
    },

    // Will simply transition "instantly" if false
    enabled: true,

    // Set this to false if you don't want to use the transition end property.
    useTransitionEnd: false
  };

  var div = document.createElement('div');
  var support = {};

  // Helper function to get the proper vendor property name.
  // (`transition` => `WebkitTransition`)
  function getVendorPropertyName(prop) {
    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) return prop;

    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
    var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

    if (prop in div.style) { return prop; }

    for (var i=0; i<prefixes.length; ++i) {
      var vendorProp = prefixes[i] + prop_;
      if (vendorProp in div.style) { return vendorProp; }
    }
  }

  // Helper function to check if transform3D is supported.
  // Should return true for Webkits and Firefox 10+.
  function checkTransform3dSupport() {
    div.style[support.transform] = '';
    div.style[support.transform] = 'rotateY(90deg)';
    return div.style[support.transform] !== '';
  }

  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  // Check for the browser's transitions support.
  support.transition      = getVendorPropertyName('transition');
  support.transitionDelay = getVendorPropertyName('transitionDelay');
  support.transform       = getVendorPropertyName('transform');
  support.transformOrigin = getVendorPropertyName('transformOrigin');
  support.transform3d     = checkTransform3dSupport();

  var eventNames = {
    'transition':       'transitionEnd',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  // Detect the 'transitionend' event needed.
  var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

  // Populate jQuery's `$.support` with the vendor prefixes we know.
  // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
  // we set $.support.transition to a string of the actual property name used.
  for (var key in support) {
    if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
      $.support[key] = support[key];
    }
  }

  // Avoid memory leak in IE.
  div = null;

  // ## $.cssEase
  // List of easing aliases that you can use with `$.fn.transition`.
  $.cssEase = {
    '_default':       'ease',
    'in':             'ease-in',
    'out':            'ease-out',
    'in-out':         'ease-in-out',
    'snap':           'cubic-bezier(0,1,.5,1)',
    // Penner equations
    'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
    'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
    'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
    'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
    'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
    'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
    'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
    'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
    'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
    'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
    'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
    'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
    'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
    'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
    'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
    'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
    'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
    'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
    'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
    'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
    'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
    'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
    'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
  };

  // ## 'transform' CSS hook
  // Allows you to use the `transform` property in CSS.
  //
  //     $("#hello").css({ transform: "rotate(90deg)" });
  //
  //     $("#hello").css('transform');
  //     //=> { rotate: '90deg' }
  //
  $.cssHooks['transit:transform'] = {
    // The getter returns a `Transform` object.
    get: function(elem) {
      return $(elem).data('transform') || new Transform();
    },

    // The setter accepts a `Transform` object or a string.
    set: function(elem, v) {
      var value = v;

      if (!(value instanceof Transform)) {
        value = new Transform(value);
      }

      // We've seen the 3D version of Scale() not work in Chrome when the
      // element being scaled extends outside of the viewport.  Thus, we're
      // forcing Chrome to not use the 3d transforms as well.  Not sure if
      // translate is affectede, but not risking it.  Detection code from
      // http://davidwalsh.name/detecting-google-chrome-javascript
      if (support.transform === 'WebkitTransform' && !isChrome) {
        elem.style[support.transform] = value.toString(true);
      } else {
        elem.style[support.transform] = value.toString();
      }

      $(elem).data('transform', value);
    }
  };

  // Add a CSS hook for `.css({ transform: '...' })`.
  // In jQuery 1.8+, this will intentionally override the default `transform`
  // CSS hook so it'll play well with Transit. (see issue #62)
  $.cssHooks.transform = {
    set: $.cssHooks['transit:transform'].set
  };

  // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
  // be necessary.
  if ($.fn.jquery < "1.8") {
    // ## 'transformOrigin' CSS hook
    // Allows the use for `transformOrigin` to define where scaling and rotation
    // is pivoted.
    //
    //     $("#hello").css({ transformOrigin: '0 0' });
    //
    $.cssHooks.transformOrigin = {
      get: function(elem) {
        return elem.style[support.transformOrigin];
      },
      set: function(elem, value) {
        elem.style[support.transformOrigin] = value;
      }
    };

    // ## 'transition' CSS hook
    // Allows you to use the `transition` property in CSS.
    //
    //     $("#hello").css({ transition: 'all 0 ease 0' });
    //
    $.cssHooks.transition = {
      get: function(elem) {
        return elem.style[support.transition];
      },
      set: function(elem, value) {
        elem.style[support.transition] = value;
      }
    };
  }

  // ## Other CSS hooks
  // Allows you to rotate, scale and translate.
  registerCssHook('scale');
  registerCssHook('translate');
  registerCssHook('rotate');
  registerCssHook('rotateX');
  registerCssHook('rotateY');
  registerCssHook('rotate3d');
  registerCssHook('perspective');
  registerCssHook('skewX');
  registerCssHook('skewY');
  registerCssHook('x', true);
  registerCssHook('y', true);

  // ## Transform class
  // This is the main class of a transformation property that powers
  // `$.fn.css({ transform: '...' })`.
  //
  // This is, in essence, a dictionary object with key/values as `-transform`
  // properties.
  //
  //     var t = new Transform("rotate(90) scale(4)");
  //
  //     t.rotate             //=> "90deg"
  //     t.scale              //=> "4,4"
  //
  // Setters are accounted for.
  //
  //     t.set('rotate', 4)
  //     t.rotate             //=> "4deg"
  //
  // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
  // functions.
  //
  //     t.toString()         //=> "rotate(90deg) scale(4,4)"
  //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
  //
  function Transform(str) {
    if (typeof str === 'string') { this.parse(str); }
    return this;
  }

  Transform.prototype = {
    // ### setFromString()
    // Sets a property from a string.
    //
    //     t.setFromString('scale', '2,4');
    //     // Same as set('scale', '2', '4');
    //
    setFromString: function(prop, val) {
      var args =
        (typeof val === 'string')  ? val.split(',') :
        (val.constructor === Array) ? val :
        [ val ];

      args.unshift(prop);

      Transform.prototype.set.apply(this, args);
    },

    // ### set()
    // Sets a property.
    //
    //     t.set('scale', 2, 4);
    //
    set: function(prop) {
      var args = Array.prototype.slice.apply(arguments, [1]);
      if (this.setter[prop]) {
        this.setter[prop].apply(this, args);
      } else {
        this[prop] = args.join(',');
      }
    },

    get: function(prop) {
      if (this.getter[prop]) {
        return this.getter[prop].apply(this);
      } else {
        return this[prop] || 0;
      }
    },

    setter: {
      // ### rotate
      //
      //     .css({ rotate: 30 })
      //     .css({ rotate: "30" })
      //     .css({ rotate: "30deg" })
      //     .css({ rotate: "30deg" })
      //
      rotate: function(theta) {
        this.rotate = unit(theta, 'deg');
      },

      rotateX: function(theta) {
        this.rotateX = unit(theta, 'deg');
      },

      rotateY: function(theta) {
        this.rotateY = unit(theta, 'deg');
      },

      // ### scale
      //
      //     .css({ scale: 9 })      //=> "scale(9,9)"
      //     .css({ scale: '3,2' })  //=> "scale(3,2)"
      //
      scale: function(x, y) {
        if (y === undefined) { y = x; }
        this.scale = x + "," + y;
      },

      // ### skewX + skewY
      skewX: function(x) {
        this.skewX = unit(x, 'deg');
      },

      skewY: function(y) {
        this.skewY = unit(y, 'deg');
      },

      // ### perspectvie
      perspective: function(dist) {
        this.perspective = unit(dist, 'px');
      },

      // ### x / y
      // Translations. Notice how this keeps the other value.
      //
      //     .css({ x: 4 })       //=> "translate(4px, 0)"
      //     .css({ y: 10 })      //=> "translate(4px, 10px)"
      //
      x: function(x) {
        this.set('translate', x, null);
      },

      y: function(y) {
        this.set('translate', null, y);
      },

      // ### translate
      // Notice how this keeps the other value.
      //
      //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
      //
      translate: function(x, y) {
        if (this._translateX === undefined) { this._translateX = 0; }
        if (this._translateY === undefined) { this._translateY = 0; }

        if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
        if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

        this.translate = this._translateX + "," + this._translateY;
      }
    },

    getter: {
      x: function() {
        return this._translateX || 0;
      },

      y: function() {
        return this._translateY || 0;
      },

      scale: function() {
        var s = (this.scale || "1,1").split(',');
        if (s[0]) { s[0] = parseFloat(s[0]); }
        if (s[1]) { s[1] = parseFloat(s[1]); }

        // "2.5,2.5" => 2.5
        // "2.5,1" => [2.5,1]
        return (s[0] === s[1]) ? s[0] : s;
      },

      rotate3d: function() {
        var s = (this.rotate3d || "0,0,0,0deg").split(',');
        for (var i=0; i<=3; ++i) {
          if (s[i]) { s[i] = parseFloat(s[i]); }
        }
        if (s[3]) { s[3] = unit(s[3], 'deg'); }

        return s;
      }
    },

    // ### parse()
    // Parses from a string. Called on constructor.
    parse: function(str) {
      var self = this;
      str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
        self.setFromString(prop, val);
      });
    },

    // ### toString()
    // Converts to a `transition` CSS property string. If `use3d` is given,
    // it converts to a `-webkit-transition` CSS property string instead.
    toString: function(use3d) {
      var re = [];

      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          // Don't use 3D transformations if the browser can't support it.
          if ((!support.transform3d) && (
            (i === 'rotateX') ||
            (i === 'rotateY') ||
            (i === 'perspective') ||
            (i === 'transformOrigin'))) { continue; }

          if (i[0] !== '_') {
            if (use3d && (i === 'scale')) {
              re.push(i + "3d(" + this[i] + ",1)");
            } else if (use3d && (i === 'translate')) {
              re.push(i + "3d(" + this[i] + ",0)");
            } else {
              re.push(i + "(" + this[i] + ")");
            }
          }
        }
      }

      return re.join(" ");
    }
  };

  function callOrQueue(self, queue, fn) {
    if (queue === true) {
      self.queue(fn);
    } else if (queue) {
      self.queue(queue, fn);
    } else {
      fn();
    }
  }

  // ### getProperties(dict)
  // Returns properties (for `transition-property`) for dictionary `props`. The
  // value of `props` is what you would expect in `$.css(...)`.
  function getProperties(props) {
    var re = [];

    $.each(props, function(key) {
      key = $.camelCase(key); // Convert "text-align" => "textAlign"
      key = $.transit.propertyMap[key] || $.cssProps[key] || key;
      key = uncamel(key); // Convert back to dasherized

      if ($.inArray(key, re) === -1) { re.push(key); }
    });

    return re;
  }

  // ### getTransition()
  // Returns the transition string to be used for the `transition` CSS property.
  //
  // Example:
  //
  //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
  //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
  //
  function getTransition(properties, duration, easing, delay) {
    // Get the CSS properties needed.
    var props = getProperties(properties);

    // Account for aliases (`in` => `ease-in`).
    if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

    // Build the duration/easing/delay attributes for it.
    var attribs = '' + toMS(duration) + ' ' + easing;
    if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

    // For more properties, add them this way:
    // "margin 200ms ease, padding 200ms ease, ..."
    var transitions = [];
    $.each(props, function(i, name) {
      transitions.push(name + ' ' + attribs);
    });

    return transitions.join(', ');
  }

  // ## $.fn.transition
  // Works like $.fn.animate(), but uses CSS transitions.
  //
  //     $("...").transition({ opacity: 0.1, scale: 0.3 });
  //
  //     // Specific duration
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
  //
  //     // With duration and easing
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
  //
  //     // With callback
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
  //
  //     // With everything
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
  //
  //     // Alternate syntax
  //     $("...").transition({
  //       opacity: 0.1,
  //       duration: 200,
  //       delay: 40,
  //       easing: 'in',
  //       complete: function() { /* ... */ }
  //      });
  //
  $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
    var self  = this;
    var delay = 0;
    var queue = true;

    // Account for `.transition(properties, callback)`.
    if (typeof duration === 'function') {
      callback = duration;
      duration = undefined;
    }

    // Account for `.transition(properties, duration, callback)`.
    if (typeof easing === 'function') {
      callback = easing;
      easing = undefined;
    }

    // Alternate syntax.
    if (typeof properties.easing !== 'undefined') {
      easing = properties.easing;
      delete properties.easing;
    }

    if (typeof properties.duration !== 'undefined') {
      duration = properties.duration;
      delete properties.duration;
    }

    if (typeof properties.complete !== 'undefined') {
      callback = properties.complete;
      delete properties.complete;
    }

    if (typeof properties.queue !== 'undefined') {
      queue = properties.queue;
      delete properties.queue;
    }

    if (typeof properties.delay !== 'undefined') {
      delay = properties.delay;
      delete properties.delay;
    }

    // Set defaults. (`400` duration, `ease` easing)
    if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
    if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

    duration = toMS(duration);

    // Build the `transition` property.
    var transitionValue = getTransition(properties, duration, easing, delay);

    // Compute delay until callback.
    // If this becomes 0, don't bother setting the transition property.
    var work = $.transit.enabled && support.transition;
    var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

    // If there's nothing to do...
    if (i === 0) {
      var fn = function(next) {
        self.css(properties);
        if (callback) { callback.apply(self); }
        if (next) { next(); }
      };

      callOrQueue(self, queue, fn);
      return self;
    }

    // Save the old transitions of each element so we can restore it later.
    var oldTransitions = {};

    var run = function(nextCall) {
      var bound = false;

      // Prepare the callback.
      var cb = function() {
        if (bound) { self.unbind(transitionEnd, cb); }

        if (i > 0) {
          self.each(function() {
            this.style[support.transition] = (oldTransitions[this] || null);
          });
        }

        if (typeof callback === 'function') { callback.apply(self); }
        if (typeof nextCall === 'function') { nextCall(); }
      };

      if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
        // Use the 'transitionend' event if it's available.
        bound = true;
        self.bind(transitionEnd, cb);
      } else {
        // Fallback to timers if the 'transitionend' event isn't supported.
        window.setTimeout(cb, i);
      }

      // Apply transitions.
      self.each(function() {
        if (i > 0) {
          this.style[support.transition] = transitionValue;
        }
        $(this).css(properties);
      });
    };

    // Defer running. This allows the browser to paint any pending CSS it hasn't
    // painted yet before doing the transitions.
    var deferredRun = function(next) {
        this.offsetWidth; // force a repaint
        run(next);
    };

    // Use jQuery's fx queue.
    callOrQueue(self, queue, deferredRun);

    // Chainability.
    return this;
  };

  function registerCssHook(prop, isPixels) {
    // For certain properties, the 'px' should not be implied.
    if (!isPixels) { $.cssNumber[prop] = true; }

    $.transit.propertyMap[prop] = support.transform;

    $.cssHooks[prop] = {
      get: function(elem) {
        var t = $(elem).css('transit:transform');
        return t.get(prop);
      },

      set: function(elem, value) {
        var t = $(elem).css('transit:transform');
        t.setFromString(prop, value);

        $(elem).css({ 'transit:transform': t });
      }
    };

  }

  // ### uncamel(str)
  // Converts a camelcase string to a dasherized string.
  // (`marginLeft` => `margin-left`)
  function uncamel(str) {
    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
  }

  // ### unit(number, unit)
  // Ensures that number `number` has a unit. If no unit is found, assume the
  // default is `unit`.
  //
  //     unit(2, 'px')          //=> "2px"
  //     unit("30deg", 'rad')   //=> "30deg"
  //
  function unit(i, units) {
    if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
      return i;
    } else {
      return "" + i + units;
    }
  }

  // ### toMS(duration)
  // Converts given `duration` to a millisecond string.
  //
  //     toMS('fast')   //=> '400ms'
  //     toMS(10)       //=> '10ms'
  //
  function toMS(duration) {
    var i = duration;

    // Allow for string durations like 'fast'.
    if ($.fx.speeds[i]) { i = $.fx.speeds[i]; }

    return unit(i, 'ms');
  }

  // Export some functions for testable-ness.
  $.transit.getTransitionValue = getTransition;
})(jQuery);

