/**
 * 展示地球
 */

var center = [110.98, 30.83];
var lat_String;
var log_String;
var west;
var north;
var east;
var south;
var charFlag = 0;
var geodata = null;
var geoJsonLayer = null;
var miningDataSource = null;
var waterdata = null;
var waterJsonLayer = null;
var waterDataSourse = null;
var snowdata = null;
var snowJsondata = null;
var snowDataSource = null;
var provincedata = null;
var provdata = null;
var provJsonData = null;
var provDataSource = null;
var points = null;
var dayofPowerData = null;
var powerMadeData = null;
var ecOfPowerData = null;
var perPowerData = null;
var provincePowerData = null;
var powerCountData = null;
var powerConsumpationData = null;
var tiandituBasic;
var showPoints = [];
var inRecPoints = [];
var inPolygnPoints = [];
var nuclearPS = [];
var thermalPS = [];
var hydraulicPS = [];
var photovoltaicPS = [];
var changesubstationPS = [];
var windPS = [];
var tower;
var towerData = null;
var hydropower;
var hydropowerData = null;
var thermalpower;
var thermalpowerData = null;
var solarpower;
var solarpowerData = null;
var transformer;
var transformerData = null;
var windpower;
var windpowerData = null;
var powerIndentification = null;
var transPS = null;
var area = 0;
var lng1 = '';
var lat1 = '';
var lng2 = '';
var lat2 = '';
var mapconfig = null;
var basicMapProvider;
var viewer;
var canvas;
var scene ;
var clock ;
var camera ;
var layers ;
var lables;
//地球的基本显示
$(function () {

  //地图初始地图服务
  if(mapconfig===null){
    //底图添加操作
    try{
      $.getJSON('./json/mapconfig.json',function (data) {
        if(data){
          mapconfig = data;
          if(mapconfig.initBaseLayer.length>0){
            var num = mapconfig.initBaseLayerNum;
            if(mapconfig.initBaseLayer[num].map_service==="WMTS"){
              basicMapProvider = new Cesium.WebMapTileServiceImageryProvider({
                url: mapconfig.initBaseLayer[num].url,
                layer:mapconfig.initBaseLayer[num].layer ,
                style: mapconfig.initBaseLayer[num].style,
                format: mapconfig.initBaseLayer[num].format,
                minimumLevel: mapconfig.initBaseLayer[num].minimumLevel,
                maximumLevel: mapconfig.initBaseLayer[num].maximumLevel,
                show: true
              });
              tiandituBasic = basicMapProvider;
            }else if(mapconfig.initBaseLayer[num].map_service==="MapBox"){
              basicMapProvider = new Cesium.MapboxImageryProvider({
                mapId:mapconfig.initBaseLayer[num].layer,
                minimumLevel: mapconfig.initBaseLayer[num].minimumLevel,
                maximumLevel: mapconfig.initBaseLayer[num].maximumLevel
              });
              tiandituBasic = basicMapProvider;
            }else if(mapconfig.initBaseLayer[num].map_service==="URL"){
              basicMapProvider = new Cesium.UrlTemplateImageryProvider({url:mapconfig.initBaseLayer[num].url});
              tiandituBasic = basicMapProvider;
            }
          }
        }
        setGloble();
      });
    }catch (err){
      alert(err);
    }
  }else {
    var url = "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali";
    basicMapProvider =  new Cesium.UrlTemplateImageryProvider({url:url});
    /*basicMapProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      minimumLevel: 1,
      maximumLevel: 17,
      show: true
    });*/
    tiandituBasic = basicMapProvider;
    setGloble();
  }




  //creatTestTrect(116.24954714577959,32.41727464542304,116.31330112261413,32.3747574264859);

});

