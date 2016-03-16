/**
 * Created by yordan on 3/16/16.
 */
'use strict';

// Include required modules
var co = require('co');
var _ = require('underscore');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
require('co-mocha');
var randomizeString = require('stray');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('crm', 'postgres', 'pass', {
	host: 'localhost',
	dialect: 'postgres'
});

// model generator
var addModel = function(name, attribs, options){
	var model = sequelize.define(name, attribs, options);

	return model;
};

// cache definitions
var i = 0;
var ClientModel    = addModel('Client', {name: {type: Sequelize.STRING}});
var index = require('../index')(sequelize, ClientModel);
var crmCompany = index.crmCompany;
var numberOfRecords = 3;
var dataArray = [];

describe('Array', function() {
	// executed before each test
	beforeEach(function* () {
		yield ClientModel.sync({force: true});

		for(i = 0; i < numberOfRecords; i++) {
			var currentModel = yield ClientModel.create();
			var currentData = {
				ClientId: currentModel.id,
				note: randomizeString(),
				owner: randomizeString(),
				manager: randomizeString(),
				contactPerson: randomizeString()
			};

			dataArray.push(currentData);
		}

		yield crmCompany.sync({force: true});
	});

	it('should add records with success', function* () {
		var savedRow1 = yield crmCompany.add(dataArray[0]);
		var savedRow2 = yield crmCompany.add(dataArray[1]);
		var savedRow3 = yield crmCompany.add(dataArray[2]);

		expect(savedRow1).to.be.a('object');
		expect(savedRow2).to.be.a('object');
		expect(savedRow3).to.be.a('object');
	});
});





