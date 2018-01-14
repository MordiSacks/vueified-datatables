let path = require('path');
/**
 *
 * @type {*|Api}
 */
let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

mix.setPublicPath('dist');

mix.options({
    processCssUrls: true,
});

/** Build src */
mix
    .js('src/vueifiedDataTables/js/vueifiedDataTables.js', 'dist/vueifiedDataTables')
    .sass('src/vueifiedDataTables/scss/vueifiedDataTables.scss', 'dist/vueifiedDataTables')
;

if (!mix.inProduction()) {
    mix.sourceMaps();
}

