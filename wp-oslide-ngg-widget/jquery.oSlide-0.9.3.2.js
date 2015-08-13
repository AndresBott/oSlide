/** @preserve
 * oSlide - jQuery Plugin
 * A slideshow designet for the frontside of my protfolio
 *
 * Copyright (c) 2011 Andrés Bott
 * Examples and documentation at: http://andresbott.com or http://oslide.andresbott.com
 * 
 * Version: 0.9.3.2
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

// TODO  opcion para cargar css de manera dinamica
(function($){
   var oSlide = function($outerContainer, options){
   	
   	var $version = "0.9.3.2";
   	
   	var $thisObj = this;  // this object set in a variable to be accesed from within other functions
   	var $container = false;
   	var $oSlideDiv= false; // the new div witch contains the images
	var $loading = false;  // the loading div
	var $prewButton = false;
	var $nextButton = false;
	var $zoomButton = false;
	var $caption = false;
	var $fulscreenContainer = false;
	
	// used in the loading animation
	var $loadingTimer = false;
	var $loading=false;
	var $loadingImg = false; 
	var $loadingFrame=1;

	// image variables
	var $nextImage = 0;
	var $currentImage = false;	
	var $imagenes = false; //
	
	// control variables
	var $mainLoopTimer = false;
	var $isInTransition=false; 
	var $startTimeMS = 0; // used for calculating the time left after a mouse over stop
	var $timeLeft = false; // used for calcilating the time left for the next slide, after a mouse over stop
	var $loopStarted = false;
	var $mouseIsOverContainer = false;
	var $slidingBack = false; // used in loginc sliding
	var $isInFullScreenMode = false;
	
	var $container_height=$($outerContainer).height();
	var $container_width=$($outerContainer).width();   	
   	
   	var defaults = {
   		logicSliding : true,
		loadingAnimationImages : 12,
		loadingAnimationSpeed : 80,
		mouseOverStopSlide:true,
		enableCaptions:true,
		fadeColorBrackgroundColor : false, 
 		enableNavigationBar:true,
  		enableNavigationControls:true,
  		allowZoom:true,
  		alwaysSowNavigationControls:false,
  		imgFillContainer:true,
		animation : "fade",
   		images: false, 		// an array containing all data to the images
		aRel : false,  	// a DOM list of images acting as thumbnails to slcroll to the image
		sleep:5000,			// time in ms, how long is the image displayed befor changing
		fade_time:300,			// speed of the fading of the images
		debug : false,
		baseZIndex:1000,
		fullScreenOptions:false,
	};
	var options = $.extend(defaults, options);
	var initOptions = false;
	var fullScreenOptions = false;



// z index values:
// container: +0
// loading animation : +1
// navigaion Bar : +2
// navigation controls (next + previous) : +3
// zoomButton : +4
// fullscreen overwiew : +10
// 
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Constructor 																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	var constructor = function (){
		consoleOut("constructor of oSlide v "+$version);
		

		
		initOptions = $.extend(initOptions,options);
		//TODO aply sleep time on fullscreen change, mouse over stop slide, show controls
		fullScreenOptions = $.extend(fullScreenOptions,options,options.fullScreenOptions)


		

		
		$container = $('<div id="oSlideContainer"></div>');
		$($outerContainer).append($container);
		$($container).width($container_width).height($container_height);
		$($container).css({"position":"relative","z-index": parseFloat(options.baseZIndex) } )
		
		$($container).append(
			$oSlideDiv = $ ( '<div id="oSlideImageDiv" style="position:absolute; overflow:hidden;"></div>')
		);
		//$($oSlideDiv).css({"border":"solid 1px green"});
		$($oSlideDiv).width($container_width).height($container_height);

		
		$imagenes=getImagesData();
		
		if($imagenes !=false){
			showLoading();

			
			// start the loop
			$thisObj.SlideNext(function(){
				// after loading the first image, show the navigation controlls as callback function
				if(options.enableNavigationBar==true){
				    showNavigationBar();
				}
				
				if(options.enableNavigationControls == true){
				    showNavigationControls();
				}
			});
			
			if(options.fullscreen == true){
				zoomToFullscreen();
			}else if(options.allowZoom == true){
				showZoomButton();
			}
			
			//alert($($container).attr("style"));
					
			$(window).resize(function(){
				$thisObj.resize();
			})
			
			if(options.mouseOverStopSlide == true){
				$($container).hover(function(){
					$mouseIsOverContainer = true;
					clearTimeout($mainLoopTimer);
					$timeLeft = parseInt( options.sleep - ( (new Date()).getTime() - $startTimeMS ));
					consoleOut("clear Timepout, resting: "+ $timeLeft + "to the next slide");

	
				}, function(){
					$mouseIsOverContainer = false;
					if($timeLeft < 100 ){
						$timeLeft = 1000;
					}
					
					consoleOut("resume Timeout width time: "+$timeLeft);
					$mainLoopTimer =  setTimeout( $thisObj.SlideNext,$timeLeft);

				});				
			}

			

		}else{
			consoleOut("ERROR: No images declarated, hidding the divs!")
		      $($container).remove();
		}
	}// end of constructor	

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Gets image data from the DOM or passed as parameter																					#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	var getImagesData = function ()	{
		 consoleOut("private method: getImagesData() ");
		 
		 // Two posibilities: either use a data array, or use a list or <a hrerf rel="relText"> links
		 // option 1: Data Array:
		 if(options.images != false){
		 	consoleOut("getting images Passed by options");
		 	return options.images;
		 	
		 //option 2: Rel links
		 }else if(options.aRel != false){
		 	consoleOut("getting images looking for rel atribure= "+options.aRel);
		 	
		 	var imagenes = new Object();
					
		 	$("a[rel='"+options.aRel+"']").each(function(i){
		 		if( typeof($(this).attr("href")) != "undefined" ){
		 			imagenes[i] = new Object();
		 			//url
		 			imagenes[i]["url"]=this.attr("href");
		 			// description
		 			if(typeof(this.attr("desc")) != "undefined"){
						imagenes[i]["desc"]=this.attr("alt");
					}
					// Getting the link URL
					if(typeof(this.attr("link")) != "undefined"){
						imagenes[i]["link"]=this.attr("link");
					}
		 		}
		 	})
		 	
		 }else{
		 	consoleOut("No Images Found","error");
		 	return false;
		 }
	}
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Starts the loading animation																									#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	var showLoading = function ()
	{
		consoleOut("method: showLoading() ");
		
		// add a div for the loading animation
		if($loading==false){
			$($container).append(
				$loading = $('<div id="oSlide-loading" style="z-index:'+ parseFloat(options.baseZIndex + 1 )+'" ></div>')
			);
			$($loading).css({
				"overflow":"hidden",
				"display":"none"
			})
			
			$($loading).append(
				$loadingImg = $('<div id="oSlide-loading-image"></div>')
			);
			$($loadingImg).css({
				"position":"absolute",
				"top":"0px",
				"left":"0px"
			})
		}
	
		if(typeof($loadingTimer)!="undefined"){
			clearInterval($loadingTimer);
		}

		$loading.show();
		$loadingTimer = setInterval(animateLoading, options.loadingAnimationSpeed);
	};
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Stops the loading animation																									#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	var hideLoading = function ()
	{
		consoleOut("private method: hideLoading() ");
		$loading.hide();
		clearInterval($loadingTimer);
	};
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	animate the loading 																									#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	var animateLoading = function ()
	{
		if (!$loading.is(':visible')){
			clearInterval(loadingTimer);
			return;
		}

		$($loadingImg).css('top', ($loadingFrame * -40) + 'px');
		$loadingFrame = ($loadingFrame + 1) % options.loadingAnimationImages;
	};


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Preloads the next image and executes the callback																					#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	var imagePreload = function (callback){
		consoleOut("private method: imagePreload(callback)");
		if( (typeof($imagenes[$nextImage]["loaded"]) == "undefined"  ) || ($imagenes[$nextImage]["loaded"]== false) ){
			showLoading();

			$imagenes[$nextImage]["img"] = new Image();
			$($imagenes[$nextImage]["img"]).load(function()
			{
				$imagenes[$nextImage]["loaded"]=true;
				$imagenes[$nextImage]["width"] = $imagenes[$nextImage]["img"].width
				$imagenes[$nextImage]["height"] = $imagenes[$nextImage]["img"].height
	
				callback();
			}).attr("src",$imagenes[$nextImage]["url"]);
		}else{
			callback();
		}
	}
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	inserts the image and deletes the previous controlling the timers																			#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	var loopControl = function ()	{
		consoleOut("private method: loopControl()");
		
		if($imagenes[$nextImage]["loaded"]==true){
		  	hideLoading();
			
			transitionToImage($currentImage,$nextImage,options.animation)

			if($nextImage==$imagenes.length-1){
				$currentImage = $nextImage;
				$nextImage = 0;
			}else{
				$currentImage = $nextImage;
				$nextImage = $nextImage +1;
			}
			
			$startTimeMS = (new Date()).getTime();
			if( ($mouseIsOverContainer == false && options.mouseOverStopSlide == true)  ||  (options.mouseOverStopSlide == false ) ){
				$mainLoopTimer =  setTimeout( $thisObj.SlideNext,options.sleep);
			}
			// if($MainLoopTimer=="inactive" && $eventMouseOver==false){
				// $MainLoopTimer="active";
				
				
			// }
		  
		}else{
			// solucionar el tema de que el script quiere mostrar la siguiente imagen pero aun no esta cargada
			
		}
			
	}
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	transition to next image																							#########################
//	private method																										#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	var transitionToImage = function ($currentImage,$nextImage,$animation){
		consoleOut("private method: transitionToImage("+$currentImage+","+$nextImage+","+$animation+")");


			if($loopStarted!=true){ // first time run
				var ßfirstrunDummy = $('<div><div style="opacity:0; filter:alpha(opacity=0); position:absolute;" ></div></div>');
				var fadeSpeed = 1;
				var currenImageElement= ßfirstrunDummy;
				$($oSlideDiv).append(ßfirstrunDummy);
				$loopStarted = true;
			}else{
				var fadeSpeed = options.fade_time;
				var currenImageElement = $imagenes[$currentImage]["node"];
			}
			var currentImageNode = $(currenImageElement).children().first();	

			
			if(typeof($imagenes[$nextImage]["link"])!="undefined"){
				// has link
				
				//$imagenes[$nextImage]["node"] = $('<div></div>');
				$imagenes[$nextImage]["node"] = $('<a href="'+$imagenes[$nextImage]["link"]+'" ></a>');
			}else{
				$imagenes[$nextImage]["node"] = $('<div></div>');
			}

			var ßtmpDivNode = $(' <div id="oSilideImg_'+$nextImage+'"  style="opacity:0; filter:alpha(opacity=0); position:absolute; overflow:hidden; text-align:center" ></div>');
			$(ßtmpDivNode).width($container_width).height($container_height);
			$($imagenes[$nextImage]["node"]).append(ßtmpDivNode);
			$(ßtmpDivNode).append($imagenes[$nextImage]["img"]);


			$($oSlideDiv).append( $imagenes[$nextImage]["node"] );

			var imageSizes = imgResize($imagenes[$nextImage]["img"],$container_height,$container_width,$imagenes[$nextImage]["width"]/$imagenes[$nextImage]["height"]);
			var nextImageNode = $($imagenes[$nextImage]["node"]).children().first();
			

		
/* ############################################################################################################################3 */
/* ##   Starting the transition definitions*/
/* ############################################################################################################################3 */

	
		switch ($animation){
		  
		case "crosfade":
			$(nextImageNode).animate({opacity:1},options.fade_time*2,function(){
				$(currenImageElement).remove();
				
				$isInTransition = false;
				if(options.enableNavigationBar == true){
						$($container).find('.oSlideNavigationElementId_'+$nextImage).addClass("oSlideNavigationActiveElement");
						$($container).find('.oSlideNavigationElementId_'+$currentImage).removeClass("oSlideNavigationActiveElement");
				}

			});

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

	}// end function

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	resizes a image																											#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	var imgResize = function($img,$height,$width,$originalAspectRation){
		// nice resize to fill function !!! ^^
		consoleOut(" Private method imageResize ");

		var ßresizeToAspectRatio = 0;

		if(typeof($height) == "undefined"){
			$height = 0;
		}
		if(typeof($width) == "undefined"){
			$width = 0;
		}

		// the parameter $originalAspectRation was not really needed, since we can calculate the aspectratio from the current image
		// but continuous resizing of the same picture resulted in a picture deformtion after invoking this method  about 100 or 
		// more times (constant window resizing) i't not a big deal, but it happend
		// so i decided to solve it! passing the aspectratio as a parameter.
		// the original code still present,
		
		//var ßoriginalImgHeight = $img.height;
		//var ßoriginalImgmgWidth = $img.width;
		//var ßoriginalImgAspectRatio = ßoriginalImgmgWidth / ßoriginalImgHeight;
		
		
		
		var ßoriginalImgAspectRatio = $originalAspectRation;
		
		var ßresultingHeight = 0;
		var ßresultingWidth = 0;
		$($img).removeAttr( "height" ).removeAttr( "width" );
		$img.style.height = $img.style.width = "";		
		
		if(	
				// width not defined
			   	$width == 0 ||
			   	//  if both width and height are defined  && aspect ratio of container is < original  image aspect ratio
			 	(   ($width / $height)  != "Infinity"   &&  ($width / $height) < ßoriginalImgAspectRatio )
			)		{
						if(options.imgFillContainer == true){
								var adjustedByWidth = false;
						}else{
								var adjustedByWidth = true;
						}
		}else{
						if(options.imgFillContainer == true){
								var adjustedByWidth = true;
						}else{
								var adjustedByWidth = false;
						}
		}
		$($img).css({"position":"relative","left": "0px", "top":"0px"});

		if(adjustedByWidth){
			// adjust image using width as reference	
			ßresultingHeight  = ($width / ßoriginalImgAspectRatio);
			ßresultingWidth = $width;
			$($img).css({"top":( (-1 * (( ßresultingHeight - $container_height )/ 2))+"px")});
			
		}else{
			// adjust image using height as reference		 	
			ßresultingWidth = ($height * ßoriginalImgAspectRatio)
			ßresultingHeight  = $height
			if(options.imgFillContainer == true){
				$($img).css({"left": ( (-1 * (( ßresultingWidth - $container_width )/ 2))+"px") })
			}

		}
		

							
		$img.height = ßresultingHeight ;
		$img.width = ßresultingWidth;	

		return {"height":ßresultingHeight,"width":ßresultingWidth};
	
	}
	
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion control bar																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		
	var showNavigationBar = function ()	{
		var ßnavigationBar = $('<div id="oSlideNavigation" style="z-index:'+ parseFloat(options.baseZIndex + 2 )+'"></div>')
		$($container).append(ßnavigationBar);


		for (i=0;i<$imagenes.length;i=i+1){
			var ßnavigationButton = $('<div class="oSlideNavigationElement oSlideNavigationElementId_'+i+'" jumpto="'+i+'"  ></div>');
			$(ßnavigationBar).append(ßnavigationButton);
			var ßnavigationButtonText = $('<span>'+(i+1)+'</span>');
			$(ßnavigationButton).append(ßnavigationButtonText);
			
			$(ßnavigationButton).click(function(){
				if(!$(this).hasClass('oSlideNavigationActiveElement')){
					if($isInTransition != true){
						consoleOut("Click on active transition = FALSE");
						
						var jumpto = $(this).attr("jumpto");
						$thisObj.SlideToImg(jumpto)
					}else{
						consoleOut("Click on active transition = TRUE");
						
						var jumpto = $(this).attr("jumpto");
						clearTimeout($mainLoopTimer);
						$nextImage = parseInt(jumpto);
					}					
				}

			});
		}
		
		$(ßnavigationBar).fadeIn(options.fade_time*3);
	}
		
		
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion controls																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		
	var showNavigationControls = function (){
		consoleOut("show Navigation Controls");
		
		$nextButton = $('<div id="oSlideNextNavigation" class="oSlideNavigationControl" style="z-index:'+parseFloat(options.baseZIndex + 3)+'"><div></div></div>')
		$($container).append($nextButton);

		$prewButton = $('<div id="oSlidePrewNavigation" class="oSlideNavigationControl" style="z-index:'+parseFloat(options.baseZIndex + 3)+'"><div></div></div>')		
		$($container).append($prewButton);
		
		$($nextButton).height($container_height);
		$($prewButton).height($container_height);

		$($nextButton).click(function(){
			consoleOut("Click on navigation controls NEXT")
			$timeLeft = options.sleep
			$thisObj.SlideNext();
		});
		
		$($prewButton).click(function(){
			consoleOut("Click on navigation controls Prew")
			$timeLeft = options.sleep
			$thisObj.SlidePrew();

		});
		if(options.alwaysSowNavigationControls != true){
			$($nextButton).hide();
			$($prewButton).hide();
		}

		$($container).hover(function(){
			$($nextButton).stop(true,true).fadeIn();
			$($prewButton).stop(true,true).fadeIn();
		}, function(){
			$($nextButton).stop(true,true).fadeOut();
			$($prewButton).stop(true,true).fadeOut();
		});
	}	


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion controls																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		
	var showZoomButton = function (){
		consoleOut("show Zoom Button");

		$zoomButton = $('<div id="oSlideZoomButton" style="z-index:'+parseFloat(options.baseZIndex + 4)+'"></div>');
		$($container).append($zoomButton);
		
		$($zoomButton).click(function(){
			if($isInFullScreenMode == true){
				zoomOut();
			}else{
				zoomToFullscreen();			
			}

		})
		
		if(options.alwaysSowNavigationControls != true){
			$($zoomButton).hide();
		}

		$($container).hover(function(){
			$($zoomButton).stop(true,true).fadeIn();
		}, function(){
			$($zoomButton).stop(true,true).fadeOut();
		});
		
	}

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion controls																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		
	var insertCaption = function (callback){
		consoleOut("private method insert Caption")
		// TODO
		if(typeof($imagenes[$currentImage]["desc"])!="undefined" && options.enableCaptions == true){
			$caption = $('<div id="oSlideCaption" style = "position:absolute; bottom:0px; padding:4px 8px;background:silver;"></div>');
			$($container).append($caption);
			$($caption).html($imagenes[$currentImage]["desc"]).hide().fadeIn(function(){
				 if(typeof(callback) == "function"){
					callback();
				}
			});;

			
			

			
		}else if(typeof(callback) == "function"){
			callback();
		}

			// $(container).find('#oSilideImg_'+id).append('	<div id="'+options.divCaptionId+'" >\
									// <div id="'+options.divCaptionTextId+'" ><span>'+imagenes[id]["desc"]+'</span></div>\
								// </div>\
							    // ')
		// }
// 
		// $(container).find('#oSilideImg_'+id).append( img = $('<img src="'+imagenes[id]["url"]+'" />') )
// 
		// imgResize(img,container_heigh,container_width);
// 		
	}
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion controls																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		
	var removeCaption = function (callback){
		consoleOut("private method remove Caption")
		// TODO

		if($caption!= false && options.enableCaptions == true){

			$($caption).fadeOut(function(){
				if(typeof(callback) == "function"){
					callback();
				}
			})
		}else if(typeof(callback) == "function"){

			callback();
		}
	}
	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion controls																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────


	
	var zoomToFullscreen = function(){
		// TODO
		consoleOut("primate method zoomToFullscreen");
		
		$isInFullScreenMode = true;
		
		options = fullScreenOptions;
		
		$('body').css("overflow","hidden");
		
		$fulscreenContainer = $('<div id="oslideFullScreenContainer" style="position:fixed;top:0px;left:0px;z-index:'+ parseFloat(options.baseZIndex + 10 )+'"></div>');
		
		   
		$($fulscreenContainer).css({'background':"black"})
	
		$('body').prepend($fulscreenContainer);
		

		$($fulscreenContainer).append($container);
			
		if(options.enableNavigationControls == true && $nextButton == false && $prewButton  == false ){
		    showNavigationControls();
		}

		
		$thisObj.resize();
		
	}	

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion controls																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	var zoomOut = function(){
		// TODO
		consoleOut("private metod zoomOut");
		
		if(options.enableNavigationControls == false && $nextButton != false && $prewButton  != false ){
			$($nextButton).remove();
			$($prewButton).remove();
			$nextButton = false;
			$prewButton = false;
		}		
		
		options = initOptions;
		$('body').css("overflow","inherit");
		$($outerContainer).append($container);
		$($fulscreenContainer).remove();
		$isInFullScreenMode = false;
		$thisObj.resize();	
	}