//显示地球
function setGloble() {
  viewer = new Cesium.Viewer('cesiumContainer',{
    animation: false,//是否创建动画小器件，左下角仪表
    baseLayerPicker: false,//是否显示图层选择器
    fullscreenButton: false,//是否显示全屏按钮
    geocoder: false,//是否显示geocoder小器件
    homeButton: false,//是否显示Home按钮形以3D模式绘制以节约GPU资源
    selectionIndicator: false,//选中元素显示，默认true
    infoBox: false,//是否显示信息框
    sceneModePicker: true,//是否显示3D/2D选择器
    timeline: false,//是否显示时间轴
    navigationHelpButton: false,//是否显示右上角帮助按钮
    scene3DOnly: false, //如果设置为true，则只能显示三维

    imageryProvider: basicMapProvider
    /*
    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
      url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS?",
      layer: "World_Imagery",
      style: "default",
      format: "image/jpeg",
      minimumLevel: 1,
      maximumLevel: 17,
      show: true
    })

    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      minimumLevel: 1,
      maximumLevel: 17,
      show: true
    })
        /*new Cesium.WebMapServiceImageryProvider({
            url: "http://mrdata.usgs.gov/services/al?service=WMS&version=1.1.1&request=GetMap&srs=EPSG:4326&format=image/gif&layers=Alabama_Lithology&STYLES=&EXCEPTIONS=INIMAGE&transparent=true",
            show: true
        })*/

  });


  //取消下面字体
  viewer._cesiumWidget._creditContainer.style.display="none";


  canvas=viewer.scene.canvas;
  scene = viewer.scene;
  pick = scene.pick;
  clock = viewer.clock;
  camera = viewer.scene.camera;
  layers = viewer.scene.imageryLayers;
  lables = scene.primitives.add(new Cesium.LabelCollection());


//三维地形的加载
/*
    var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
      url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
      //水的波纹效果
      requestWaterMask : true,
      requestVertexNormals : true
    });
    viewer.scene.globe.terrainProvider = cesiumTerrainProviderMeshes;
  //取消光照
    viewer.scene.globe.enableLighting = false;*/







  //geocoder程序
  /*
    function cancelGeocode(viewModel) {
      viewModel._isSearchInProgress = false;
      if (Cesium.defined(viewModel._geocodeInProgress)) {
        viewModel._geocodeInProgress.cancel = true;
        viewModel._geocodeInProgress = undefined;
      }
    }

    function updateCamera(viewModel, destination) {
      viewModel._scene.camera.flyTo({
        destination : destination,
        complete: function() {
          viewModel._complete.raiseEvent();
        },
        duration : viewModel._flightDuration,
        endTransform : Cesium.Matrix4.IDENTITY
      });
    }

    function geocode(viewModel) {
      var query = viewModel.searchText;

      if (/^\s*$/.test(query)) {
        //whitespace string
        return;
      }

      // If the user entered (longitude, latitude, [height]) in degrees/meters,
      // fly without calling the geocoder.
      var splitQuery = query.match(/[^\s,\n]+/g);
      if ((splitQuery.length === 2) || (splitQuery.length === 3)) {
        var longitude = +splitQuery[0];
        var latitude = +splitQuery[1];

        var obj = GPS.gcj_decrypt_exact(latitude,longitude);
        var height = (splitQuery.length === 3) ? +splitQuery[2] : 300.0;

        if (!isNaN(longitude) && !isNaN(latitude) && !isNaN(height)) {
          updateCamera(viewModel, Cesium.Cartesian3.fromDegrees(obj.lon,obj.lat, height));
          return;
        }
      }
      viewModel._isSearchInProgress = true;

      var smPOI = 'http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.jsonp';
      var promise = Cesium.loadJsonp(smPOI, {
        parameters : {
          keywords : query,
          city : "北京市",
          location : '',
          radius : '',
          leftLocation : '',
          rightLocation : '',
          pageSize : 50,
          pageNum : 1,
          key:"S4lcB1k7tOv22H2paEuN7RSf" // your personal key, you can get it from SuperMap Online
        },
        callbackParameterName : 'callback',
        jsonpName : 'callBack'
      });
      var geocodeInProgress = viewModel._geocodeInProgress = Cesium.when(promise, function(result) {
        if (geocodeInProgress.cancel) {
          return;
        }
        viewModel._isSearchInProgress = false;

        if (result.length === 0 || result.totalHints === 0) {
          viewModel.searchText = viewModel._searchText + ' (not found)';
          return;
        }
        if(Cesium.defined(viewModel.entities)){
          for(var i=0;i<viewModel.entities.length;i++)
          {
            viewer.entities.remove(viewModel.entities[i]);
          }
        }
        viewModel.entities = [];

        var obj;
        for(var i=0;i<result.poiInfos.length;i++)
        {
          var resource = result.poiInfos[i];
          viewModel._searchText = resource.name;
          var location = resource.location;

          obj = GPS.gcj_decrypt_exact(location.y,location.x);

          var entity = {
            id:resource.name + i,
            position : Cesium.Cartesian3.fromDegrees(obj.lon,obj.lat),
            point : {
              show : true, // default
              color : Cesium.Color.SKYBLUE, // default: WHITE
              pixelSize : 10, // default: 1
              outlineColor : Cesium.Color.YELLOW, // default: BLACK
              outlineWidth : 3 // default: 0
            }
          };

          entity.description = new Cesium.ConstantProperty(resource.name);

          viewModel.entities.push(entity);
          viewer.entities.add(entity);
        }

        updateCamera(viewModel, Cesium.Cartesian3.fromDegrees(obj.lon,obj.lat, height));
      }, function() {
        if (geocodeInProgress.cancel) {
          return;
        }

        viewModel._isSearchInProgress = false;
        viewModel.searchText = viewModel._searchText + ' (error)';
      });
    }

    var geocoder = viewer.geocoder.viewModel;

    geocoder._searchCommand = Cesium.createCommand(function() {
      if (geocoder.isSearchInProgress) {
        cancelGeocode(geocoder);
      } else {
        geocode(geocoder);
      }
    });*/

  /*全球重要城市图
  viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
      url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/WorldTimeZones/MapServer/WMTS/tile/1.0.0/WorldTimeZones/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      layer: "tdtAnnoLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
      show: false,
      maximumLevel: 19
  }));*/
  /*
  blackMarble.alpha = 0.75;*/
  setView(111.07, 39.05, 10000000);

//setView(116.28073233104128, 32.39633196789283, 12016.734);


  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  var longitude_show=document.getElementById('longitude_show');
  var latitude_show=document.getElementById('latitude_show');
  var altitude_show=document.getElementById('altitude_show');
//具体事件的实现
  var ellipsoid=viewer.scene.globe.ellipsoid;
  var handler = new Cesium.ScreenSpaceEventHandler(canvas);
  handler.setInputAction(function(movement){
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    var cartesian=viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
    if(cartesian){
      //将笛卡尔三维坐标转为地图坐标（弧度）
      var cartographic=viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      //将地图坐标（弧度）转为十进制的度数
      lat_String=Cesium.Math.toDegrees(cartographic.latitude).toFixed(14);
      log_String=Cesium.Math.toDegrees(cartographic.longitude).toFixed(14);
      var alti_String=(viewer.camera.positionCartographic.height/1000).toFixed(6);
      longitude_show.innerHTML=log_String;
      latitude_show.innerHTML=lat_String;
      altitude_show.innerHTML=alti_String;
    }
    else {
      longitude_show.innerHTML="";
      latitude_show.innerHTML="";
    }
  },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  var topRect = new Rectangle(viewer);
  var toolbar = topRect.addToolbar(document.getElementById("selwin"), {
    buttons: ['extent']
  });
  toolbar.addListener('extentCreated', function (event) {
    var extent = event.extent;
    north = Cesium.Math.toDegrees(extent.north).toFixed(14);
    west = Cesium.Math.toDegrees(extent.west).toFixed(14);
    south = Cesium.Math.toDegrees(extent.south).toFixed(14);
    east = Cesium.Math.toDegrees(extent.east).toFixed(14) ;
    //alert(x1 +" "+x2+" "+y1 +" "+y2 +"   "+points[0].latitude+" "+points[0].longitude);
    var extentPrimitive = new Rectangle.ExtentPrimitive({
      extent: extent
      //material: Cesium.Material.fromType(Cesium.Material.StripeType)
    });
    scene.primitives.add(extentPrimitive);
    handler.setInputAction(function () {
      if(west){
        setRectangleView(west,south,east,north);
      }

      //setRectangleView(west,south,east,north);

      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    extentPrimitive.setEditable();
    extentPrimitive.addListener('onEdited', function (event) {
      var extent = event.extent;
      north = Cesium.Math.toDegrees(extent.north).toFixed(14);
      west = Cesium.Math.toDegrees(extent.west).toFixed(14);
      south = Cesium.Math.toDegrees(extent.south).toFixed(14);
      east = Cesium.Math.toDegrees(extent.east).toFixed(14) ;
    });

  });





  var drawPolygon = new Polygon(viewer);
  var polygon = drawPolygon.addToolbar(document.getElementById("polygonBox"), {
    buttons: [ 'polygon']
  });
  polygon.addListener('polygonCreated', function (event) {

    var polygon = new Polygon.PolygonPrimitive({
      positions: event.positions
      //material: Cesium.Material.fromType('Checkerboard')
    });
    scene.primitives.add(polygon);
    polygon.setEditable();
  });

  var rec = new rect(viewer);
  var tool = rec.addToolbar(document.getElementById("rectBox"), {
    buttons: [ 'extent']
  });
  tool.addListener('extentCreated', function (event) {
    extent = event.extent;
    cx1 = Cesium.Math.toDegrees(extent.north).toFixed(14);
    cy1 = Cesium.Math.toDegrees(extent.west).toFixed(14);
    cx2 = Cesium.Math.toDegrees(extent.south).toFixed(14);
    cy2 = Cesium.Math.toDegrees(extent.east).toFixed(14) ;
    //alert(x1 +" "+x2+" "+y1 +" "+y2 +"   "+points[0].latitude+" "+points[0].longitude);

    var extentPrimitive = new rect.ExtentPrimitive({
      extent: extent
      //material: Cesium.Material.fromType(Cesium.Material.StripeType)
    });
    scene.primitives.add(extentPrimitive);
    extentPrimitive.setEditable();
    extentPrimitive.addListener('onEdited', function (event) {
      var extent = event.extent;
      cx1 = Cesium.Math.toDegrees(extent.north).toFixed(14);
      cy1 = Cesium.Math.toDegrees(extent.west).toFixed(14);
      cx2 = Cesium.Math.toDegrees(extent.south).toFixed(14);
      cy2 = Cesium.Math.toDegrees(extent.east).toFixed(14) ;
    });

    //for (i=0;i<inRecPoints.length;i++){
    //   alert(inRecPoints[i].name+" "+inRecPoints[i].latitude+" "+inRecPoints[i].longitude);
    // }
  });
}

//设置窗口视野范围
function setRectangleView(minlng,minlat,maxlng,maxlat) {
  var midlng = (maxlng - minlng)/10;
  var midlat = (maxlat - minlat)/10;

  var w = minlng-midlng;
  var s = minlat-midlat;
  var e = Number(maxlng)+midlng;
  var n = Number(maxlat)+midlat;
  var rect = new Cesium.Rectangle.fromDegrees(w,s,e,n);
  viewer.camera.flyTo({
    destination: rect});
}
function isInPoy(px,py, poly) {
  var sum = 0;

  for(var i = 0, l = poly.length-1, j = l - 1; i < l; j = i, i++) {
    var sx = poly[i].longitude,
      sy = poly[i].latitude,
      tx = poly[j].longitude,
      ty = poly[j].latitude;

    // 点与相邻顶点连线的夹角
    var angle = Math.atan2(sy - py, sx - px) - Math.atan2(ty - py, tx - px);

    // 确保夹角不超出取值范围（-π 到 π）
    if(angle >= Math.PI) {
      angle = angle - Math.PI * 2
    } else if(angle <= -Math.PI) {
      angle = angle + Math.PI * 2
    }

    sum += angle
  }

  // 计算回转数并判断点和多边形的几何关系
  return Math.round(sum / Math.PI) === 0 ? 'out' : 'in'
}
function back(callback) {
  callback=[west,south, east,north,rectangle];
  return callback;
}

function point(callback) {
    callback = points;
    return callback;
}
function isInRect(latitude,longitude,x1,y1,x2,y2){
    if(latitude < x1 && latitude > x2 && longitude > y1 && longitude < y2){
        return true;
    }else{
        return false;
    }
}

function showGeoJson(uri,num) {
  if(num===1){
    //Cesium.Math.setRandomNumberSeed(0);
    if(geodata===null){
      $.getJSON(uri,function (data) {
        geodata = data;
      });
    }
    if(geoJsonLayer===null){
      geoJsonLayer = Cesium.GeoJsonDataSource.load(uri);
    }
    geoJsonLayer.then(function(dataSource) {
      if(miningDataSource===null){
        miningDataSource = dataSource;
      }
      viewer.dataSources.add(miningDataSource);
      var entities = miningDataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.name = geodata.features[i].id;
        entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.BLACK,0.75);
        entity.polygon.extrudedHeight = -5000;
        entity.polygon.outline = true;
        entity.polygon.outlineWidth = 10;
        //实体动态添加属性
        entity['feature'] = "某矿区";
        //var color = colorHash[name];
        /*if (!color) {
            color = Cesium.Color.fromRandom({
                alpha : 1.0
            });
            colorHash[name] = color;
        }*/

        //entity.polygon.extrudedHeight =5000.0;
      }
    });
    return true;
  }else if (num===2){
    if(waterdata===null){
      $.getJSON(uri,function (data) {
        waterdata = data;
      });
    }
    if(waterJsonLayer===null){
      waterJsonLayer = Cesium.GeoJsonDataSource.load(uri);
    }
    waterJsonLayer.then(function(dataSource) {
      if(waterDataSourse===null){
        waterDataSourse = dataSource;
      }
      viewer.dataSources.add(waterDataSourse);
      var entities = waterDataSourse.entities.values;
      var colorHash = {};
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.name = waterdata.features[i].id;
        var color = Cesium.Color.BLUE;
        //var color = colorHash[name];
        /*if (!color) {
            color = Cesium.Color.fromRandom({
                alpha : 1.0
            });
            colorHash[name] = color;
        }*/
        entity.polygon.material = color;
        entity.polygon.outline = true;
        //entity.polygon.extrudedHeight =5000.0;
      }
    });
    return true;
  }else if(num ===3){
    if(snowdata===null){
      $.getJSON(uri,function (data) {
        snowdata = data;
      });
    }
    if(snowJsondata===null){
      snowJsondata = Cesium.GeoJsonDataSource.load(uri);
    }
    snowJsondata.then(function(dataSource) {
      if(snowDataSource===null){
        snowDataSource = dataSource;
      }
      viewer.dataSources.add(snowDataSource);
      var entities = snowDataSource.entities.values;
      var colorHash = {};
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.name = snowdata.features[i].id;
        var color = Cesium.Color.BLUE;
        //var color = colorHash[name];
        /*if (!color) {
            color = Cesium.Color.fromRandom({
                alpha : 1.0
            });
            colorHash[name] = color;
        }*/
        entity.polygon.material = color;
        entity.polygon.outline = true;
        //entity.polygon.extrudedHeight =5000.0;
      }
    });
    return true;
  }else if(num ===4){

    if(provJsonData===null){
      provJsonData = Cesium.GeoJsonDataSource.load(uri)
    }
    provJsonData.then(function(dataSource) {
      if(provDataSource===null){
        provDataSource = dataSource;
      }

      viewer.dataSources.add(provDataSource);
      var entities = provDataSource.entities.values;
      if(provdata===null){
        $.getJSON(uri,function (data) {
          provdata = data;
          for (var i = 0; i < provdata.features.length; i++) {
            var entity = entities[i];
            if(entity.polygon!==undefined){
            entity.name = provdata.features[i].properties.NAME;
            entity['EPC'] = provdata.features[i].properties.EPC;
            entity['Area'] = provdata.features[i].properties.Area;
            entity['p'] = provdata.features[i].properties.p;
            entity['GDP'] = provdata.features[i].properties.GDP;
            entity['pGDP'] = provdata.features[i].properties.pGDP;
            //压缩后的GeoJson里香港澳门因面积小没有统计
              //分层设色
             entity.polygon.extrudedHeight = provdata.features[i].properties.EPC*100;
             entity.polygon.material = setColor(provdata.features[i].properties.EPC);
             entity.polygon.outline = true;
             entity.polygon.outlineColor = Cesium.Color.YELLOW;
             entity.polygon.outlineWidth = 250;
            }
          }
          var entity1  = entities[34];
          entity1['EPC'] = provdata.features[33].properties.EPC;
          entity1['Area'] = provdata.features[33].properties.Area;
          entity1['p'] = provdata.features[33].properties.p;
          entity1['GDP'] = provdata.features[33].properties.GDP;
          entity1['pGDP'] = provdata.features[33].properties.pGDP;
          entity1.polygon.material = setColor(provdata.features[33].properties.EPC);
          entity1.polygon.outline = true;
        });
      }else {
        for (var i = 0; i < provdata.features.length; i++) {
          var entity = entities[i];
          if(entity.polygon!==undefined) {
            entity.name = provdata.features[i].properties.NAME;
            entity['EPC'] = provdata.features[i].properties.EPC;
            entity['Area'] = provdata.features[i].properties.Area;
            entity['p'] = provdata.features[i].properties.p;
            entity['GDP'] = provdata.features[i].properties.GDP;
            entity['pGDP'] = provdata.features[i].properties.pGDP;
            entity1.polygon.material = setColor(provdata.features[31].properties.EPC);
            entity1.polygon.outline = true;
          }
        }
        var entity1  = entities[34];
        entity1['EPC'] = provdata.features[33].properties.EPC;
        entity1['Area'] = provdata.features[33].properties.Area;
        entity1['p'] = provdata.features[33].properties.p;
        entity1['GDP'] = provdata.features[33].properties.GDP;
        entity1['pGDP'] = provdata.features[33].properties.pGDP;
        entity1.polygon.material = setColor(provdata.features[33].properties.EPC);
        entity1.polygon.outline = true;
      }

    });
    return true;
  }else
    return false;
}
function deleteGeoJson(dataname,dataSourceName) {
  if (dataname) {
    viewer.dataSources.remove(dataSourceName,true);
  }
}
function setView(longitude,latitude,height) {
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
            heading : Cesium.Math.toRadians(0),
            pitch : Cesium.Math.toRadians(-90),
            roll : Cesium.Math.toRadians(0)
        }
    });
}
function flyTo(longitude,latitude,height) {
    if(height ==null) height = 1041.8;
    viewer.camera.flyTo({
        destination :  Cesium.Cartesian3.fromDegrees(longitude,latitude, height), // 设置位置
        orientation: {
            heading : Cesium.Math.toRadians(0),
            pitch : Cesium.Math.toRadians(-90),
            roll : Cesium.Math.toRadians(0)
        },
        duration:1.5//飞入时间
    });
    return true;
}
//计算面积
function computeSignedArea(path) {
var radius= 6371009;
var len = path.length;
if (len < 3) return 0;
var total = 0;
var  prev = path[len - 1];
var prevTanLat = Math.tan(((Math.PI / 2 - prev.latitude/180*Math.PI) / 2));
var prevLng = (prev.longitude)/180*Math.PI;
for (var i in path) {
  var tanLat = Math.tan((Math.PI / 2 -
    (path[i].latitude)/180*Math.PI) / 2);
  var lng = (path[i].longitude)/180*Math.PI;
  total += polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
  prevTanLat = tanLat;
  prevLng = lng;
}
//单位万平方公里
return Math.abs(total * (radius * radius)/10000000000);
}
function polarTriangleArea(tan1,lng1,tan2,lng2) {
  var deltaLng = lng1 - lng2;
  var t = tan1 * tan2;
  return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
}
//添加多边形
x = {
    'name': '淮南',
    'landused': {
    'id1': {'mianji':1230 ,'fanwei1': [119, 40, 116, 40, 116, 34, 119, 34]},
    'id2': {'fanwei2': [119, 28, 119, 34, 116, 34, 116, 28]},
    'id3': {'fanwei3': [102, 44, 104, 44, 104, 45, 105, 45, 105, 44, 106, 44, 106, 42, 107, 42, 107, 43, 108, 43, 108, 41, 104, 41, 104, 42, 105, 42, 105, 43, 102, 43]},
    'id4': {'fanwei4': [0, 0, 0, 3, 3, 3, 3, 2, 1, 2, 1, 1, 4, 1, 4, 6, 0, 6, 0, 7, 5, 7, 5, 0]}
    }
    };
