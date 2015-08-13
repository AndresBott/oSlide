<?php
class oSlide{
	
	static function getAnimation ($id=0){
		switch($id){
			case 0:
				return'slideleft';
			break;
			case 1:
				return'slideright';
			break;		
			case 2:
				return 'fade';
			break;		
			case 3:
				return 'crosfade';
			break;
			default:
				return 'fade';			
			break;	
		}
	}
	
	static function extendDefaultOptions($args=0){
		$defaults=array(
			"width"=>"800px",
			"height"=>"350px",
			"animation"=>2,
			"fadetime"=>500,
			"sleeptime"=>6000,
			"multiplicator"=>0,
			"printcontrols"=>true,
			"zoom"=>false,
			"captions"=>false
		);
		
		if(is_array($args)){
			foreach ($defaults as $defaultKey => $defaultValue) {
				if(isset($args[$defaultKey])){
					$defaults[$defaultKey] = $args[$defaultKey];
				}	
			}
		}
		// check for some important values to be correct
		if(is_numeric($defaults["animation"])){
			$defaults["animation"] = oSlide::getAnimation($defaults["animation"]);
		}	
		return $defaults;	
	}
	
	// should print a oSlide without depending on a NextGen Gallery
	static function show (){
		
		
	}
	

	
	static function getNGG($args=0,$id="",$class = "oSlide"){
		// if NextGenGallery is not present -> exit
		if(!class_exists(nggdb)){
			return false;
		}
		$images = nggdb::get_gallery($args["galleryid"]);
		// if gallery has no images
		if(empty($images)){
			return false;
		}
						
		// the id of the oslide div
		if($id != false){
			$id='oSlide-'.$id;
		}else{
			$id = time();
		}
		
		$options = oSlide::extendDefaultOptions($args);
		
		

		// the string including oslide
		$return = "";
		
		$return .='<div id="'.$id.'"  class = "'.$class.'"  style="width:'.$options["width"].'; height:'.$options["height"].'"> </div>'."\n".'
					<script type="text/javascript">'."\n".'
					var Photos_'.str_replace("-", "_",$id).'=['."\n";
			foreach ($images  as $image) {
				$return .="\n".'{ "url": "'.$image->imageURL.'" } ,';
			}					
			
		// remove the last ','
		$return = substr($return,0, -1);
		$return .= "\n".']'."\n";
		
		// starting the Slide
		$return .= '
				jQuery(document).ready(function($){'."\n".'		
				$("#'.$id.'").oSlide({'."\n".'
					enableCaptions:false,
					fade_time:'.$options['fadetime'].',
					sleep:'.$options['sleeptime'].',
					enableNavigationBar: false,
				';
			if($options["printcontrols"] == true){
				$return .= '	enableNavigationControls: true,'."\n";					
			}else{
				$return .= '	enableNavigationControls: false,'."\n";										
			}
		$return .= '
					animation:"'.$options['animation'].'",'."\n".'	
					allowZoom: false,'."\n".'	
					images: Photos_'.str_replace("-", "_",$id).', 		// an array containing all data to the images'."\n".'	
				});'."\n";

			
		// Since height multiplicator is NOT Jet implemented in oSlide, i make it afterwards
		if($options["multiplicator"] != 0){
			$return .= '
				var ßproporcionDePeso = '.$options["multiplicator"].'
				var ßsliderHeight = $("#'.$id.'").height();
				var ßsliderHeightReudciotn = Math.round( ( (ßsliderHeight /100)*3)*ßproporcionDePeso);
				ßsliderHeight = ßsliderHeight - ßsliderHeightReudciotn;
	
				var ßsumHeight = Math.round(  $("#'.$id.'").width() * (ßproporcionDePeso/100));
				$("#'.$id.'").height(ßsliderHeight + ßsumHeight );

				$(window).resize();
				$(window).resize(function(){
					var ßsumHeight = Math.round($("#'.$id.'").width() * (ßproporcionDePeso/100));
					$("#'.$id.'").height(ßsliderHeight + ßsumHeight );
				})';	
		}

			
			
		$return .= '});'."\n";
		$return .= '</script>';
		return $return;	
		

				
	}//  getNGG
	
	
	static function printNGG($args=0,$id="",$class = "oSlide"){
		echo $this->getNGG($args,$id,$class);	
	}
	
	
	
	
	
	
	
	
	
	
	function nggShow_oSlide($args,$id="",$class = "oSlide"){
	//aBWpDebug($args);
	
	if(!class_exists(nggdb)){
		return false;
	}
	

	
	$return = "";	
	global $oslideLoaded;
	
	if($oslideLoaded == FALSE){
	
	
	if(PHP_OS=="Linux"){
		$oss = "/";
	}elseif(PHP_OS=="WIN"){
		$oss = "\\";
	}

	
	$url = plugins_url();
		
	$url2 = explode($oss,__FILE__);
	array_pop($url2);
	$url2 =  array_reverse ( $url2 );
	$url2 = $url2[0];
	$url = $url.$oss.$url2.$oss;
		


		
	$return .='  <script type="text/javascript" src="'.$url.'jquery.oSlide-0.9.3.2.js"></script>'."\n";
	$return .='  <link rel="stylesheet" type="text/css" href="'.$url.'oSlide-0.9.3.css" media="screen" /> '."\n";
	$oslideLoaded = true; 		
	}
	
	

	extract($args);
		

	
	if($id != false){
		$id='oSlide-'.$id;
	}else{
		$id = time();
	}
	
	
	switch($args['animation']){
		case 0:
			$animation = 'slideleft';
		break;
		case 1:
			$animation = 'slideright';
		break;		
		case 2:
			$animation = 'fade';
		break;		
		case 3:
			$animation = 'crossfade';
		break;
		default:
			$animation = 'fade';			
		break;	
	}
	
	$images = nggdb::get_gallery($args['galleryid']);
	
	$return .='<div id="'.$id.'"  class = "'.$class.'"  style="width:'.$args['width'].'; height:'.$args['height'].'"> </div>';
	$return .= "\n".'<script type="text/javascript">';
	$return .= "\n".' var Photos_'.str_replace("-", "_",$id).'=[';
			foreach ($images  as $image) {
				$return .="\n".'{ "url": "'.$image->imageURL.'" } ,';
			}
	$return = substr($return,0, -1);
	$return .= "\n".']'."\n";	
	

				
	// $return.='
		// jQuery(document).ready(function($) {
		   // //alert("hola");
		// });
	// ';
				
			

	$return .= '	jQuery(document).ready(function($){'."\n";
	$return .= '		$("#'.$id.'").oSlide({'."\n";		
	$return .= '			enableCaptions:false,'."\n";
	$return .= '			fade_time:'.$args['fadetime'].','."\n";				
	$return .= '			sleep:'.$args['sleeptime'].','."\n";				
	$return .= '			enableNavigationBar: false,'."\n";
		if(	$args['printcontrols'] == true){
			$return .= '	enableNavigationControls: true,'."\n";					
		}else{
			$return .= '	enableNavigationControls: false,'."\n";							
		}

		
	$return .= '			animation:"'.$animation.'",'."\n";
	$return .= '			allowZoom: false,'."\n";			
	$return .= '			images: Photos_'.str_replace("-", "_",$id).', 		// an array containing all data to the images'."\n";				
	$return .= '		});'."\n";				
	$return .= '	})	'."\n";				
	
	
	
	$return .= "\n".'</script>';

	
	return $return;
	

	
	
}



	
}
?>