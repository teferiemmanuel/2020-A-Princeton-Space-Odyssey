const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const buildPath = './build/';

module.exports = {
    entry: ['./src/app.js'],
    output: {
        path: path.join(__dirname, buildPath),
        filename: '[name].[hash].js',
        publicPath: `/${pkg.repository}/`,
    },
    target: 'web',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                test: /\.(jpe?g|png|gif|svg|tga|gltf|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg)$/i,
                use: 'file-loader',
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                test: /\.(vert|frag|glsl|shader|txt)$/i,
                use: 'raw-loader',
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                type: 'javascript/auto',
                test: /\.(json)/,
                exclude: path.resolve(__dirname, './node_modules/'),
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                test: /\.(html)$/,
                use: ['html-loader'],
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                test: /\.(ttf)$/,
                loader: 'url-loader?limit=100000',
            }
        ],
    },
    resolve: {
        alias: {
            lights$: path.resolve(__dirname, 'src/components/lights'),
            objects$: path.resolve(__dirname, 'src/components/objects'),
            scenes$: path.resolve(__dirname, 'src/components/scenes'),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
          favicon: 'src/favicon.ico',
          template: 'src/index.ejs'
        }),
        new CopyPlugin([{
          from: "./src/style.css",
          to: "style.css" }]),
        new CopyPlugin([{
          from: "./src/textures",
          to: "textures" }]),
        new CopyPlugin([{
          from: "./src/starwing.ttf",
          to: "starwing.ttf" }])
    ],
};
