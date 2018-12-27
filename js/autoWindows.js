$(function(){

    var winHeight = $(window).height();
    var menuHeight = $("#leftbox").height();

    if(menuHeight>=winHeight){
        $("#leftbox").css("height",auto);
    }
});

function isFullScreen (){
    if(
        window.outerHeight === screen.availHeight
    ){
        if(window.outerWidth === screen.availWidth

        ){
            return true;// 全屏
        }
    }
    return false; // 不是全屏
}



