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
var sequelize = new Sequelize('crm', 'postgres', '24262426', {
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
var savedRow1, savedRow2, savedRow3;
var cm1, cm2, cm3;

describe('Array', function() {
	// executed before each test
	beforeEach(function* () {
		yield ClientModel.sync({force: true});
		yield crmCompany.sync({force: true});

		cm1 = yield ClientModel.create({name: randomizeString()});
		cm2 = yield ClientModel.create({name: randomizeString()});
		cm3 = yield ClientModel.create({name: randomizeString()});
	});

	let addRecords = function* () {
		savedRow1 = yield crmCompany.add({
			ClientId: cm3.id,
			note: randomizeString(),
			owner: randomizeString(),
			manager: randomizeString(),
			contactPerson: randomizeString()
		});

		savedRow2 = yield crmCompany.add({
			ClientId: cm1.id,
			note: randomizeString(),
			owner: randomizeString(),
			manager: randomizeString(),
			contactPerson: randomizeString()
		});

		savedRow3 = yield crmCompany.add({
			ClientId: cm2.id,
			note: randomizeString(),
			owner: randomizeString(),
			manager: randomizeString(),
			contactPerson: randomizeString()
		});
	};

	it('should add records', function* () {
		yield addRecords();

		expect(savedRow1).to.be.a('object');
		expect(savedRow2).to.be.a('object');
		expect(savedRow3).to.be.a('object');
	});

	it('should get records by ClientId', function* () {
		yield addRecords();

		let r1 = yield crmCompany.get(1);
		let r2 = yield crmCompany.get(2);
		let r3 = yield crmCompany.get(3);

		expect(r1.ClientId).to.equal(1);
		expect(r2.ClientId).to.equal(2);
		expect(r3.ClientId).to.equal(3);
	});
});





