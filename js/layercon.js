$(document).ready(function () {
    var isFrist = true;

    //捕获ajax异常信息
  $.ajaxSetup({
    error:function(x,e){
      alert("请求数据失败，请检查地图服务器或配置文件！");
      return false;
    }
  });

//图层管理界面
$('#chart1').click(function () {
  if($('#chart1').prop("checked")){
    if(isFrist || isPieChart ===false){
      myChart1 = echarts.init(document.getElementById('PieChart'));
      PieOption.title.text="电力设施类型饼状图";
      myChart1.setOption(PieOption);
      countAllPS();
      isFrist = false;
      $('#PieChart').slideDown();
    }
    if(isPieChart){
      countAllPS();
      $('#PieChart').slideDown();
    }
  }else{
    $('#PieChart').slideUp();
  }
});
//区域电力消费
$('#chart25').click(function () {

    if($('#chart25').prop("checked")) {
      if (provincedata === null) {
        $.getJSON(configJson.data_production.PowerConsumption_data.power_Province.geoJsonURL, function (data) {
          provincedata = data;
          areaEleCount();
          $('#areaElePieChart').slideDown();
        });
      } else {
        areaEleCount();
        $('#areaElePieChart').slideDown();
      }
    }
  else {
      $('#areaElePieChart').slideUp();
    }
});
//4-8对应年度数据
$('#chart3').click(function () {
  if($('#chart3').prop("checked")){
    powerMade();
    $('#BarChart').slideDown();
  }else {
    $('#BarChart').slideUp();
  }
  });
$('#chart4').click(function () {
        if($('#chart4').prop("checked")){
            ecPower();
            $('#BarChart').slideDown();
        }else {
            $('#BarChart').slideUp();
        }
    });
$('#chart5').click(function () {
        if($('#chart5').prop("checked")){
            dayPower();
            $('#BarChart').slideDown();
        }else {
            $('#BarChart').slideUp();
        }
    });
$('#chart6').click(function () {
        if($('#chart6').prop("checked")){
            perPower();
            $('#BarChart').slideDown();
        }else {
            $('#BarChart').slideUp();
        }
    });
$('#chart7').click(function () {
        if($('#chart7').prop("checked")){
            provincePower();
            $('#BarChart').slideDown();
        }else {
            $('#BarChart').slideUp();
        }
    });
$('#chart8').click(function () {
        if($('#chart8').prop("checked")){
            powerCount();
            $('#BarChart').slideDown();
        }else {
            $('#BarChart').slideUp();
        }
    });
//清空按钮
$('#chartclear').click(function () {
  $('#BarChart').hide();
  $('#PieChart').hide();
  $('input[name="oneChartBox"]').prop('checked',false);
  $('#chart1').prop('checked',false);
  $('#areaEle').prop('checked',false);
  $('#chart25').prop("checked",false);
  $('#areaElePieChart').hide();
  $('#eleFacChart').css('background','#595959');
  $('#energyEatMapChart').css('background','#595959');
});


$('#closeShowWin').click(function () {
  $('#powerShowWin').hide();
});

$('#rectArea').click(function () {
  $("input[name = 'loc']").attr("disabled","disabled");
  south = 0;
  west = 0;
  north = 0;
  east = 0;
});

$('#rectSelfArea').click(function () {
  $("input[name = 'loc']").removeAttr("disabled");
  south = 0;
  west = 0;
  north = 0;
  east = 0;
});

$('#queryDelay').click(function () {
  $("input[name ='sameRad']").prop('checked',false);
  $("input[name = 'loc']").val("");
  $('#queryArea').slideUp(300);
});
$('#querySure').click(function () {
   lng1 = parseFloat($('#lng1').val());
   lat1 = parseFloat($('#lat1').val());
   lat2 = parseFloat($('#lat2').val());
   lng2 = parseFloat($('#lng2').val());
   if($('#rectSelfArea').prop('checked')){
     if(lng1 >= lng2 || lat1 <= lat2 || lng1 >180 || lng1 < -180 || lng2 >180 || lng2 < -180 || lat1 > 90 || lat1 < -90
       || lat2 >90 || lat2 < -90 || isNaN(lng1) || isNaN(lng2) || isNaN(lat1) || isNaN(lat2)){
       alert("请输入正确的经纬度范围！")
     }else {
       $('#queryArea').slideUp(300);
     }
   }
   if($('#rectArea').prop('checked')){
     if(south!==0&& north!==0){
       points = null;
     }
     $('#queryArea').slideUp(300);
   }
});
$('#queryConfig').click(function () {
  $('#queryArea').slideDown(300);
});
});


