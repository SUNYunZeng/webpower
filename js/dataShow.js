/**
 * 图层变量
 */
//计算底图个数
var is_init = false;
var lowNum = 0;
var configJson = null;
var urlParse = "";
var rectangleUrlParse = "";
var powerIdentificationUrl = "";
var rectIdentificationUrl = "";
//json遍历经纬度范围存储
var jsonBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var senceRowBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var ObjectIdentificationRowBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var PowerConsumptionBBox ={"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var senceBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var miningFieldBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var waterBodyBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var ObjectIdentificationBBox = {"minlng":0,"minlat":0,"maxlng":0,"maxlat":0};
var tiandituTerBasicLayer,tiandituTerBasicAnno,globalLandform,
  esriWorldImagery,landuse,minerLayer,gobleNVDI,energyEatMap,
  nightRGBProvider, nightPowerProvider,waterProvider,sence_water;
var totalPowerCom = 0;
//记录查询到第几个图片
var img_index = 0;
var is_img_area = true;
var dataset = [];
$(function () {
  //示范区选择

  // 默认全球示范区
  $.getJSON("./json/config.json",function (data) {
    if(data){
      configJson = data.global;
      /*
      claMaxMinBBox(senceRowBBox,data.huainan.raw_data.LandUse_data.remote_sensing_images);
      claMaxMinBBox(ObjectIdentificationRowBBox,data.huainan.raw_data.ObjectIdentification_data.data);
      claMaxMinBBox(PowerConsumptionBBox,data.huainan.data_production.PowerConsumption_data.power_Consumpation);
      claMaxMinBBox(senceBBox,data.huainan.data_production.LandUse_data.farmland.data);
      claMaxMinBBox(senceBBox,data.huainan.data_production.LandUse_data.industrial.data);
      claMaxMinBBox(senceBBox,data.huainan.data_production.LandUse_data.residential.data);
      claMaxMinBBox(senceBBox,data.huainan.data_production.LandUse_data.water.data);
      claMaxMinBBox(senceBBox,data.huainan.data_production.LandUse_data.forest.data);
      claMaxMinBBox(miningFieldBBox,data.huainan.data_production.mining_Field.data);
      claMaxMinBBox(waterBodyBBox,data.huainan.data_production.water_Body.data);*/
      //初始化图层
      if(!is_init){
        initBaseLayer();
        initData();
        is_init = true;
      }
    }
    urlParse = configJson.data_production.ObjectIdentification_data.earthUrl;
    rectangleUrlParse = configJson.data_production.ObjectIdentification_data.rectangleUrl;
    powerIdentificationUrl = configJson.data_production.ObjectIdentification_data.powerIdentificationUrl;
    rectIdentificationUrl = configJson.data_production.ObjectIdentification_data.rectIdentificationUrl;
    $.getJSON(urlParse, function (data) {
      //var points = eval("("+data+")");老版方法，不推荐
      console.log(data);
      points = data.RECORDS;
      sortPowerStaion(points);
    });
  });

  $('#global').click(function () {
    cleanAll();
  $('#exampleChoice').text('全球示范区');
    $('#global').text('全球示范区√');
    $('#china').text('中国及周边');
    is_img_search_area(true);
    //获取配置文件里的所有的BBox

  });

  $('#china').click(function () {
    $('#exampleChoice').text('中国及周边');
    $('#global').text('全球示范区');
    $('#china').text('中国及周边√');
    cleanAll();
    is_img_search_area(true);
    $.getJSON("./json/config.json",function (data) {
      if(data){
        configJson = data.china;
        //初始化图层
        if(!is_init){
          initBaseLayer();
          initData();
          is_init = true;
        }
      }
      urlParse = configJson.data_production.ObjectIdentification_data.earthUrl;
      rectangleUrlParse = configJson.data_production.ObjectIdentification_data.rectangleUrl;
      powerIdentificationUrl = configJson.data_production.ObjectIdentification_data.powerIdentificationUrl;
      rectIdentificationUrl = configJson.data_production.ObjectIdentification_data.rectIdentificationUrl;
        $.getJSON(urlParse, function (data) {
          //var points = eval("("+data+")");老版方法，不推荐
          points = data.RECORDS;
          sortPowerStaion(points);
        });
    });
  });

  function cleanAll(){
    viewer.entities.removeAll();viewer.dataSources.removeAll();
    viewer.scene.primitives.remove(tower);viewer.scene.primitives.remove(windpower);viewer.scene.primitives.remove(hydropower);
    viewer.scene.primitives.remove(transformer);viewer.scene.primitives.remove(thermalpower);viewer.scene.primitives.remove(solarpower);
    featureCollection.splice(0,featureCollection.length);
    //layers.removeAll();
    // tiandituBasicLayer = layers.addImageryProvider(tiandituBasic);
    for(var i = layers.length;i > 1 ;i--){
      layers.remove(layers.get(i-1))
    }
    lowNum = 0;
    $('.trackPopUp').hide();
    $('input[name= tc]').prop('checked',false);
    $('input[name= dxdmzb]').prop('checked',false);
    $('input[name= powerTypeLay]').prop('checked',false);
    $("#elecondition2").empty();
    $('#BarChart').hide();
    $('#PieChart').hide();
    $('input[type="checkbox"]').prop('checked',false);
    $('input[name="oneChartBox"]').prop('checked',false);
    $('#chart1').prop('checked',false);
    $('#areaEle').prop('checked',false);
    $('#chart25').prop("checked",false);
    $('#areaElePieChart').hide();
    $(document).find("li[name='secondCondition']").remove();
    $(document).find("li[class='firstCondition']").css('background','transparent');
    $(document).find("div[class='box2']").find("img").attr("src","img/eyeClose.png");
    var attrValueDiv = document.getElementById("picture_ul");
    attrValueDiv.innerHTML='';
    $('#pictureBox').hide();
    dataset = [];
    img_index=0;
  }

  //图层清空逻辑
  $('#cesiumClear').click(cleanAll);

  //发电站检索

  $('#queryBtn').click(function () {
    searhPoints();
  });
  $('#queryTxt').on('keypress',function () {
    if(event.keyCode === 13){
      searhPoints();
    }
  });

  //初始化
  // $('#tuBtn,#elefac,#eleload,#elegeo').click(function () {
  //   if(configJson==null){
  //     $.getJSON("./json/config.json",function (data) {
  //       configJson = data.global;
  //       urlParse = configJson.data_production.ObjectIdentification_data.earthUrl;
  //       rectangleUrlParse = configJson.data_production.ObjectIdentification_data.rectangleUrl;
  //       powerIdentificationUrl = configJson.data_production.ObjectIdentification_data.powerIdentificationUrl;
  //       rectIdentificationUrl = configJson.data_production.ObjectIdentification_data.rectIdentificationUrl;
  //       //setView(configJson.longitude, configJson.lautitude, configJson.elevation);
  //       //如果发电站数据为空，则请求数据,并对数据信息进行分类，存储在相应的变量中
  //       if (points === null) {
  //         $.getJSON(urlParse, function (data) {
  //           //var points = eval("("+data+")");老版方法，不推荐
  //           points = data.RECORDS;
  //           sortPowerStaion(points);
  //         });
  //       }
  //       /*$.getJSON(config[i].url,function (data) {
  //         points = data;
  //       });*/
  //       //初始化图层
  //       initBaseLayer();
  //       initData();
  //
  //     });
  //   }
  // });
  function is_img_search_area(flag) {
    if (flag) {
      is_img_area = true;
    } else {
      is_img_area = false;
      dataset = [];
      img_index=0;
    }
  }

  if(mapconfig===null){
    //底图添加操作
    try{
      $.getJSON('./json/mapconfig.json',function (data) {
        if(data){
          mapconfig = data;
          for(var i = 0;i < mapconfig.mapToolBar.length;i++){
            if(typeof mapconfig.mapToolBar[i].minimumLevel!=='undefined'){
              appendBaseLayerCon(mapconfig.mapToolBar[i].child_li,mapconfig.mapToolBar[i].liname,mapconfig.mapToolBar[i].name,mapconfig.mapToolBar[i].upId,
                mapconfig.mapToolBar[i].downId,mapconfig.mapToolBar[i].opaId,mapconfig.mapToolBar[i].layername,mapconfig.mapToolBar[i].layProvider,
                mapconfig.mapToolBar[i].map_service,mapconfig.mapToolBar[i].url,mapconfig.mapToolBar[i].layerProvider_layer,mapconfig.mapToolBar[i].location
                ,mapconfig.mapToolBar[i].minimumLevel,mapconfig.mapToolBar[i].maximumLevel);
            }else if(typeof mapconfig.mapToolBar[i].parameters!=='undefined'){
              appendBaseLayerCon(mapconfig.mapToolBar[i].child_li,mapconfig.mapToolBar[i].liname,mapconfig.mapToolBar[i].name,mapconfig.mapToolBar[i].upId,
                mapconfig.mapToolBar[i].downId,mapconfig.mapToolBar[i].opaId,mapconfig.mapToolBar[i].layername,mapconfig.mapToolBar[i].layProvider,
                mapconfig.mapToolBar[i].map_service,mapconfig.mapToolBar[i].url,mapconfig.mapToolBar[i].layerProvider_layer,mapconfig.mapToolBar[i].location
                ,null,null,mapconfig.mapToolBar[i].parameters);
            }else {
              appendBaseLayerCon(mapconfig.mapToolBar[i].child_li,mapconfig.mapToolBar[i].liname,mapconfig.mapToolBar[i].name,mapconfig.mapToolBar[i].upId,
                mapconfig.mapToolBar[i].downId,mapconfig.mapToolBar[i].opaId,mapconfig.mapToolBar[i].layername,mapconfig.mapToolBar[i].layProvider,
                mapconfig.mapToolBar[i].map_service,mapconfig.mapToolBar[i].url,mapconfig.mapToolBar[i].layerProvider_layer,mapconfig.mapToolBar[i].location);
            }

          }
        }
      });
    }catch (err){
      alert(err);
    }
  }else {
    for(var i = 0;i < mapconfig.mapToolBar.length;i++){
      if(typeof mapconfig.mapToolBar[i].minimumLevel!=='undefined'){
        appendBaseLayerCon(mapconfig.mapToolBar[i].child_li,mapconfig.mapToolBar[i].liname,mapconfig.mapToolBar[i].name,mapconfig.mapToolBar[i].upId,
          mapconfig.mapToolBar[i].downId,mapconfig.mapToolBar[i].opaId,mapconfig.mapToolBar[i].layername,mapconfig.mapToolBar[i].layProvider,
          mapconfig.mapToolBar[i].map_service,mapconfig.mapToolBar[i].url,mapconfig.mapToolBar[i].layerProvider_layer,mapconfig.mapToolBar[i].location
          ,mapconfig.mapToolBar[i].minimumLevel,mapconfig.mapToolBar[i].maximumLevel);
      }else if(typeof mapconfig.mapToolBar[i].parameters!=='undefined'){
        appendBaseLayerCon(mapconfig.mapToolBar[i].child_li,mapconfig.mapToolBar[i].liname,mapconfig.mapToolBar[i].name,mapconfig.mapToolBar[i].upId,
          mapconfig.mapToolBar[i].downId,mapconfig.mapToolBar[i].opaId,mapconfig.mapToolBar[i].layername,mapconfig.mapToolBar[i].layProvider,
          mapconfig.mapToolBar[i].map_service,mapconfig.mapToolBar[i].url,mapconfig.mapToolBar[i].layerProvider_layer,mapconfig.mapToolBar[i].location
          ,null,null,mapconfig.mapToolBar[i].parameters);
      }else {
        appendBaseLayerCon(mapconfig.mapToolBar[i].child_li,mapconfig.mapToolBar[i].liname,mapconfig.mapToolBar[i].name,mapconfig.mapToolBar[i].upId,
          mapconfig.mapToolBar[i].downId,mapconfig.mapToolBar[i].opaId,mapconfig.mapToolBar[i].layername,mapconfig.mapToolBar[i].layProvider,
          mapconfig.mapToolBar[i].map_service,mapconfig.mapToolBar[i].url,mapconfig.mapToolBar[i].layerProvider_layer,mapconfig.mapToolBar[i].location);
      }

    }
  }


});
//图层provider以及图层菜单配置函数
function initData() {
//天地图矢量影像
  /*
  tiandituVecBasic = new Cesium.WebMapTileServiceImageryProvider({
    id:'tiandituVecBasicLayer',
    name :　'tiandituVecBasicLayer',
    url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
    layer: "tdtVecBasicLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible"
  });*/

//天地图影像注记
  /*
  tiandituBasicAnno = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg"
  });*/

//天地图矢量注记
  /*
  tiandituVecBasicAnno = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg"
  });*/

//天地图地形数据
  tiandituTerBasicLayer = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/ter_w/wmts?tk=a2b59c813943cadad8878744565affbd&service=wmts&request=GetTile&version=1.0.0&LAYER=ter&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
    show: true
  });

