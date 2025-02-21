module.exports = {
    plugins: [
        require('postcss-url')({
            url: (asset) => {
                if (asset.url && asset.url.includes('fonts/')) {
                    asset.url = asset.url.replace('node_modules/bootstrap-icons/font', 'build');
                }
                if (asset.url && asset.url.includes('flags/')) {
                    asset.url = asset.url.replace('node_modules', 'build');
                }
                return asset.url;
            },
        }),
    ],
}