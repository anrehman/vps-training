/*
 * a Cisco Spark Integration based on nodejs, that acts on user's behalf.
 * implements the Cisco Spark OAuth flow, to retreive Cisco Spark API access tokens.
 *
 * See documentation: https://developer.ciscospark.com/authentication.html
 *
 */

let cheerio = require("cheerio");

require('dotenv').config();

let debug = require("debug")("oauth");
let fine = require("debug")("oauth:fine");

let request = require("request");
let express = require('express');
let app = express();

let clientId = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET;
let port = process.env.PORT || 8080;
let redirectURI = process.env.REDIRECT_URI || `http://localhost:${port}/oauth`; // where your integration is waiting for Cisco Spark to redirect and send the authorization code
let state = process.env.STATE || "CiscoDevNet"; // state can be used for security and/or correlation purposes
let scopes = "spark:all"; // supported scopes are documented at: https://developer.ciscospark.com/add-integration.html, the scopes separator is a space, example: "spark:people_read spark:rooms_read"

//
// Step 1: initiate the OAuth flow
//   - serves a Web page with a link to the Cisco Spark OAuth flow initializer
//
// Initiate the OAuth flow from the 'index.ejs' template
// -------------------------------------------------------------
// -- Comment this section to initiate the flow from  static html page
let initiateURL = "https://api.ciscospark.com/v1/authorize?"
    + "client_id=" + clientId
    + "&response_type=code"
    + "&redirect_uri=" + encodeURIComponent(redirectURI)
    + "&scope=" + encodeURIComponent(scopes)
    + "&state=" + state;

let read = require("fs").readFileSync;
let join = require("path").join;

app.use(express.static("public"));

app.get("/index.html", function (req, res) {
    debug("serving the integration home page (generated from an EJS template)");
    res.send(server_side);
});
app.get("/", function (req, res) {
    console.log("redirecting...");
    res.redirect("/index.html");
});

app.get('/idbroker', function (req, res) {
    console.log(initiateURL);
    res.status(301).redirect(initiateURL)
});

// -------------------------------------------------------------
// Statically serve the "/www" directory
// WARNING: Do not move the 2 lines of code below, as we need this exact precedance order for the static and dynamic HTML generation to work correctly all together
//          If the section above is commented, the static index.html page will be served instead of the EJS template.
let path = require('path');