//天地图地形注记
  tiandituTerBasicAnno = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/cta_w/wmts?tk=a2b59c813943cadad8878744565affbd&service=wmts&request=GetTile&version=1.0.0&LAYER=cta&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
    show: true
  });

//全球地貌渲染图

  globalLandform = new Cesium.WebMapTileServiceImageryProvider({
    url : 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS/tile/1.0.0/USGSShadedReliefOnly/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    maximumLevel: 4
  });

//Esri全球街区图
  /*
  esriBasicLayer = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer?service=wmts&request=GetTile&version=1.0.0&LAYER=World&style=default&format=tiles",
    show: true
  });*/
  /*
  esriBasicLayer = new Cesium.WebMapTileServiceImageryProvider({
      url: 'http://localhost:8080/geowebcache/service/wmts?',
      layer : 'nightlight',
      style : 'default',
      tileMatrixSetID : 'EPSG:0_nightlight',
      tileMatrixLabels : ['EPSG:0_nightlight:0','EPSG:0_nightlight:1','EPSG:0_nightlight:2','EPSG:0_nightlight:3','EPSG:0_nightlight:4','EPSG:0_nightlight:5','EPSG:0_nightlight:6','EPSG:0_nightlight:7'],
      format : 'image/png'
  });
  */
//Esri全球自然表面图
  /*
  esriPhysicalBasicLayer = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer?service=wmts&request=GetTile&version=1.0.0&LAYER=World_Physical_Map&style=default&format=tiles",
    show: true
  });*/

  //Esri全球影像
  esriWorldImagery = new Cesium.WebMapTileServiceImageryProvider({
    url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS?",
    layer: "World_Imagery",
    style: "default",
    format: "image/jpeg",
    minimumLevel: 1,
    maximumLevel: 17,
    show: true
  });

//中国行政区划
  /*
  chinaProvinceLayer = new Cesium.WebMapServiceImageryProvider({
    url: "http://gisserver.tianditu.com/TDTService/region/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.0.0&CRS=EPSG:4326&LAYERS=030100&STYLES=&FORMAT=image/png&transparent=true",
    parameters : {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });*/

//示范区
  landuse =  new Cesium.WebMapServiceImageryProvider({
    url: "",
    layers : "",
    crs : "",
    parameters : {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
    //url:"http://localhost:8080/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=test:huainan_4&styles=&bbox=116.40443901028064,32.58689047451887,117.10554738343849,32.92445544411034&width=768&height=369&srs=EPSG:4326&format=image%2Fpng"
  });

  //目标识别_水区
  sence_water = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: configJson.data_production.LandUse_data.water.WMSURL,
    layers: configJson.data_production.LandUse_data.water.data[0].layer,
    crs : configJson.data_production.LandUse_data.water.data[0].crs,
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });
  //目标识别_矿区
  sence_mining = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: configJson.data_production.LandUse_data.mining.WMSURL,
    layers: configJson.data_production.LandUse_data.mining.layer,
    crs : configJson.data_production.LandUse_data.water.crs,
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });
  //目标识别_林区
  sence_forest = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: configJson.data_production.LandUse_data.forest.WMSURL,
    layers: configJson.data_production.LandUse_data.forest.data[0].layer,
    crs : configJson.data_production.LandUse_data.forest.data[0].crs,
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });
  //目标识别_农业
  sence_farmland = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: configJson.data_production.LandUse_data.farmland.WMSURL,
    layers: configJson.data_production.LandUse_data.farmland.data[0].layer,
    crs : configJson.data_production.LandUse_data.farmland.data[0].crs,
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });
  //目标识别_工业区
  sence_industrial = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: configJson.data_production.LandUse_data.industrial.WMSURL,
    layers: configJson.data_production.LandUse_data.industrial.data[0].layer,
    crs : configJson.data_production.LandUse_data.industrial.data[0].crs,
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });
  //目标识别_住宅区
  sence_residential = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: configJson.data_production.LandUse_data.residential.WMSURL,
    layers: configJson.data_production.LandUse_data.residential.data[0].layer,
    crs : configJson.data_production.LandUse_data.residential.data[0].crs,
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });

