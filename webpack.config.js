module.exports = {
    entry: './src/test/main.js',
    module: {
        loaders: [
        { test: /\.vue$/, loader: 'vue'},
        { test: /\.js$/, loader: 'babel-loader?presets[]=es2015',exclude: /node_modules/},
        { test: /\.scss$/, loaders: ["style", "css", "sass"] },
        { test: /\.less$/, loader: 'style!css!less'},
        { test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,loader: 'url'}
        ]
    },
    babel: {
        presets: ['es2015']
    },
    output:{
        filename: 'js/main.js'
    }
}