//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	show navigarion control bar																										#########################
//	private method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
		
	this.resize = function ()	{

		consoleOut("Public method resize()");
		
		if($isInFullScreenMode == true){

			if( $container_height != $(window).height()  ||  $container_width != $(window).width() ){
				$($fulscreenContainer).height($(window).height()).width($(window).width());
				$container_height=$($fulscreenContainer).height();
				$container_width=$($fulscreenContainer).width();
				
				$($container).width($container_width).height($container_height);
				$($oSlideDiv).width($container_width).height($container_height);
				($imagenes[$currentImage]["node"]).children().first().width($container_width).height($container_height);
				
				imgResize($imagenes[$currentImage]["img"],$container_height,$container_width,$imagenes[$currentImage]["width"]/$imagenes[$currentImage]["height"]);
				if(options.enableNavigationControls == true){
					$($nextButton).height($container_height);
					$($prewButton).height($container_height);
				}				
			}

			
		}else{
			 if( $container_height != $($outerContainer).height()  ||  $container_width != $($outerContainer).width()){
				$container_height=$($outerContainer).height();
				$container_width=$($outerContainer).width();
				
				$($container).width($container_width).height($container_height);
				$($oSlideDiv).width($container_width).height($container_height);
				if(typeof($imagenes[$currentImage]) != "undefined"){
					$imagenes[$currentImage]["node"].children().first().width($container_width).height($container_height);
				}

				if(typeof($imagenes[$currentImage])!="undefined"){
					imgResize($imagenes[$currentImage]["img"],$container_height,$container_width,$imagenes[$currentImage]["width"]/$imagenes[$currentImage]["height"]);
				}
				if(options.enableNavigationControls == true){
					$($nextButton).height($container_height);
					$($prewButton).height($container_height);
				}
			}
		}
		
		
		
	}				
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Slides to the next image																									#########################
//	pPublic method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

       this.SlideNext = function(ßcallback){

	   consoleOut(" public method: SlideNext() $nextImage: "+$nextImage+" $currentImage: "+$currentImage );
		
		if($isInTransition != true){
			$isInTransition = true;
			//$MainLoopTimer ="inactive";
			clearTimeout($mainLoopTimer);

			imagePreload(function(){
				loopControl();
				if(typeof(ßcallback) == "function" ){
					ßcallback();
				}
			});
		}
       };
       
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Slides to the prewious image																									#########################
//	pPublic method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	this.SlidePrew = function(callback){

	consoleOut("public method: SlidePrew() $nextImage: "+$nextImage+" $currentImage: "+$currentImage );
	  
		if($isInTransition != true){
			if($currentImage == 0){
				$nextImage = $imagenes.length -1;
			}else{
				$nextImage = $currentImage -1;
			}
			$slidingBack = true;
			$thisObj.SlideNext(callback);
		}
	};

 //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Slides to the next image																									#########################
