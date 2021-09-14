let chai = require("chai");
let server = require("./geektrust")
let chaiHttp = require("chai-http")


chai.should();

chai.use(chaiHttp)
var expect  = require('chai').expect;
var request = require('request');

it('Main page content', function(done) {
    request('http://localhost:3005/bookMeetingRoom/?check_available=book' , function(error, response, body) {
        expect(body).to.equal("Booked");
        done();
    });
});



it('About page content', function(done) {
    request('http://localhost:3005/bookMeetingRoom/?check_available=vacancy' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
    });
});