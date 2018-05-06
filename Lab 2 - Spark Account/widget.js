$(document).on('click', '.panel-heading span.icon_minim', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('focus', '.panel-footer input.chat_input', function (e) {
    var $this = $(this);
    if ($('#minim_chat_window').hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideDown();
        $('#minim_chat_window').removeClass('panel-collapsed');
        $('#minim_chat_window').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});

$(document).on('click', '#login', function (e) {
    var token = 'MzQ5MDZhZTQtMmM2Mi00YzY4LThkZGItNTBiNTEyNzc1NzVjZTA1MDczMjYtZWJh'
    var spaceId = 'Y2lzY29zcGFyazovL3VzL1JPT00vMjUwOGRmNTAtNTA1OS0xMWU4LTk4NDMtOWJkMDdlOGQzZDI4'
    var loader = "<div id='loader' class='loader' style=' margin: 0 auto;'></div>"
    $("#widget-container").replaceWith(loader);

    var widget =
        "<div id=\"ciscospark-widget\" style=\"width: 500px; height: 500px;\"/>\n" +
        "<script>\n"
        +
        "   let widgetEl = document.getElementById('ciscospark-widget');\n" +
        "   // Init a new widget\n" +
        "   ciscospark.widget(widgetEl).spaceWidget({\n" +
        "       accessToken: '" + token + "',\n" +
        "       spaceId: '" + spaceId + "' \n" +
        "   });\n" +
        "</script>\n";

    $("#loader").replaceWith(widget);
});

