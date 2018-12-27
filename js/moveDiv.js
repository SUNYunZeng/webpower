var mouseX, mouseY;
var objX, objY;
var isDowm = false;  //是否按下鼠标
function mouseDown(obj, e) {
    obj.style.cursor = "move";
    objX = obj.style.left;
    objY = obj.style.top;
    mouseX = e.clientX;
    mouseY = e.clientY;
    isDowm = true;
}
function mouseMove(obj,e) {
    // var div = document.getElementById("div1");
    var x = e.clientX;
    var y = e.clientY;
    if (isDowm) {
        obj.style.left = parseInt(objX) + parseInt(x) - parseInt(mouseX) + "px";
        obj.style.top = parseInt(objY) + parseInt(y) - parseInt(mouseY) + "px";
        // document.getElementById("span1").innerHTML = "x:" + div.style.top + "  " + "y:" + div.style.left;
    }
}
function mouseUp(obj,e) {
    if (isDowm) {
        var x = e.clientX;
        var y = e.clientY;
        //   var div = document.getElementById("div1");
        obj.style.left = (parseInt(x) - parseInt(mouseX) + parseInt(objX)) + "px";
        obj.style.top = (parseInt(y) - parseInt(mouseY) + parseInt(objY)) + "px";
        // document.getElementById("span2").innerHTML = "x:" + div.style.top + "  " + "y:" + div.style.left;
        mouseX = x;
        rewmouseY = y;
        obj.style.cursor = "default";
        isDowm = false;
    }
}