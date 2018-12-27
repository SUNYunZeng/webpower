$(function () {
    $('#clear').click(function () {
        clearAll();
    });
});
function clearAll() {
  $('#PieChart1').hide();
  $('#PieChart2').hide();
  $('#BarCharts').hide();
  $('#LineCharts').hide();
}