//夜光灰度
  nightPowerProvider =  new Cesium.WebMapServiceImageryProvider({
    url: configJson.data_production.PowerConsumption_data.power_Consumpation.WMSURL,
    layers : configJson.data_production.PowerConsumption_data.power_Consumpation.layer,
    crs : configJson.data_production.PowerConsumption_data.power_Consumpation.crs,
    parameters : {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
    //url:"http://localhost:8080/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=test:huainan_4&styles=&bbox=116.40443901028064,32.58689047451887,117.10554738343849,32.92445544411034&width=768&height=369&srs=EPSG:4326&format=image%2Fpng"
  });

  powerProvinceProvider = new Cesium.WebMapServiceImageryProvider({
    url: 'http://localhost:8080/geoserver/test/wms?',
    layers : 'test:province',
    crs : 'EPSG:4326',
    parameters : {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });



  new Cesium.WebMapServiceImageryProvider({
    url: 'http://localhost:8080/geoserver/test/wms?',
    layers : 'test:powerInfo',
    crs : 'EPSG:4326',
    parameters : {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }/*
    getFeatureInfoParameters : {
      request : 'GetFeatureInfo'
    },
    getFeatureInfoFormats :[powerData]*/
    //url:"http://localhost:8080/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=test:huainan_4&styles=&bbox=116.40443901028064,32.58689047451887,117.10554738343849,32.92445544411034&width=768&height=369&srs=EPSG:4326&format=image%2Fpng"
  });
//var powerData = new Cesium.GetFeatureInfoFormat('json','application/json',jis);

//夜光彩色
  nightRGBProvider = new Cesium.WebMapServiceImageryProvider({
    url: configJson.data_production.PowerConsumption_data.power_RGB.WMSURL,
    layers : configJson.data_production.PowerConsumption_data.power_RGB.layer,
    crs : configJson.data_production.PowerConsumption_data.power_RGB.crs,
    parameters : {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });

//矿区
  /*minmingProvider = new Cesium.WebMapServiceImageryProvider({
    url: "http://localhost:8080/geoserver/test/wms?",
    layers: "test:huainan_map,test:huainan_I4",
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true,
      request : 'GetMap'
    }
  });*/

  //水区
  waterProvider = new Cesium.WebMapServiceImageryProvider({
    url: "",
    layers : "",
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true,
      request : 'GetMap'
    }
  });





//植被覆盖指数

  gobleNVDI = new Cesium.WebMapServiceImageryProvider({
    //url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326",
    url: "http://www.opengis.uab.es/cgi-bin/world/MiraMon.cgi",
    layers: 'NDVI9293may-World',
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });
//全球矿产分布
  minerLayer = new Cesium.WebMapServiceImageryProvider({
    url: "https://mrdata.usgs.gov/services/ofr20051294",
    layers: 'Major_Deposits',
    parameters: {
      service : 'WMS',
      format: 'image/png',
      transparent: true
    }
  });

  //天地图影像注记
  //baseMap('tdtBasicAnno','tiandituBasicAnnoLayer',tiandituBasicAnno,'tdtBasicAnnoUp','tdtBasicAnnoDown','tdtBasicAnnoOpa');
  //天地图矢量注记
  //baseMap('tdtVecBasicAnno','tiandituVecAnnoLayer',tiandituVecBasicAnno,'tdtVecBasicAnnoUp','tdtVecBasicAnnoDown','tdtVecBasicAnnoOpa');
  //中国行政区域
 // baseMap('ChinaProvinceLayer','ChinaProvinceLayer',chinaProvinceLayer,'ChinaProvinceLayerUp','ChinaProvinceLayerDown','ChinaProvinceLayerOpa');


  //天地图矢量
  //lowBaseMap('tdtVecBasicLayer','tiandituVecBasicLayer',tiandituVecBasic,'tdtVecBasicLayerUp','tdtVecBasicLayerDown','tdtVecBasicLayerOpa');
  ////Esri全球自然表面图
  //lowBaseMap('EsriPhysicalLayer','esriTerBasicAnno',esriPhysicalBasicLayer,'EsriPhysicalLayerUp','EsriPhysicalLayerDown','EsriPhysicalLayerOpa');
  //Esri全球街区图
  //lowBaseMap('EsriWorleLayer','EsriWorleLayer',esriBasicLayer,'EsriWorleLayerUp','EsriWorleLayerDown','EsriWorleLayerOpa');


  //左侧图层添加功能栏与图层展示联动逻辑
  //addLayer('energyEatMap',null,'energyEatMapLayer');
  addLayer('nightRGB',nightRGBProvider,'nightRGBLayer','夜光电力彩色图','nRGBUp','nRGBDown','nRGBDel','nRGBOpa','nRGBChart',null);
  addLayer('sence_mining',sence_mining,'sence_miningLayer','场景识别_矿区','sence_miningUp','sence_miningDown','sence_miningDel','sence_miningOpa',null,"#000000");
  addLayer('sence_water',sence_water,'sence_waterLayer','场景识别_水区','sence_waterUp','sence_waterDown','sence_waterDel','sence_waterOpa',null,"#0000FF");
  addLayer('sence_forest',sence_forest,'sence_forestLayer','场景识别_林区','sence_forestUp','sence_forestDown','sence_forestDel','sence_forestOpa',null,"#00FF00");
  addLayer('sence_farmland',sence_farmland,'sence_forestLayer','场景识别_农区','sence_farmlandUp','sence_farmlandDown','sence_farmlandDel','sence_farmlandOpa',null,"#66A61E");
  addLayer('sence_residential',sence_residential,'sence_residentialLayer','场景识别_住宅区','sence_residentialUp','sence_residentialDown','sence_residentialDel','sence_residentialOpa',null,"#FF00FF");
  addLayer('sence_industrial',sence_industrial,'sence_industrialLayer','场景识别_工业区','sence_industrialUp','sence_industrialDown','sence_industrialDel','sence_industrialOpa',null,"#7570B3");
  addLayer('MineralslLayer',minerLayer,'mineralLayer','全球矿产分布','MineLayUp','MineLayDown','MineLayDel','MineLayOpa',null,null);
  addLayer('tdtTerBasicLayer',tiandituTerBasicLayer,'dixingLayer','地形渲染图','tdtTerBLayUp','tdtTerBLayDown','tdtTerBLayDel','tdtTerBLayOpa',null,null);
  addLayer('mining',null,'miningLayer');
  addLayer('plant',gobleNVDI,'plantLayer','植被指数图','plantUp','plantDown','plantDel','plantOpa',null,null);
  addLayer('night_power',nightPowerProvider,'nightpowerLayer','夜光电力遥感图','night_powerUp','night_powerDown','night_powerDel','night_powerOpa','night_powerChart',null);
  addLayer('landuse',landuse,'landuseLayer','场景底图','languseUp','languseDown','languseDel','languseOpa',null,null);
  addLayer('water',waterProvider,'waterLayer','SAR水体提取','waterUp','waterDown','waterDel','waterOpa','waterChart',null);

  //异常地质全选机制
  //strangrGeoSelectAll();

  //矢量图形添加及图层添加
  addVecJson('energyEatMap','电力消费专题图','energyEatMapLi','energyEatMapChart','energyEatMapDel');
  addVecJson('mining','矿区地质分布','miningLi','miningChart','miningDel');

//发电站相关

  powerBuildiPoint('thermalPowerStation','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('nuclearPowerStation','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('hydraulicPowerStation','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('windPowerStation','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('photovoltaicPowerStation','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('largesubstation','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('eleTypePoint','电力设施分布','eleFacLid','eleFacChart','eleFacDel');
  powerBuildiPoint('eleType3DModel','电力设施分布','eleFacLid','eleFacChart','eleFacDel');

  //发电站全选函数
  $("#powerSattionTypeAll").click(function () {
    //如果框选范围

    if($('#rectArea').prop('checked')){
      if(south ===0 && north===0){
        alert("请选择框选范围");
        $("#powerSattionTypeAll").prop('checked',false);
      }else{
        var isChecked = $('#powerSattionTypeAll').prop("checked");
        $("input[name='powerTypeLay']").prop("checked", isChecked);
        if(isChecked){
          points = null;
          $.getJSON(rectangleUrlParse+"&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"", function (data) {
            //var points = eval("("+data+")");老版方法，不推荐
            if (data.RECORDS.length>0){
              points = data.RECORDS;
              sortPowerStaion(points);
              whatsEleFacLayer(points);
              transPS = points;
              if($("#eleFacLid").length>0){
              }else {
                appendVecLayerCon(null,'电力设施分布','eleFacLid','eleFacChart','eleFacDel')
              }
            } else {
              alert("数据为空")
            }
          });
        }else{
          $("#eleFacLid").remove();
          removePS(points);
        }

      }
    }else if($('#rectSelfArea').prop('checked')){
      var isChecked = $('#powerSattionTypeAll').prop("checked");
      $("input[name='powerTypeLay']").prop("checked", isChecked);
      if(isChecked){
        points = null;
        $.getJSON(rectangleUrlParse+"&lng1="+lng1+"&lat1="+lat1+"&lng2="+lng2+"&lat2="+lat2+"", function (data) {
          //var points = eval("("+data+")");老版方法，不推荐
          if (data!==null){
            points = data.RECORDS;
            sortPowerStaion(points);
            whatsEleFacLayer(points);
            transPS = points;
            if($("#eleFacLid").length>0){
            }else {
              appendVecLayerCon(null,'电力设施分布','eleFacLid','eleFacChart','eleFacDel')
            }
          } else {
            alert("数据为空");
            $("#powerSattionTypeAll").prop('checked',false);
          }
        });
      }else{
        $("#eleFacLid").remove();
        removePS(points);
      }
    }else {
      var isChecked = $('#powerSattionTypeAll').prop("checked");
      $("input[name='powerTypeLay']").prop("checked", isChecked);
      if(isChecked){
        points = null;
        if (points === null) {
          $.getJSON(urlParse, function (data) {
            //var points = eval("("+data+")");老版方法，不推荐
            points = data.RECORDS;
            sortPowerStaion(points);
            whatsEleFacLayer(points);
            transPS = points;
            if($("#eleFacLid").length>0){
            }else {
              appendVecLayerCon(null,'电力设施分布','eleFacLid','eleFacChart','eleFacDel')
            }
          });
        }
      }else{
        $("#eleFacLid").remove();
        removePS(points);
      }
    }
  });


  //夜光遥感灰度选择标志
  $('#night_power,#nightRGB').click(function () {
    charFlag = 2;
  });

  //电力设施选择标志
  $('input[name="powerTypeLay"]').click(function () {
    charFlag = 1;
  });

}
//底图添加,删除，上下移动函数(图层是实际添加函数)
function lowBaseMap(baseMapId,layerName,layerProvider,upBtnName,downBtnName,rangeName) {
  $("#"+baseMapId).click(function () {
    if($("#"+baseMapId).prop('checked')){
      layerName = layers.addImageryProvider(layerProvider);
      lowNum+=1;
      layers.lowerToBottom(layerName);
      for(var i = 0; i < lowNum;i++){
        //底图循环到底图的最上方
        layers.raise(layerName);
      }
      var r=document.getElementById(rangeName);
      layerName.alpha = r.value/100;
    }else {
      layers.remove(layerName);
      lowNum-=1;
    }
  });
  $("#"+upBtnName).click(function () {
    if(layers.indexOf(layerName)!==lowNum){
      layers.raise(layerName);
    }
  });
  $("#"+downBtnName).click(function () {
    if(layers.indexOf(layerName)!==1){
      layers.lower(layerName);
    }
  });
  $("#"+rangeName).click(function () {
    var r=document.getElementById(rangeName);
    layerName.alpha = r.value/100;
  });
}
//中间图添加,删除，上下移动函数
function baseMap(baseMapId,layerName,layerProvider,upBtnName,downBtnName,rangeName) {
  $("#"+baseMapId).click(function () {
    if($("#"+baseMapId).prop('checked')){
      layerName = layers.addImageryProvider(layerProvider);
      var r=document.getElementById(rangeName);
      layerName.alpha = r.value/100;
    }else {
      layers.remove(layerName);
    }
  });
  $("#"+upBtnName).click(function () {
    if(layers.indexOf(layerName)!==lowNum){
      layers.raise(layerName);
    }
  });
  $("#"+downBtnName).click(function () {
    if(layers.indexOf(layerName)!==lowNum+1){
      layers.lower(layerName);
    }
  });
  $("#"+rangeName).click(function () {
    var r=document.getElementById(rangeName);
    layerName.alpha = r.value/100;
  });
}
//图层添加函数
function addLayer(id1,layerName,addLayerName,name,upId,downId,deleteId,opaId,chartId,color) {
  if(addLayerName){
    $("#"+id1).click(function () {
      var isChecked = $(this).prop("checked");
      if(isChecked){
        if(layerName){
          //从第十个开始插入图层
            //从头插入
          addLayerName = layers.addImageryProvider(layerName);
          appendLayerCon(id1,name,addLayerName,upId,downId,deleteId,opaId,chartId,color);
          if(id1==="water"){
            if(waterBodyBBox.maxlng!==0){
              setRectangleView(waterBodyBBox.minlng,waterBodyBBox.minlat,waterBodyBBox.maxlng,waterBodyBBox.maxlat);
            }
            //flyTo(114.47,30.50,84332);
          }else if(id1==='landuse'){
            if(senceRowBBox.maxlng!==0){
              setRectangleView(senceRowBBox.minlng,senceRowBBox.minlat,senceRowBBox.maxlng,senceRowBBox.maxlat);
            }
          }else if(id1 ==='sence_water'||id1==='sence_industrial'||id1 === 'sence_residential'||
            id1==='sence_forest'||id1==='sence_farmland'){
            if(senceBBox.maxlng!==0){
              setRectangleView(senceBBox.minlng,senceBBox.minlat,senceBBox.maxlng,senceBBox.maxlat);
            }
          }
          else if(id1 === "night_power"||id1 === "nightRGB"){
            if(powerConsumpationData===null){
              $.getJSON(configJson.data_production.PowerConsumption_data.powerAreaConsumpation_data.geoJsonURL,function (data) {
                powerConsumpationData = data;
                if(totalPowerCom===0){
                  for(var i =0;i < powerConsumpationData.features.length;i++ ){
                    totalPowerCom = totalPowerCom + powerConsumpationData.features[i].properties.RASTERVALU;
                  }
                }
              });
            }
            if(PowerConsumptionBBox.maxlng!==0){
              setRectangleView(PowerConsumptionBBox.minlng,PowerConsumptionBBox.minlat,PowerConsumptionBBox.maxlng,PowerConsumptionBBox.maxlat);
            }

           } /*else if(id1==="energyEatMap"){
            showGeoJson('./json/province.json',4);
            if (provincedata === null) {
            //当选中电力消费专题图时
            /*if (provincedata === null) {
              //获取各区域的电力消耗信息
              $.getJSON(configJson.powerProvince.geoJsonUrl, function (data) {
                provincedata = data;
                areaEleCount();
                //遍历电力消耗信息，然后在图上绘出各省份的电力消耗量
                for(var i = 0;i< provincedata.features.length;i++){
                  if(provincedata.features[i].properties.EPC!==0){
                    window['prov'+i] = lables.add({
                      //文字标签设置
                      fillColor : Cesium.Color.WHITE,
                      position : Cesium.Cartesian3.fromDegrees(provincedata.features[i].geometry.coordinates[0], provincedata.features[i].geometry.coordinates[1]),
                      text : provincedata.features[i].properties.NAME+'\n'+provincedata.features[i].properties.EPC,
                      scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.2),
                      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                      outlineColor : Cesium.Color.BLACK,
                      outlineWidth: 1,
                      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                      pixelOffset: new Cesium.Cartesian2(-35, 35)
                    });
                  }
                }
                $('#areaElePieChart').slideDown();
                });
            }else {
              for(var i = 0;i< provincedata.features.length;i++){
                if(provincedata.features[i].properties.EPC!==0){
                  window['prov'+i] = lables.add({
                    position : Cesium.Cartesian3.fromDegrees(provincedata.features[i].geometry.coordinates[0], provincedata.features[i].geometry.coordinates[1]),
                    text : provincedata.features[i].properties.NAME+'\n'+provincedata.features[i].properties.EPC,
                    scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.2),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                    pixelOffset: new Cesium.Cartesian2(-15, 15)
                  });
                }
              }
            }
            }*/
        }
      }else {
        if(layerName){
          layers.remove(addLayerName);
          $("#"+name).remove();
          /*删除标签
          if(provincedata){
            for(var i = 0;i< provincedata.features.length;i++){
              if(provincedata.features[i].properties.EPC){
                lables.remove(window['prov'+i]);
              }
            }
          }*/
        }
      }
    });
  }
}

//矢量（GeoJson、entity）添加函数
function addVecJson(id,name,liId,chartId,deleteId) {
  $("#"+id).click(function () {
    //矢量图层加载函数
    var isChecked = $(this).prop("checked");
    if(isChecked){
      //如果选择是全国电力消费
      if(id ==="energyEatMap"){
        if(showGeoJson('./json/province.json',4)){
          // ***********************************************************************
          /*setTimeout(function () {
            if (provincedata === null) {
              try{
                //获取各区域的电力消耗信息
                $.getJSON('##########################', function (data) {
                  provincedata = data;
                  areaEleCount();
                  $('#areaElePieChart').slideDown();
                });
              }catch (err){
                alert("获取数据失败，错误信息为："+err);
              }
            }
          },2300);*/
          //*************************************************************************
          if(PowerConsumptionBBox.minlng!==0){
            setRectangleView(PowerConsumptionBBox.minlng,PowerConsumptionBBox.minlat,PowerConsumptionBBox.maxlng,PowerConsumptionBBox.maxlat);
          }
        }
        //当选中电力消费专题图时
        /*if (provincedata === null) {
          //获取各区域的电力消耗信息
          $.getJSON(configJson.powerProvince.geoJsonUrl, function (data) {
            provincedata = data;
            areaEleCount();
            //遍历电力消耗信息，然后在图上绘出各省份的电力消耗量
            for(var i = 0;i< provincedata.features.length;i++){
              if(provincedata.features[i].properties.EPC!==0){
                window['prov'+i] = lables.add({
                  //文字标签设置
                  fillColor : Cesium.Color.WHITE,
                  position : Cesium.Cartesian3.fromDegrees(provincedata.features[i].geometry.coordinates[0], provincedata.features[i].geometry.coordinates[1]),
                  text : provincedata.features[i].properties.NAME+'\n'+provincedata.features[i].properties.EPC,
                  scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.2),
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineColor : Cesium.Color.BLACK,
                  outlineWidth: 1,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                  pixelOffset: new Cesium.Cartesian2(-35, 35)
                });
              }
            }
            $('#areaElePieChart').slideDown();
            });
        }else {
          for(var i = 0;i< provincedata.features.length;i++){
            if(provincedata.features[i].properties.EPC!==0){
              window['prov'+i] = lables.add({
                position : Cesium.Cartesian3.fromDegrees(provincedata.features[i].geometry.coordinates[0], provincedata.features[i].geometry.coordinates[1]),
                text : provincedata.features[i].properties.NAME+'\n'+provincedata.features[i].properties.EPC,
                scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.2),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                pixelOffset: new Cesium.Cartesian2(-15, 15)
              });
            }
          }
        }*/

        //图层管理界面对应更新
        appendVecLayerCon(id,name,liId,chartId,deleteId);
      }
      //如果选择的是矿区
      else if(id==="mining"){
        //当选择的是矿区显示的时候，展示矿区的GeoJson数据
        showGeoJson(configJson.data_production.mining_Field.data[0].geoJsonURL,1);
        if(miningFieldBBox.maxlng!==0){
          setRectangleView(miningFieldBBox.minlng,miningFieldBBox.minlat,miningFieldBBox.maxlng,miningFieldBBox.maxlat);
        }
        //flyTo(116.64,32.74,141733);
        appendVecLayerCon(id,name,liId,null,deleteId);
      }
    }else {
      //全国电力消费情况删除
      if(id ==="energyEatMap"){
        //删除全国电力消费值以及对应图层
        $("#energyEatMapLi").remove();
        deleteGeoJson(provdata,provDataSource);
        $('#areaElePieChart').slideUp();
      }
      //矿区删除
      else if(id==="mining"){
        //删除矿区的GeoJson数据及对应图层
        deleteGeoJson(geodata,miningDataSource);
        $("#miningLi").remove();
      }
    }
  });

}



//动态添加图层函数
function appendLayerCon(ConName,name,layerName,upId,downId,deleteId,opaId,chartId,color){
  var attrValueDiv = document.getElementById("elecondition1");
  var divChilds = attrValueDiv.childNodes;
  var tempHtml = '';
  var li= document.createElement("li");
  li.setAttribute("id", name);
  li.setAttribute("name", "secondCondition");
  if(chartId!==null){
    tempHtml +="<li style='box-shadow: 0 0 10px grey; background: #888888; left: -40px;position: relative; width: 220px;height: 50px;color:#ffffff;  border: #cccccc solid 1px;line-height: 40px;padding-left: 15px; font-family: sans-serif;font-size:1.1em' tabindex="
      +divChilds.length
      +">"
      +"<a class='minChart' style=\"width:22px;height:22px;border-radius:10px;position: absolute;right:2px;top:18px\" href='#' title='图表统计' id="
      +chartId
      +"><img src='img/miniChartBtn.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +"<a class='up1'  style=\"width:20px;height:20px;position: absolute;right: 45px;top:18px\" href='#' title='图层上移' id="
      +upId
      +" ><img src='img/up.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\"></a>"
      +"<a class='down1'  style=\"width:20px;height:20px;position: absolute;right: 69px;top:18px\" href='#' title='图层下移' id="
      +downId
      +" ><img src='img/down.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +name
      +"<a class='delete'  style=\"width:22px;height:22px;position: absolute;right: 24px;top:18px\" href='#' title='图层关闭' id="
      +deleteId
      +"><img src='img/delete.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +"<input  title=\"透明度\" class='gunL'  name=\"points\" value='100' type=\"range\" min=\"0\" max=\"100\" id="
      +opaId
      +">"
      +"</li>";
  }else if(color!==null) {
    tempHtml +="<li style='box-shadow: 0 0 10px grey; background: #888888; left: -40px;position: relative; width: 220px;height: 50px;color:#ffffff;  border: #cccccc solid 1px;line-height: 40px;padding-left: 15px; font-family: sans-serif;font-size:1.1em' tabindex="
      +divChilds.length
      +">"
      +"<div style='height: 36px;width: 10px;top:10px;left:2px;position: absolute;background-color: "+color+"'></div>"
      +"<a class='up1'  style=\"width:20px;height:20px;position: absolute;right: 45px;top:18px\" href='#' title='图层上移' id="
      +upId
      +" ><img src='img/up.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\"></a>"
      +"<a class='down1'  style=\"width:20px;height:20px;position: absolute;right: 69px;top:18px\" href='#' title='图层下移' id="
      +downId
      +" ><img src='img/down.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +name
      +"<a class='delete'  style=\"width:22px;height:22px;position: absolute;right: 24px;top:18px\" href='#' title='图层关闭' id="
      +deleteId
      +"><img src='img/delete.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +"<input  title=\"透明度\" class='gunL'  name=\"points\" value='100' type=\"range\" min=\"0\" max=\"100\" id="
      +opaId
      +">"
      +"</li>";
  }else {
    tempHtml +="<li style='box-shadow: 0 0 10px grey; background: #888888; left: -40px;position: relative; width: 220px;height: 50px;color:#ffffff;  border: #cccccc solid 1px;line-height: 40px;padding-left: 15px; font-family: sans-serif;font-size:1.1em' tabindex="
      +divChilds.length
      +">"
      +"<a class='up1'  style=\"width:20px;height:20px;position: absolute;right: 45px;top:18px\" href='#' title='图层上移' id="
      +upId
      +" ><img src='img/up.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\"></a>"
      +"<a class='down1'  style=\"width:20px;height:20px;position: absolute;right: 69px;top:18px\" href='#' title='图层下移' id="
      +downId
      +" ><img src='img/down.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +name
      +"<a class='delete'  style=\"width:22px;height:22px;position: absolute;right: 24px;top:18px\" href='#' title='图层关闭' id="
      +deleteId
      +"><img src='img/delete.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +"<input  title=\"透明度\" class='gunL'  name=\"points\" value='100' type=\"range\" min=\"0\" max=\"100\" id="
      +opaId
      +">"
      +"</li>";
  }

  //attrValueDiv.innerHTML += tempHtml;

  li.innerHTML = tempHtml;

  if(attrValueDiv.childNodes[0]){
    attrValueDiv.insertBefore(li,attrValueDiv.childNodes[0]);
  }else {
    attrValueDiv.appendChild(li);
  }

  //图表统计
  $('#night_powerChart,#nRGBChart').click(function () {
    charFlag = 2;
    $('#RightTitle').text("电力消耗统计");
    $('#chartsMenu').slideDown();
  });
  $('#night_powerDel,#nRGBDel').click(function () {
    $('#chartsMenu').slideUp();
  });

  $("#"+chartId).click(function () {
    $(this).css('background','darkorange');
    $('#eleFacChart').css('background','#888888');
  });

  $('#chartclear,#rightbackBtn').click(function () {
    $("#"+chartId).css('background','#888888');
  });

//图层删除
  $("#"+deleteId).click(function () {
    $("#"+ConName).prop("checked",false);
    layers.remove(layerName);
    $("#"+name).remove();
  });
  //图层上移
  $("#"+upId).click(function () {
    var $li = $("#"+upId).parent().parent();
    $li.prev().before($li);
    layers.raise(layerName);
  });
  //图层下移
  $("#"+downId).click(function () {
    var $li = $("#"+downId).parent().parent();
    //下一个为选中状态才可下移(如果是动态添加的为1)
    if($li.next().find("input").prop("checked")||$li.next().find("input").length===1){
        $li.next().after($li);
    }
    if(layers.indexOf(layerName)!==lowNum+1){
      layers.lower(layerName);
    }
  });
  $("#"+opaId).click(function () {
    var r=document.getElementById(opaId);
    layerName.alpha = r.value/100;
  });

}

//矢量图层动态加载函数
function appendVecLayerCon(id,name,liId,chartId,deleteId,color) {
  var attrValueDiv = document.getElementById("elecondition2");
  var divChilds = attrValueDiv.childNodes;
  var tempHtml = '';
  var backUrl;
  if(id==='tower'){
    backUrl = './img/tower.png'
  }else if(id==='hydropower'){
    backUrl = './img/hydropower.png'
  }else if(id==='thermalpower'){
    backUrl = './img/thermalpower.png'
  }else if(id==='solarpower'){
    backUrl = './img/solarpower.png'
  }else if(id==='transformer'){
    backUrl = './img/transformer.png'
  }else if(id==='windpower'){
    backUrl = './img/windpower.png'
  }
  var li= document.createElement("li");
  li.setAttribute("id", liId);
  if(chartId!==null){
    tempHtml +="<li style='box-shadow: 0 0 10px grey; left: -40px;position: relative; width: 220px;height: 50px;color:#ffffff; background: #888888;  border: #cccccc solid 1px;line-height: 50px;padding-left: 15px; font-family: sans-serif;font-size:1.1em' tabindex="
      +divChilds.length
      +">"
      +"<a class='minChart' style=\"width:22px;height:22px;border-radius:10px;position: absolute;right: 2px;top:13px\" href='#' title='图表统计' id="
      +chartId
      +"><img src='img/miniChartBtn.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +name
      +"<a class='delete'  style=\"width:22px;height:22px;position: absolute;right: 24px;top:13px\" href='#' title='图层关闭' id="
      +deleteId
      +"><img src='img/delete.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +"</li>";
    //attrValueDiv.innerHTML += tempHtml;
  }else {
    tempHtml +="<li style='box-shadow: 0 0 10px grey; left: -40px;position: relative; width: 220px;height: 50px;color:#ffffff; background: #888888;  border: #cccccc solid 1px;line-height: 50px;padding-left: 15px; font-family: sans-serif;font-size:1.1em' tabindex="
      +divChilds.length
      +">"
      +"<div style='height: 32px;background-image:url("+backUrl+");background-size：100%;width: 32px;top:9px;right:110px;position: absolute;'></div>"
      +"<div style='height: 36px;width: 45px;top:7px;right:53px;position: absolute;border:2px solid "+color+"'></div>"
      +"</a>"
      +name
      +"<a class='delete'  style=\"width:22px;height:22px;position: absolute;right: 24px;top:13px\" href='#' title='图层关闭' id="
      +deleteId
      +"><img src='img/delete.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
      +"</li>";
    //attrValueDiv.innerHTML += tempHtml;
  }


  li.innerHTML = tempHtml;
 if(document.getElementById(liId)===null){
   if(attrValueDiv.childNodes[0]){
     attrValueDiv.insertBefore(li,attrValueDiv.childNodes[0]);
   }else {
     attrValueDiv.appendChild(li);
   }
 }
  //图表统计对应
  $('#eleFacChart').click(function () {
    $('#nRGBChart,#night_powerChart').css('background','#888888');
    charFlag = 1;
    $(this).css('background','darkorange');
    $('#RightTitle').text("电力设施统计");
    $('#chartsMenu').slideDown();
    $('#chartManager').hide();
  });
  $('#energyEatMapChart').click(function () {
    $(this).css('background','darkorange');
    areaEleCount();
    $('#areaElePieChart').slideDown();
    $('#chartManager').hide();
  });
  $('#chartclear,#rightbackBtn').click(function () {
    $('#eleFacChart').css('background','#888888');
    $('#energyEatMapChart').css('background','#888888');
  });

  //图层对应矢量图形管理界面
  $("#"+deleteId).click(function () {
    //如果是发电站对应的删除按钮
    if(deleteId==="eleFacDel"){
      removePS(points);
      $("input[name='powerTypeLay']").prop("checked", false);
    }
    //如果是全国电力消费对应的删除按钮
    else if(deleteId==="energyEatMapDel"){
      //删除矢量数据
      deleteGeoJson(provdata,provDataSource);
    }
    //如果是矿区数据
    else if(deleteId==="miningDel"){
      deleteGeoJson(geodata,miningDataSource);
      //对应选择为否
    }
    initBill(id);
    if(id==='tower'){
      scene.primitives.remove(tower);
    }else if(id==='hydropower'){
      scene.primitives.remove(hydropower);
    }else if(id==='thermalpower'){
      scene.primitives.remove(thermalpower);
    }else if(id==='solarpower'){
      scene.primitives.remove(solarpower);
    }else if(id==='transformer'){
      scene.primitives.remove(transformer);
    }else if(id==='windpower'){
      scene.primitives.remove(windpower);
    }else if(id){
      $("#"+id).prop('checked',false);
    }



    //删除图层管理区域对应图层块
    $(this).parent().parent().remove();
    //如果是最后一个图层，那么图层就收起
      $('#chartsMenu').slideUp();
  });

}

//底图*中间图动态添加函数
function appendBaseLayerCon(child_li,liname,name,upId,downId,opaId,layername,layProvider,serverclass,url,layerProvider_layer,location,minimumLevel,
  maximumLevel,parameters) {
  var attrValueDiv;
  if(location==='bottom'){
    attrValueDiv  = document.getElementById("elecondition3");
  }else if(location==='middle'){
    attrValueDiv = document.getElementById("elecondition1");
  }

  var tempHtml = '';
  var li= document.createElement("li");
  li.setAttribute("id", liname);
  li.setAttribute("name", name);
  tempHtml +="<li class='firstCondition' style='left: -40px;position: relative; width: 220px;height: 53px;color:#ffffff;  border: #cccccc solid 1px;" +
    "line-height: 37px;padding-left: 15px; font-family: sans-serif;font-size:1.1em' id="
    +child_li
    +">"
    +"<a class='up'  href='#' style=\"width:20px;height:20px;position: absolute;right: 45px;top:18px\" href='#' title='图层上移' id="
    +upId
    +" ><img src='img/up.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\"></a>"
    +"<a class='down'  style=\"width:20px;height:20px;position: absolute;right: 69px;top:18px\" href='#' title='图层下移' id="
    +downId
    +" ><img src='img/down.png' style=\"position:absolute;width:inherit;height:inherit;border:0;\" /></a>"
    +"<div id=\"eyeImg5\" class=\"box1\" title=\"图层开关\">" +
    "          <img id="+layername+"2"+"  style=\"position:absolute;height:inherit;width:inherit;top:0;\" src=\"img/eyeClose.png\"/>" +
    "          <input title=\"图层开关\" id="+layername+" + style=\"opacity:0;width:18px;height:18px;top:-6px;position:relative;z-index:20;\" type=\"checkbox\">" +
    "          　<div class=\"box2\" style=\"width:18px;height:18px;position:absolute;right:0;top:0\">" +
    "          　　　　<img  style=\"border:none;position: absolute;width: 18px;top:0;\"/>" +
    "          　　</div>" +
    "        </div>"
    +"<label for=\"EsriTerLayer\">"+name+"</label>"
    +"<input  title=\"透明度\" class='gunL'  name=\"points\" value='100' type=\"range\" min=\"0\" max=\"100\" id="
    +opaId
    +">"
    +"</li>";
  li.innerHTML = tempHtml;
  if(attrValueDiv.childNodes[0]){
    attrValueDiv.insertBefore(li,attrValueDiv.childNodes[0]);
  }else {
    attrValueDiv.appendChild(li);
  }

  //添加的地图服务类型判断
  if(serverclass==="WMTS"){
    layProvider =  new Cesium.WebMapTileServiceImageryProvider({
      url: url,
      minimumLevel: minimumLevel,
      maximumLevel: maximumLevel,
      show: true
    });
  }else if(serverclass==="WMS") {
    layProvider = new Cesium.WebMapServiceImageryProvider({
      url: url,
      layers: layerProvider_layer,
      parameters:parameters,
      show: true
    });
  }else if(serverclass==="OpenStreet") {
    layProvider = new Cesium.createOpenStreetMapImageryProvider({
      url: url,
      layers: layerProvider_layer,
      show: true
    });
  }else if(serverclass==="MapBox"){
    layProvider = new Cesium.MapboxImageryProvider({
      mapId:layerProvider_layer,
      minimumLevel: 1,
      maximumLevel: 17,
      show: true
    })
  }

  //图层添加逻辑
  if(location==='bottom'){
    lowBaseMap(layername,layername,layProvider,upId,downId,opaId);
    $("#"+layername).click(function () {
      var attrValueDiv = document.getElementById("elecondition3");
      var $li = document.getElementById(liname);
      if($(this).prop('checked')){
        //如果不是第一个，就与上面的li互换位置
        $("#"+child_li).css('background','#888888');
        if(attrValueDiv.childNodes[0]!==$li){
          attrValueDiv.insertBefore($li,attrValueDiv.childNodes[0]);
        }
      }else {
        //删除的话就放在最后一个
        attrValueDiv.appendChild($li);
        $("#"+child_li).css('background','transparent');
      }
    });
  }else if(location==='middle'){
    baseMap(layername,layername,layProvider,upId,downId,opaId);
    $("#"+layername).click(function () {
      var attrValueDiv = document.getElementById("elecondition1");
      var $li = document.getElementById(liname);
      if($(this).prop('checked')){
        //如果不是第一个，就与上面的li互换位置
        $("#"+child_li).css('background','#888888');
        if(attrValueDiv.childNodes[0]!==$li){
          attrValueDiv.insertBefore($li,attrValueDiv.childNodes[0]);
        }
      }else {
        //删除的话就放在最后一个
        attrValueDiv.appendChild($li);
        $("#"+child_li).css('background','transparent');
      }
    });
  }

  eyeInit(layername);


  $("#"+upId).click(function(){
    var $li = $(this).parent().parent();
    //如果当前为选中状态才可以上移
    if($(this).next().next().find("input").prop('checked')){
      $li.prev().before($li)
    }
  });
  $("#"+downId).click(function(){
    var $li = $(this).parent().parent();
    //当图层块为选择状态且下一个图层快也为选择状态，才可以进行下移操作
    if($li.next().find("input").prop("checked")||$li.next().find("input").length===1){
      $li.next().after($li)
    }
  });


}

//地图图层移动以及控件初始化（底图加上中间图层的上下移动以及背景颜色控制函数）
function initBaseLayer() {


  /*
  //图层置顶
  $('#ChinaProvinceLayerTop').click(function () {
    var attrValueDiv = document.getElementById("elecondition1");
    var $li = document.getElementById('ChinaProvinceLayer1');
    if(attrValueDiv.childNodes[0]!==$li&&$('#ChinaProvinceLayer').prop('checked')){
      attrValueDiv.insertBefore($li,attrValueDiv.childNodes[0]);
      $('#ChinaProvinceLayer1').css('background-color','#595959');
    }
  });
  $('#tdtBasicAnnoTop').click(function () {
    var attrValueDiv = document.getElementById("elecondition1");
    var $li = document.getElementById('tdtBasicAnno1');
    if(attrValueDiv.childNodes[0]!==$li&&$('#tdtBasicAnno').prop('checked')){
      attrValueDiv.insertBefore($li,attrValueDiv.childNodes[0]);
      $('#tdtBasicAnno1').css('background','#595959');
    }
  });

  $('#tdtVecBasicAnnoTop').click(function () {
    var attrValueDiv = document.getElementById("elecondition1");
    var $li = document.getElementById('tdtVecBasicAnno1');
    if(attrValueDiv.childNodes[0]!==$li&&$('#tdtVecBasicAnno').prop('checked')){
      attrValueDiv.insertBefore($li,attrValueDiv.childNodes[0]);
      $('#tdtVecBasicAnno1').css('background','#595959');
    }
  });*/


  $("ul li a.up").click(function(){
    var $li = $(this).parent();
    //如果当前为选中状态才可以上移
    if($(this).next().next().find("input").prop('checked')){
      $li.prev().before($li)
    }
  });
  $("ul li a.down").click(function(){
    var $li = $(this).parent();
    //当图层块为选择状态且下一个图层快也为选择状态，才可以进行下移操作
    if($li.next().find("input").prop("checked")){
      $li.next().after($li)
    }
  });
  $("ul li a.delete").click(function(){
    $(this).parent().remove();
  });
}

//发电站检索
function searhPoints() {
  var i =0;
  var query_param = $('#queryTxt').val();
  var reg = /[0-9a-zA-Z]+/;


  if (/^\s*$/.test(query_param)) {
    //whitespace string
    return;
  }

  // If the user entered (longitude, latitude, [height]) in degrees/meters,
  // fly without calling the geocoder.
  var splitQuery = query_param.match(/[^\s,\n]+/g);

  if(splitQuery.length===1) {
    //如果长度为1且有数字
    if (reg.test(splitQuery[0])) {
      /*for (i; i < showPoints.length; i++) {
        if (showPoints[i].id === query_param) {
          var s = viewer.entities.getById(showPoints[i].id);
          flyTo(showPoints[i].longitude, showPoints[i].latitude);
          //viewer.zoomTo(viewer.entities.getById(showPoints[i].id));
          break;
        }
        else if (showPoints[i].feature === query_param) {
        }
      }
      if (i === showPoints.length) {
        alert("没找到!")
      } else {
        //$('.trackPopUp').hide();
        // $('.trackPopUpLink').empty();
        // $(".cesium-selection-wrapper").hide();
        setTimeout(function () {
          showInforWindows(s)
        }, 1000)
      }*/
      if (query_param === 'GouZi' || query_param === 'home') {
        flyTo(118.55786641411927, 36.67847589392107, 474.718);
      }
      if (query_param === 'BaoZi') {
        flyTo(109.75006091239443, 38.27780813553693, 1464.3848);
      }
    } else {
      if($('#rectArea').prop('checked')){
        //矩形初始化
        if(south===0&&north===0){
          alert("请选择待搜索的矩形范围！");
        }else{
         searchStation(splitQuery[0],west,north,east,south);
        }
      }else if ($('#rectSelfArea').prop('checked')){
        searchStation(splitQuery[0],lng1,lat1,lng2,lat2);
      }else {
        // searchStation(splitQuery[0],null,null,null,null);
        if (query_param === '家' || query_param ==='孙云增') {
          flyTo(118.55786641411927, 36.67847589392107, 474.718);
        }
        if (query_param === '薛洁') {
          flyTo(109.75006091239443, 38.27780813553693, 1464.3848);
        }
      }

    }
  }

  function searchStation(text,west,north,east,south) {
    var towerURL = '';
    var hydropowerURL='';
    var thermalpowerURL = '';
    var solarpowerURL = '';
    var transformerURL = '';
    var windpowerURL = '';
    if(west  == null){
      towerURL = powerIdentificationUrl+'&type=tower';
      hydropowerURL=powerIdentificationUrl+'&type=hydropower';
      thermalpowerURL = powerIdentificationUrl+'&type=thermalpower';
      solarpowerURL = powerIdentificationUrl+'&type=solarpowerstation';
      transformerURL = powerIdentificationUrl+'&type=transformersmall';
      windpowerURL = powerIdentificationUrl+'&type=windpower';
    }else {
      towerURL = rectIdentificationUrl+"&type=tower&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"";
      hydropowerURL=rectIdentificationUrl+"&type=hydropower&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"";
      thermalpowerURL = rectIdentificationUrl+"&type=thermalpower&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"";
      solarpowerURL = rectIdentificationUrl+"&type=solarpowerstation&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"";
      transformerURL = rectIdentificationUrl+"&type=transformersmall&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"";
      windpowerURL = rectIdentificationUrl+"&type=windpower&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"";
    }

    if (text === '输电塔') {
      towerData = null;
      $.getJSON(towerURL, function (data) {
        towerData = data.tower;
        if(towerData.length > 0){
          initBill('tower');
          scene.primitives.remove(tower);
          drawPowerRectangle(towerData, 'tower');
        }else {
         alert("没有数据！")
        }
      });
    } else if (text === '水力发电站') {
      hydropowerData = null;
      $.getJSON(hydropowerURL, function (data) {
        hydropowerData = data.hydropower;
        if(hydropowerData.length > 0){
          initBill('hydropower');
          scene.primitives.remove(hydropower);
          drawPowerRectangle(hydropowerData, 'hydropower');
        }else {
          alert("没有数据！")
        }

      });
    }
    else if (text=== '火力发电站') {
      thermalpowerData = null;
      $.getJSON(thermalpowerURL, function (data) {
        thermalpowerData = data.thermalpower;
        if(thermalpowerData.length > 0){
          initBill('thermalpower');
          scene.primitives.remove(thermalpower);
          drawPowerRectangle(thermalpowerData, 'thermalpower');
        }else {
          alert("没有数据！")
        }

      });

    } else if (text=== '光伏发电站') {
      solarpowerData = null;
      $.getJSON(solarpowerURL,function (data) {
        solarpowerData = data.solarpowerstation;
        if(solarpowerData.length > 0){
          initBill('solarpower');
          scene.primitives.remove(solarpower);
          drawPowerRectangle(solarpowerData, 'solarpower');
        }else {
          alert("没有数据！")
        }

      });
    } else if (text=== '变电站') {
      transformerData = null;
      $.getJSON(transformerURL,function (data) {
        transformerData = data.transformersmall;
        if(transformerData.length > 0){
          initBill('transformer');
          scene.primitives.remove(transformer);
          drawPowerRectangle(transformerData, 'transformer');
        }else {
          alert("没有数据！")
        }

      });
    } else if (text=== '风力发电站') {
      windpowerData = null;
      $.getJSON(windpowerURL,function (data) {
        windpowerData = data.windpower;
        if(windpowerData.length > 0){
          initBill('windpower');
          scene.primitives.remove(windpower);
          drawPowerRectangle(windpowerData, 'windpower');
        }else {
          alert("没有数据！")
        }
      });
    }
  }

  if ((splitQuery.length === 2) || (splitQuery.length === 3)) {
    var longitude = +splitQuery[0];
    var latitude = +splitQuery[1];

    //var obj = (latitude,longitude);
    var height = (splitQuery.length === 3) ? +splitQuery[2] : 4000.0;

    if (!isNaN(longitude) && !isNaN(latitude) && !isNaN(height)) {
      flyTo(longitude,latitude, height);
    }
  }


}
//根据经纬度绘制边框函数
function drawPowerRectangle(data,type) {

  var instances = [];
  var color;
  var str;
  if(type === 'tower'){
    color = Cesium.Color.YELLOW;
    str = '输电塔'

  }else if(type ==='hydropower'){
    color = Cesium.Color.BLUE;
    str = '水力发电站'
  }else if(type ==='thermalpower'){
    color = Cesium.Color.RED;
    str = '火力发电站'
  }else if(type ==='solarpower'){
    color = Cesium.Color.WHITE;
    str = '光伏发电站'
  }else if(type ==='transformer'){
    color = Cesium.Color.MAGENTA;
    str = '变电站'
  }else if(type ==='windpower'){
    color = new Cesium.Color.fromBytes(0,255,0);
    str = '风力发电站'
  }else {
    alert("type错误");
    return;
  }
  /*function offsetByDistance() {
    Sandcastle.declare(offsetByDistance);
    Cesium.when.all([
         Cesium.Resource.fetchImage('../images/Cesium_Logo_overlay.png')
        ],
        function(images) {
            // As viewer zooms closer to facility billboard,
            // increase pixelOffset on CesiumLogo billboard to this height
            var facilityHeight = images[0].height;

            // colocated billboards, separate as viewer gets closer

            viewer.entities.add({
                position : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
                billboard : {
                    image : './img/locationImg.png',
                    horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset : new Cesium.Cartesian2(0.0, -facilityHeight),
                    pixelOffsetScaleByDistance : new Cesium.NearFarScalar(1.0e3, 0.0, 1.5e6, 1.0),
                    translucencyByDistance : new Cesium.NearFarScalar(1.0e3, 0.0, 1.5e6, 1)
                }
            });
    });
}*/
  for(var i = 0;i < data.length;i++){
    billName = viewer.entities.add({
      position : Cesium.Cartesian3.fromDegrees(data[i].lng1, data[i].lat1),
      billboard : {
        image : './img/locationImg.png',
        width:32,
        height:32,
        color : color,
        horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
       // pixelOffset : new Cesium.Cartesian2(0.0, -facilityHeight),
        pixelOffsetScaleByDistance : new Cesium.NearFarScalar(500, 0.0, 1.0e3, 1),
        translucencyByDistance : new Cesium.NearFarScalar(500, 0.0, 1.0e3, 1)
      },
      id : type+i,
      name : '电力设施属性',
      type : str,
      confidence : data[i].confidence,
      longitude : data[i].lng1,
      latitude : data[i].lat1
    });
    instances.push(new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions : Cesium.Cartesian3.fromDegreesArray([data[i].lng1,data[i].lat1,  data[i].lng1,data[i].lat2,
          data[i].lng2,data[i].lat2,  data[i].lng2,data[i].lat1,   data[i].lng1,data[i].lat1]),
        width : 2.0
      }),
      id : {
        name : '电力设施属性',
        type : str,
        confidence : data[i].confidence,
        longitude : (parseFloat(data[0].lng1)+parseFloat(data[0].lng2))/2,
        latitude : (parseFloat(data[0].lat1)+parseFloat(data[0].lat2))/2
      },
      vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
    }));
  }
  var inpri = {
    geometryInstances : instances,
    appearance : new Cesium.PolylineMaterialAppearance({
      material : new Cesium.Material({
        fabric : {
          type : 'Color',
          uniforms : {
            color : color
          }
        }
      })
    })
  };
  if(type === 'tower'){
    tower = new Cesium.Primitive(inpri);
    scene.primitives.add(tower);
    appendVecLayerCon(type,str,type+'li',null,type+'del','#FFFF00');
  }else if(type ==='hydropower'){
    hydropower = new Cesium.Primitive(inpri);
    scene.primitives.add(hydropower);
    appendVecLayerCon(type,str,type+'li',null,type+'del','#0000FF');
  }else if(type ==='thermalpower'){
    thermalpower = new Cesium.Primitive(inpri);
    scene.primitives.add(thermalpower);
    appendVecLayerCon(type,str,type+'li',null,type+'del','#FF0000');
  }else if(type ==='solarpower'){
    solarpower = new Cesium.Primitive(inpri);
    scene.primitives.add(solarpower);
    appendVecLayerCon(type,str,type+'li',null,type+'del','#FFFFFF');
  }else if(type ==='transformer'){
    transformer = new Cesium.Primitive(inpri);
    scene.primitives.add(transformer);
    appendVecLayerCon(type,str,type+'li',null,type+'del','#FF0080');
  }else if(type ==='windpower'){
    windpower = new Cesium.Primitive(inpri);
    scene.primitives.add(windpower);
    appendVecLayerCon(type,str,type+'li',null,type+'del','#00FF00');
  }else {
    alert("type错误");
  }





  /*viewer.entities.add({
    name : 'Red line on terrain',
    polyline : {
      positions : Cesium.Cartesian3.fromDegreesArray([lng1,lat1, lng1,lat2, lng2,lat2,lng2,lat1,lng1,lat1]),
      width : 2,
      material : Cesium.Color.RED,
      clampToGround : true
    }
  });
  /*
  viewer.entities.add(
    {
      id : id,
      name : type,
      confidence : confidence,
      rectangle : {
        coordinates : Cesium.Rectangle.fromDegrees(lng1,lat2,lng2,lat1),
        material : Cesium.Color.RED.withAlpha(0),
        outline : true,
        outlineColor : Cesium.Color.RED,
        outlineWidth : 5.0,
        height : 0.0
      }
    }
  );*/
}


