// This is common setup for all tests
const chai = require('chai');

global.assert = chai.assert;
global.expect = chai.expect;
global.should = chai.should();
global.jsdom = require('jsdom');
