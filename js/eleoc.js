
$(function () {
  /**
   * 界面打开逻辑
   */
// /电力设施打开按钮，第一次打开获取点的数据信息
    $('#elefac').click(function () {
        $('#eleFacMenu').toggle();
        $('#eleLoadMenu').hide();
        $('#eleGeoMenu').hide();
       $('#controllBox').hide();
    });
    $('#leftbackBtn').click(function () {
        $('#eleFacMenu').hide();
    });
    $('#leftbackBtn1').click(function () {
        $('#eleLoadMenu').hide();
    });
    $('#leftbackBtn2').click(function () {
        $('#eleGeoMenu').hide();
    });
    $('#eleload').click(function () {
        $('#eleFacMenu').hide();
        $('#eleGeoMenu').hide();
        $('#eleLoadMenu').toggle();
      $('#controllBox').hide();
    });
    $('#elegeo').click(function () {
        $('#eleGeoMenu').toggle();
        $('#eleLoadMenu').hide();
        $('#eleFacMenu').hide();
        $('#controllBox').hide();
    });
    $('#rightbackBtn').click(function () {
       $('#chartsMenu').hide();
    });
    $('#chartsBtn').click(function () {
      if($('#rectArea').prop('checked')){
        if(south ===0 && north===0){
          alert("请选择框选范围");
        }else{
            points = null;
            $.getJSON(rectangleUrlParse+"&lng1="+west+"&lat1="+north+"&lng2="+east+"&lat2="+south+"", function (data) {
              //var points = eval("("+data+")");老版方法，不推荐
              if (data.pdate.RECORDS.length>0){
                points = data.pdate.RECORDS;
                sortPowerStaion(points);
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
            } else {
              alert("数据为空");
            }
          });

      }else {
        points = null;
        if(points ===null){
          $.getJSON(urlParse,function (data) {
            //var points = eval("("+data+")");老版方法，不推荐
            points = data.pdate.RECORDS;
            sortPowerStaion(points);
          });
        }
      }

      $('#RightTitle').text("图表统计");
      if(showPoints.length!==0){
        charFlag = 1;
      }else if($('#nightRGB').prop("checked")||$('#night_power').prop("checked")){
        if(powerConsumpationData){
          charFlag = 2;
        }
      }
      $('#chartsMenu').toggle();
      $('#chartManager').hide();
    });
    $('#righttwoback').click(function () {
      $('#chartManager').hide();
    });
    $('#chartManBtn').click(function () {

        if(powerMadeData === null){
            $.getJSON("./json/elescale.json",function (data) {
                powerMadeData = data.RECORDS;
                //alert(powerMadeData[1].id);
            });
        }
        if(dayofPowerData === null){
            $.getJSON("./json/dayofpower.json",function (data) {
                dayofPowerData = data.RECORDS;
                //alert(powerMadeData[1].id);
            });
        }
        if(perPowerData === null){
            $.getJSON("./json/perpower.json",function (data) {
                perPowerData = data.RECORDS;
            });
        }
        if(ecOfPowerData === null){
            $.getJSON("./json/ecofpower.json",function (data) {
                ecOfPowerData = data.RECORDS;
                //alert(powerMadeData[1].id);
            });
        }
        if(provincePowerData === null){
            $.getJSON("./json/powerofprovince.json",function (data) {
                provincePowerData = data.RECORDS;
                //alert(powerMadeData[1].id);
            });
        }
        if(powerCountData === null){
            $.getJSON("./json/powercount.json",function (data) {
                powerCountData = data.RECORDS;
                //alert(powerMadeData[1].id);
            });
        }
        //默认打图表统计，首先统计电力，然后统计区域耗电
      $('#chartManager').toggle();
        $('#chartsMenu').hide();
    });
    $('#chartConBox').click(function () {
       $('#chartConMenu').toggle();
    }).mouseenter(function () {
        $('#before').css("background","rgba(60,60,60,0)") ;
    }).mouseleave(function () {
        $('#before').css("background","rgba(60,60,60,0.65)");
    });
    $('#inChartConBtnBox').click(function () {
        $('#chartConMenu').hide();
    });
    //图层界面打开的同时，对点的信息进行分类
    $('#tuBtn').click(function () {
       $('#controllBox').toggle();
       $('#eleFacMenu').hide();
       $('#eleGeoMenu').hide();
       $('#eleLoadMenu').hide();
    });
        //var pt1 = new Cesium.Cartesian2(0,0);
        //var pt2= new Cesium.Cartesian2($('#windows').offsetWidth,$('#windows').offsetHeight);
        //alert($('#windows').offsetWidth);
    $('#leftbackBtn3').click(function () {
       $('#controllBox').hide();
    });



});