//
// Step 2: process OAuth Authorization codes
//
app.get("/oauth", function (req, res) {
    debug("oauth callback entered");

    // Did the user decline
    if (req.query.error) {
        if (req.query.error == "access_denied") {
            debug("user declined, received err: " + req.query.error);
            res.send("<h1>OAuth Integration could not complete</h1><p>Got your NO, ciao.</p>");
            return;
        }

        if (req.query.error == "invalid_scope") {
            debug("wrong scope requested, received err: " + req.query.error);
            res.send("<h1>OAuth Integration could not complete</h1><p>The application is requesting an invalid scope, Bye bye.</p>");
            return;
        }

        if (req.query.error == "server_error") {
            debug("server error, received err: " + req.query.error);
            res.send("<h1>OAuth Integration could not complete</h1><p>Cisco Spark sent a Server Error, Auf Wiedersehen.</p>");
            return;
        }

        debug("received err: " + req.query.error);
        res.send("<h1>OAuth Integration could not complete</h1><p>Error case not implemented, au revoir.</p>");
        return;
    }

    // Check request parameters correspond to the spec
    if ((!req.query.code) || (!req.query.state)) {
        debug("expected code & state query parameters are not present");
        res.send("<h1>OAuth Integration could not complete</h1><p>Unexpected query parameters, ignoring...</p>");
        return;
    }

    // Check State
    // [NOTE] we implement a Security check below, but the State letiable can also be leveraged for Correlation purposes
    if (state != req.query.state) {
        debug("State does not match");
        res.send("<h1>OAuth Integration could not complete<State does/h1><p>Wrong secret, aborting...</p>");
        return;
    }

    console.log(req.query.code);
    let options = {
        method: "POST",
        url: "https://api.ciscospark.com/v1/access_token",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret,
            code: req.query.code,
            redirect_uri: redirectURI
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            debug("could not reach Cisco Spark to retreive access & refresh tokens");
            res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your access token. Try again...</p>");
            return;
        }

        if (response.statusCode != 200) {
            debug("access token not issued with status code: " + response.statusCode);
            switch (response.statusCode) {
                case 400:
                    let responsePayload = JSON.parse(response.body);
                    res.send("<h1>OAuth Integration could not complete</h1><p>Bad request. <br/>" + responsePayload.message + "</p>");
                    break;
                case 401:
                    res.send("<h1>OAuth Integration could not complete</h1><p>OAuth authentication error. Ask the service contact to check the secret.</p>");
                    break;
                default:
                    res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your access token. Try again...</p>");
                    break;
            }
            return;
        }

        // Check payload
        let json = JSON.parse(body);
        if ((!json) || (!json.access_token) || (!json.expires_in) || (!json.refresh_token) || (!json.refresh_token_expires_in)) {
            debug("could not parse access & refresh tokens");
            res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your access token. Try again...</p>");
            return;
        }
        debug("OAuth flow completed, fetched tokens: " + JSON.stringify(json));

        let logOut = "<button id='logout' class='btn btn-danger btn-lg btn-block'>Logout</button>";

        let options = {
            method: "POST",
            url: "https://api.ciscospark.com/v1/rooms",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Bearer " + json.access_token
            },
            body: "{\"title\":\"Customer Care\"}"

        };
        request(options, function (error, response, body) {
            if (error) {
                debug("could not reach Cisco Spark to retreive access & refresh tokens");
                res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your access token. Try again...</p>");
                return;
            }

            if (response.statusCode != 200) {
                debug("access token not issued with status code: " + response.statusCode);
                switch (response.statusCode) {
                    case 400:
                        let responsePayload = JSON.parse(response.body);
                        res.send("<h1>OAuth Integration could not complete</h1><p>Bad request. <br/>" + responsePayload.message + "</p>");
                        break;
                    case 401:
                        res.send("<h1>OAuth Integration could not complete</h1><p>OAuth authentication error. Ask the service contact to check the secret.</p>");
                        break;
                    default:
                        res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your access token. Try again...</p>");
                        break;
                }
                return;
            }

            let responsePayload = JSON.parse(body);
            console.log(responsePayload.id)

            let widget =
                "<div id=\"my-ciscospark-widget\" style=\"width: 500px; height: 500px;\"/>\n" +
                "<script>\n" +
                "document.cookie = 'token=" + json.access_token + "';\n" +

                "var request3 = new XMLHttpRequest();\n" +
                " request3.open('POST', 'https://api.ciscospark.com/v1/memberships', true);\n" +
                "request3.setRequestHeader('Content-Type', 'application/json; charset=utf-8');\n" +
                " request3.setRequestHeader('Authorization', 'Bearer " + json.access_token + "');\n" +
                " request3.setRequestHeader('Accept', 'application/json');\n" +
                "request3.send('{\"roomId\": \"" + responsePayload.id + "\", \"personEmail\":\"customercare@sparkbot.io\"}');\n" +

                "request3.onreadystatechange = function () {\n" +
                "if (request3.readyState === 4) {\n" +
                "var result3 = JSON.parse(request3.responseText);\n" +
                "   let widgetEl = document.getElementById('my-ciscospark-widget');\n" +
                "   // Init a new widget\n" +
                "   ciscospark.widget(widgetEl).spaceWidget({\n" +
                "       accessToken: '" + json.access_token + "',\n" +
                "       spaceId: '" + responsePayload.id + "'\n" +
                "   });\n" +

                "}" +
                "\n}";


            let html = read(__dirname + '/public' + "/index.html", 'utf8');
            let $ = cheerio.load(html);
            $('#widget-container').replaceWith(widget);
            $('#main-container-widget').append(logOut);
            console.log("Entra!")
            res.send($.html());
        });
    });
});