$("#pictureChildBox").scroll(function () {
  var scrollLeft = $(this).scrollLeft();
  var scrollWidth = $(this)[0].scrollWidth;
  var windowidth = $(this).width();
  if(scrollLeft + windowidth >= scrollWidth){
    requset5img();
  }
});
function add_img_btn(id,url,minlng,minlat,maxlng,maxlat,name) {
  var attrValueDiv = document.getElementById("picture_ul");
  var tempHtml = '';
  var btn_id = name+id;
  var li= document.createElement("li");
  tempHtml +=
    "<input  name='button'  type='image' class='eleimg' src='"+url+"' id='"+btn_id+"'" +
    " title='"+name+"'>";
  li.innerHTML = tempHtml;
  attrValueDiv.appendChild(li);

  $("#"+btn_id).click(function () {
    setRectangleView(minlng,minlat,maxlng,maxlat);
  });
}


function requset5img() {
  if(img_index+5 <= dataset.length){
    end_index = img_index+5;
  }else {
    end_index = dataset.length;
  }
  for(var i=img_index;i<end_index;i++){
    add_img_btn(i,dataset[i].imgURL,dataset[i].lng1,dataset[i].lat2,  dataset[i].lng2,dataset[i].lat1,dataset[i].name);
  }
  img_index += 5;
}

