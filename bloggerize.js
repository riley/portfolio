'use strict';

var marked = require('marked');
var fs = require('fs');
var ejs = require('ejs');

// what the hell, node
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + '/' + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var homePagePostCount = 5;

// reading files asyncronously is unnecessarily complex for a script. IMHO
var posts = fs.readdirSync('app/_posts').reverse().map(function (file) {
    if (file === '.DS_Store') return null;
    return {
        fileName: file,
        html: '<article>' + marked(fs.readFileSync('app/_posts/' + file).toString()) + '</article>'
    };
}).filter(function (x) { return x; });


var indexStr = fs.readFileSync('app/stubs/index_template.html').toString();
var workStub = fs.readFileSync('app/stubs/work_stub.html').toString();

var index = ejs.render(indexStr, {title: 'Home', content: posts.slice(0, homePagePostCount).map(function (post) { return post.html; })}, {debug: true});
var about = ejs.render(indexStr, {title: 'About', content: workStub});

deleteFolderRecursive('app/blog'); // delete all old posts
fs.mkdirSync('app/blog');

// create blog posts
posts.forEach(function (post) {
    var date = new Date(post.fileName.substr(0, 10));
    var slug = post.fileName.split('_')[1].replace('.md', '');
    var postHtml = ejs.render(indexStr, {title: 'blog post', content: post.html}, {debug: true});
    fs.writeFileSync('app/blog/' + slug + '.html', postHtml);
});

// create archive page

fs.writeFileSync('app/index.html', index);
fs.writeFileSync('app/about.html', about);

process.exit();