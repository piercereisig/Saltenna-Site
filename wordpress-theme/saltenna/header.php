<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

  <header class="site-header">
    <div class="container nav-wrap">
      <a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Saltenna home">
        <img src="<?php echo esc_url( saltenna_asset( 'images/logo-white.png' ) ); ?>" alt="Saltenna" />
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
      <nav class="main-nav">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>"<?php echo is_front_page() ? ' class="active"' : ''; ?>>Home</a>
        <a href="<?php echo esc_url( saltenna_page_url( 'communications' ) ); ?>"<?php echo is_page( 'communications' ) ? ' class="active"' : ''; ?>>Communications</a>
        <a href="<?php echo esc_url( saltenna_page_url( 'sensing' ) ); ?>"<?php echo is_page( 'sensing' ) ? ' class="active"' : ''; ?>>Sensing</a>
        <a href="<?php echo esc_url( saltenna_page_url( 'about' ) ); ?>"<?php echo is_page( 'about' ) ? ' class="active"' : ''; ?>>About</a>
        <a href="<?php echo esc_url( saltenna_page_url( 'contact' ) ); ?>" class="nav-cta<?php echo is_page( 'contact' ) ? ' active' : ''; ?>">Contact Us</a>
      </nav>
    </div>
  </header>
