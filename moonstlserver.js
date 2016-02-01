var express = require('express');
var bodyParser = require('body-parser');
var Concentrate = require("concentrate");
var GeoTIFF = require("geotiff");
var fs = require("fs");

var stlStreamer = require("./stlstreamer");
var elevation = require("./elevationgetter");

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var path = "ulcn2005_lpo_dd0.tif";
var moontiff;
var image;
fs.readFile(path, function(err, data) {
  if (err) throw err;
  moontiff = GeoTIFF.parse(data);
  image = moontiff.getImage();
  //console.log(moontiff.fileDirectories[0][0]);
  //console.log(moontiff.fileDirectories[0][1]);
});


var count = 0;

app.post("/Moon2STL/stl",function(req,res){
  console.time(count);
  
  var c = Concentrate();
  c.on("end", function() {
    res.end();
  }).on("readable", function() {
    c.pipe(res);
  });

  res.setHeader('Content-disposition', 'attachment; filename=' + req.body.filename);
  res.setHeader('Content-type', "application/sla");
  res.writeHead(200);

  //Had a realllllly interesting bug here for awhile because it turns out that
  //JavaScript yields "10"*3 = 30, but "10"+3 = '103'
  var width = Number(req.body.width);
  var height = Number(req.body.height);

  var sw = {lat:Number(req.body.swlat), lng:Number(req.body.swlng)};
  var se = {lat:Number(req.body.selat), lng:Number(req.body.selng)};
  var nw = {lat:Number(req.body.nwlat), lng:Number(req.body.nwlng)};

  var modelOptions = {sw:sw, se:se, nw:nw, width:width, height:height, scale:req.body.scale};

  elevation.getElevations(modelOptions,image,c,function(stream,elevations){
    elevationData = {xlen:width, ylen:height, scale:1/1895, values: elevations};

    stlStreamer.stream(elevationData,stream,function(){
      c.flush().end();
      console.timeEnd(count);
      count++;
    });
  });

});

app.listen(9000);
