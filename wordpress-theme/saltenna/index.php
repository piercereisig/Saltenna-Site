<?php
/**
 * Generic fallback template for posts and any page without a dedicated template.
 */
get_header();
?>

  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">Saltenna</span>
      <h1><?php the_title(); ?></h1>
    </div>
  </section>

  <section class="block">
    <div class="container">
      <?php
      while ( have_posts() ) {
        the_post();
        the_content();
      }
      ?>
    </div>
  </section>

<?php get_footer(); ?>
