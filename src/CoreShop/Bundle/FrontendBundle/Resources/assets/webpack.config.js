const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
// directory where compiled assets will be stored
.setOutputPath('../public/build/')
// public path used by the web server to access the output path
.setPublicPath('/build')
// only needed for CDN's or sub-directory deploy
//.setManifestKeyPrefix('')

/*
 * ENTRY CONFIG
 *
 * Each entry will result in one JavaScript file (e.g. app.js)
 * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
 */
.addEntry('app', './js/app.ts')

// When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
.splitEntryChunks()

// will require an extra script tag for runtime.js
// but, you probably want this, unless you're building a single-page app
.enableSingleRuntimeChunk()

/*
 * FEATURE CONFIG
 *
 * Enable & configure other features below. For a full
 * list of features, see:
 * https://symfony.com/doc/current/frontend.html#adding-more-features
 */
.cleanupOutputBeforeBuild()
.enableBuildNotifications()
.enableSourceMaps(!Encore.isProduction())
// enables hashed filenames (e.g. app.abc123.css)
// .enableVersioning(Encore.isProduction())

.configureBabel((config) => {
    config.plugins.push('@babel/plugin-transform-class-properties');
})

// enables @babel/preset-env polyfills
.configureBabelPresetEnv((config) => {
    config.useBuiltIns = 'usage';
    config.corejs = 3;
})
.enablePostCssLoader()
//enables Sass/SCSS support
.enableSassLoader((options) => {
    options.sassOptions = {
        outputStyle: 'compressed',
    };
})
.configureCssLoader((options) => {
    options.url = false;
})
// uncomment if you use TypeScript
.enableTypeScriptLoader()

// uncomment if you use React
//.enableReactPreset()

// uncomment to get integrity="..." attributes on your script & link tags
// requires WebpackEncoreBundle 1.4 or higher
//.enableIntegrityHashes(Encore.isProduction())

// uncomment if you're having problems with a jQuery plugin
//.autoProvidejQuery()
.copyFiles([
    {
        from: "./node_modules/bootstrap-icons/font/fonts",
        to: "../build/fonts/[path][name].[ext]",
    },
    {
        from: "./node_modules/flag-icons/flags/4x3",
        to: "../build/flag-icons/flags//4x3/[path][name].[ext]",
    },
    {
        from: "./fonts",
        to: "../build/fonts/[path][name].[ext]",
    },
])
;

module.exports = Encore.getWebpackConfig();