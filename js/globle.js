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
var featureCollection = [];
var Points = [];
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
var position = {
  latitude: 0,
  longitude: 0,
  height: 0,
  endPosition: null,
  cartesian : null
};
var isDrug = false;
var transPS = null;
var area = 0;
var lng1 = '';
var lat1 = '';
var lng2 = '';
var lat2 = '';
var mapconfig = null;
var basicMapProvider;
var viewer;
var _tooltip;
var canvas;
var scene ;
var clock ;
var camera ;
var layers ;
var lables;
var loactionEntity=null;
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
  _tooltip = createTooltip(viewer);

  //*******************************文字标记*******************//
  //获取注记内容
  viewer.screenSpaceEventHandler.setInputAction(function(movement) {
    var cartesian = viewer.scene.pickPosition(movement.position);
    //记录标注的location
    position.cartesian = cartesian;
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    position.latitude = Cesium.Math.toDegrees(cartographic.latitude);
    position.longitude = Cesium.Math.toDegrees(cartographic.longitude);
    position.height = cartographic.height;
  },Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //右键修改文字注记
  viewer.screenSpaceEventHandler.setInputAction(function onRightClick(movement) {
    var pickedFeature = viewer.scene.pick(movement.position);
    if(pickedFeature.id.name==='label'){
      var str = prompt("请输入标注修改的文字:");
      if(str){
        pickedFeature.id.label.text = str;
      }
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  //鼠标中键选项取消选择
  viewer.screenSpaceEventHandler.setInputAction(function onMiddleClick(movement) {
    var pickedFeature = viewer.scene.pick(movement.position);
    if(!Cesium.defined(pickedFeature)){

    }else if(pickedFeature.hasOwnProperty('primitive')){
      //viewer.entities.remove(pickedFeature.primitive);
      var index=featureCollection.indexOf(pickedFeature.id);
      if(index> -1) featureCollection.splice(index,1);
      viewer.entities.remove(viewer.entities.getById(pickedFeature.id.id));
      //_datasources.remove(pickedFeature.primitive)
    }else {
      index=featureCollection.indexOf(pickedFeature.id);
      if(index> -1) featureCollection.splice(index,1);
      viewer.entities.remove(pickedFeature.id);
    }
  }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);

  //左键按住拖动标注
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    var pickedFeature = viewer.scene.pick(movement.position);
    if(Cesium.defined(pickedFeature)&&typeof pickedFeature.getProperty!=='function') {
      //文字注记才支持拖动
      if(pickedFeature.id.name==='label'){
        isDrug = true;
      }
    }
  },Cesium.ScreenSpaceEventType.LEFT_DOWN);
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick() {
    isDrug = false;
  },Cesium.ScreenSpaceEventType.LEFT_UP);

  //鼠标移到模型上高亮逻辑
  viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
    var pickedFeature = viewer.scene.pick(movement.endPosition);
    position.endPosition = viewer.scene.pickPosition(movement.endPosition);
    if(isDrug){
      banmouse(true);
      var cartesian1 = viewer.scene.pickPosition(movement.endPosition);
      var cartographic1 = Cesium.Cartographic.fromCartesian(cartesian1);
      position.latitude = Cesium.Math.toDegrees(cartographic1.latitude);
      position.longitude = Cesium.Math.toDegrees(cartographic1.longitude);
      position.height = cartographic1.height;
      //console.log(location.latitude,location.longitude,location.height);
      pickedFeature.id.position = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude,position.height);
    }else {
      banmouse(false);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

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
function banmouse(flag){
  viewer.scene.screenSpaceCameraController.enableRotate = !flag;
  viewer.scene.screenSpaceCameraController.enableTranslate = !flag;
  viewer.scene.screenSpaceCameraController.enableZoom = !flag;
  viewer.scene.screenSpaceCameraController.enableTilt = !flag;
  viewer.scene.screenSpaceCameraController.enableLook = !flag;
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

function createTooltip(viewer){
  var tooltip = function(viewer) {
    var tipsOverlay = document.createElement('div');
    tipsOverlay.className = 'backdrop';
    tipsOverlay.style.display = 'none';
    tipsOverlay.style.position = 'absolute';
    tipsOverlay.style.bottom = '0';
    tipsOverlay.style.left = '0';
    tipsOverlay.style['pointer-events'] = 'none';
    tipsOverlay.style.padding = '4px';
    tipsOverlay.style.color = 'white';
    tipsOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    var title = document.createElement('div');
    this._tipsOverlay = tipsOverlay;
    this._title = title;
    tipsOverlay.appendChild(title);
    viewer.container.appendChild(tipsOverlay);
  };
  tooltip.prototype.setVisible = function(visible) {
    this._tipsOverlay.style.display = visible?'block' : 'none';
  };
  tooltip.prototype.showAt = function(position, message) {
    if(position && message){
      this.setVisible(true);
      this._title.innerHTML = message;
      this._tipsOverlay.style.bottom = viewer.canvas.clientHeight - position.endPosition.y-this._tipsOverlay.clientHeight/2 + "px";
      this._tipsOverlay.style.left = position.endPosition.x + this._tipsOverlay.clientWidth/2 + 'px';
    }
  };
  return new tooltip(viewer)
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