var wyoming = {
    name : 'wyoming',
    polygon : {
        hierarchy : Cesium.Cartesian3.fromDegreesArray(x.landused.id1.fanwei1),
        material : Cesium.Color.RED.withAlpha(0.5),
        outline : true,
        outlineColor : Cesium.Color.BLACK
    },
    position: Cesium.Cartesian3.fromDegrees( 117, 37),
    label : { //文字标签
        text: '工业区',
        font: '14pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
        pixelOffset: new Cesium.Cartesian2(0, -9)   //偏移量
    }
};
wyoming2 = {
    name : 'wyoming',
    polygon : {
        hierarchy : Cesium.Cartesian3.fromDegreesArray(x.landused.id2.fanwei2),
        material : Cesium.Color.BLUE.withAlpha(0.5),
        outline : true,
        outlineColor : Cesium.Color.BLACK
    },
    position: Cesium.Cartesian3.fromDegrees( 117, 31),
    label : { //文字标签
        text: '农业区',
        font: '14pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
        pixelOffset: new Cesium.Cartesian2(0, -9)   //偏移量
    }
};
wyoming3 = {
    name : 'wyoming',
    polygon : {
        hierarchy : Cesium.Cartesian3.fromDegreesArray(x.landused.id4.fanwei4),
        material : Cesium.Color.BLUE.withAlpha(0.5),
        outline : true,
        outlineColor : Cesium.Color.BLACK
    },
    position: Cesium.Cartesian3.fromDegrees( 102, 36),
    label : { //文字标签
        text: '示范区',
        font: '14pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
        pixelOffset: new Cesium.Cartesian2(0, -9)   //偏移量
    }
};

