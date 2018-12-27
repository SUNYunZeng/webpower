var PieOption = {
    backgroundColor: 'rgba(0,0,0,0)',
    title: {
        text: 'Customized Pie',
        left: 'center',
        top: 20,
        textStyle: {
            color: '#ccc'
        }
    },
    toolbox : {
        show : true,
        iconStyle : {
            bordercolor : '#c23531'
        },
        feature:{
        saveAsImage : {show : true},
         myCloseTool: {
             show: true,
             title: '关闭',
             icon: 'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
             onclick: function () {
                 $('#PieChart1').hide();
                 $('#PieChart1').css({"z-index":"1"});
                 $('#PieChart2').hide();
                 $('#PieChart2').css({"z-index":"1"});
             }
         }
    }
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },

    visualMap: {
        show: false,
        min: 80,
        max: 600,
        inRange: {
            colorLightness: [0, 1]
        }
    },
    series : [
        {
            name:'访问来源',
            type:'pie',
            radius : '55%',
            center: ['50%', '50%'],
            data:[
                {value:335, name:'A'},
                {value:310, name:'B'},
                {value:274, name:'C'},
                {value:235, name:'D'},
                {value:400, name:'E'}
            ].sort(function (a, b) { return a.value - b.value; }),
            roseType: 'radius',
            label: {
                normal: {
                    textStyle: {
                        color: 'rgba(255, 255, 255, 1.0)'
                    }
                }
            },
            labelLine: {
                normal: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 1.0)'
                    },
                    smooth: 0.2,
                    length: 10,
                    length2: 20
                }
            },
            itemStyle: {
                normal: {
                    color: '#c23531',
                    shadowBlur: 200,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },

            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return Math.random() * 200;
            }
        }
    ]
};
$(document).ready(function () {
    $('#pie').click(function () {
        $('#pcm').slideToggle("fast");
    }).mouseenter(function () {
        $('#pie').css("background-color","#595959");
        $('#pcm').slideDown("fast");
    }).mouseleave(function () {
        $('#pie').css("background-color","#0000");
        $('#pcm').mouseleave(function () {
            $('#pcm').slideUp("fast");
        });
    });
    $('#PBtn1').click(function () {
        $('#pcm').hide();
        var myChart1 = echarts.init(document.getElementById('PieChart1'));
        PieOption.title.text="电力设施类型饼状图";
        $('#PieChart1').css({"z-index":'2'});
        $('#PieChart1').show();
        myChart1.setOption(PieOption);

    });
    $("#PBtn2").click (function () {
        $('#pcm').hide();
        var myChart2 = echarts.init(document.getElementById('PieChart2'));
        PieOption.title.text="土地利用类型饼状图";
        $('#PieChart2').css({"z-index":'2'});
        $('#PieChart2').show();
        myChart2.setOption(PieOption);
    });
});



