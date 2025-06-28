<?php
add_action('wp_enqueue_scripts', function() {
    // Blocksy stílusok
    wp_enqueue_style('blocksy-style', get_template_directory_uri() . '/style.css');
    wp_enqueue_style('blocksy-child-style', get_stylesheet_uri(), ['blocksy-style'], '1.0.0');

    // Saját JS fájl betöltése
    wp_enqueue_script(
        'szak-kereso-autocomplete',
        get_stylesheet_directory_uri() . '/js/szak-kereso.js',
        [],
        '1.0',
        true
    );
});

function szak_kereso_form() {
    ob_start();
    ?>
    <form method="get" action="<?php echo home_url(); ?>" class="szak-kereso-form">
        <input type="hidden" name="post_type" value="szak" />
        
        <div class="search-container">
            <input type="text" name="s" autocomplete="off"/>

            <div class="filter-wrapper">
                <select name="kepzestipus">
                    <option value="">Képzéstípus</option>
                    <?php
                    $terms = get_terms(['taxonomy' => 'kepzestipus', 'hide_empty' => false]);
                    foreach ($terms as $term) {
                        echo '<option value="' . esc_attr($term->slug) . '">' . esc_html($term->name) . '</option>';
                    }
                    ?>
                </select>

                <select name="szakterulet">
                    <option value="">Szakterület</option>
                    <?php
                    $terms = get_terms(['taxonomy' => 'szakterulet', 'hide_empty' => false]);
                    foreach ($terms as $term) {
                        echo '<option value="' . esc_attr($term->slug) . '">' . esc_html($term->name) . '</option>';
                    }
                    ?>
                </select>

                <button type="submit">Keresés</button>
            </div>
        </div>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('szak_kereso', 'szak_kereso_form');



function szak_kereses_lekerdezes($query) {
    if (!is_admin() && $query->is_main_query() && is_search() && $query->get('post_type') === 'szak') {

        // Képzéstípus
        if (!empty($_GET['kepzestipus'])) {
            $query->set('tax_query', [
                [
                    'taxonomy' => 'kepzestipus',
                    'field'    => 'slug',
                    'terms'    => sanitize_text_field($_GET['kepzestipus']),
                ]
            ]);
        }

        // Szakterület
        if (!empty($_GET['szakterulet'])) {
            $tax_query = $query->get('tax_query') ?: [];
            $tax_query[] = [
                'taxonomy' => 'szakterulet',
                'field'    => 'slug',
                'terms'    => sanitize_text_field($_GET['szakterulet']),
            ];
            $query->set('tax_query', $tax_query);
        }
    }
}
add_action('pre_get_posts', 'szak_kereses_lekerdezes');


add_action('wp_ajax_szak_kereso_elo', 'szak_kereso_elo');
add_action('wp_ajax_nopriv_szak_kereso_elo', 'szak_kereso_elo');

function szak_kereso_elo() {
    $keresett = sanitize_text_field($_GET['q']);

    $args = [
        'post_type' => 'szak',
        's' => $keresett,
        'posts_per_page' => 5,
    ];

    $query = new WP_Query($args);

    $eredmenyek = [];

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $eredmenyek[] = [
                'title' => get_the_title(),
                'url' => get_permalink(),
            ];
        }
    }

    wp_send_json($eredmenyek);
}