function setColor(num,totalNum) {
  totalNum = 56933 || totalNum;
  if(num/totalNum>0.08){
    return new Cesium.Color.fromBytes(1,58,148);
  }else if(num/totalNum>0.05){
    return new Cesium.Color.fromBytes(40,79,176);
  } else if(num/totalNum>0.03){
    return new Cesium.Color.fromBytes(102,120,209);
  }
  else if(num/totalNum>0.02){
    return new Cesium.Color.fromBytes(155,162,232);
  }else {
    return new Cesium.Color.fromBytes(198,200,247);
  }
}


//wyoming.position = Cesium.Cartesian3.fromDegrees(-107.724,42.00);
//viewer.trackedEntity = wyoming;
//绘制网格测试
function creatTestTrect(lat1,lng1,lat2,lng2) {

  flyTo(lat1,lng1);
  var instance = new Cesium.GeometryCollection({
    geometry : new Cesium.RectangleGeometry({
      rectangle : Cesium.Rectangle.fromDegrees(lat1,lng1,lat2,lng2),
    })
  });
  scene.primitives.add(new Cesium.Primitive({
    //绘制矩形
    geometryInstances : instance,
    appearance : new Cesium.EllipsoidSurfaceAppearance({
      material : Cesium.Matearial.fromType('Dot')
    })}));
}