//	pPublic method																											#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

	this.SlideToImg = function($imgId,callback){
		if($currentImage != $imgId){
			if($isInTransition != true){
				consoleOut("just called public method: SlideToImg($img = "+$imgId+" , callback2 = "+callback+") ");
				$nextImage = parseFloat($imgId);
	// 			clearTimeout($main_loop);
	// 			$timeLeft = options.sleep
				if($currentImage > $nextImage){
					$slidingBack = true;
				}
	
				$thisObj.SlideNext();
				if(typeof(callback) == "function" ){
					callback();
				}
			}
		}
    };     
       
   	
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																						#########################
//	private method 																		#########################
//	outputs a message to the console													#########################
// 																						#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	var consoleOut = function (message,type){
		var extendText = "oSlide: ";
		if(typeof(message) == 'undefined'){
			var message = "WARNING: a consoleOut event was called here without any message!";
		}
		if( typeof(console) !== 'undefined' && console != null && options.debug == true) {
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
	}



//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																						#########################
//	Google Closure compiler preservation attempts										#########################
//																						#########################
// 																						#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

var textDiv = function(){
	consoleOut("textDiv");
}

window['textDiv'] = textDiv;


//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 																														#########################
//	Launch the constructor																										#########################
// 																														#########################
//───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
	constructor();
   }; // end of oSlide
// ########################################################################################################################################################################################################
// ########################################################################################################################################################################################################
// ########################################################################################################################################################################################################
// ########################################################################################################################################################################################################
// ########################################################################################################################################################################################################


   $.fn.oSlide = function(options){
       return this.each(function()
       {
           var element = $(this);
          
           // Return early if this element already has a plugin instance
           if (element.data('JsObj')) return;

           // pass options to plugin constructor
           var myplugin = new oSlide(this, options); /// odo sustituir this por element

           // Store plugin object in this element's data
           element.data('JsObj', myplugin);
       });
   };
})(jQuery);