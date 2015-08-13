<?php
/*
Plugin Name: oSlide for - Nex tGen Galley 
Plugin URI: http://URI_Of_Page_Describing_Plugin_and_Updates
Description: A brief description of the Plugin.
Version: 0.1
Author: Andrés Bott
Author URI: http://URI_Of_The_Plugin_Author
License: GPL3
*/


class nggoSlideWidget extends WP_Widget {

	function __construct() {
		$widget_ops = array('classname' => 'widget_oslide', 'description' => __( 'oslide widget', 'nggallery-oslide') );
		$this->WP_Widget('oSlide', __('NextGEN oSlide', 'nggallery-oslide'), $widget_ops);
		
		// include oslide class
		require(get_template_directory()."/plugins/wp-oslide-ngg-widget/oSlide.class.php");
		 
		if(is_active_widget(false, false, $this->id_base) ){
			
			// http://www.local/clientes/Fieitas/wpFieitas/wp-content/themes/wp_template
			$jsurl = get_template_directory_uri()."/plugins/wp-oslide-ngg-widget/jquery.oSlide-0.9.3.2.js";
			
			//$jsurl =  plugins_url( 'jquery.jresize.0.2.js' , __FILE__ );	
			wp_enqueue_script('oSlide', $jsurl, array('jquery'), "0.2", false);
			
			$styleurl = get_template_directory_uri()."/plugins/wp-oslide-ngg-widget/oSlide-0.9.3.css";
			
			//$styleurl = plugins_url( 'nggSPW.css' , __FILE__ );
			wp_enqueue_style( "oSlide-css", $styleurl ) ;			
			
		}

		

	}

	function widget( $args, $instance ) {

		extract( $args );
		$ngg_options = get_option('ngg_options');
			
		//$title = apply_filters('widget_title', empty( $instance['title'] ) ? __('Slideshow', 'nggallery-oslide') : $instance['title'], $instance, $this->id_base);

		$render = oSlide::getNGG($instance,$args[widget_id]);
		//$render = nggShow_oSlide($instance,$args[widget_id]);
		
		echo $before_widget;
		if ( $title){
			echo $before_title . $title . $after_title;
		}
	    echo $render;
		echo $after_widget;
	}// end of widget





	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		$instance['title'] = strip_tags($new_instance['title']);
		$instance['galleryid'] = (int) $new_instance['galleryid'];
		
			// oSlide args
			$instance['width'] = strip_tags($new_instance['width']) ;
			if(substr($instance['width'], -1) == "%"){
				$width=intval($instance['width']) ;
				$width = $width."%";
	
			}else{
				$width=intval($instance['width']) ;
				$width = $width."px";			
			}
			$instance['width'] = $width;
			
			$instance['height'] = strip_tags($new_instance['height']);
			if(substr($instance['height'], -1) == "%"){
				$height=intval($instance['height']) ;
				$height= $height."%";
			}else{
				$height=intval($instance['height']) ;
				$height = $height."px";			
			}
			$instance['height'] = $height;
			
			$instance['fadetime'] = (int) $new_instance['fadetime'];		
	
			$instance['sleeptime'] = (int) $new_instance['sleeptime'];
			if($instance['sleeptime'] == 0){
				$instance['sleeptime'] = 5000;
			}			
			
			$instance['animation'] = (int) $new_instance['animation'];
					
			
			$instance['multiplicator'] = preg_replace("/[^\d]/", "", 	$new_instance['multiplicator']);
			if(		$instance['multiplicator']  < 1){
						$instance['multiplicator'] = 0;
			}else if(		$instance['multiplicator']  > 600){
						$instance['multiplicator'] = 600;
			}
	
	
				
			if($new_instance['printcontrols'] == "on"){
						$instance['printcontrols'] = true;
			}else{
				$instance['printcontrols'] = false;
			}