//根据点的信息创建发电站点信息
function powerBuildiPoint(id,name,liId,chartId,deleteId) {

  $("#"+id).click(function (){

      if($('#rectArea').prop('checked')){
        if(south ===0 && north===0){
          alert("请选择框选范围");
          $("#"+id).prop('checked',false);
        }else{
          points = null;
          $.getJSON(rectangleUrlParse+"&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"", function (data) {
            //var points = eval("("+data+")");老版方法，不推荐
            if (data.pdate.RECORDS.length>0){
              points = data.pdate.RECORDS;
              sortPowerStaion(points);
              removeTransPS(transPS);
              whatsEleFacLayer(points);
              transPS = points;
              if($("#"+liId).length>0){
                if(showPoints.length===0){
                  $("#eleFacLid").remove();
                }
              }else {
                appendVecLayerCon(id,name,liId,chartId,deleteId);
              }
            } else {
              alert("数据为空")
            }

          });
        }
      }else if($('#rectSelfArea').prop('checked')){
        points = null;
        $.getJSON(rectangleUrlParse+"&lng1="+lng1+"&lat1="+lat1+"&lng2="+lng2+"&lat2="+lat2+"", function (data) {
          //var points = eval("("+data+")");老版方法，不推荐
          if (data!==null){
            points = data.pdate.RECORDS;
            sortPowerStaion(points);
            removeTransPS(transPS);
            whatsEleFacLayer(points);
            transPS = points;
            if($("#"+liId).length>0){
              if(showPoints.length===0){
                $("#eleFacLid").remove();
              }
            }else {
              appendVecLayerCon(id,name,liId,chartId,deleteId);
            }
          } else {
            alert("数据为空");
            $("#powerSattionTypeAll").prop('checked',false);
          }
        });
      }else {
        points = null;
        if (points === null) {
          $.getJSON(urlParse, function (data) {
            //var points = eval("("+data+")");老版方法，不推荐
            points = data.pdate.RECORDS;
            sortPowerStaion(points);
            removeTransPS(transPS);
            whatsEleFacLayer(points);
            transPS = points;
            if($("#"+liId).length>0){
              if(showPoints.length===0){
                $("#eleFacLid").remove();
              }
            }else {
              appendVecLayerCon(id,name,liId,chartId,deleteId);
            }
          });
        }
      }


    });
}
//根据发电站类型的选择重新确定要可视化哪一些点
function whatsEleFacLayer(data) {
  showPoints = [];
  removePS();
  var uri1='img/tower.glb';
  var uri2='img/fengche.gltf';
  var uri3='img/tower_white.glb';
  for(var i =0; i < data.length; i++){
    var isChecked1 = $('#nuclearPowerStation').prop("checked");
    if(isChecked1){
      if(data[i].feature === '核电站')
      {pushSelPoints(showPoints,data[i]);
        if($('#eleTypePoint').prop("checked")){
          createColorPoints(data[i],Cesium.Color.YELLOW);
        }else {
          createColor3DModel(data[i],Cesium.Color.YELLOW,uri1)
        }
      }
    }
    var isChecked2 = $('#thermalPowerStation').prop("checked");
    if(isChecked2 ){
      if(data[i].feature === '火力发电站'||data[i].feature === '火电站'||data[i].feature === '火电')
      {pushSelPoints(showPoints,data[i]);
        if($('#eleTypePoint').prop("checked")){
          createColorPoints(data[i],Cesium.Color.RED);
        }else{
          createColor3DModel(data[i],Cesium.Color.RED,uri1)
        }
      }
    }
    var isChecked3 = $('#hydraulicPowerStation').prop("checked");
    if(isChecked3 ){
      if(data[i].feature === '水力发电站'||data[i].feature === '水电站'||data[i].feature === '水电')
      {pushSelPoints(showPoints,data[i]);
        if($('#eleTypePoint').prop("checked")){
          createColorPoints(data[i],Cesium.Color.BLUE);
        }else {
          createColor3DModel(data[i],Cesium.Color.BLUE,uri1)
        }
      }
    }
    var isChecked4 = $('#photovoltaicPowerStation').prop("checked");
    if(isChecked4 ){
      if(data[i].feature === '光伏发电站'||data[i].feature === '光伏'||data[i].feature === '光伏站'){
        pushSelPoints(showPoints,data[i]);
        if($('#eleTypePoint').prop("checked")){
          createColorPoints(data[i],Cesium.Color.WHITE);
        }else {
          createColor3DModel(data[i],Cesium.Color.WHITE,uri1)
        }
      }
    }
    var isChecked5 = $('#windPowerStation').prop("checked");
    if(isChecked5 ){
      if(data[i].feature === '风力发电站'||data[i].feature === '风电'||data[i].feature === '风电站'){
        pushSelPoints(showPoints,data[i]);
        if($('#eleTypePoint').prop("checked")){
          createColorPoints(data[i],Cesium.Color.fromBytes(0,255,0));
        }else {
          createColor3DModel(data[i],Cesium.Color.fromBytes(0,255,0),uri2)
        }
      }
    }
    var isChecked6 = $('#largesubstation').prop("checked");
    if(isChecked6){
      if(data[i].feature === '变电站'){
        pushSelPoints(showPoints,data[i]);
        if($('#eleTypePoint').prop("checked")){
          createColorPoints(data[i],Cesium.Color.MAGENTA );
        }else {
          createColor3DModel(data[i],Cesium.Color.MAGENTA ,uri3)
        }
      }
    }
  }
}
function createColorPoints(data,color) {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude),
    id: data.id,
    name: data.name,
    latitude: data.latitude,
    longitude: data.longitude,
    feature: data.feature,
    location: data.location,
    point: {
      color: color,
      pixelSize: 5
    }
    //label : { //文字标签
    //  text : data.feature,
    //  font : '2pt monospace',
    //  style : Cesium.LabelStyle.FILL_AND_OUTLINE,
    //  color : color,
    //outlineWidth : 2,
    //   verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
    //  pixelOffset : new Cesium.Cartesian2( 0, -5 )   //偏移量
    // }
  })
}
function createColor3DModel(data,color,uri) {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude),
    id: data.id,
    name: data.name,
    latitude: data.latitude,
    longitude: data.longitude,
    feature: data.feature,
    location: data.location,
    model: {
      uri: uri,
      minimumPixelSize: 35,
      maximumScale: 150000,
      silhouetteColor: color,
      color: color
    }
  });
}
var firstIn = true;
function sortPowerStaion(data){
  thermalPSNum = 0;
  hydraulicPSNum = 0;
  windPSNum = 0;
  nuclearPSNum = 0;
  photovoltaicPSNum = 0;
  changesubstationPSNum = 0;
  for(var i =0; i < data.length; i++){
    if(data[i].feature === '火力发电站'||data[i].feature === '火电站'||data[i].feature === '火电') {pushSelPoints(thermalPS,data[i]);thermalPSNum++}
    if(data[i].feature === '水力发电站'||data[i].feature === '水电站'||data[i].feature === '水电') {pushSelPoints(hydraulicPS,data[i]);hydraulicPSNum++}
    if(data[i].feature === '风力发电站'||data[i].feature === '风电'||data[i].feature === '风电站') {pushSelPoints(windPS,data[i]);windPSNum++}
    if(data[i].feature === '核电站') {pushSelPoints(nuclearPS,data[i]);nuclearPSNum++}
    if(data[i].feature === '光伏发电站'||data[i].feature === '光伏'||data[i].feature === '光伏站') {pushSelPoints(photovoltaicPS,data[i]);photovoltaicPSNum++}
    if(data[i].feature === '变电站'){pushSelPoints(changesubstationPS,data[i]);changesubstationPSNum++}
  }
  if(firstIn){
    thermalPSNumSum = thermalPSNum;
    hydraulicPSNumSum = hydraulicPSNum;
    windPSNumSum = windPSNum;
    nuclearPSNumSum = nuclearPSNum;
    photovoltaicPSNumSum = photovoltaicPSNum;
    changesubstationPSNumSum = changesubstationPSNum;
    firstIn = false;
  }
}
function sortPowerStationNum(data) {
  if(data.feature === '火力发电站'||data.feature === '火电站'||data.feature === '火电') thermalPSNum++;
  if(data.feature === '水力发电站'||data.feature === '水电站'||data.feature === '水电') hydraulicPSNum++;
  if(data.feature === '风力发电站'||data.feature === '风电'||data.feature === '风电站') windPSNum++;
  if(data.feature === '核电站') nuclearPSNum++;
  if(data.feature === '光伏发电站'||data.feature === '光伏'||data.feature === '光伏站') photovoltaicPSNum++;
  if(data.feature === '变电站')changesubstationPSNum++;
}
function pushSelPoints(goal,data){
  goal.push({
    id : data.id,
    latitude : data.latitude,
    longitude : data.longitude,
    feature : data.feature,
    name : data.name,
    location : data.location
  })
}
function removePS() {
    for(var i = 0;i < points.length; i++){
        viewer.entities.removeById(points[i].id);
    }
}
function removeTransPS(data) {
  if(data!==null){
    for(var i = 0;i < data.length; i++){
      viewer.entities.removeById(data[i].id);
    }
  }

}

