$(function () {


  $('#label').click(function () {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function(movement) {
      createLabel();
      handler.destroy();
      _tooltip.setVisible(false);
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function(movement) {
      _tooltip.showAt(movement,"左击完成标注<br>中键点击清除标注");
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    function createLabel() {
      var label = new Cesium.Entity({
        position : Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude,5),
        name : 'label',
        label:{
          text: '请右键以修改文字',
          font: '64px Helvetica',
          fillColor: Cesium.Color.SKYBLUE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 200, 0.4)
        }
      });
      viewer.entities.add(label);
      featureCollection.push(label);
    }
  });

  $('#polyline').click(function(){
    var activeShapePoints = [];
    var floatingPoint;
    var activePolyline;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function(click) {
      //var position = _this.viewer.scene.pickPosition(click.position);
      if(Cesium.defined(position.cartesian)){
        var cartesian = position.cartesian;
        if(activeShapePoints.length === 0){
          floatingPoint = creatPoint(cartesian);
          activeShapePoints.push(cartesian);
          var dynamicPositions = new Cesium.CallbackProperty(function() {
            return activeShapePoints;
          },false);
          activePolyline = createPolyline(dynamicPositions);
        }
        activeShapePoints.push(cartesian);
        creatPoint(cartesian);
      }
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function(movement) {
      if(Cesium.defined(floatingPoint)){
        if(Cesium.defined(position.endPosition)){
          floatingPoint.position.setValue(position.endPosition);
          activeShapePoints.pop();
          activeShapePoints.push(position.endPosition);
        }
      }
      _tooltip.showAt(movement,"请左击依次拾取结点<br>双击完成标注")
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function(movement) {
      handler.destroy();
      _tooltip.setVisible(false);
      for(var i=0;i<Points.length;i++){
        viewer.entities.remove(Points[i]);
      }
      Points = [];
      featureCollection.push(activePolyline);
    },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    function createPolyline(positionData) {
      var polyline;
      polyline = viewer.entities.add({
        name : 'polyline',
        polyline : {
          positions : positionData,
          //在地形上绘制多段线，但是在3dtilset模型上无效
          clampToGround : true,
          material: Cesium.Color.RED,
          width : 3
        }
      });
      return polyline;
    }
  });
  $('#polygon').click(function drawPolygon() {
    var activeShapePoints = [];
    var floatingPoint;
    var activePolygon;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(function(click) {

      if(Cesium.defined(position.cartesian)){
        var cartesian = position.cartesian;
        if(activeShapePoints.length === 0){
          floatingPoint = creatPoint(cartesian);
          activeShapePoints.push(cartesian);
          var dynamicPositions = new Cesium.CallbackProperty(function() {
            return activeShapePoints;
          },false);
          activePolygon = createPolygon(dynamicPositions);
        }
        activeShapePoints.push(cartesian);
        creatPoint(cartesian);
      }
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function(movement) {
      if(Cesium.defined(floatingPoint)){
        if(Cesium.defined(position.endPosition)){
          floatingPoint.position.setValue(position.endPosition);
          activeShapePoints.pop();
          activeShapePoints.push(position.endPosition);
        }
      }
      _tooltip.showAt(movement,"请左击依次拾取结点<br>双击完成标注")
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function(movement) {
      handler.destroy();
      _tooltip.setVisible(false);
      for(var i=0;i<Points.length;i++){
        viewer.entities.remove(Points[i]);
      }
      Points = [];
      featureCollection.push(activePolygon);
    },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    function createPolygon(positionData) {
      var polygon;
      polygon = viewer.entities.add({
        name: 'polygon',
        positions : positionData,
        polygon:{
          hierarchy : positionData,
          material: Cesium.Color.RED.withAlpha(0.7),
          outline: true,
          outlineColor: Cesium.Color.YELLOW.withAlpha(1)
        }
      });
      return polygon;
    }
  });

  function creatPoint(position) {
    var point = viewer.entities.add({
      position : position,
      name : 'shapePoint',
      point : {
        color : Cesium.Color.RED,
        pixelSize : 5,
        heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
    Points.push(point);
    return point;
  }
  //保存标注
  function saveMakeup(callback){
    var _this = this;
    var _flags = false;
    var _myMakeup={features:[]};
    var _myGeoJson;
    _myMakeup["type"] = "FeatureCollection";
    var option;
    var positions;
    for(var i=0;i<featureCollection.length;i++){
      if(featureCollection[i].name==='label'){
        var location = Cartesian3ToLatlng(featureCollection[i].position.getValue());
        option = {
          type : "Feature",
          properties: {
            type: featureCollection[i].name,
            text: featureCollection[i].label.text.toString(),
            lat:location[0],
            lng:location[1],
            height:location[2]
          },
          geometry: {
            type: "Point",
            coordinates: [location[0],
              location[1],
              location[2]]
          }
        };
      }else if(featureCollection[i].name==='polyline'){
        console.log();
        positions = createLatlngArray(featureCollection[i].polyline.positions.getValue());
        option = {
          type : "Feature",
          properties: {
            type: featureCollection[i].name,
            style: {
              material : featureCollection[i].polyline.material.getValue().color.toRgba(),
              width : 3
            }
          },
          geometry: {
            type: "LineString",
            coordinates: positions
          }
        }
      }else if(featureCollection[i].name==='polygon'){
        positions = createLatlngArray(featureCollection[i].positions.getValue());
        if(positions===false){
          positions = featureCollection[i].positions.getValue();
        }
        option = {
          type : "Feature",
          properties: {
            type: featureCollection[i].name,
            style:{
              material : featureCollection[i].polygon.material.getValue().color.toRgba(),
              outline: true,
              outlineColor: featureCollection[i].polygon.outlineColor.getValue().toRgba()
            },
            positions : positions
          },
          geometry: {
            type: "Polygon",
            coordinates: [positions]
          }
        }
      }
      _myMakeup.features.push(option);
    }
    if(_myMakeup.features.length>0){
      //保存GeoJson数据
      _myGeoJson = JSON.stringify(_myMakeup);
      _flags = true;
      //console.log(myGeoJson);
    }
    const _cameraLocJson = getCameraLocation();
    callback(_flags,_myGeoJson,_cameraLocJson);
    //保存相机位置
    function getCameraLocation() {
      var _cameraLocation = {
        position: null,
        direction: null,
        up: null
      };
      _cameraLocation.position = viewer.camera.positionWC.clone();
      _cameraLocation.up= viewer.camera.up.clone();
      _cameraLocation.direction = viewer.camera.direction.clone();
      return JSON.stringify(_cameraLocation);
    }
  }

  function Cartesian3ToLatlng(cartesian) {
    var position = [];
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    position.push(Cesium.Math.toDegrees(cartographic.longitude));
    position.push(Cesium.Math.toDegrees(cartographic.latitude));
    position.push(cartographic.height);
    return position;
  }
  function createLatlngArray(array) {
    var _this = this;
    var positionArray = [];
    for(var i=0;i<array.length-2;i++){
      var item = _this.Cartesian3ToLatlng(array[i]);
      if(isNaN(item[0])){
        return false;
      }else {
        positionArray.push(_this.Cartesian3ToLatlng(array[i]));
      }
    }
    return positionArray;
  }
  //标注清空
  $('#mark_clear').click(function () {
    featureCollection.splice(0,featureCollection.length);
    viewer.entities.removeAll();
  });
});

/*
*
  //标注
  function makeup(flag){
    const flags = this.flags;
    const location = this.location;
    var _this = this;
    var featureCollection = this.featureCollection;
    var Points = [];
    const _tooltip = createTooltip(_this.viewer);
    switch (flag) {
      case 'label':
        drawLabel();
        break;
      case 'polyline':
        drawPolyline();
        break;
      case 'polygon':
        drawPolygon();
        break;
      case 'rectangle':
        drawRectangle();
        break;
      default:

        break;
    }
    function drawLabel() {
      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
      handler.setInputAction(function(movement) {
        createLabel();
        handler.destroy();
        flags.markup = false;
        _tooltip.setVisible(false);
      },Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function(movement) {
        flags.markup = true;
        _tooltip.showAt(movement,"左击完成标注<br>中键点击清除标注");
      },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      function createLabel() {
        var label = new Cesium.Entity({
          position : Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude,location.height+3),
          name : 'label',
          label:{
            text: '请右键以修改文字',
            font: '24px Helvetica',
            fillColor: Cesium.Color.SKYBLUE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 200, 0.4)
          }
        });
        _this.viewer.entities.add(label);
        _featureCollection.push(label);
      }
    }
    function drawPolyline() {
      flags.markup = true;
      var activeShapePoints = [];
      var floatingPoint;
      var activePolyline;
      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
      handler.setInputAction(function(click) {
        //var position = _this.viewer.scene.pickPosition(click.position);
        if(Cesium.defined(location.cartesian)){
          var cartesian = location.cartesian;
          if(activeShapePoints.length === 0){
            floatingPoint = creatPoint(cartesian);
            activeShapePoints.push(cartesian);
            var dynamicPositions = new Cesium.CallbackProperty(function() {
              return activeShapePoints;
            },false);
            activePolyline = createPolyline(dynamicPositions);
          }
          activeShapePoints.push(cartesian);
          creatPoint(cartesian);
        }
      },Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function(movement) {
        if(Cesium.defined(floatingPoint)){
          if(Cesium.defined(location.endPosition)){
            floatingPoint.position.setValue(location.endPosition);
            activeShapePoints.pop();
            activeShapePoints.push(location.endPosition);
          }
        }
        _tooltip.showAt(movement,"请左击依次拾取结点<br>双击完成标注")
      },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function(movement) {
        handler.destroy();
        flags.markup = false;
        _tooltip.setVisible(false);
        for(var i=0;i<Points.length;i++){
          _this.viewer.entities.remove(Points[i]);
        }
        Points = [];
        _featureCollection.push(activePolyline);
      },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      function createPolyline(positionData) {
        var polyline;
        polyline = _this.viewer.entities.add({
          name : 'polyline',
          polyline : {
            positions : positionData,
            //在地形上绘制多段线，但是在3dtilset模型上无效
            clampToGround : false,
            followSurface : false,
            material: Cesium.Color.RED,
            width : 3
          }
        });
        return polyline;
      }
    }
    function drawPolygon() {
      flags.markup = true;
      var activeShapePoints = [];
      var floatingPoint;
      var activePolygon;
      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.canvas);
      handler.setInputAction(function(click) {
        var position = _this.viewer.scene.pickPosition(click.position);
        if(Cesium.defined(location.cartesian)){
          var cartesian = location.cartesian;
          if(activeShapePoints.length === 0){
            floatingPoint = creatPoint(cartesian);
            activeShapePoints.push(cartesian);
            var dynamicPositions = new Cesium.CallbackProperty(function() {
              return activeShapePoints;
            },false);
            activePolygon = createPolygon(dynamicPositions);
          }
          activeShapePoints.push(cartesian);
          creatPoint(cartesian);
        }
      },Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function(movement) {
        if(Cesium.defined(floatingPoint)){
          if(Cesium.defined(location.endPosition)){
            floatingPoint.position.setValue(location.endPosition);
            activeShapePoints.pop();
            activeShapePoints.push(location.endPosition);
          }
        }
        _tooltip.showAt(movement,"请左击依次拾取结点<br>双击完成标注")
      },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function(movement) {
        handler.destroy();
        flags.markup = false;
        _tooltip.setVisible(false);
        for(var i=0;i<Points.length;i++){
          _this.viewer.entities.remove(Points[i]);
        }
        Points = [];
        _featureCollection.push(activePolygon);
      },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      function createPolygon(positionData) {
        var polygon;
        polygon = _this.viewer.entities.add({
          name: 'polygon',
          positions : positionData,
          polygon:{
            hierarchy : positionData,
            perPositionHeight: true,
            material: Cesium.Color.RED.withAlpha(0.7),
            outline: true,
            outlineColor: Cesium.Color.YELLOW.withAlpha(1)
          }
        });
        return polygon;
      }
    }
    function drawRectangle() {
      var pointsArr = [];
      var shape ={
        points: [],
        rect: null,
        entity: null
      };
      var tempPosition;
      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
      //鼠标左键单击画点
      handler.setInputAction(function(click) {

        flags.markup = true;
        tempPosition = _this.viewer.scene.pickPosition(click.position);

        //选择的点在地球上
        if(tempPosition){
          if(shape.points.length===0){
            pointsArr.push(tempPosition);
            shape.points.push(_this.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
            shape.rect.east+=0.000001;
            shape.rect.north+=0.000001;
            shape.entity = _this.viewer.entities.add({

            })
          }
        }
      },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    function creatPoint(position) {
      var point = _this.viewer.entities.add({
        position : position,
        name : 'shapePoint',
        point : {
          color : Cesium.Color.RED,
          pixelSize : 5,
          // heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      Points.push(point);
      return point;
    }
    function createTooltip(viewer) {
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
  }

  //标注清空
  function cleanMakeup(){
    this.flags.markup = false;
    const viewer = this.viewer;
    this.featureCollection.splice(0,this.featureCollection.length);
    viewer.entities.removeAll();
  }
  //保存标注
  function saveMakeup(callback){
    var _this = this;
    var _flags = false;
    const _featureCollection = this.featureCollection;
    var _myMakeup={features:[]};
    var _myGeoJson;
    _myMakeup["type"] = "FeatureCollection";
    var option;
    var positions;
    for(var i=0;i<_featureCollection.length;i++){
      if(_featureCollection[i].name==='label'){
        var location = _this.Cartesian3ToLatlng(_featureCollection[i].position.getValue());
        option = {
          type : "Feature",
          properties: {
            type: _featureCollection[i].name,
            text: _featureCollection[i].label.text.toString(),
            lat:location[0],
            lng:location[1],
            height:location[2]
          },
          geometry: {
            type: "Point",
            coordinates: [location[0],
              location[1],
              location[2]]
          }
        };
      }else if(_featureCollection[i].name==='polyline'){
        console.log();
        positions = _this.createLatlngArray(_featureCollection[i].polyline.positions.getValue());
        option = {
          type : "Feature",
          properties: {
            type: _featureCollection[i].name,
            style: {
              material : _featureCollection[i].polyline.material.getValue().color.toRgba(),
              width : 3
            }
          },
          geometry: {
            type: "LineString",
            coordinates: positions
          }
        }
      }else if(_featureCollection[i].name==='polygon'){
        positions = _this.createLatlngArray(_featureCollection[i].positions.getValue());
        if(positions===false){
          positions = _featureCollection[i].positions.getValue();
        }
        option = {
          type : "Feature",
          properties: {
            type: _featureCollection[i].name,
            style:{
              material : _featureCollection[i].polygon.material.getValue().color.toRgba(),
              outline: true,
              outlineColor: _featureCollection[i].polygon.outlineColor.getValue().toRgba()
            },
            positions : positions
          },
          geometry: {
            type: "Polygon",
            coordinates: [positions]
          }
        }
      }
      _myMakeup.features.push(option);
    }
    if(_myMakeup.features.length>0){
      //保存GeoJson数据
      _myGeoJson = JSON.stringify(_myMakeup);
      _flags = true;
      //console.log(myGeoJson);
    }
    const _cameraLocJson = getCameraLocation();
    callback(_flags,_myGeoJson,_cameraLocJson);
    //保存相机位置
    function getCameraLocation() {
      var _cameraLocation = {
        position: null,
        direction: null,
        up: null
      };
      _cameraLocation.position = _this.viewer.camera.positionWC.clone();
      _cameraLocation.up= _this.viewer.camera.up.clone();
      _cameraLocation.direction = _this.viewer.camera.direction.clone();

      return JSON.stringify(_cameraLocation);
    }
  }
* */
