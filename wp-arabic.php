<?php
/**
 * Plugin Name: WPArabic (عربي)- Typing Arabic in WordPress
 * Plugin URI:  https://wordpress.org/plugins/wparabic
 * Description: Possbility of Arabic Typing in WordPress. Arabi -> عربي It will enable you to write Arabic lating language content in Classic Editors
 * Version:     1.0.4
 * Author:      Hassan Ali
 * Author URI:  https://hassanali.pro
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: wparabic
 */

if ( ! class_exists( 'wparabic' ) ) {
    class wparabic {
		var $plugin_name = "";
        public function __construct() {
			$this->plugin_name = "wparabic";

			// Add Btn after 'Media'
			add_action( 'media_buttons', array($this, 'add_arabic_media_button'), 10);

			// enqueue for the front end styles and javascript
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts_style' ), 10 );

			//enqueue for the admin section styles and javascript
			add_action('admin_enqueue_scripts', array( $this, 'admin_style_scripts' ));

			//enable the second row in tiny mce and add font-size and font-family section
			add_filter( 'mce_buttons_2', array( $this,'wparabic_mce_editor_buttons') );

			//adding the list of fonts for Arabic Language
			add_filter( 'tiny_mce_before_init', array( $this,'wparabic_mce_before_init') );

			//adding the stylesheet to enable font in editor
			add_filter( 'init', array( $this,'wparabic_add_editor_styles') );

			//save the WP Arabic status in metadata
			add_action( 'save_post', array( $this, 'wparabic_save_status'), 1, 2 );

			//language support
			add_action( 'plugins_loaded', array( $this, 'wparabic_plugin_textdomain' ));
        }

		function wparabic_plugin_textdomain(){
			$plugin_rel_path = basename( dirname( __FILE__ ) ) . '/languages';
			load_plugin_textdomain( 'wparabic', false, $plugin_rel_path );
		}

		/**
		 * Add the style sheet in editor.
		 */
		public function wparabic_add_editor_styles() {
		    add_editor_style( plugin_dir_url( __FILE__ ) . "assets/css/editor-control.css" );
		}

		/**
		 * Add the "font-family and font-size" section in editor.
		 */

		public function wparabic_mce_editor_buttons( $buttons ) {

		    array_unshift( $buttons, 'fontselect' );
		    array_unshift( $buttons, 'fontsizeselect' );
		    return $buttons;
		}


		/**
		 * Add fonts to the "Font Family" drop-down.
		 */
		public function wparabic_mce_before_init( $settings ) {

		    $font_formats = "BalooBhaijaan = 'BalooBhaijaan', sans-serif;"
		    					. "Jomhuria = 'Jomhuria', sans-serif;"
		    					. "Thabit = 'Thabit', sans-serif;"
		    					. "Scheherazade = 'Scheherazade', sans-serif;";
		    $settings[ 'font_formats' ] = $font_formats;
		    $settings[ 'fontsize_formats' ] = "9px 10px 12px 13px 14px 16px 18px 21px 24px 28px 32px 36px 40px 42px 44px";

		    return $settings;

		}

		/**
		 * Add media button for enable and disable Wp Arabic option.
		 */
		function add_arabic_media_button() {
			global $post;
			$post_id = $post->ID;
			$wparabic_status = get_post_meta( $post_id, 'wparabic_save_status', true );
			if($wparabic_status == "yes"){ ?>
				<a href = "#" class = "button media-button-wparabic enabled active" title = "<?php echo __('Disbale WPArabic', $this->plugin_name); ?>">
					<img src="<?php echo plugin_dir_url( __FILE__ ) . 'assets/images/arabic.png'; ?>" alt="arabic" /><strong><?php echo __('Disbale WPArabic', $this->plugin_name); ?></strong>
					<input type="hidden" name="wparabic_save_status" value="yes" class="wparabic_save_status" />
				</a>
			<?php } else { ?>
				<a href = "#" class = "button media-button-wparabic enabled" title = "<?php echo __('Enable WPArabic', $this->plugin_name); ?>">
					<img src="<?php echo plugin_dir_url( __FILE__ ) . 'assets/images/arabic.png'; ?>" alt="arabic" /><strong><?php echo __('Enable WPArabic', $this->plugin_name); ?></strong>
					<input type="hidden" name="wparabic_save_status" value="no" class="wparabic_save_status" />
				</a>
			<?php
			}
		}

		/**
		 * Load frontend CSS & JS.
		 */
		public function enqueue_scripts_style(){
			//wp_enqueue_script('wparabic', plugin_dir_url( __FILE__ ) . 'assets/js/wparabic.js');

			wp_enqueue_style( 'wparabic', plugin_dir_url( __FILE__ ) . 'assets/css/wparabic.css' );

			wp_enqueue_style( 'wparabic-editor', plugin_dir_url( __FILE__ ) . "assets/css/editor-control.css" );
		}

		/**
		 * Load Backend Admin CSS & JS.
		 */
		public function admin_style_scripts( $page ) {
			if ( $page == 'post-new.php' || $page == 'post.php' ) {
				wp_enqueue_script('wparabic-translate-api', plugin_dir_url( __FILE__ ) . 'assets/js/translate-api.js', null, '1.0.0', true);

				wp_enqueue_script('wparabic-admin', plugin_dir_url( __FILE__ ) . 'assets/js/wparabic-admin.js', 'wparabic-translate-api', '1.0.0', true);
				wp_localize_script( 'wparabic-admin', 'arabic_text',
					array( 'arabic_enable' => __('Enable WPArabic', $this->plugin_name), 'arabic_disable' => __('Disable WPArabic', $this->plugin_name) )
				);

				wp_enqueue_script('wparabic-block', plugin_dir_url(__FILE__).'assets/js/block.js', array('wparabic-translate-api', 'wp-blocks', 'wp-element', 'wp-editor', 'wp-i18n', 'wp-edit-post'), '1.0.0', true );

				wp_enqueue_style( 'wparabic-translate', plugin_dir_url( __FILE__ ) . 'assets/css/translate.css' );

				wp_enqueue_style('wparabic-admin', plugin_dir_url( __FILE__ ) . 'assets/css/wparabic-admin.css');

				wp_enqueue_style( 'wparabic-editor', plugin_dir_url( __FILE__ ) . "assets/css/editor-control.css" );

				wp_enqueue_script( 'wparabic-block', plugin_dir_url(__DIR__).'assets/js/api.js', null, '1.0.0', true );
			}
		}

		/**
		 * Save the wp arabic option for post | page.
		 */
		function wparabic_save_status($post_id, $post){
			if(isset($_POST['wparabic_save_status'])){
				$wparabic_status = sanitize_text_field($_POST['wparabic_save_status']);
				update_post_meta( $post_id, 'wparabic_save_status', $wparabic_status );
			}
		}

    }
	$wparabic = new wparabic();
}
