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
$(document).on('click', '.icon_close', function (e) {
    //$(this).parent().parent().parent().parent().remove();
    $("#chat_window_1").remove();
});

$(document).on('click', '#login', function (e) {
    document.location.href = "/idbroker";
});

$(document).on('click', '#logout', function (e) {
    document.location.href = "/logout";
});

$(document).on('click', '#guest-login', function (e) {
    var loader = "<div id='loader' class='loader' style=' margin: 0 auto;'></div>"
    $("#guest-widget-container").replaceWith(loader);


    var header = {
        "typ": "JWT",
        "alg": "HS256"
    };

    var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    var encodedHeader = base64url(stringifiedHeader);

    var d = new Date();
    d.setHours(d.getHours() + 1);
    var expiryDate = parseInt(d.getTime() / 1000);

    var data = {
        "sub": "Campaign-3",
        "name": "Customer Support Guest",
        "iss": "Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi8yOGFlZTc1NS1kOGRhLTRjZDUtOTkyZi04MDQ4NmI2NjQwNDA",
        "exp": expiryDate
    };

    var secret = "Pn4Ei6pUaXtoisGpFV/3pmUb3r/WQzLz1/P2DabqZtk=";

    var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
    var encodedData = base64url(stringifiedData);

    var token = encodedHeader + "." + encodedData;


    var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

    var signature = CryptoJS.HmacSHA256(token, CryptoJS.enc.Base64.parse(secret));
    console.log(signature);
    var base64Hash = CryptoJS.enc.Base64.stringify(signature);

    signature = urlConvertBase64(base64Hash);
    console.log(signature);

    var signedToken = token + "." + signature;
    console.log(signedToken);

    var request = new XMLHttpRequest();
    request.open('POST', "https://api.ciscospark.com/v1/jwt/login", true);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    request.setRequestHeader('Authorization', 'Bearer ' + signedToken);
    request.setRequestHeader('Accept', 'application/json');
    request.send("");

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            var obj = JSON.parse(request.responseText);
            console.log(obj.token);

            var request2 = new XMLHttpRequest();
            request2.open('POST', "https://api.ciscospark.com/v1/rooms", true);
            request2.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            request2.setRequestHeader('Authorization', 'Bearer ' + obj.token);
            request2.setRequestHeader('Accept', 'application/json');
            request2.send('{"title":"Support Session"}');

            request2.onreadystatechange = function () {
                if (request2.readyState === 4) {
                    var result = JSON.parse(request2.responseText);

                    var request3 = new XMLHttpRequest();
                    request3.open('POST', "https://api.ciscospark.com/v1/memberships", true);
                    request3.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                    request3.setRequestHeader('Authorization', 'Bearer ' + obj.token);
                    request3.setRequestHeader('Accept', 'application/json');
                    request3.send('{"roomId": "' + result.id + '", "personEmail":"customercare@sparkbot.io"}');

                    request3.onreadystatechange = function () {
                        if (request3.readyState === 4) {
                            var result3 = JSON.parse(request3.responseText);

                            var request4 = new XMLHttpRequest();
                            request4.open('POST', "https://api.ciscospark.com/v1/messages", true);
                            request4.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                            request4.setRequestHeader('Authorization', 'Bearer ' + obj.token);
                            request4.setRequestHeader('Accept', 'application/json');
                            request4.send('{"roomId": "' + result.id + '", "markdown":"<@personEmail:customercare@sparkbot.io> expert"}');

                            request4.onreadystatechange = function () {
                                if (request4.readyState === 4) {
                                    var result4 = JSON.parse(request4.responseText);


                                    var widget =
                                        "<div id=\"guest-ciscospark-widget\" style=\"width: 500px; height: 500px;\"/>\n" +
                                        "<script>\n"
                                        +
                                        "   let widgetEl = document.getElementById('guest-ciscospark-widget');\n" +
                                        "   // Init a new widget\n" +
                                        "   ciscospark.widget(widgetEl).spaceWidget({\n" +
                                        "       accessToken: '" + obj.token + "',\n" +
                                        "       spaceId: '" + result.id + "' \n" +
                                        "   });\n" +
                                        "</script>\n";

                                    $("#loader").replaceWith(widget);
                                }
                            }
                        }
                    }
                }
            }
        }
    };



});

function urlConvertBase64(input) {

    // Remove padding equal characters
    var output = input.replace(/=+$/, '');

    // Replace characters according to base64url specifications
    output = output.replace(/\+/g, '-');
    output = output.replace(/\//g, '_');

    return output;
}

function getBase64Decoded(encodedStr) {
    let parsedWordArray = CryptoJS.enc.Base64.parse(encodedStr);
    let parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
    return parsedStr;
}

function base64url(source) {
    // Encode in classical base64
    encodedSource = CryptoJS.enc.Base64.stringify(source);

    // Remove padding equal characters
    encodedSource = encodedSource.replace(/=+$/, '');

    // Replace characters according to base64url specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
}