/**
 * 动态添加气泡窗口
 */
$(function () {
  var handler3D = new Cesium.ScreenSpaceEventHandler(canvas);
  handler3D.setInputAction(function (movement) {
    var pick = scene.pick(movement.position);
    if (pick && pick.id&&pick.id.name!=='label') {
      showInforWindows(pick.id);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  isFirstMovein = true;
//鼠标移动进入实体展示其信息
  handler3D.setInputAction(function (movement) {
    var pick = scene.pick(movement.endPosition);
    var pickId = null;
    if (pick && Cesium.defined(pick)&&pick.id.name!=='label'&&pick.id.name!=='polyline'&&pick.id.name!=='shapePoint'&&pick.id.name!=='polygon') {
      //如果拾取的是实体
      if(typeof pick.id === 'object') {
        if (pick === null) {
          pickId = pick.id.id;
        }
        if (pickId !== pick.id.id) {
          isFirstMovein = true;
          pickId = pick.id.id;
        }
        if (pick.id.name !== undefined && pick.id.name !== null) {
          document.getElementById("upname").textContent = pick.id.name;
          //document.getElementById("showBoxId").textContent='';
          if (isFirstMovein) {
            $("#showTable tr").remove();
            if (pick.id.feature) {
              var tr = '<tr><th style="color:#ffffff;">属性:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.feature + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.type) {
              var tr = '<tr><th style="color:#ffffff;">类型:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.type + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.EPC) {
              var tr = '<tr><th style="color:#ffffff;">电力消费:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.EPC + '/亿千瓦时' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.Area) {
              var tr = '<tr><th style="color:#ffffff;">面积:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.Area + '/万平方千米' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.p) {
              var tr = '<tr><th style="color:#ffffff;">人口:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.p + '/万人' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.GDP) {
              var tr = '<tr><th style="color:#ffffff;">GDP:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.GDP + '/亿元' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.pGDP) {
              var tr = '<tr><th style="color:#ffffff;">人均GDP:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.pGDP + '/元' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.longitude) {
              var tr = '<tr><th style="color:#ffffff;">经度:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.longitude + '°' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.latitude) {
              var tr = '<tr><th style="color:#ffffff;">纬度:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.latitude + '°' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.location) {
              var tr = '<tr><th style="color:#ffffff;">位置:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.location + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.lat1) {
              var tr = '<tr><th style="color:#ffffff;">纬度:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + (pick.id.lat1+pick.id.lat2)/2 + '°' + '></td></tr>';
              $("#showTable").append(tr);
            }
            if (pick.id.confidence) {
              var tr = '<tr><th style="color:#ffffff;">置信度:</th><td ><input  style="border: 0.5px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + pick.id.confidence + '></td></tr>';
              $("#showTable").append(tr);
            }
            isFirstMovein = false;
          }
        } else {
          //document.getElementById("notPoint").textContent="Name";
        }
        var pos = getPos(movement.endPosition);
        document.getElementById("notPoint").style.left = pos.x + 10 + "px";
        document.getElementById("notPoint").style.top = pos.y + 10 + "px";
        document.getElementById("notPoint").style.display = "block";
      }else if(typeof pick.id === 'string'){
        //如果拾取的是primitivw形状
         // alert(primitive.getGeometryInstanceAttributes(pick.id).name)
      }
    } else {
      $("#showTable tr").remove();
      document.getElementById("notPoint").style.display = "none";
      isFirstMovein = true;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//获取屏幕坐标
  function getPos(position) {
    var location = new Cesium.Cartesian2(position.x, position.y);
    return location;
  }

//点击实体查看其信息
  function showInforWindows(s) {
    var newDiv = "div" + s.id;   //生成函数名
    window[newDiv] = '<div id="trackPopUp-' + s.id + '"  class="trackPopUp">' +
      '<div id="trackPopUpContent-' + s.id + '" class="leaflet-popup"  style="top:5px;left:0;">' +
      '<a id="leaflet-popup-close-button-' + s.id + '"class="leaflet-popup-close-button" href="#">×</a>' +
      '<div class="leaflet-popup-content-wrapper">' +
      '<div id="trackPopUpLink-' + s.id + '" class="leaflet-popup-content" style="max-width: 300px;"></div>' +
      '</div>' +
      '<div class="leaflet-popup-tip-container">' +
      '<div class="leaflet-popup-tip"></div>' +
      '</div>' +
      '</div>' +
      '</div>';
    $("#cesiumContainer").append(window[newDiv]);
    var info;
    if(s.name ==='电力设施属性'){
      info =
        '<h4 style="color:#ffffff;" align=center>' + s.name + '</h4>' +
        '<table>' +
        '<tr><th style="color:#ffffff;">类型:</th><td align="center" ><input  style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.type + '></td></tr>' +
        '<tr><th style="color:#ffffff;">经度:</th><td><input id="x" style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.longitude.toFixed(6) + '></td></tr>' +
        '<tr><th style="color:#ffffff;">纬度:</th><td><input id="y" style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.latitude.toFixed(6) + '></td></tr>' +
        '<tr><th style="color:#ffffff;">置信度:</th><td><input id="z" style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.confidence + '></td></tr>' +
        '</table>';
    }else {
       info =
        '<h4 style="color:#ffffff;" align=center>' + s.name + '</h4>' +
        '<table>' +
        '<tr><th style="color:#ffffff;">类型:</th><td align="center" ><input  style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.feature + '></td></tr>' +
        '<tr><th style="color:#ffffff;">经度:</th><td><input id="x" style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.longitude.toFixed(6) + '></td></tr>' +
        '<tr><th style="color:#ffffff;">纬度:</th><td><input id="y" style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.latitude.toFixed(6) + '></td></tr>' +
        '<tr><th style="color:#ffffff;">位置:</th><td><input id="z" style="border: 1px solid #ffffff;color:#ffffff;background-color: rgba(60,60,60,0.6)" value=' + s.location + '></td></tr>' +
        '</table>';
    }


    var obj = {station: s, position: s._position._value, content: info};
    autoInfoWindow(obj);

    function autoInfoWindow(obj) {

      var trackPopUpLink = "#trackPopUpLink-" + obj.station.id;
      var trackPopUp = "#trackPopUp-" + obj.station.id;
      var trackPopUpContent = "#trackPopUpContent-" + obj.station.id;
      var close = "#leaflet-popup-close-button-" + obj.station.id;


      $(".cesium-selection-wrapper").show();
      $(trackPopUpLink).empty();
      $(trackPopUpLink).append(obj.content);
      var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
      $(trackPopUp).show();
      positionPopUp(c);

      function positionPopUp(c) {
        var x = c.x - ($(trackPopUpContent).width()) / 2;
        var y = c.y - ($(trackPopUpContent).height());
        $(trackPopUpContent).css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
      }

      //动态变量名
      var stationHandler = obj.station.id;   //生成函数名
      window[stationHandler] = viewer.scene.postRender.addEventListener(function () {
        var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, obj.station._position._value);
        // If things moved, move the
        // popUp too
        if (changedC != null) {
          if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
            positionPopUp(changedC);
            c = changedC;
          }
        }

      });
      // PopUp close button event handler
      $(close).click(function () {
        $(trackPopUp).hide();
        $(trackPopUpLink).empty();
        $(".cesium-selection-wrapper").hide();
        window[stationHandler].call();
        return false;
      });
    }
  }
});
