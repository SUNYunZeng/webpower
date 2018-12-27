var inSelectNum = 0;
var myChart01;
var firstProSta = true;
var isGloble = false;
//统计区域整体耗电量
$(function () {
  /**
   * 图表控制函数
   */
     var flagChart = 0;
     isPieChart = false;
     names = [];
     eledata = [];

     //如果统计范围为当前屏幕
    $('#selallBtn').click(function () {
        flagChart = 1;
        $('#selallBtn').css("background","#595959");
        $('#rectBox').css("background","transparent");
        $('#polygonBox').css("background","transparent");
        //获取屏幕坐标
        var pt1 = new Cesium.Cartesian2(0,0);
        var pt2= new Cesium.Cartesian2($(document.body).width(),$(document.body).height());
          var pick1= viewer.scene.globe.pick(viewer.camera.getPickRay(pt1), viewer.scene);
          var pick2= viewer.scene.globe.pick(viewer.camera.getPickRay(pt2), viewer.scene);

        //将三维坐标转成地理坐标
        if(typeof (pick1)!=="undefined" && typeof (pick2)!=="undefined"){
            var geoPt1= viewer.scene.globe.ellipsoid.cartesianToCartographic(pick1);
            var geoPt2= viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
            //地理坐标转换为经纬度坐标
            var point1=[geoPt1.longitude / Math.PI * 180,geoPt1.latitude / Math.PI * 180];
            var point2=[geoPt2.longitude / Math.PI * 180,geoPt2.latitude / Math.PI * 180];
            area = 0;
            var inPolygn = [{
             latitude : point1[1],
             longitude : point1[0]
           },{
              latitude : point1[1],
              longitude :  point2[0]
            },{
              latitude : point2[1],
              longitude : point2[0]
            },{
              latitude : point2[1],
              longitude : point1[0]
            }];
            area = computeSignedArea(inPolygn);

            if(showPoints!==null){
              isGloble = false;
              initCountNum();
              for(var i = 0; i<showPoints.length;i++){
                if(isInRect(showPoints[i].latitude,showPoints[i].longitude,point1[1],point1[0],point2[1],point2[0])){
                  sortPowerStationNum(showPoints[i])
                }
              }
            }
          //如果图层为电力消耗图层
          if($('#nightRGB').prop("checked")||$('#night_power').prop("checked")){
            if(powerConsumpationData){
              inSelectNum = 0;
              var totalPowerConsumepation = 0;
              for(var j=0;j < powerConsumpationData.features.length;j++ ){
                if(isInRect(powerConsumpationData.features[j].geometry.coordinates[1]
                    ,powerConsumpationData.features[j].geometry.coordinates[0],point1[1],point1[0],point2[1],point2[0])){
                  totalPowerConsumepation=totalPowerConsumepation+powerConsumpationData.features[j].properties.RASTERVALU;
                }
              }
              inSelectNum = totalPowerConsumepation;
            }
          }

        }else{
          if($('#nightRGB').prop("checked")||$('#night_power').prop("checked")){
            countAllPower();
          }
          isGloble = true;
        }
    });
    //如果统计范围是框选
    $('#rectBox').click(function () {
        $('#rectBox').css("background","#595959");
        $('#selallBtn').css("background","transparent");
        $('#polygonBox').css("background","transparent");
        flagChart = 2;
    });
    //如果统计范围是多边形选区
    $('#polygonBox').click(function () {
        $('#polygonBox').css("background","#595959");
        $('#selallBtn').css("background","transparent");
        $('#rectBox').css("background","transparent");
        inPolygnPoints = [];
        var inPolygn = [];
        area = 0;
        inSelectNum = 0;
        var canvas = viewer.canvas;
        var handler = new Cesium.ScreenSpaceEventHandler(canvas);
        handler.setInputAction(function () {
            inPolygn.push({
                latitude : lat_String,
                longitude : log_String
            })
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(function () {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
          area = computeSignedArea(inPolygn);
            if(showPoints!==null){
                for(var i=0;i<showPoints.length;i++){
                    if(isInPoy(showPoints[i].longitude,showPoints[i].latitude,inPolygn)==='in'){
                        pushSelPoints(inPolygnPoints,showPoints[i]);
                    }}
            }else alert("您选择的区域没有数据！");
          if($('#nightRGB').prop("checked")||$('#night_power').prop("checked")){
            if(powerConsumpationData){
              var totalPowerConsumepation = 0;
              for(var j=0;j < powerConsumpationData.features.length;j++ ){
                if(isInPoy(powerConsumpationData.features[j].geometry.coordinates[0]
                    ,powerConsumpationData.features[j].geometry.coordinates[1],inPolygn)==='in'){
                  totalPowerConsumepation=totalPowerConsumepation+powerConsumpationData.features[j].properties.RASTERVALU;
                }
              }
              inSelectNum = totalPowerConsumepation;
            }
          }

        },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        flagChart = 3;
    });
    $('#countBtn').click(function () {
        $('#selallBtn').css("background","transparent");
        $('#rectBox').css("background","transparent");
        $('#polygonBox').css("background","transparent");
      if($('#nightRGB').prop("checked")||$('#night_power').prop("checked")) {
        if(flagChart ===2){
          var inPolygn = [];
          area = 0;
          inSelectNum = 0;
          inPolygn= [{
            latitude : cx1,
            longitude : cy1
          },{
            latitude : cx1,
            longitude : cy2
          },{
            latitude : cx2,
            longitude : cy2
          },{
            latitude : cx2,
            longitude : cy1
          }];
          area = computeSignedArea(inPolygn);
          if(powerConsumpationData){
            inSelectNum = 0;
            var totalPowerConsumepation = 0;
            for(var j=0;j < powerConsumpationData.features.length;j++ ){
              if(isInRect(powerConsumpationData.features[j].geometry.coordinates[1]
                  ,powerConsumpationData.features[j].geometry.coordinates[0],cx1,cy1,cx2,cy2)){
                totalPowerConsumepation+=powerConsumpationData.features[j].properties.RASTERVALU;
              }
            }
            inSelectNum = totalPowerConsumepation;
          }
        }
      }
      if(charFlag === 1){
            //如果图表管理界面选择是电力设施统计面板
            myChart01 = echarts.init(document.getElementById('PieChart'));
            PieOption.title.text="电力设施类型饼状图";
            myChart01.setOption(PieOption);
            if(flagChart === 0) {
              countGlobePS();
                isPieChart = true;
            }
            if(flagChart ===1){
              if(isGloble){
                countGlobePS();
              }else {
                countAllPS();
              }
                isPieChart = true;
            }
            if(flagChart ===2){
                if(inRecPoints!==null){
                    initCountNum();
                    inRecPoints = [];
                    if(showPoints!==null){
                        for(var i=0;i<showPoints.length;i++){
                            if(isInRect(showPoints[i].latitude,showPoints[i].longitude,cx1,cy1,cx2,cy2)){
                                pushSelPoints(inRecPoints,showPoints[i]);
                            }
                        }}
                    for( i = 0; i<inRecPoints.length;i++){
                        sortPowerStationNum(inRecPoints[i])
                    }
                }
                countAllPS();
                isPieChart = true;
                //等选区确定了在判断
            }
            if(flagChart ===3){
                if(inPolygnPoints!==null){
                    initCountNum();
                    for( i = 0; i<inPolygnPoints.length;i++){
                        sortPowerStationNum(inPolygnPoints[i])
                    }
                }
                countAllPS();
                isPieChart = true;
            }
            $('#PieChart').show();
          $('#chart1').attr("checked",true);
        }
      //如果是电力消费统计
      if(charFlag===2){

        $('#areaInput').prop("value",area.toFixed(9)+"/万平方公里");
        $('#powerConsumeInput').prop("value",inSelectNum.toFixed(7)+"/万千瓦时");
        $('#powerArea').prop("value",(inSelectNum/area).toFixed(2)+"/千瓦时每平方公里");
        compareTotalPower();
        $('#powerShowWin').show();
      }

    });

});
/*for(var i = 0;i <inRecPoints.length;i++){
            names.push(inRecPoints[i].id);
            eledata.push({
                name : inRecPoints[i].id,
                value : inRecPoints[i].longitude
            })
       }*/

var PieOption = {
    backgroundColor: 'rgba(60,60,60,0.4)',
    title : {
        text: '测试',
        x:'center',
        textStyle: {
            color: '#fff'
        }
    },
    toolbox : {
        show : true,
        iconStyle : {
            bordercolor : '#c23531',
            normal:{
                color:'#fff'
            }
        },
        feature:{
            saveAsImage : {show : true},
            myCloseTool: {
                show: true,
                title: '关闭',
                icon: 'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
                onclick: function () {
                    $('#PieChart').hide();
                    $('#chart1').attr('checked',false)
                }
            }
        }
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)",
        textStyle: {
            size : 80
        }
    },

    legend: {
        orient: 'vertical',
        left: 'left',
        data: [],
        textStyle: {
            color: '#fff'
        }
    },
    series : [
        {
            name: '发电站类型',
            type: 'pie',
            radius : '52%',
            center: ['50%', '60%'],
            data:[],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
var BarOption = {
    title : {
        text: '',
        x:'center',
        textStyle: {
            color: '#fff'
        },
        subtextStyle : {
            color: '#fff'
        }
    },
    backgroundColor: 'rgba(60,60,60,0.4)',
    tooltip : {
        trigger: 'item'
    },
    grid:{
        x:65,
        x2:15,
        y2:32
    },
    legend: {
        orient: 'horizontal',
        left: 'center',
        top: '30px',
        data: [],
        textStyle: {
            color: '#fff'
        }
    },
    toolbox: {
        show : true,
        feature : {
            dataView : {show: true, readOnly: false},
            saveAsImage : {show: true},
            magicType : {show: true, type: ['line', 'bar']},
            myCloseTool: {
                show: true,
                title: '关闭',
                icon: 'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
                onclick: function () {
                    $('#BarChart').hide();
                    $('#eleFacChart').css('background','#888888');
                }
            }
        },
        iconStyle:{
            normal:{
                color:'#fff'
            }
        }
    },
    xAxis : [
        {
            type: 'category',
            axisLine: {
                lineStyle: {
                    type: 'solid',
                    color:'#fff'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fff',
                    backgroundColor: 'rgba(60,60,60,0.8)'
                }
            },
            data: []
        }
    ],
    yAxis : [
        {
            axisLine: {
                lineStyle: {
                    type: 'solid',
                    color:'#fff'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            },
            type : 'value'
        }
    ],
    series : []
};
var HuanBarOption = {
  title : {
    subtext: '单位(kwh/k㎡)',
    subtextStyle : {
      color: '#fff'
    },
    text: '单位面积耗电量',
    x:'center',
    textStyle: {
      color: '#fff',
      fontSize: '14'
    }
  },
  color: ['#3398DB'],
  tooltip : {
    trigger: 'axis',
    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
      type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    }
  },

  grid: {
    left: '1%',
    right: '6%',
    bottom: '3%',
    containLabel: true
  },
  yAxis : [
    {
      type : 'category',
      orient: 'vertical',
      data : ['均\n值','所\n选'],
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        lineStyle: {
          type: 'solid',
          color:'#fff'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#fff',
          backgroundColor: 'rgba(60,60,60,0.8)',
          fontSize: '4'
        }
      }
    }
  ],
  xAxis : [
    {
      type : 'value',
      axisLine: {
        lineStyle: {
          type: 'solid',
          color:'#fff'
        },
        interval : 1
      },
      axisLabel: {
        textStyle: {
          color: '#fff'
        },
        fontStyle : 'italic',
        interval : 1
      }
    }
  ],
  series : [
    {
      name:'数值',
      type:'bar',
      barWidth: '50%',
      data:[],
      itemStyle: {
        normal:{
          color: function (params){
            var colorList = ['#ff4844','#9ac3e5'];
            return colorList[params.dataIndex];
          }
        }
      }
    }
  ]
};
var HuanPieOption = {
  title : {
    subtext: '单位/万千瓦时间)',
    subtextStyle : {
      color: '#fff'
    },
    text: '当前耗电量占比',
    x:'right',
    textStyle: {
      color: '#fff',
      fontSize: '14'
    }
  },
  color:['#00EBC0','#E9F01D'],
  tooltip: {
    trigger: 'item',
    formatter: "{b}: {c} ({d}%)",
    position: ['5%', '80%']
  },
  legend: {
    orient: 'vertical',
    x: 'left',
    data:['剩余','所选'],
    textStyle: {
      color: '#fff'
    }
  },
  series: [
    {
      center: ['50%','60%'],
      type:'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: false,
          position: 'center'
        },
        emphasis: {
          show: true,
          textStyle: {
            fontSize: '30',
            fontWeight: 'bold'
          }
        }
      },
      labelLine: {
        normal: {
          show: false
        }
      },
      data:[]
    }
  ]
};
var provBarOption = {
  //基本配置都写在baseoption 中
  baseOption: {
    backgroundColor: 'rgba(60,60,60,0.4)',
    color:['#1e90ff'],
    timeline: {
      //loop: false,
      axisType: 'category',
      show: false

    },
    grid:{
      x:65,
      x2:15,
      y2:62
    },
    xAxis : [{
      type:'category',
      axisLine: {
        lineStyle: {
          type: 'solid',
          color:'#fff'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#fff',
          backgroundColor: 'rgba(60,60,60,0.8)'
        },
        interval:0,
        rotate:40
      }
    }],
    yAxis: {
      name : '单位：亿千瓦小时',
      type: 'value',
      axisLine: {
        lineStyle: {
          type: 'solid',
          color:'#fff'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#fff'
        }
      },
      'max':5000
    },
    series: [
      {
        type: 'bar'
      }
    ],
    tooltip: {},
    title : {
      subtext: '数据提取自夜光遥感图',
      x :'center',
      textStyle: {
        color: '#fff'
      },
      subtextStyle : {
        color: '#fff'
      }
    },
    toolbox: {
      show : true,
      feature : {
        dataView : {show: true, readOnly: false},
        saveAsImage : {show: true},
        myCloseTool: {
          show: true,
          title: '关闭',
          icon: 'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
          onclick: function () {
            $('#energyEatMapChart').css('background','#888888');
            $('#chart25').prop('checked',false);
            $('#areaElePieChart').hide();


          }
        }
      },
      iconStyle:{
        normal:{
          color:'#fff'
        }
      }
    }
  },
  //变量则写在options中
  options:[]
};
var TimeLineOption = {
    //timeline基本配置都写在baseoption 中

    baseOption: {
        backgroundColor: 'rgba(60,60,60,0.4)',
        color:['#1e90ff'],
        timeline: {
            //loop: false,
            axisType: 'category',
            show: true,
            autoPlay: true,
            playInterval: 1000,
            lineStyle : {
                color : '#fff',
                type: 'dashed'
            },
            controlStyle : {
                normal : { color : '#fff'},
                emphasis : { color : '#1e90ff'}
            },
            checkpointStyle : {
                color : '#1e90ff',
                borderColor : 'blue'

            },label: {
                textStyle: {
                    color: '#fff'
                }
            },
            data:[
                '2007','2008','2009','2010','2011',
                '2012','2013','2014','2015'
            ]
        },
        grid:{
            x:65,
            x2:15,
            y2:82
        },
        xAxis : [{
            type:'category',
            axisLine: {
                lineStyle: {
                    type: 'solid',
                    color:'#fff'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fff',
                    backgroundColor: 'rgba(60,60,60,0.8)'
                },
                interval:0,
                rotate:40
            }
        }],
        yAxis: {
            name : '单位：亿千瓦小时',
            type: 'value',
            axisLine: {
                lineStyle: {
                    type: 'solid',
                    color:'#fff'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            },
            'max':5000
        },
        series: [
            {
                type: 'bar'
            }
        ],
        tooltip: {},
        title : {
            subtext: '数据来自国家统计局',
            x :'center',
            textStyle: {
                color: '#fff'
            },
            subtextStyle : {
                color: '#fff'
            }
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                saveAsImage : {show: true},
                magicType:{'show':true,'type':['line','bar']},
                myCloseTool: {
                    show: true,
                    title: '关闭',
                    icon: 'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
                    onclick: function () {
                        $('#BarChart').hide();
                    }
                }
            },
            iconStyle:{
                normal:{
                    color:'#fff'
                }
            }
        }
    },
    //变量则写在options中
    options:[]
};

//各省电力消费柱状图
/*
var areaElePievar = {
  title : {
    text: '各省电力消费值',
    subtext:'单位/亿千瓦时',
    x:'center',
    textStyle: {
      color: '#fff'
    },
    subtextStyle : {
      color: '#fff'
    }
  },
  backgroundColor: 'rgba(60,60,60,0.4)',
  tooltip : {
    trigger: 'item',
    formatter: "{a} <br/>{b} : {c} ({d}%)"
  },
  legend: {
    type: 'scroll',
    orient: 'vertical',
    right: 10,
    top: 20,
    bottom: 20,
    data: [],
    textStyle: {
      color: '#fff'
    }
  },
  calculable : true,
  toolbox: {
    show : true,
    feature : {
      dataView : {show: true, readOnly: false},
      saveAsImage : {show: true},
      myCloseTool: {
        show: true,
        title: '关闭',
        icon: 'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
        onclick: function () {
          $('#areaElePieChart').hide();
        }
      }
    },
    iconStyle:{
      normal:{
        color:'#fff'
      }
    }
  },
  series : []
};*/
//统计全球发电站
function countGlobePS() {
  myChart01 = echarts.init(document.getElementById('PieChart'));
  var names =[];
  var eledata = [];
  var color = [];
  if(thermalPSNumSum!==0) {names.push('火力发电站');eledata.push({
    name: '火力发电站',
    value: thermalPSNumSum
  });
    color.push('#FF0000');
  }
  if(hydraulicPSNumSum!==0) {names.push('水力发电站');eledata.push({
    name: '水力发电站',
    value: hydraulicPSNumSum
  });
    color.push('#0000FF');
  }

  if(windPSNumSum!==0) {names.push('风力发电站');eledata.push({
    name: '风力发电站',
    value: windPSNumSum
  });
    color.push('#00FF00');
  }
  if(photovoltaicPSNumSum!==0) {names.push('光伏发电站');eledata.push({
    name: '光伏发电站',
    value: photovoltaicPSNumSum
  });
    color.push('#FFFFFF');
  }
  if(nuclearPSNumSum!==0) {names.push('核电站'); eledata.push({
    name: '核电站',
    value: nuclearPSNumSum
  });
    color.push('#FFFF00');
  }
  if(changesubstationPSNumSum!==0) {
    names.push('大型变电站'); eledata.push({
      name: '大型变电站',
      value: changesubstationPSNumSum
    });
    color.push('#FF00FF');
  }

  myChart01.setOption({
    color : color,
    legend: {
      data: names
    },
    series: [{
      data: eledata
    }]
  });
}

//统计所有发电站信息
function countAllPS() {
  myChart01 = echarts.init(document.getElementById('PieChart'));
    var names =[];
    var eledata = [];
    var color = [];
    if(thermalPSNum!==0) {names.push('火力发电站');eledata.push({
        name: '火力发电站',
        value: thermalPSNum
    });
    color.push('#FF0000');
    }
    if(hydraulicPSNum!==0) {names.push('水力发电站');eledata.push({
        name: '水力发电站',
        value: hydraulicPSNum
    });
      color.push('#0000FF');
    }

    if(windPSNum!==0) {names.push('风力发电站');eledata.push({
        name: '风力发电站',
        value: windPSNum
    });
      color.push('#00FF00');
    }
    if(photovoltaicPSNum!==0) {names.push('光伏发电站');eledata.push({
        name: '光伏发电站',
        value: photovoltaicPSNum
    });
      color.push('#FFFFFF');
    }
    if(nuclearPSNum!==0) {names.push('核电站'); eledata.push({
        name: '核电站',
        value: nuclearPSNum
    });
      color.push('#FFFF00');
    }
  if(changesubstationPSNum!==0) {
      names.push('大型变电站'); eledata.push({
    name: '大型变电站',
    value: changesubstationPSNum
    });
      color.push('#FF00FF');
    }

    myChart01.setOption({
        color : color,
        legend: {
            data: names
        },
        series: [{
            data: eledata
        }]
    });
}

//统计全国所有区域电力消费信息
function countAllPower() {
  var totalPowerConsumepation = 0;
  //中国大陆面积
  area = 963.4057;
  if(powerConsumpationData){
    for(var i=0;i < powerConsumpationData.features.length;i++ ){
      totalPowerConsumepation+=powerConsumpationData.features[i].properties.RASTERVALU;
    }
  }
  inSelectNum = totalPowerConsumepation;
}

function BarCharts(data,option){
    barChart = echarts.init(document.getElementById('BarChart'));
    barChart.setOption(BarOption,true);
    var names =[];
    var seri = [];

    for(var i =0;i<data.length;i++){
        names.push(data[i].id);
        seri.push({
            name:data[i].id,
            type:'bar',
            data:[data[i].y10, data[i].y11, data[i].y12, data[i].y13, data[i].y14, data[i].y15]
        })
    }
    barChart.setOption({
        title : {
            text: '电力生产统计',
            subtext: ''
        },
        color:['orange', 'blue','red','green'],
        xAxis :[{
            data: ['2010年', '2011年', '2012年', '2013年', '2014年', '2015年']
        }
        ],
        yAxis :[
            {
                name : '电力生产/亿千瓦小时'
            }
        ],
        legend:{
            data : names,
            top: '30px'
        },

        series: seri
    });
}
function powerMade() {
    powermadeChart = echarts.init(document.getElementById('BarChart'));
    powermadeChart.setOption(BarOption,true);
    var names =[];
    var seri = [];
    for(var i =0;i<4;i++){
        names.push(powerMadeData[i].id);
        seri.push({
            name:powerMadeData[i].id,
            type:'bar',
            data:[powerMadeData[i].y10, powerMadeData[i].y11, powerMadeData[i].y12, powerMadeData[i].y13, powerMadeData[i].y14, powerMadeData[i].y15]
        })
    }
    powermadeChart.setOption({
        title : {
            text: '电力生产统计',
            subtext: ''
        },
        color:['orange', 'blue','red','green'],
        xAxis :[{
            data: ['2010年', '2011年', '2012年', '2013年', '2014年', '2015年']
        }
        ],
        yAxis :[
            {
                name : '电力生产/亿千瓦小时'
            }
        ],
        legend:{
            data : names,
            top: '30px'
        },

        series: seri
    });

}
function ecPower() {
    ecpowerChart = echarts.init(document.getElementById('BarChart'));
    ecpowerChart.setOption(BarOption,true);
    var names =[];
    var seri = [];
    for(var i =0;i<4;i++){
        names.push(ecOfPowerData[i].id);
        seri.push({
            name:ecOfPowerData[i].id,
            type:'bar',
            data:[ecOfPowerData[i].y07, ecOfPowerData[i].y08, ecOfPowerData[i].y09, ecOfPowerData[i].y10,
                ecOfPowerData[i].y11, ecOfPowerData[i].y12, ecOfPowerData[i].y13, ecOfPowerData[i].y14]
        })
    }
    ecpowerChart.setOption({
        title : {
            text: '能源弹性系数',
            subtext: '能源弹性系数=能源量的增长率/经济总量的增长率\n电力弹性系数=电量的增长率/经济总量的增长率'
        },
        color:['red','green','yellow', 'orange'],
        xAxis :[{
            data: ['2007年', '2008年', '2009年', '2010年', '2011年', '2012年','2013年','2014年']
        }
        ],
        yAxis :[
            {
                name : '弹性系数'
            }
        ],
        legend:{
            data : names,
            top: '60px'
        },

        series: seri
    });

}
function dayPower() {
    dayofPowerChart = echarts.init(document.getElementById('BarChart'));
    dayofPowerChart.setOption(BarOption,true);
    var names =[];
    var seri = [];
    var a = ['平均每天天然气消费量\n(亿立方米)','平均每天汽油消费量\n(万吨)','平均每天煤炭消费量\n(万吨)','平均每天电力消费量\n(亿千瓦小时)','平均每天能源消费量\n(万吨标准煤)'];

    for(var i =0;i<5;i++){
        names.push(a[i]);
        seri.push({
            name:a[i],
            type:'line',
            data:[dayofPowerData[i].y07, dayofPowerData[i].y08, dayofPowerData[i].y09, dayofPowerData[i].y10,
                dayofPowerData[i].y11, dayofPowerData[i].y12, dayofPowerData[i].y13, dayofPowerData[i].y14, dayofPowerData[i].y15]
        })
    }
    dayofPowerChart.setOption({
        title : {
            text: '平均每天能源消费量',
            subtext: ''
        },
        color:['red','green','yellow','blue','orange'],
        xAxis :[{
            data: ['2007年', '2008年', '2009年', '2010年', '2011年', '2012年','2013年','2014年','2015年']
        }
        ],
        yAxis :[
            {
                name : ''
            }
        ],
        legend:{
            data : names
        },

        series: seri
    });
}
function perPower() {
    perPowerChart = echarts.init(document.getElementById('BarChart'));
    perPowerChart.setOption(BarOption,true);
    var names =[];
    var seri = [];
    var a = ['人均天然气生活消费量\n(立方米)','人均煤炭生活消费量\n(千克)','人均电力生活消费量\n(千瓦小时)','人均能源生活消费量\n(千克标准煤)'];

    for(var i =0;i<4;i++){
        names.push(a[i]);
        seri.push({
            name:a[i],
            type:'line',
            data:[perPowerData[i].y07, perPowerData[i].y08, perPowerData[i].y09, perPowerData[i].y10,
                perPowerData[i].y11, perPowerData[i].y12, perPowerData[i].y13, perPowerData[i].y14, perPowerData[i].y15]
        })
    }
    perPowerChart.setOption({
        title : {
            text: '人均能源生活消费量',
            subtext: ''
        },
        color:['red','green','yellow','orange'],
        xAxis :[{
            data: ['2007年', '2008年', '2009年', '2010年', '2011年', '2012年','2013年','2014年','2015年']
        }
        ],
        yAxis :[
            {
                name : ''
            }
        ],
        legend:{
            data : names
        },

        series: seri
    });
}
function provincePower() {
    var y07=[];var y08=[];var y09=[];var y10=[];
    var y11=[];var y12=[];var y13=[];var y14=[];var y15=[];
    var data = [];
    for(var i=0;i<31;i++){
        y07.push(provincePowerData[i].y07);
        y08.push(provincePowerData[i].y08);
        y09.push(provincePowerData[i].y09);
        y10.push(provincePowerData[i].y10);
        y11.push(provincePowerData[i].y11);
        y12.push(provincePowerData[i].y12);
        y13.push(provincePowerData[i].y13);
        y14.push(provincePowerData[i].y14);
        y15.push(provincePowerData[i].y15);
        data.push(provincePowerData[i].id);
    }
    provincePowerChart = echarts.init(document.getElementById('BarChart'));
    provincePowerChart.setOption(TimeLineOption,true);
    provincePowerChart.setOption(
        {
            options: [

            {
                xAxis: [{
                    data :data
                }],
                title: {
                    text: '2007年各省发电量'
                },
                series : [
                    {
                        'markLine':{
                            symbol : ['arrow','none'],
                            symbolSize : [4, 2],
                            itemStyle : {
                                normal: {
                                    lineStyle: {color:'orange'},
                                    barBorderColor:'orange',
                                    label:{
                                        position:'left',
                                        formatter:function(params){
                                            return Math.round(params.value);
                                        },
                                        textStyle:{color:'orange'}
                                    }
                                }
                            },
                            'data':[{'type':'average','name':'平均值'}]
                        },
                        'data': y07
                    }
                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2008年各省发电量'
                },
                series: [
                    {
                        data: y08
                    }
                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2009年各省发电量'
                },
                series: [
                    {
                        data: y09
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2010年各省发电量'
                },
                series: [
                    {
                        data: y10
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2011年各省发电量'
                },
                series: [
                    {
                        data: y11
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2012年各省发电量'
                },
                series: [
                    {
                        data: y12
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2013年各省发电量'
                },
                series: [
                    {
                        data: y13
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2014年各省发电量'
                },
                series: [
                    {
                        data: y14
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2015年各省发电量'
                },
                series: [
                    {
                        data: y15
                    }

                ]
            }
        ]
        }
    )
}
//统计省份夜光遥感电力消耗值
function areaEleCount() {

  if(provincedata&&firstProSta) {
    //冒泡排序排列,当数据传过来时只排序一次
    for (var i = 0; i < provincedata.features.length; i++) {
      for (var j = 0; j < provincedata.features.length - i - 1; j++) {
        if (provincedata.features[j].properties.EPC < provincedata.features[j + 1].properties.EPC) {
          var swap = provincedata.features[j].properties.EPC;
          var name = provincedata.features[j].properties.NAME;
          var lng = provincedata.features[j].geometry.coordinates[0];
          var lat = provincedata.features[j].geometry.coordinates[1];
          provincedata.features[j].properties.EPC = provincedata.features[j + 1].properties.EPC;
          provincedata.features[j].properties.NAME = provincedata.features[j + 1].properties.NAME;
          provincedata.features[j].geometry.coordinates[0] = provincedata.features[j + 1].geometry.coordinates[0];
          provincedata.features[j].geometry.coordinates[1] = provincedata.features[j + 1].geometry.coordinates[1];
          provincedata.features[j + 1].properties.EPC = swap;
          provincedata.features[j + 1].properties.NAME = name;
          provincedata.features[j + 1].geometry.coordinates[0] = lng;
          provincedata.features[j + 1].geometry.coordinates[1] = lat;
        }
      }
    }
    firstProSta = false;
  }

  var prov = [];
  var data = [];
  for(var i=0;i<34;i++){
    prov.push(provincedata.features[i].properties.EPC);
    data.push(provincedata.features[i].properties.NAME);
  }
  provincePChart = echarts.init(document.getElementById('areaElePieChart'));
  provincePChart.setOption(provBarOption,true);
  provincePChart.setOption(
    {
      options: [

        {
          xAxis: [{
            data :data
          }],
          title: {
            text: '各省电力消耗量'
          },
          series : [
            {
              'markLine':{
                symbol : ['arrow','none'],
                symbolSize : [4, 2],
                itemStyle : {
                  normal: {
                    lineStyle: {color:'#FFFF00'},
                    barBorderColor:'#FFFF00',
                    label:{
                      position:'left',
                      formatter:function(params){
                        return Math.round(params.value);
                      },
                      textStyle:{color:'#FFFF00'}
                    }
                  }
                },
                'data':[{'type':'average','name':'平均值'}]
              },
              'data': prov
            }
          ]
        }
      ]
    }
  )
}

//区域耗电量与区域整体均值作比较
function compareTotalPower() {
  comparePowerChart = echarts.init(document.getElementById('powerShowChart'));
  comparePowerChart.setOption(HuanBarOption,true);
  comparePowerChart.setOption({
    series: [
      {data:[(totalPowerCom/999.4057).toFixed(4), (inSelectNum/area).toFixed(4)]
      }
    ]
});

  comparePowerChart2 = echarts.init(document.getElementById('powerShowChart1'));
  comparePowerChart2.setOption(HuanPieOption,true);
  comparePowerChart2.setOption({
    series: [
      {
        data:[{value:(totalPowerCom-inSelectNum).toFixed(4),name:'剩余'}, {value:(inSelectNum).toFixed(4),name:'所选'}]
      }
      ]
  })

}

//各省份电力消耗统计玫瑰图
/*function areaEleCount() {
  areaEleChart = echarts.init(document.getElementById('areaElePieChart'));
  areaEleChart.setOption(areaElePievar,true);
  var names = [];
  var seri = [];
  var selected = {};
  if(provincedata){
      //冒泡排序排列
      for(var i = 0;i < provincedata.features.length;i++){
        for(var j = 0;j < provincedata.features.length-i-1;j++){
          if(provincedata.features[j].properties.EPC<provincedata.features[j+1].properties.EPC){
            var swap = provincedata.features[j].properties.EPC;
            var name = provincedata.features[j].properties.NAME;
            var lng = provincedata.features[j].geometry.coordinates[0];
            var lat = provincedata.features[j].geometry.coordinates[1];
            provincedata.features[j].properties.EPC = provincedata.features[j+1].properties.EPC;
            provincedata.features[j].properties.NAME = provincedata.features[j+1].properties.NAME;
            provincedata.features[j].geometry.coordinates[0] = provincedata.features[j+1].geometry.coordinates[0];
            provincedata.features[j].geometry.coordinates[1] = provincedata.features[j+1].geometry.coordinates[1];
            provincedata.features[j+1].properties.EPC = swap;
            provincedata.features[j+1].properties.NAME = name;
            provincedata.features[j+1].geometry.coordinates[0] = lng;
            provincedata.features[j+1].geometry.coordinates[1] = lat;
          }
        }
      }

    for(var iii = 0;iii < provincedata.features.length;iii++){
        names.push(provincedata.features[iii].properties.NAME);
        seri.push({
          name : provincedata.features[iii].properties.NAME,
          value : provincedata.features[iii].properties.EPC
        });
        selected[provincedata.features[iii].properties.NAME] = iii < 8;
      }

    areaEleChart.setOption({
      legend: {
        data: names,
        selected : selected
      },
      series: [{
        name : "省份",
        data: seri.sort(function (a, b) { return a.value - b.value;}),
        type : 'pie',
        radius:'65%',
        center: ['37%', '50%'],
        roseType : 'radius',
        label: {
          normal: {
            show: true
          }
        },
        labelLine: {
          normal: {
            show: true
          }
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    })
  }

}*/
function powerCount() {
    var y07=[];var y08=[];var y09=[];var y10=[];
    var y11=[];var y12=[];var y13=[];var y14=[];var y15=[];
    var data = [];
    for(var i=0;i<29;i++){
        y07.push(powerCountData[i].y07);
        y08.push(powerCountData[i].y08);
        y09.push(powerCountData[i].y09);
        y10.push(powerCountData[i].y10);
        y11.push(powerCountData[i].y11);
        y12.push(powerCountData[i].y12);
        y13.push(powerCountData[i].y13);
        y14.push(powerCountData[i].y14);
        y15.push(powerCountData[i].y15);
        data.push(powerCountData[i].id);
    }
    powerCountChart = echarts.init(document.getElementById('BarChart'));
    powerCountChart.setOption(TimeLineOption,true);
    powerCountChart.setOption({
        baseOption:{
            color:['orange'],
            timeline:{
                checkpointStyle : {
                color : 'orange',
                borderColor : 'yellow'
            }},
            grid:{
                x:65,
                x2:15,
                y2:142
            },
            yAxis: {
                'max':8000
            }
        },
        options: [

            {
                xAxis: [{
                    data :data
                }],
                title: {
                    text: '2007年分行业电力消费量'
                },
                series : [
                    {
                        'markLine':{
                            symbol : ['arrow','none'],
                            symbolSize : [4, 2],
                            itemStyle : {
                                normal: {
                                    lineStyle: {color:'yellow'},
                                    barBorderColor:'yellow',
                                    label:{
                                        position:'left',
                                        formatter:function(params){
                                            return Math.round(params.value);
                                        },
                                        textStyle:{color:'yellow'}
                                    }
                                }
                            },
                            'data':[{'type':'average','name':'平均值'}]
                        },
                        'data': y07
                    }
                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2008年分行业电力消费量'
                },
                series: [
                    {
                        data: y08
                    }
                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2009年分行业电力消费量'
                },
                series: [
                    {
                        data: y09
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2010年分行业电力消费量'
                },
                series: [
                    {
                        data: y10
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2011年分行业电力消费量'
                },
                series: [
                    {
                        data: y11
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2012年分行业电力消费量'
                },
                series: [
                    {
                        data: y12
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2013年分行业电力消费量'
                },
                series: [
                    {
                        data: y13
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2014年分行业电力消费量'
                },
                series: [
                    {
                        data: y14
                    }

                ]
            },
            {
                xAxis: [{
                    data: data
                }],
                title: {
                    text: '2015年分行业电力消费量'
                },
                series: [
                    {
                        data: y15
                    }

                ]
            }
        ]
    }
        );
}
function initCountNum() {
    thermalPSNum = 0;
    hydraulicPSNum = 0;
    windPSNum = 0;
    nuclearPSNum = 0;
    photovoltaicPSNum = 0;
    changesubstationPSNum = 0;
}