$("#imgQuery").click(function () {
  $.getJSON("./json/mytest.json",function (data) {
    set_img_dataset(is_img_area,'邓紫棋',data.data);
    $('#pictureBox').show();
    requset5img();
  });
});


function set_img_dataset(flag,text,data) {
  if (flag) {
    var set = data;
    for(var i=0;i<set.length;i++){
      set[i]['name']=text;
    }
    dataset = dataset.concat(set);
  }
}

//眼睛开关控制函数
function eyeInit(inputName) {
  $("#"+inputName).click(function(){
    if($("#"+inputName+'2')){
      $("#"+inputName+'2').remove();
    }
    if(this.checked){
      $(this).siblings(".box2").find("img").attr("src","img/eyeOpen.png");
    }else{
      $(this).siblings(".box2").find("img").attr("src","img/eyeClose.png");
    }
  });
}

//视野范围遍历函数
function claMaxMinBBox(jsonBBox,jsonData) {
  //如果是数组对象，就遍历数据里面的BBox,否则直接找对象里面的BBox
  if(isArrayFn(jsonData)){
    jsonBBox.minlng = jsonData[0].BBox.Min_X;
    jsonBBox.minlat = jsonData[0].BBox.Min_Y;
    jsonBBox.maxlng = jsonData[0].BBox.Max_X;
    jsonBBox.maxlat = jsonData[0].BBox.Max_Y;
    //循环比较求出最值
    for(var i =0;i<jsonData.length;i++){
      jsonBBox.minlng = caluMin(jsonBBox.minlng,jsonData[i].BBox.Min_X);
      jsonBBox.minlat = caluMin(jsonBBox.minlat,jsonData[i].BBox.Min_Y);
      jsonBBox.maxlng = caluMax(jsonBBox.maxlng,jsonData[i].BBox.Max_X);
      jsonBBox.maxlat = caluMax(jsonBBox.maxlat,jsonData[i].BBox.Max_Y);
    }
  }else {
    jsonBBox.minlng = jsonData.BBox.Min_X;
    jsonBBox.minlat = jsonData.BBox.Min_Y;
    jsonBBox.maxlng = jsonData.BBox.Max_X;
    jsonBBox.maxlat = jsonData.BBox.Max_Y;
  }
}
function caluMax(a,b) {
  if(a >= b){
    return a;
  }else {
    return b;
  }
}
function caluMin(a,b) {
  if(a <= b){
    return a;
  }else {
    return b;
  }
}

