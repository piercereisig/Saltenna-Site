<?php
/**
 * Saltenna theme setup.
 */

function saltenna_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'script', 'style', 'search-form' ) );
}
add_action( 'after_setup_theme', 'saltenna_setup' );

function saltenna_assets() {
	wp_enqueue_style(
		'saltenna-styles',
		get_template_directory_uri() . '/assets/css/styles.css',
		array(),
		wp_get_theme()->get( 'Version' )
	);
	// Keep the fixed header below the WP admin bar when logged in.
	wp_add_inline_style( 'saltenna-styles', 'body.admin-bar .site-header{top:32px;}@media(max-width:782px){body.admin-bar .site-header{top:46px;}}' );

	wp_enqueue_script(
		'saltenna-main',
		get_template_directory_uri() . '/assets/js/main.js',
		array(),
		wp_get_theme()->get( 'Version' ),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'saltenna_assets' );

/**
 * URL helper for theme assets.
 */
function saltenna_asset( $path ) {
	return get_template_directory_uri() . '/assets/' . ltrim( $path, '/' );
}

/**
 * Permalink helper that works with any permalink structure.
 */
function saltenna_page_url( $slug ) {
	$page = get_page_by_path( $slug );
	return $page ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
}

/**
 * Customizer: LinkedIn feed settings.
 *
 * The live feed uses a widget service (e.g. SociableKIT): create a
 * "LinkedIn Page Posts" widget there, sign in with the company LinkedIn
 * page, and paste the embed URL here. Until then a follow card is shown.
 */
function saltenna_customize_register( $wp_customize ) {
	$wp_customize->add_section(
		'saltenna_linkedin',
		array(
			'title'    => __( 'LinkedIn Feed', 'saltenna' ),
			'priority' => 30,
		)
	);

	$wp_customize->add_setting(
		'saltenna_linkedin_embed',
		array(
			'default'           => 'https://widgets.sociablekit.com/linkedin-page-posts/iframe/25695728',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		'saltenna_linkedin_embed',
		array(
			'label'       => __( 'Feed widget embed URL', 'saltenna' ),
			'description' => __( 'Create a free "LinkedIn Page Posts" widget at sociablekit.com, sign in with the company LinkedIn page, then paste the embed URL here (looks like https://widgets.sociablekit.com/linkedin-page-posts/iframe/XXXXX). Leave empty to show the follow card instead.', 'saltenna' ),
			'section'     => 'saltenna_linkedin',
			'type'        => 'url',
		)
	);

	$wp_customize->add_setting(
		'saltenna_linkedin_url',
		array(
			'default'           => 'https://www.linkedin.com/company/saltenna/',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		'saltenna_linkedin_url',
		array(
			'label'   => __( 'Company LinkedIn page URL', 'saltenna' ),
			'section' => 'saltenna_linkedin',
			'type'    => 'url',
		)
	);
}
add_action( 'customize_register', 'saltenna_customize_register' );

/**
 * Create the site's pages the first time the theme is activated,
 * and point the front page at a static page so front-page.php is used.
 */
function saltenna_create_pages() {
	$pages = array(
		'Home'           => 'home',
		'About'          => 'about',
		'Communications' => 'communications',
		'Sensing'        => 'sensing',
		'Contact'        => 'contact',
	);

	foreach ( $pages as $title => $slug ) {
		if ( ! get_page_by_path( $slug ) ) {
			wp_insert_post(
				array(
					'post_title'  => $title,
					'post_name'   => $slug,
					'post_type'   => 'page',
					'post_status' => 'publish',
				)
			);
		}
	}

	$home = get_page_by_path( 'home' );
	if ( $home ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home->ID );
	}
}
add_action( 'after_switch_theme', 'saltenna_create_pages' );