/*function mobeRect() {
    window.onload = function(e) {

        e = e || window.event;

        // startX, startY 为鼠标点击时初始坐标

        // diffX, diffY 为鼠标初始坐标与 box 左上角坐标之差，用于拖动

        var startX, startY, diffX, diffY;

        // 是否拖动，初始为 false

        var dragging = false;



        // 鼠标按下

        document.onmousedown = function(e) {

            startX = e.pageX;

            startY = e.pageY;



            // 如果鼠标在 box 上被按下

            if(e.target.className.match(/box/)) {

                // 允许拖动

                dragging = true;



                // 设置当前 box 的 id 为 moving_box

                if(document.getElementById("moving_box") !== null) {

                    document.getElementById("moving_box").removeAttribute("id");

                }

                e.target.id = "moving_box";



                // 计算坐标差值

                diffX = startX - e.target.offsetLeft;

                diffY = startY - e.target.offsetTop;

            }

            else {

                // 在页面创建 box

                var active_box = document.createElement("div");

                active_box.id = "active_box";

                active_box.className = "box";

                active_box.style.top = startY + 'px';

                active_box.style.left = startX + 'px';

                active_box.style.zIndex = 40;

                document.body.appendChild(active_box);

                active_box = null;

            }

        };



        // 鼠标移动

        document.onmousemove = function(e) {

            // 更新 box 尺寸

            if(document.getElementById("active_box") !== null) {

                var ab = document.getElementById("active_box");

                ab.style.width = e.pageX - startX + 'px';

                ab.style.height = e.pageY - startY + 'px';

            }



            // 移动，更新 box 坐标

            if(document.getElementById("moving_box") !== null && dragging) {

                var mb = document.getElementById("moving_box");

                mb.style.top = e.pageY - diffY + 'px';

                mb.style.left = e.pageX - diffX + 'px';

            }

        };



        // 鼠标抬起

        document.onmouseup = function(e) {

            // 禁止拖动

            dragging = false;

            if(document.getElementById("active_box") !== null) {

                var ab = document.getElementById("active_box");

                ab.removeAttribute("id");

                // 如果长宽均小于 3px，移除 box

                if(ab.offsetWidth < 3 || ab.offsetHeight < 3) {

                    document.body.removeChild(ab);

                }

            }

        };

    };
}


/*添加电塔模型
var scene=viewer.scene;

var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414, 0.0));
var model = scene.primitives.add(Cesium.Model.fromGltf({
    uri : 'ModelData/Air_Plane/Air.gltf',//如果为bgltf则为.bgltf
    modelMatrix : modelMatrix,
    minimumPixelSize : 512,
    maxmumScale : 200000
}));*/
//viewer.camera.flyTo({
//  destination : Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414, 50.0)
//});
/*

 */