app.get("/logout", function (req, res) {
    console.log("logout!");

    let redirectURL = "http://localhost:8080/"
    let cookies = cookiesToJSON(req.headers.cookie);
    let token = cookies.token;
    console.log(token);

    let logoutURL = getLogoutURL(token, redirectURL)
    res.redirect(logoutURL);
});

function cookiesToJSON(cookies) {
    let output = {};
    cookies.split(/\s*;\s*/).forEach(function (pair) {
        pair = pair.split(/\s*=\s*/);
        output[pair[0]] = pair.splice(1).join('=');
    });
    return output;
}
//
// Step 3: this is where the integration runs its custom logic
//   - this function is called as the Cisco Spark OAuth flow has been successfully completed,
//   - this function is expected to send back an HTML page to the end-user
//
// some optional activities to perform here:
//    - associate the issued Spark access token to a user through the state (acting as a Correlation ID)
//    - store the refresh token (valid 90 days) to reissue later a new access token (valid 14 days)

function oauthFlowCompleted(access_token, res) {
    // Retreive user name: GET https://api.ciscospark.com/v1/people/me
    let options = {
        method: 'GET',
        url: 'https://api.ciscospark.com/v1/people/me',
        headers:
            {
                "authorization": "Bearer " + access_token
            }
    };

    request(options, function (error, response, body) {
        if (error) {
            debug("could not reach Cisco Spark to retreive Person's details, error: " + error);
            res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your Cisco Spark account details. Try again...</p>");
            return;
        }

        // Check the call is successful
        if (response.statusCode != 200) {
            debug("could not retreive your details, /people/me returned: " + response.statusCode);
            res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your Cisco Spark account details. Try again...</p>");
            return;
        }

        let json = JSON.parse(body);
        if ((!json) || (!json.displayName)) {
            debug("could not parse Person details: bad json payload or could not find a displayName.");
            res.send("<h1>OAuth Integration could not complete</h1><p>Sorry, could not retreive your Cisco Spark account details. Try again...</p>");
            return;
        }
    });
}


// The idea here is to store the access token for future use, and the expiration dates and refresh_token to have Cisco Spark issue a new access token
function storeTokens(access_token, expires_in, refresh_token, refresh_token_expires_in) {

    // Store the token in some secure backend
    debug("TODO: store tokens and expiration dates");

    // For demo purpose, we'll NOW ask for a refreshed token
    refreshAccessToken(refresh_token);
}

//
// Example of Refresh token usage
//
function refreshAccessToken(refresh_token) {

    let options = {
        method: "POST",
        url: "https://api.ciscospark.com/v1/access_token",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "refresh_token",
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refresh_token
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            debug("could not reach Cisco Spark to refresh access token");
            return;
        }

        if (response.statusCode != 200) {
            debug("access token not issued with status code: " + response.statusCode);
            return;
        }

        // Check payload
        let json = JSON.parse(body);
        if ((!json) || (!json.access_token) || (!json.expires_in) || (!json.refresh_token) || (!json.refresh_token_expires_in)) {
            debug("could not parse response");
            return;
        }

        // Refresh token obtained
        debug("newly issued tokens: " + JSON.stringify(json));
    });
}

function getLogoutURL(token, redirectURL) {
    //let rootURL = redirectURL.substring(0, redirectURL.length - 5);
    let rootURL = redirectURL;
    var url = "https://idbroker.webex.com/idb/oauth2/v1/logout?"
        + "goto=" + encodeURIComponent(rootURL)
        + "&token=" + token;
    console.log(url);
    return url;
}

// Starts the app
app.listen(port, function () {
    debug("Cisco Spark OAuth Integration started on port: " + port);
});
