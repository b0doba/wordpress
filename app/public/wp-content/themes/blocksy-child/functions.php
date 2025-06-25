<?php
add_action('wp_enqueue_scripts', function() {
    // Blocksy szülőtéma stílusa – csak ha nem automatikusan töltődik
    wp_enqueue_style('blocksy-style', get_template_directory_uri() . '/style.css');

    // Gyerek téma stílusa
    wp_enqueue_style('blocksy-child-style', get_stylesheet_uri(), ['blocksy-style'], '1.0.0');
});
