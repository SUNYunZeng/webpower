var xAxisData = [];
var data1 = [];
var data2 = [];
var data3 = [];
var data4 = [];

for (var i = 0; i < 10; i++) {
    xAxisData.push('Class' + i);
    data1.push((Math.random() * 2).toFixed(2));
    data2.push(-Math.random().toFixed(2));
    data3.push((Math.random() * 5).toFixed(2));
    data4.push((Math.random() + 0.3).toFixed(2));
}

var itemStyle = {
    normal: {
    },
    emphasis: {
        barBorderWidth: 1,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0,0,0,0.5)'
    }
};

BarOption = {
    backgroundColor: 'rgba(0,0,0,0.5)',
    legend: {
        data: ['bar', 'bar2', 'bar3', 'bar4'],
        align: 'left',
        left: 10
    },
    brush: {
        toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
        xAxisIndex: 0
    },
    toolbox: {
        show : true,
        feature: {
            magicType: {
                type: ['stack', 'tiled']
            },
            dataView: {},
            myCloseTool:{
                show:true,
                title:'关闭',
                icon:'M512.001 15.678C237.414 15.678 14.82 238.273 14.82 512.86S237.414 1010.04 512 1010.04s497.18-222.593 497.18-497.18S786.589 15.678 512.002 15.678z m213.211 645.937c17.798 17.803 17.798 46.657 0 64.456-17.798 17.797-46.658 17.797-64.456 0L512.001 577.315 363.241 726.07c-17.799 17.797-46.652 17.797-64.45 0-17.804-17.799-17.804-46.653 0-64.456L447.545 512.86 298.79 364.104c-17.803-17.798-17.803-46.657 0-64.455 17.799-17.798 46.652-17.798 64.45 0l148.761 148.755 148.755-148.755c17.798-17.798 46.658-17.798 64.456 0 17.798 17.798 17.798 46.657 0 64.455L576.456 512.86l148.756 148.755z m0 0',
                onclick:function () {
                    $('#BarCharts').hide();
                }
            }
        }
    },
    tooltip: {},
    xAxis: {
        data: xAxisData,
        name: 'X Axis',
        silent: false,
        axisLine: {onZero: true},
        splitLine: {show: false},
        splitArea: {show: false}
    },
    yAxis: {
        inverse: true,
        splitArea: {show: false}
    },
    grid: {
        left: 100
    },
    visualMap: {
        type: 'continuous',
        dimension: 1,
        text: ['High', 'Low'],
        inverse: true,
        itemHeight: 200,
        calculable: true,
        min: -2,
        max: 6,
        top: 60,
        left: 10,
        inRange: {
            colorLightness: [0.4, 0.8]
        },
        outOfRange: {
            color: '#bbb'
        },
        controller: {
            inRange: {
                color: '#2f4554'
            }
        }
    },
    series: [
        {
            name: 'bar',
            type: 'bar',
            stack: 'one',
            itemStyle: itemStyle,
            data: data1
        },
        {
            name: 'bar2',
            type: 'bar',
            stack: 'one',
            itemStyle: itemStyle,
            data: data2
        },
        {
            name: 'bar3',
            type: 'bar',
            stack: 'two',
            itemStyle: itemStyle,
            data: data3
        },
        {
            name: 'bar4',
            type: 'bar',
            stack: 'two',
            itemStyle: itemStyle,
            data: data4
        }
    ]
};
$(document).ready(function () {
    $('#bar').click(function () {
        $('#bcm').slideToggle("fast");
    }).mouseenter(function () {
        $('#bar').css("background-color","#595959");
        $('#bcm').slideDown("fast");
    }).mouseleave(function () {
        $('#bar').css("background-color","#0000");
        $('#bcm').mouseleave(function () {
            $('#bcm').slideUp("fast");
        });
    });
    $('#BBtn1').click(function () {
        $('#bcm').hide();
        var myChart1 = echarts.init(document.getElementById('BarCharts'));
        myChart1.setOption(BarOption);
        myChart1.on('brushSelected', renderBrushed);
        $('#BarCharts').css({"z-index":'2'}).show();
        function renderBrushed(params) {
            var brushed = [];
            var brushComponent = params.batch[0];

            for (var sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
                var rawIndices = brushComponent.selected[sIdx].dataIndex;
                brushed.push('[Series ' + sIdx + '] ' + rawIndices.join(', '));
            }

            myChart1.setOption({
                title: {
                    backgroundColor: '#333',
                    text: 'SELECTED DATA INDICES: \n' + brushed.join('\n'),
                    bottom: 0,
                    right: 0,
                    width: 100,
                    textStyle: {
                        fontSize: 12,
                        color: '#fff'
                    }
                }
            });
        }
    });
});