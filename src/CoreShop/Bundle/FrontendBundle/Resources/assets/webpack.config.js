const path = require('path');
const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
.setOutputPath('../public/build/')
.setPublicPath('/bundles/coreshopfrontend/build/')
.setManifestKeyPrefix('bundles/coreshopfrontend/')
.cleanupOutputBeforeBuild()

/*
 * ENTRY CONFIG
 *
 * Each entry will result in one JavaScript file (e.g. app.js)
 * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
 */
.addEntry('app', './js/app.ts')

// will require an extra script tag for runtime.js
// but, you probably want this, unless you're building a single-page app
.disableSingleRuntimeChunk()

/*
 * FEATURE CONFIG
 *
 * Enable & configure other features below. For a full
 * list of features, see:
 * https://symfony.com/doc/current/frontend.html#adding-more-features
 */
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
        quietDeps: true,
        silenceDeprecations: [
            'legacy-js-api',
            'slash-div',
        ],
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

.copyFiles([
    {
        from: "./node_modules/bootstrap-icons/font/fonts",
        to: "fonts/[path][name].[ext]",
        context: path.resolve(__dirname, "node_modules", "bootstrap-icons", "font", "fonts")
    },
    {
        from: "./node_modules/flag-icons/flags/4x3",
        to: "flag-icons/flags/4x3/[path][name].[ext]",
        context: path.resolve(__dirname, "node_modules", "flag-icons", "flags", "4x3")
    },
    {
        from: "./fonts",
        to: "fonts/[path][name].[ext]",
        context: path.resolve(__dirname, "..", "assets", "fonts")
    },
    {
        from: "./images",
        to: "images/[path][name].[ext]",
        context: path.resolve(__dirname, "..", "assets", "images")
    },
])
.addAliases({
    '@': `${__dirname}/node_modules`
})
;

module.exports = Encore.getWebpackConfig();