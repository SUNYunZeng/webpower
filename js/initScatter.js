

$(document).ready(function () {
    $('#scatter').click(function () {
            $('#scm').slideToggle("fast");
    });
    $('#scatter').mouseenter(function () {
        $('#scatter').css("background-color","#595959");
        $('#scm').slideDown("fast");
    }).mouseleave(function () {
        $('#scatter').css("background-color","#0000");
        $('#scm').mouseleave(function () {
            $('#scm').slideUp("fast");
        });
    });
    $('#SBtn1').click(function () {
        
    });
});