function tryRect(lng1,lat1,lng2,lat2,num) {
  var instances = [];
  var rowAdd = (lat1-lat2)/num;
  var colAdd = (lng2-lng1)/num;
  for(var i =lng1;i<lng2;lng1+=colAdd){
    for(var j = lat2;j < lat1;lat2+=rowAdd){
      instances.push(new Cesium.GeometryInstance({
        geometry : new Cesium.RectangleGeometry({
          rectangle : Cesium.Rectangle.fromDegrees(lng1,lat2,lng1+colAdd,lat2+rowAdd)
        }),
        attributes : {
          color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandow({
            alpha : 0.5
          }))
        }
      }));
    }
  }
  scene.primitives.add(new Cesium.Primitive({
    geometryInstances : instances,
    appearance : new Cesium.PerInstanceColorAppearance()
  }));
}

/*
var instances = [];

for ( var lon = 80.0; lon < 100.0; lon += 1 )
{
  for ( var lat = 30.0; lat < 50.0; lat += 1 )
  {
    instances.push( new Cesium.GeometryInstance( {
      geometry : new Cesium.RectangleGeometry( {
        rectangle : Cesium.Rectangle.fromDegrees( lon, lat, lon + 1, lat + 1 )
      } ),
      attributes : {
        color : Cesium.ColorGeometryInstanceAttribute.fromColor( Cesium.Color.fromRandom( {
          alpha : 0.5
        } ) )
      }
    } ) );
  }
}

scene.primitives.add( new Cesium.Primitive( {
  geometryInstances : instances, //合并
  //某些外观允许每个几何图形实例分别指定某个属性，例如：
  appearance : new Cesium.PerInstanceColorAppearance()
} ) );
*/