//判断json对象里是数组还是对象
function isArrayFn(test) {
  //如果浏览器支持isArray方法
  if(typeof Array.isArray==="function"){
    return Array.isArray(test);
  }else {
    return Object.prototype.toString.call(test)==='[object Array]';
  }
}
//初始化图标
function initBill(type) {
  for(var i = 0;i < 10000000;i++){
    if(viewer.entities.getById(type+i)!==undefined){
      viewer.entities.remove(viewer.entities.getById(type+i));
    }else {
      break;
    }
  }
}

//地图图层控件调用的
/*
//专题图控件及初始化
function upThis(is) {
  var $li = $(is).parent().parent();
  $li.prev().before($li)
}
function downThis(is) {
  var $li = $(is).parent().parent();
  $li.next().after($li)
}

//异常地质全选函数
function strangrGeoSelectAll() {
  $("#humanGeoTypeCon,#strangeGeoType").click(function () {
    var isChecked = $(this).prop("checked");
    if(isChecked){
      if(!$('#miningLang').prop("checked")){
        showGeoJson(configJson.miningJsonUrl.url1,1);
      }
    }else {
      if($('#miningLang').prop("checked")){
        deleteGeoJson(geodata,miningDataSource);
      }
    }
    $("input[name='humanGeoType']").prop("checked", isChecked);
  });
}*/


