var gulp = require('gulp'),
    parseArgs  = require('minimist'),
    fs = require('fs'),
    named = require('vinyl-named'),
    webpack = require('gulp-webpack'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    clean = require('gulp-clean')
    rename = require('gulp-rename');

var argv = parseArgs(process.argv.slice(2),{
    string: ['n'],
    default: {
        'n': 'nofound',
    }
});
var pth = 'src/' + (argv.n == 'nofound' ? '**' : argv.n);//src文件路径
var dpth = 'dist/' + (argv.n == 'nofound' ? '**' : argv.n);//dist文件路径

//编译项目
gulp.task('build', ['clean','createDist','bundle','sass','autofx','copy'])

gulp.task('createDist',function(){
    try{
        fs.statSync(dpth);
    }catch(e){
        ensureDirDist(dpth) 
    }  
}) 

gulp.task('clean', function(){
    return gulp.src(dpth)
        .pipe(clean())
})

//添加MD5后缀
/*gulp.task('MD5',['css', 'scripts', 'rev'])

gulp.task('css', function () {
    return gulp.src(dpth + '/css/*.css')
        .pipe(rev())
        .pipe(gulp.dest(dpth + '/css'))
        .pipe( rev.manifest() )
        .pipe( gulp.dest( dpth + '/css' ) );
});
 
gulp.task('scripts', function () {
    return gulp.src(dpth + '/js/*.js')
        .pipe(rev())
        .pipe(gulp.dest(dpth + '/js'))
        .pipe( rev.manifest() )
        .pipe( gulp.dest( dpth + '/js' ) );
});

gulp.task('rev', function () {
    return gulp.src([dpth + '/css/*.json', dpth + '/js/*.json', dpth + '/*.html'])
        .pipe( revCollector({
            replaceReved: true,
            dirReplacements: {
                'lib': 'css',
                'js': 'js',
                'cdn/': function(manifest_value) {
                    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                }
            }
        }) )
        .pipe( gulp.dest(dpth) );
});*/

gulp.task('bundle', function() {
  return gulp.src(pth + '/main.js')
    .pipe(named())
    .pipe(webpack(getConfig()))
    .pipe(gulp.dest(dpth + '/js/'))
})

//css相关 
gulp.task('sass', function () {
    gulp.src(pth + '/lib/*.scss')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sass())
        .pipe(gulp.dest(dpth+'/css'))
});

gulp.task('autofx', function () {
    gulp.src(dpth + '/css/*.css')
        .pipe(autoprefixer({
            browsers: ["last 20 versions"]
        }))
        .pipe(gulp.dest(dpth+'/css'));
});

gulp.task('copy', ['copy-html','copy-img']);

gulp.task('copy-html',function(){
    gulp.src(pth + "/*.html")
    .pipe(gulp.dest(dpth+'/'))
})

gulp.task('copy-img',function(){
    gulp.src(pth + "lib/!*.scss")
    .pipe(gulp.dest(dpth + "/img/"));
})

gulp.task('watch', function() {
  return gulp.src(pth + '/entry.js')
    .pipe(named())
    .pipe(webpack(getConfig({watch: true})))
    .pipe(gulp.dest(dpth + '/js/'))
})

function getConfig(opt) {
  var config = {
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
    devtool: 'source-map'
    }
    if (!opt) {
        return config
    }
    for (var i in opt) {
        config[i] = opt[i]
    }
    return config
}

//创建编译后的文件夹
function ensureDirDist(pth){
    fs.mkdirSync(pth);
    fs.mkdirSync(pth+'/css');
    fs.mkdirSync(pth+'/js');
    fs.mkdirSync(pth+'/img');
}

//初始化项目部分
//创建src各个文件夹
gulp.task('init',['prepare'])

function ensureDir(pth){
    fs.mkdirSync(pth);
    fs.mkdirSync(pth+'/components');
    fs.mkdirSync(pth+'/lib');
    createIndexHtml(pth);
    createEntryJs(pth);  
    createApp(pth)  
}

//创建index.html的模板
function createIndexHtml(pth){
    var str =
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta http-equiv="Cache-Control" content="no-transform"/>
    <meta http-equiv="Cache-Control" content="no-siteapp"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta content="yes" name="apple-touch-fullscreen"/>
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    <title></title>
    <script>function startTimer(){clearTimeout(refreshRemTimer),refreshRemTimer=setTimeout(refreshRem,300)}function refreshRem(){var e=docEl.getBoundingClientRect().width;e=e<240?240:e,e=e>1240?1240:e;var i=e/10;docEl.style.fontSize=i+"px"}var rem={},win=window,doc=win.document,docEl=doc.documentElement,refreshRemTimer;rem.init=function(){refreshRem(),win.addEventListener("resize",startTimer),win.addEventListener("pageshow",function(e){e.persisted&&startTimer()})},rem.init(),window.devicePixelRatio&&2==devicePixelRatio&&(document.querySelector("html").className="hairlines2"),window.devicePixelRatio&&devicePixelRatio>=3&&(document.querySelector("html").className="hairlines3");</script>
</head>
<body>
    <div id="app"></div>
    <script src="js/main.js"></script>
</body>
</html>`;
    fs.writeFileSync(pth + '/index.html', str)
}

//创建入口文件
function createEntryJs(pth){
    var str = 
`import Vue from 'vue'
import app from './components/app.vue'

new Vue({
   el: '#app',
   render: function(func){
   return func(app);
   }
})`

  fs.writeFileSync(pth + '/main.js', str)
}

//创建app.vue
function createApp(pth){
  var str = 
`<template>
  <div>Hello World!</div>
</template>

<script>
export default {
    name: 'app',
    components: {
    },
    mounted: function(){
    },
    data () {
        return {
        }
    }
}
</script>`

    fs.writeFileSync(pth + '/components/app.vue', str)
}

//若文件不存在，则创建文件，否则打开已有文件
gulp.task('prepare', function(cb){
    try{
        fs.statSync(dpth);
    }catch(e){
        ensureDir(pth);
    }
    return cb();
});

//初始化路径
gulp.task('set',function(){
    fs.readFile('package.json', 'utf-8',function(err,data){
        if (err) {
            console.log(err)
        }else{
            var data = JSON.parse(data);
            data.scripts.dev = 'webpack-dev-server --content-base ' + pth;

            var str = JSON.stringify(data, null, 2);          
            fs.writeFileSync('./package.json', str)
        }
    })

    fs.readFile('webpack.config.js', 'utf-8',function(err,data){
        if (err) {
            console.log(err)
        }else{
            var data = data;
            str = data.replace(/src\/\w{1,}\/main.js/, pth+'/main.js')
            fs.writeFileSync('./webpack.config.js', str)
        }
    })
})