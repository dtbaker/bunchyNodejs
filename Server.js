var Hapi = require('hapi');
var server = new Hapi.Server(3000);
var http = require('http');
var requests = require('request');
var Joi = require('joi');

var user = {
    username: '',
    password: ''
}

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello Bunchy!');
    }
});

server.route({
    method: 'GET',
    path: '/Bunches/{location}',
    config: {
        handler: function (request, reply) {
            console.log(request.params.location);
            requests('http://bunchyapi.azurewebsites.net/api/bunch/get/'+encodeURIComponent(request.params.location), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body) // Print the google web page.
                    reply(body);
                }
                else {
                    var e = JSON.parse(body);
                    reply(e.ExceptionMessage);
                }
            })

        },
        validate: {
            params: {
                location: Joi.string()
            }
        }
    }
});

server.route({
    method: 'POST',
    path: '/Auth',
    config: {
        handler: function (request, reply) {
            user = request.payload;          
                console.log(request.payload);
                var r = requests.post('http://bunchyapi.azurewebsites.net/token', { form: { 'grant_type': 'password', 'username': user.username, 'password': user.password } }, 
                function optionalCallback(err, httpResponse, body) {                    
                    if (err) {
                        console.log(err);
                        reply('There was an error with the connection to the bunchy API. Please try again.');
                    }
                    else {
                        var apiresponse = JSON.parse(body);
                        console.log('StatusCode', apiresponse.statusCode);
                        console.log('Error', apiresponse.error_description);
                        console.log('Welcome:', apiresponse.userName);
                        console.log('Token:', apiresponse.access_token);
                        reply(body);
                    }
                }); //end of callback
        }, //end of handler        
        validate: {
            payload: {
                username: Joi.required(),
                password: Joi.required()
            }
        }
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});