function showPic(e,sUrl){
    var x,y;
    x = e.clientX;
    y = e.clientY;
    document.getElementById("Layer1").style.left = x+2+'px';
    document.getElementById("Layer1").style.top = y+2+'px';
    document.getElementById("Layer1").innerHTML = "<img border='0' width='200px' height='100px' src=\"" + sUrl + "\">";
    document.getElementById("Layer1").style.display = "";
}
function hiddenPic(){
    document.getElementById("Layer1").innerHTML = "";
    document.getElementById("Layer1").style.display = "none";
}