		return $instance;
	}

	function form( $instance ) {
		global $wpdb;
		$defaults = array( 
			'title' => 'SlideShow', 
			'galleryid' => '1',
			'height' => '350px',
			'width' => '800px',
			'fadetime'=>'500',
			'sleeptime'=>'6000',
			'heightMultiplicator'=>0,
			'animation'=>'2',
			'printcontrols' => 1
		);
		
		$instance = wp_parse_args( $instance, $defaults ); 
	
		//aBWpDebug($instance);
		$tables = $wpdb->get_results("SELECT * FROM $wpdb->nggallery ORDER BY 'name' ASC ");
		
		echo '
			<p>
				<label for="'.  $this->get_field_id('title') .'">'. __('Title:') .'</label>
				<input class="widefat" id="'.  $this->get_field_id('title') .'" name="'.  $this->get_field_name('title') .'" type="text" value="'.  $instance['title'] .'" />
			</p>
			<p>
				<label for="'.  $this->get_field_id('galleryid') .'">'. __('Select Gallery:', 'nggallery') .'</label> 
				<select size="1" name="'.  $this->get_field_name('galleryid') .'" id="'.  $this->get_field_id('galleryid') .'" class="widefat">
					<option value="0" ';
						if (0 == $instance['galleryid']){ echo ' selected="selected" '; }
						echo ' >'. _e('All images', 'nggallery') .'</option>';
						if($tables) {
							foreach($tables as $table) {
								echo '<option value="'.$table->gid.'" ';
								if ($table->gid == $instance['galleryid']) echo "selected='selected' ";	
								echo '>'.$table->name.'</option>'."\n\t"; 
							}
						}
		echo '
				</select> 
			</p>

			
			
			<h4 style="margin-bottom:0px;"> '.  __('Slideshow size:','nggoslide').'</h4>
			<hr>   
			<p>
				<label for="'.  $this->get_field_id('width') .'">'. __('Width (px or %): ', 'nggallery') .'</label>
				<input class="widefat" id="'.  $this->get_field_id('width') .'" name="'.  $this->get_field_name('width') .'" type="text"  value="'.  $instance['width'] .'" />
			</p>
			<p>
				<label for="'.  $this->get_field_id('height') .'">'. __('Height (px or %):', 'nggallery') .'</label>
				<input class="widefat" id="'.  $this->get_field_id('height') .'" name="'.  $this->get_field_name('height') .'" type="text"  value="'.  $instance[ 'height'] .'" />
			</p>
			<p>
				<label for="'.  $this->get_field_id('multiplicator') .'">'. __('heightMultiplicator: ', 'nggallery') .'</label> 
				<input class="widefat" id="'.  $this->get_field_id('multiplicator') .'" name="'.  $this->get_field_name('multiplicator') .'" type="text"  value="'.  $instance['multiplicator'] .'" />
			</p>
	
			
						 
			<h4 style="margin-bottom:0px;"> '.  __('oslide Options:','nggoslide').'</h4>
			<hr> 		 
			<p>
					<label for="'.  $this->get_field_id('fadetime') .'">'. __('Transition Speed (ms): ', 'nggallery') .'</label> 
					<input id="'.  $this->get_field_id('fadetime').'" name="'.  $this->get_field_name('fadetime') .'" type="text"  value="'.  $instance['fadetime'] .'" />
			</p> 
			<p>
					<label for="'.  $this->get_field_id('sleeptime') .'">'. __('Sleep time(ms): ', 'nggallery') .'</label> 
					<input id="'.  $this->get_field_id('sleeptime') .'" name="'.  $this->get_field_name('sleeptime') .'" type="text"  value="'.  $instance['sleeptime'] .'" />
			</p>
			<p>
				<input id="'.  $this->get_field_id('printcontrols') .'" class="checkbox" name="'.  $this->get_field_name('printcontrols') .'" type="checkbox"  '. checked( $instance['printcontrols'], true ) .'  />
				<label for="'.  $this->get_field_id('printcontrols') .'">'. __('print controls ', 'nggallery') .'</label> 
			</p>
			<p>	
				<label for="'.  $this->get_field_id('animation') .'">'. __('animation effect:', 'nggallery') .'</label> 
					<select size="1" name="'.  $this->get_field_name('animation') .'" id="'.  $this->get_field_id('animation') .'" class="widefat">
						<option value="0" ';   	if (0 == $instance['animation'])  echo "selected='selected' " ; echo' >'. __('slide Left', 'nggallery') .'</option>
						<option value="1" '; 	if (1 == $instance['animation'])  echo "selected='selected' " ;	echo' >'. __('slide right', 'nggallery') .'</option>	
						<option value="2" '; 	if (2 == $instance['animation'])  echo "selected='selected' " ;	echo' >'. __('fade', 'nggallery') .'</option>	
						<option value="3" '; 	if (3 == $instance['animation'])  echo "selected='selected' " ;	echo' >'. __('corsfade', 'nggallery') .'</option>	
					</select>
			</p> 
			<hr> 			
		';
	}

}// end of class
// register it

function nggoSlideWidget_register_widgets() {
	register_widget( 'nggoSlideWidget' );
}

add_action( 'widgets_init', 'nggoSlideWidget_register_widgets' );


?>