/*
//立方体（boxes）
var blueBox = viewer.entities.add({
    name : 'Blue box',
    position : Cesium.Cartesian3.fromDegrees(-114.0,40.0,30000.0),
    box : {
        //长宽高
        dimensions : new Cesium.Cartesian3(40000.0,300000.0,500000.0),
        material : Cesium.Color.BLUEVIOLET.withAlpha(0.5),
        fill : true, //不显示填充
        outline : true,//显示轮廓
        outlineColor : Cesium.Color.BLACK
    }
});
/*
//镜头旋转
//镜头顺时针旋转90度，即东向
var heading = Cesium.Math.toRadians(90);
//镜头倾斜30度俯视
var pitch = Cesium.Math.toRadians(-30);
viewer.zoomTo(blueBox,new Cesium.HeadingPitchRange(heading,pitch)).then(function(result){
    //执行完毕，进行的动作
    if(result){//如果镜头切换成功，则result = true
        viewer.selectedEntity = blueBox;
    }
});*/
//viewer.zoomTo(viewer.scene);

/*$(function () {
    $('#sbtn').click(function () {
        if($('#searchtxt').val()=='p1'){
            createModel(1,1,0);
        }
        if($('#searchtxt').val()=='p2'){
            createModel(2,2,0,'/images/tatatat.glb');
        }
    });
    $('#searchtxt').on('keypress',function () {
        if(event.keyCode === 13){
            if($('#searchtxt').val()=='p1'){
                createModel(1,1,0);
            }
            if($('#searchtxt').val()=='p2'){
                createModel(2,2,0,'/images/tatatat.glb');
            }
        }
    });
});*/
/*var logging = document.getElementById('logging');
function loggingMessage(message) {
    logging.innerHTML = message;
}*/
/*
var rect = new rect(viewer);
var rectk = rect.addToolbar(document.getElementById("rectBox"), {
    buttons: ['extent']
});
rectk.addListener('extentCreated', function (event) {
    var extent = event.extent;
    //loggingMessage('Extent created (N: ' + extent.north.toFixed(3) + ', E: ' + extent.east.toFixed(3) + ', S: ' + extent.south.toFixed(3) + ', W: ' + extent.west.toFixed(3) + ')');
    var extentPrimitive = new rect.ExtentPrimitive({
        extent: extent,
       // material: Cesium.Material.fromType(Cesium.Material.StripeType)
    });
    scene.primitives.add(extentPrimitive);
    extentPrimitive.setEditable();
    extentPrimitive.addListener('onEdited', function (event) {
        //loggingMessage('Extent edited: extent is (N: ' + event.extent.north.toFixed(3) + ', E: ' + event.extent.east.toFixed(3) + ', S: ' + event.extent.south.toFixed(3) + ', W: ' + event.extent.west.toFixed(3) + ')');
    });
});*/
/*handler.setInputAction(function(movement) {
    viewer.entities.remove(rectangle);
     startMouseLog = log_String;
     startMouseLat = lat_String;
    handler.setInputAction(function(position) {
        endMouseLat = lat_String;
        endMouseLog = log_String;
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        // 鼠标滑动的距离的x或y/网页可见区域的宽或者高
        //var x = (mousePosition.x - startMousePosition.x) / width;
        // var y = -(mousePosition.y - startMousePosition.y) / height;
        //这就是决定相机移动速度的参数
        //相机移动
        if(startMouseLat>endMouseLat){
            north = startMouseLat;
            south = endMouseLat;
        }else{
            north = endMouseLat;
            south = startMouseLat;
        }
        if(startMouseLog-endMouseLog<0||startMouseLog-endMouseLog>270){
            west = startMouseLog;
            east = endMouseLog;
        }else {
            west = endMouseLog;
            east = startMouseLog;
        }
        rectangle = viewer.entities.add({
            rectangle : {
                id : "rect",
                coordinates : Cesium.Rectangle.fromDegrees(west, south, east,north ),
                material : Cesium.Color.YELLOW.withAlpha(0.3),
                outline : true,
                outlineColor : Cesium.Color.RED
            }
        });
        scene.screenSpaceCameraController.enableRotate = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableZoom = true;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableLook = true;
        flag = false;
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

 }, Cesium.ScreenSpaceEventType.LEFT_CLICK);*/
/*var wyoming = viewer.entities.add({
    id: 'Wyoming',
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
            114.358734,30.542093,
            114.362734, 30.542093,
            114.362734, 30.540093,
            114.358734, 30.540093]),
        height: 0,
        material: '/images/caoc.png',
        outline: true,
        outlineColor: Cesium.Color.BLACK
    }
});
viewer.zoomTo(wyoming);*/
