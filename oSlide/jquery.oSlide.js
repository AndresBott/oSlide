/** @preserve
 * oSlide - jQuery Plugin
 * A slideshow designet for the frontside of my protfolio
 *
 * Copyright (c) 2011 Andrés Bott
 * Examples and documentation at: http://andresbott.com or http://oslide.andresbott.com
 *
 * Version: 1.0.5
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




// TODO
// añadir funcion random para las animaciones de cambio de imagen
// comprobar que funcione solo con una imagen
// si al iniciar el slider tiene el mouse sobre si, monstrar los controles (sin tner que salir y entrar)
// falta el codigo de titulo y descripcion (mostrar y ocultar)
// en resize, comprobar tamaño anterior al tamaño nuevo para saber si hace falta recargar la imagen
// ken burn no funciona en full screen
// goto ID tiene fallos si se llama repetidamente sobre la misma imagen



(function($){
	var oSlide = function($container,$settings){
		var defaults = {
			debug:false,
			baseZIndex : 600,

			//=======    Loading   =========//
			loadingAnimationSpeed:1800,


			//=======    Callbacks  =========//
			afterMainLoopStarted:false,
			afterResize:false,


			//=======    FullScreen Controls  =========//
			allowFullScreen : true,
			FillInFullScreen : false,
			KenBurnsInFullScreen : true,
			enableKeys : true,
			FullScreenPause:false,

			//=======    Controls  =========//
			enableNavigationControls:true,
			alwaysSowNavigationControls:false,
			FillInWindowScreen : true,
			allowPause: true,

			kenBurns:35, // 0 to deactivate
			kenburnAnimationTime:false, // time the ken burn animation takes
			kenburnsEasing:"linear", // linear - tipe of ken burn easing

			timeBetweenAnimations:6000,

			imageAnimation: "fade",
			imageAnimationSpeed:1000,
			imageAnimationInSpeed:false,
			imageAnimationOutSpeed:false,

			titleAnimation:"fade",
			titleAnimationSpeed:1000,
			titleAnimationInSpeed:false,
			titleAnimationOutSpeed:false,
			titleAnimationTimeOut:1000,
			titleAnimationBeforeTimeOut:1000, // millisecongs the title hides before the image

			descriptionAnimation:"fade",
			descriptionAnimationSpeed:1000,
			descriptionAnimationInSpeed:false,
			descriptionAnimationOutSpeed:false,
			descriptionAnimationTimeOut:550,
			descriptionAnimationBeforeTimeOut:500, // millisecongs the description hides before the image

			//=======    Showing images  =========//
			openingAnimation: "TV", // fade, TV
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
		if($settings.timeBetweenAnimations == false){

			$settings.timeBetweenAnimations =  50000000000000000;

		}
		if($settings.kenburnAnimationTime == false){
			$settings.kenburnAnimationTime =  $settings.timeBetweenAnimations + $settings.imageAnimationInSpeed;
		}



		//=======    internal usage Vars  =========//
		this.version = "1.0.5-devel";
		this.resizeTimeout = false; // holds a timeout when resizing
		this.NonSlidecontainer = $container // points to the original, in code, defined Container
		this.containerWidth = 0	 // container sizes
		this.containerHeight = 0
		this.imgLength = 0 // how many images are in the slide
		this.currentImageIndex = -1;
		this.nextImageIndex = 0;
		this.mainLoopTimer = false; //holds the main timer
		this.tittleTimer = false; // holds the timer fot the title element
		this.descTimer = false; // holds the timer for the description element
		this.isInImageTransition = false;
		this.isLoadingVisible = false; // boolean to know if loading is visible
		this.containerHasMouse = false; // boolean to know if the mouse is over the container
		this.isFullScreen = false;
		this.nextButton = false;  // holds the div with the next image button
		this.prewButton = false;  // holds the div with the previous image button
		//this.currentKBanimationType = false; // holds the ken Bruns animation tipe of the curren image

		//=======    internal usage Vars  =========//

		this.options = $settings;
		this.constructor();
	}

	oSlide.prototype = {

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Log some info to the browser console (delete for final version)
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
//	Protoptype constructor, the starting point
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		constructor: function(){
			var $this = this;

			//   		$(this.container).css({
			//			"position":"relative",
			//			"overflow":"hidden",
			//			'z-index': this.options.baseZIndex
			//		})


			//var tempcontainerWidth = $($this.NonSlidecontainer).width();
			//var tempcontainerHeight = $($this.NonSlidecontainer).height();

			$this.container = $('<div class="oSlideContainer"></div>').css({
				"position":"absolute",
				"overflow":"hidden",
				'z-index': this.options.baseZIndex+1
			});
			$($this.NonSlidecontainer).append($this.container);


			// resize
			this.resize();
			$(window).resize(function(){
				clearTimeout ($this.resizeTimeout);
				$this.resizeTimeout = setTimeout(function(){
					//alert("rees")
					$this.resize();
					$this.reloadImage();
				}, 300);


			})

			// action keys, only in fullscreen
			if($this.options.enableKeys == true){
				$(document).keydown(function(e){
					if($this.isFullScreen == true){
						if (e.keyCode==27){
							$this.exitFullScreen();
						}
						if (e.keyCode==37){
							$this.previous();
						}
						if (e.keyCode==39){
							$this.next();
						}

					}
				});


			}

			// show loading animation
			this.showLoading();


			// pause Resume control

			//if ($this.options.FullScreenPause == true  && $this.isFullScreen == true) {
			//
			//
			//}
			$this.container.hover(function(){

				$this.containerHasMouse = true;
				if ($this.isFullScreen == true) {
					if ($this.options.FullScreenPause == true) {
						$this.pause();
					}
				}else{
					if ($this.options.allowPause == true) {
						$this.pause();
					}
				}


			}, function(){


				$this.containerHasMouse = false;
				if ($this.isFullScreen == true) {
					if ($this.options.FullScreenPause == true) {
						$this.resume();
					}
				}else{
					if ($this.options.allowPause == true) {
						$this.resume();
					}
				}
			});

			if($this.containerHasMouse == true){
				$this.pause();
				alert("pause")
			}

			this.imgLength =  $(this.options.images).size();

			if (this.imgLength == 1) {
				//only one image
			}else if (this.imgLength > 1) {
				//more than one image
				$this.SlideFirstImage();
			}else{
				$this.consoleOut("ERROR: No images declarated, hidding the divs!")
				$(this.NonSlidecontainer).remove();
			}
		}, // end of constructor

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Navigation Contorls and more public methods
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		next : function(){
			this.mainLoop("+1");
		},

		previous : function(){

			this.mainLoop("-1");
		},

		goTo : function(i){

			this.mainLoop(i);
		},

		reloadThisImage : function(){
			this.SlideNext("-2");
		},


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	resize the elements to propper dimensions
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		resize : function(ßcallback){
			var $this = this;

			// resize when loading is visible
			if (this.isLoadingVisible == true) {
				this.hideLoading();
				this.showLoading();
			}

			$this.consoleOut("Method: Resize()");

			if($this.isFullScreen != true){
				$this.containerWidth = $($this.NonSlidecontainer).width();
				$this.containerHeight = $($this.NonSlidecontainer).height();
				$this.container.width($this.containerWidth).height($this.containerHeight)
			}else{
				$this.containerWidth = $(this.container).width();
				$this.containerHeight = $(this.container).height();
			}

			if($this.nextButton != false){
				$this.nextButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10 ,postion:"absolute",top:0,right:0}).find("div").css({"top": ( (this.containerHeight /2 )-30 ) });
				$this.prewButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10 ,postion:"absolute",top:0,left:0}).find("div").css({"top": ( (this.containerHeight /2 )-30 ) });

			}



			if (typeof($this.options.afterResize)== "function") {
				$this.options.afterResize();
			}
			if (typeof(ßcallback)== "function") {
				ßcallback();
			}

			//if($this.currentImageIndex >= 0){
			//$this.reload();
			//$this.reloadThisImage();
			//$this.goTo("-2")
			//var curImgSize = this.getImageResize($this.currentImageIndex);
			//alert(dump(curImgSize))
			//$($this.options.images[$this.currentImageIndex]["img"]).width(curImgSize.w).height(curImgSize.h);
			//}


		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Starts the loading animation
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		showLoading : function (){
			if (this.isLoadingVisible == false){
				this.consoleOut("method: showLoading() ");
				this.isLoadingVisible = true;

				var $this = this;

				$this.loadingContainer = $('<div class="oSlide-loading-container" style="z-index:'+ parseFloat(this.options.baseZIndex + 1 )+';"> </div>');
				$(this.container).append(this.loadingContainer);


				this.loading_point1 = $('<div class="oSlide-loading"></div>').css({
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


				$(this.loadingContainer).append($this.loading_point1).append($this.loading_point2).append($this.loading_point3).append($this.loading_point4);

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
			}else{
				this.consoleOut("Info: Loading animation already visible ");
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Stops the loading animation
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		hideLoading : function (){

			if(this.isLoadingVisible == true){
				//var $this = this;
				this.isLoadingVisible = false;
				this.consoleOut("Method: hideLoading() -> Hidding Loading Div ");
				$('.oSlide-loading-container').remove();
				clearInterval(this.loadingTimer);
			}else{
				this.consoleOut("Method: hideLoading() ->  Loading Div alreaddy hidden");
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

			$this.nextButton = $('<div id="oSlideNextNavigation" class="oSlideNavigationControl"><div></div></div>')
			$this.container.append($this.nextButton);

			$this.prewButton = $('<div id="oSlidePrewNavigation" class="oSlideNavigationControl"><div></div></div>')
			$this.container.append($this.prewButton);

			if($this.options.allowFullScreen == true){
				var $zoomButton = $('<div id="oSlideZoomButton"></div>');
				$this.container.append($zoomButton);
				$zoomButton.css({'z-index': this.options.baseZIndex+10 });
				$($zoomButton).click(function(){

					//$this.reloadImage();
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

			$this.nextButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10 ,postion:"absolute",top:0,right:0}).find("div").css({"top": ( (this.containerHeight /2 )-30 ) });
			$this.prewButton.height(this.containerHeight).css({'z-index': this.options.baseZIndex+10 ,postion:"absolute",top:0,left:0}).find("div").css({"top": ( (this.containerHeight /2 )-30 ) });

			$($this.nextButton).click(function(){
				$this.consoleOut("Click on navigation controls NEXT")
				//$timeLeft = options.sleep
				$this.next();
			});

			$($this.prewButton).click(function(){
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
				$this.nextButton.hide();
				$this.prewButton.hide();
				$this.container.hover(function(){

					$this.nextButton.stop(true,true).fadeIn();
					$this.prewButton.stop(true,true).fadeIn();
				}, function(){

					$this.nextButton.stop(true,true).fadeOut();
					$this.prewButton.stop(true,true).fadeOut();
				});
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Load the first Image
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		SlideFirstImage:function(ßcallback){

			var $this = this;
			$this.consoleOut("Method: SlideFirstImage()" );


			$this.nextImageIndex = 0;
			$this.currentImageIndex = -1;

			$this.imagePreload(function(){
				$this.showFirstImage(function(){
					$this.mainLoop();
					if(typeof(ßcallback) == "function" ){
						ßcallback();
					}
				});

			});
		},
		//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	adds the link to the image,  used in showFisrtImage and showNextImage
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		addOutLink:function (img){
			var $this = this;
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
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Preloads the next image and executes the callback
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		imagePreload : function (ßcallback){

			this.consoleOut("method: imagePreload(callback)");
			var $this = this;
			if( (typeof(this.options.images[this.nextImageIndex]["loaded"]) == "undefined"  ) || (this.options.images[this.nextImageIndex]["loaded"]== false) ){
				$this.showLoading();

				this.options.images[this.nextImageIndex]["img"] = new Image();

				$(this.options.images[this.nextImageIndex]["img"]).load(function(){
					$this.options.images[$this.nextImageIndex]["loaded"]=true;

					var div = $('<div id="div_index_'+$this.nextImageIndex+'"></div>');
					var imgDiv = $('<div id="img_index_'+$this.nextImageIndex+'"></div>');
					div.append(imgDiv);
					imgDiv.append($this.options.images[$this.nextImageIndex]["img"]);


					$this.options.images[$this.nextImageIndex]["div"] = div;
					$this.options.images[$this.nextImageIndex]["imgdiv"] = imgDiv;

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

			//this.consoleOut("method: Resize!!!! container size= "+contWidth +"x"+contHeight);

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

				ßresultingWidthNoFill = (contHeight  * curImgAspect);
				ßresultingHeightNoFill = contHeight;

				ßresultNofillLeft = Math.round(( (( ßresultingHeight - contHeight ))));
				ßresultNofilltop = 0;

				// var center = {
				// top: Math.round((-1 * (( ßkresultingHeight - contHeight )/ 2)))+"px",
				// left: Math.round((-1 * (( ßkresultingWidth - contWidth )/ 2)))+"px"
				// }

			}else{
				// adjust image using height as reference
				ßkresultingWidth = ((contHeight * kenBurns ) * curImgAspect);
				ßkresultingHeight  = contHeight * kenBurns;

				ßresultingWidth = (contHeight  * curImgAspect);
				ßresultingHeight  = contHeight;

				ßresultingWidthNoFill = contWidth;
				ßresultingHeightNoFill = (contWidth / curImgAspect);

				//alert(ßresultingHeightNoFill + " - "+ contHeight)
				ßresultNofillLeft = 0;
				ßresultNofilltop = 	Math.round((( -1 * ( ßresultingHeightNoFill - contHeight ))/2 ));
			}

			var center = {
				ktop: Math.round((-1 * (( ßkresultingHeight - contHeight )/ 2))),
				kleft: Math.round((-1 * (( ßkresultingWidth - contWidth )/ 2))),
				top: Math.round((-1 * (( ßresultingHeight - contHeight )/ 2))),
				left: Math.round((-1 * (( ßresultingWidth - contWidth )/ 2))),
				// noFillTop:
				// noFillLeft:
			}

			var Nofill = {
				w:ßresultingWidthNoFill,
				h:ßresultingHeightNoFill,
				left:ßresultNofillLeft,
				top:ßresultNofilltop
			}
			return {
				w:ßresultingWidth,
				h:ßresultingHeight,
				wk:ßkresultingWidth,
				hk:ßkresultingHeight,
				c:center,
				nofill:Nofill
			}
		},


		//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	resizes the image to propper size and Animates the kenBurns Effect
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		animateKenBurnsAndResizeImage : function(img,sizes){
			var $this = this;
			var kb = false;
			if( ( $this.isFullScreen == false && $this.options.kenBurns > 0 )  || ( $this.isFullScreen == true && $this.options.KenBurnsInFullScreen == true ) ){

				//var kbAnimationTime = $this.options.timeBetweenAnimations + $this.options.imageAnimationInSpeed;
				var kbAnimationTime = $this.options.kenburnAnimationTime;
				// set the kenBurn animation tipe if enabled:
				if(typeof($this.options.images[$this.nextImageIndex]["kenburns"]) != "undefined"){
					kb = $this.options.images[$this.nextImageIndex]["kenburns"]

					if(kb == "in"){
						// zoom in
						kb = (Math.floor((Math.random()*9)+10)).toString() ;

					}else if(kb == "out"){
						// zoom out
						kb = (Math.floor((Math.random()*9)+1)).toString() ;

					}
				}else{
					kb = (Math.floor((Math.random()*18)+1)).toString() ;
				}

				var easing = $this.options.kenburnsEasing;
				img.removeAttr( "height" ).removeAttr( "width" ).css({"height":"","width":"","top":"","left":"","right":"","bottom":""});

				$this.consoleOut("Method: animateKenBurnsAndResizeImage() -> animation: " + kb );
				$this.consoleOut(dump(sizes));

				// resize acording kenburns
				switch (kb){
					case "1": // zoom in top left
					default:
						img.css({  top : sizes.c.top, left:sizes.c.left,width:sizes.wk,height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   }, kbAnimationTime,easing);
						break;
					case "2": // zoom in top
						img.css({  top : sizes.c.top, left:sizes.c.kleft,width:sizes.wk,height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, left : sizes.c.left   },  kbAnimationTime,easing);
						break;
					case "3": // zoom in top right
						img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, right:sizes.c.left}, kbAnimationTime,easing);
						break;
					case "4": // zoom in right
						img.css({  top : sizes.c.ktop, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  top : sizes.c.top, right:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "5": // zoom in bottom right
						img.css({  bottom : sizes.c.top, right:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, right:sizes.c.left}, kbAnimationTime,easing);
						break;
					case "6": // zoom in bottom
						img.css({  bottom : sizes.c.top, right:sizes.c.kleft, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, right:sizes.c.left}, kbAnimationTime,easing);
						break;
					case "7":  // zoom in bottom left
						img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "8": // zoom in left
						img.css({  bottom : sizes.c.ktop, left:sizes.c.left, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left}, kbAnimationTime,easing);
						break;
					case "9": // zoom in center
						img.css({  bottom : sizes.c.ktop, left:sizes.c.kleft, width:sizes.wk, height:sizes.hk }).animate({  width:sizes.w,  height:sizes.h,  bottom : sizes.c.top, left:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "10": // zoom out top left
						img.css({  top : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, left : sizes.c.left   },  kbAnimationTime,easing);
						break;
					case "11":  // zoom out top
						img.css({  top : sizes.c.top, left:sizes.c.left,width:sizes.w,height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, left : sizes.c.kleft   },  kbAnimationTime,easing);
						break;
					case "12": // zoom out top right
						img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.top, right:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "13": // zoom out right
						img.css({  top : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.ktop, right:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "14": // zoom out bottom right
						img.css({  bottom : sizes.c.top, right:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, right:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "15": // zoom out bottom
						img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, left:sizes.c.kleft},  kbAnimationTime,easing);
						break;
					case "16": // zoom out bottom left
						img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.top, left:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "17": // zoom out left
						img.css({  top : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  top : sizes.c.ktop, left:sizes.c.left},  kbAnimationTime,easing);
						break;
					case "18": // zoom out center
						img.css({  bottom : sizes.c.top, left:sizes.c.left, width:sizes.w, height:sizes.h }).animate({  width:sizes.wk,  height:sizes.hk,  bottom : sizes.c.ktop, left:sizes.c.kleft},  kbAnimationTime,easing);
						break;
					case "0":
						img.width(sizes.w).height(sizes.h).css({  top : sizes.c.top, left:sizes.c.left });
						break;
				}// end ken burns switch
			}else{
				img.stop();

				if( ($this.isFullScreen == false &&  FillInWindowScreen == true) || ($this.isFullScreen == true && $this.options.FillInFullScreen == true)){
					img.width(sizes.w).height(sizes.h);
					img.css({  top : sizes.c.top, left:sizes.c.left });
				}else{
					img.width(sizes.nofill.w).height(sizes.nofill.h);
					//$this.container.width(sizes.nofill.w).height(sizes.nofill.h).css({  top : sizes.nofill.top, left:sizes.nofill.left });
					img.css({  top : sizes.nofill.top, left:sizes.nofill.left });

				}
				$this.consoleOut("Method: animateKenBurnsAndResizeImage() -> No KenBurns");
				//alert(dump(sizes));
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	make the First image visible
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		showFirstImage:function(ßcallback){
			this.consoleOut("Method: showFirstImage() ->  Current Image = "+ this.currentImageIndex + " Next Image = "+ this.nextImageIndex);

			var $this = this;
			var $callback = ßcallback;
			var div = $this.options.images[$this.nextImageIndex]["div"];
			var imgDiv = $this.options.images[$this.nextImageIndex]["imgdiv"];
			var sizes = $this.getImageResize($this.nextImageIndex);

			//alert(dump(sizes));

			this.hideLoading();


			if($this.options.enableNavigationControls == true){
				$this.showNavigationControls();
			}

			initSwitchImages();



			function afterImageChanged(){

				// after loading the first image, show the navigation controlls as callback function
				if (typeof($this.options.afterMainLoopStarted) == "function") {
					$this.options.afterMainLoopStarted();
				}
			}

			function initSwitchImages(){
				switch ($this.options.openingAnimation){
					case "fade":
						// TODO -> repasar, basandose en TV
						$($this.container).append(div);
						var img = $(div).find("img").first().css({position:"absolute"});
						$this.addOutLink(img);
						div.css({opacity: 0}).animate({   opacity: 1  },$this.options.imageAnimationInSpeed).queue(
							function(){
								timeoutToNextImage();
								$(this).dequeue();
							}
						);
						animateKenBurns(img,sizes);
						showTitles();
						break;
					case "TV":
						$($this.container).append(div);
						var img = $(div).find("img").first().css({position:"absolute"});
						$this.addOutLink(img);

						$this.animateKenBurnsAndResizeImage(img,sizes);
						$this.showTitles()

						// div.css(
						// {
						// position:"absolute",
						// width:$this.containerWidth ,
						// height:$this.containerHeight
						// }
						// );
						imgDiv.css({height:0,position:"relative",top:$this.containerHeight/2}).animate({height:$this.containerHeight,top:0} ,$this.options.imageAnimationInSpeed).queue(
							function(){
								afterImageChanged();
								$this.sleepUntilNextImage(ßcallback);
								$(imgDiv).css({"heigh":"","top":"",position:"absolute", width:$this.containerWidth ,height:$this.containerHeight})
								$(this).dequeue();
							}
						);
						break;
				}// end of switch
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	make the next image visible
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		showNextImage:function(ßcallback){
			this.consoleOut("Method: showNextImage() -> Current Image = "+ this.currentImageIndex + " Next Image = "+ this.nextImageIndex);

			var $this = this;
			var $callback = ßcallback;
			var div = $this.options.images[$this.nextImageIndex]["div"];
			// TODO working here
			//$(div).css({"heigh":"","top":"",position:"absolute", width:"" ,height:""})
			var imgDiv = $this.options.images[$this.nextImageIndex]["imgdiv"];
			//var img = $this.options.images[$this.nextImageIndex]["img"];
			var sizes = $this.getImageResize($this.nextImageIndex);
			var currentDiv = $this.options.images[$this.currentImageIndex]["div"];
			this.hideLoading();

			switchImages();

			function switchImages(){
				$this.consoleOut("Method: showNextImage() -> Sub Function  switchImages ");
				var animateOutSpeed = $this.options.imageAnimationOutSpeed;
				switch ($this.options.imageAnimation){

					case "fade":
						// TODO -> repasar, basandose en slide right
						currentDiv.animate({   opacity:0},animateOutSpeed).queue(
							function() {
								$this.removeTitles();
								$(this).remove();
								$($this.container).append(div);

								var img = $(div).find("img").first().css({position:"absolute"});

								$this.addOutLink(img);

								$this.animateKenBurnsAndResizeImage(img,sizes);
								$this.showTitles();

								div.css({opacity: 0}).animate({   opacity: 1  },$this.options.imageAnimationInSpeed).queue(
									function(){
										$this.sleepUntilNextImage(ßcallback);
										$(this).dequeue();
									}
								);
								$(this).dequeue();

							}
						);
						break;

					case "crosfade":
						// TODO -> repasar, basandose en slide right

						$this.removeTitles();
						$($this.container).append(div);

						var remove = currentDiv;

						var img = $(div).find("img").first().css({position:"absolute"});

						$this.addOutLink(img);

						$this.animateKenBurnsAndResizeImage(img,sizes);

						$this.showTitles();

						div.css({opacity: 0}).animate({   opacity: 1  },$this.options.imageAnimationInSpeed*2).queue(
							function(){
								$(remove).remove();
								$this.sleepUntilNextImage(ßcallback);
								$(this).dequeue();
							}
						);

						break

					case "slideright":

						$this.removeTitles();
						$($this.container).append(div);

						var remove = currentDiv;
						var img = $(div).find("img").first().css({position:"absolute"});
						//$(img).css({position:"absolute"});
						$this.addOutLink(img);
						$this.animateKenBurnsAndResizeImage(img,sizes);
						$this.showTitles();


						imgDiv.css(
							{position:"absolute",
								overflow:"hidden",
								width:$this.containerWidth ,
								height:$this.containerHeight,
								left: $this.containerWidth + "px"}
						).animate({
								left: 0},$this.options.imageAnimationInSpeed).queue(
							function(){
								$(remove).remove();
								$this.sleepUntilNextImage(ßcallback);
								$(this).dequeue();
							}
						);


						// $(nextImageNode).css({opacity:1,"left": (-1 *$container_width)}).animate({ "left":0},{ duration: options.fade_time ,queue : false,  complete: function() {
//
						// $isInTransition = false;
						// if(options.enableNavigationBar == true){
						// $($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
						// $($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
						// }
//
						// }});
						break;


				}// end of switch
			}


		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	calls the tiemout funtion to sleep between image transition
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		sleepUntilNextImage: function($callback){
			var $this = this;
			this.isInImageTransition = false;
			$this.consoleOut("Method: sleepUntilNextImage()");

			$this.mainLoopTimer = new Timer(function(){
				if(typeof($callback) == "function"){
					$callback();
				}
			},$this.options.timeBetweenAnimations - $this.options.imageAnimationInSpeed);

			if($this.containerHasMouse == true){

				if($this.isFullScreen == true && $this.options.FullScreenPause == true){
					$this.pause();
					//alert("pause hacer un if con la variable del pause full screen")
				}else if($this.isFullScreen == false){
					$this.pause();
				}


			}

			// thanks to: http://stackoverflow.com/questions/3969475/javascript-pause-settimeout
			function Timer(callback, delay) {

				var InitDelay, timerId, start, remaining = delay;

				this.pause = function() {
					$this.consoleOut("Method: sleepUntilNextImage() -> Subfunction Pause");
					window.clearTimeout(timerId);
					remaining -= new Date() - start;
				};

				this.clear = function(){
					window.clearTimeout(timerId);
					timerId, start, remaining = this.initDelay;
				}

				this.resume = function() {
					$this.consoleOut("Method: sleepUntilNextImage() -> Subfunction Resume");
					start = new Date();
					timerId = window.setTimeout(callback, remaining);

				};

				this.resume();
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Load the Next image
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		mainLoop:function(ßcallback){
			var $this = this;
			this.consoleOut("Method: mainLoop() -> $currentImage: "+this.currentImageIndex +" $nextImage: "+this.nextImageIndex );

			if(this.isInImageTransition != true){
				this.isInImageTransition = true;


				$this.mainLoopTimer.clear();

				// image calculation

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
				}else{
					if($this.nextImageIndex == $this.imgLength -1){
						$this.currentImageIndex = $this.nextImageIndex;
						$this.nextImageIndex = 0;
					}else{
						$this.currentImageIndex = $this.nextImageIndex;
						$this.nextImageIndex = $this.nextImageIndex +1;
					}
				}

				$this.imagePreload(function(){
					$this.showNextImage(function(){
						$this.mainLoop();
					});

					if(typeof(ßcallback) == "function" ){
						ßcallback();
					}
				});
			}
		},


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Shows the title and description element if pressent
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		showTitles:function (ßmethod){
			var $this = this;
			this.consoleOut("Method: showTitles() ");

			// Tittle animation
			//alert("add");
			if($this.options.images[$this.nextImageIndex]["title"] != false){
				setTimeout(function(){

					var div = $this.options.images[$this.nextImageIndex]["div"];
					var textElement = $this.options.images[$this.nextImageIndex]["title"];
					if(ßmethod == "fast"){
						var animation = "fast"
					}else{
						var animation = $this.options.titleAnimation;
					}
					switchAnimation($this.options.titleAnimation,textElement,div,  $this.options.titleAnimationInSpeed,  $this.options.titleAnimationOutSpeed,  false);

					$this.tittleTimer = new Timer(function(){  // holds the timer for the title element
						switchAnimation($this.options.titleAnimation,textElement,div,  $this.options.titleAnimationInSpeed,  $this.options.titleAnimationOutSpeed,  true);
					},($this.options.timeBetweenAnimations -$this.options.imageAnimationOutSpeed - $this.options.titleAnimationBeforeTimeOut )); // how many millisecond before hidding the div, shoud we hide the title

				}, $this.options.titleAnimationTimeOut);
			}


			// Description animation
			if($this.options.images[$this.nextImageIndex]["desc"] != false){
				setTimeout(function(){

					var div = $this.options.images[$this.nextImageIndex]["div"];
					var textElement = $this.options.images[$this.nextImageIndex]["desc"];
					if(ßmethod == "fast"){
						var animation = "fast"
					}else{
						var animation = $this.options.descriptionAnimation;
					}
					switchAnimation($this.options.descriptionAnimation,textElement,div,  $this.options.descriptionAnimationInSpeed,  $this.options.descriptionAnimationOutSpeed,  false);

					$this.descTimer = new Timer(function(){  // holds the timer for the description element
						switchAnimation($this.options.descriptionAnimation,textElement,div,  $this.options.descriptionAnimationInSpeed,  $this.options.descriptionAnimationOutSpeed,  true);
					},($this.options.timeBetweenAnimations -$this.options.imageAnimationOutSpeed  - $this.options.descriptionAnimationBeforeTimeOut )); // how many millisecond before hidding the div, shoud we hide the title

				}, $this.options.descriptionAnimationTimeOut);
			}


			function switchAnimation($animation,$textElement,$div,$speedIn,$speedOut,$hide){
				$this.consoleOut("Method: showTitles() Sub function switchAnimation()");


				switch ($animation){
					case "fade":

						if($hide == false){
							//show Element
							$div.append($textElement);
							$textElement.css({ opacity: 0 , 'z-index': $this.options.baseZIndex+11 }).animate({ opacity: 1 },$speedIn);
							$this.consoleOut("Method: showTitles() -> ADD element ID :  "+ $this.nextImageIndex+ " text: "+ $($textElement).html() )
						}else if($hide == true){
							// hide Element
							$textElement.animate({ opacity: 0 },$speedOut).queue(function(){
								$this.consoleOut("Method: showTitles() -> Remove element ID :  "+ $this.nextImageIndex+ " text: "+ $($textElement).html() )
								$(this).remove();
							})
						}

						break;

					case "fast":

						if($hide == false){
							//show Element
							$div.append($textElement);
							$textElement.css({ opacity: 0 , 'z-index': $this.options.baseZIndex+11 }).animate({ opacity: 1 },100);
						}else if($hide == true){
							// hide Element
							$textElement.animate({ opacity: 0 },100).queue(function(){
								$this.consoleOut("Method: showTitles() -> Remove element ID :  "+ $this.nextImageIndex+ " text: "+ $($textElement).html() )
								$(this).remove();
							})
						}
						break;

				}// end of switch
			}

			// thanks to: http://stackoverflow.com/questions/3969475/javascript-pause-settimeout
			function Timer(callback, delay) {
				var initDelay, timerId, start, remaining = delay;

				this.pause = function() {
					$this.consoleOut("Method: showTitles() -> Subfunction Pause");
					window.clearTimeout(timerId);
					remaining -= new Date() - start;
				};
				this.clear = function(){
					window.clearTimeout(timerId);

					timerId, start, remaining = this.initDelay;

				}

				this.resume = function() {
					$this.consoleOut("Method: showTitles() -> Subfunction Resume");
					start = new Date();
					timerId = window.setTimeout(callback, remaining);
				};

				this.resume();
			}

		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Removes title and description if still pressent
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		removeTitles:function (ßspeed){
			var $this = this;
			this.consoleOut("Method: removeTitles() ");
			if(ßspeed == "now"){
				var speed = 0;

			}else{
				var speed = 150;
			}

			if (typeof ($this.options.images[$this.currentImageIndex] ) != "undefined") {
				//code
				//alert($this.options.images[$this.currentImageIndex]["title"].html())
				if($this.options.images[$this.currentImageIndex]["title"] != false){
					$($this.options.images[$this.currentImageIndex]["title"]).animate({ opacity:0},speed).queue(
						function() {

							$(this).remove();
							$(this).dequeue();
						}
					);
				}
				if($this.options.images[$this.currentImageIndex]["desc"] != false){
					$($this.options.images[$this.currentImageIndex]["desc"]).animate({ opacity:0},speed).queue(
						function() {
							$(this).remove();
							$(this).dequeue();
						}
					);
				}
			}
		},




//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Pauses All timers
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		pause:function(){
			var $this = this;
			if($this.options.allowPause == true){
				if($this.mainLoopTimer != false){
					$this.mainLoopTimer.pause();
				}

				if($this.tittleTimer != false){
					$this.tittleTimer.pause();
				}

				if($this.descTimer != false){
					$this.descTimer.pause();
				}
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Clear All timers
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		clear:function(){
			var $this = this;
			if($this.options.allowPause == true){
				if($this.mainLoopTimer != false){
					$this.mainLoopTimer.clear();
				}

				if($this.tittleTimer != false){
					$this.tittleTimer.clear();
				}

				if($this.descTimer != false){
					$this.descTimer.clear();
				}
			}
		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Resumes All timers
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────


		resume: function(){
			var $this = this;
			if($this.options.allowPause == true){
				if($this.mainLoopTimer != false){
					$this.mainLoopTimer.resume();
				}

				if($this.tittleTimer != false){
					$this.tittleTimer.resume();
				}

				if($this.descTimer != false){
					$this.descTimer.resume();
				}
			}
		},


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Go fullscreen
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		goFullScreen:function(ßcallback){

			this.consoleOut("Go FullScreen");
			var imgDiv = this.options.images[this.nextImageIndex]["imgdiv"];



			if (this.isInImageTransition == true) {
				$(this.options.images[this.currentImageIndex]["div"]).remove();
				$(imgDiv).stop(true,true);
				this.isInImageTransition = false;
			}


			var $this = this;
			$this.isFullScreen = true;
			$('body').css("overflow","hidden");

			$this.fulscreenContainer = $('<div id="oslideFullScreenContainer" style="position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:'+ parseFloat($this.options.baseZIndex + 10 )+'"></div>');
			$($this.fulscreenContainer).css({'background':"black"})
			$('body').prepend($this.fulscreenContainer);
			$($this.fulscreenContainer).append($this.container).addClass("oSlideFullScreen");
			$($this.container).css({"width":"100%","height":"100%"});




			$this.resize(function(){

				$this.reloadImage();
				$this.resume();

			});


			//$this.containerWidth = 0	 // container sizes
			//$this.containerHeight = 0

			//alert("ancho: " +$this.containerWidth + " alto: "+ $this.containerHeight);


		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Exit fullscreen
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		exitFullScreen:function(ßcallback){
			this.consoleOut("Exit FullScreen");

			var imgDiv = this.options.images[this.nextImageIndex]["imgdiv"];
			if (this.isInImageTransition == true) {
				$(this.options.images[this.currentImageIndex]["div"]).remove();
				$(imgDiv).stop(true,true);
				this.isInImageTransition = false;
			}

			var $this = this;
			$this.isFullScreen = false;
			$('body').css({"overflow":""});
			$($this.NonSlidecontainer).append($this.container);


//			var tempcontainerWidth = $($this.NonSlidecontainer).width();
//			var tempcontainerHeight = $($this.Originalcontainer).height();
//
//                        $($this.container).width(tempcontainerWidth).height(tempcontainerHeight);
			$($this.fulscreenContainer).remove();

			$this.resize(function(){
				$this.reloadImage();
			});

		},

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
//	Reload the same image
//
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

		// TODO recarga la imagen, pero no el titulo ni descricpion
		reloadImage: function(){
			this.consoleOut("Method: reloadImage()");

			if(this.isInImageTransition != true){
				this.isInImageTransition = true;

				var $this = this;





				var div = $this.options.images[$this.nextImageIndex]["div"];
				var imgDiv = $this.options.images[$this.nextImageIndex]["imgdiv"];
				var sizes = $this.getImageResize($this.nextImageIndex);

				var titles = $this.options.images[$this.nextImageIndex]["title"];
				var desc = $this.options.images[$this.nextImageIndex]["desc"];

				if(titles != false){
					$(titles).remove();
				}
				if(desc != false){
					$(desc).remove();
				}
				//$this.clear();

				if ($this.isFullScreen == false) {

					$(imgDiv).css({
						position:"absolute",
						width:$this.containerWidth ,
						height:$this.containerHeight,
					})



				}else{
					$(imgDiv).css({
						overflow:"",
						width:$this.containerWidth ,
						height:$this.containerHeight,
					})


				}

				div.animate({   opacity:0},100).queue(
					function() {

						$(this).remove();
						$($this.container).append(div);

						var img = $(div).find("img").first().css({position:"absolute"});
						$this.addOutLink(img);

						$this.animateKenBurnsAndResizeImage(img,sizes);
						$this.showTitles();

						div.css({opacity: 0}).animate({   opacity: 1  },$this.options.imageAnimationInSpeed).queue(
							function(){


								$this.sleepUntilNextImage(function(){
									$this.mainLoop();
								});
								$(this).dequeue();
							}
						);
						$(this).dequeue();

					}
				);
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
