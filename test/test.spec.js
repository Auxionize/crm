/**
 * Created by yordan on 3/16/16.
 */
'use strict';

// Include required modules
var co = require('co');
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
var ClientModel    = addModel('Client', {name: {type: Sequelize.STRING}});
var index = require('../index')(sequelize, ClientModel);
var crmCompany = index.crmCompany;
var savedRow1, savedRow2, savedRow3, cm1, cm2, cm3;
var fields = [];

describe('Array', function() {
	// executed before each test
	beforeEach(function* () {
		yield ClientModel.sync({force: true});
		yield crmCompany.sync({force: true});

		cm1 = yield ClientModel.create({name: randomizeString()});
		cm2 = yield ClientModel.create({name: randomizeString()});
		cm3 = yield ClientModel.create({name: randomizeString()});
	});

	let seedData = function* () {
		savedRow1 = yield crmCompany.addModel({
			ClientId: cm3.id,
			note: randomizeString(),
			owner: randomizeString(),
			manager: randomizeString(),
			contactPerson: randomizeString()
		});

		savedRow2 = yield crmCompany.addModel({
			ClientId: cm1.id,
			note: randomizeString(),
			owner: randomizeString(),
			manager: randomizeString(),
			contactPerson: randomizeString()
		});

		savedRow3 = yield crmCompany.addModel({
			ClientId: cm2.id,
			note: randomizeString(),
			owner: randomizeString(),
			manager: randomizeString(),
			contactPerson: randomizeString()
		});
	};

	it('should add records', function* () {
		yield seedData();

		expect(savedRow1).to.be.a('object');
		expect(savedRow2).to.be.a('object');
		expect(savedRow3).to.be.a('object');
	});

	it('should get model by ClientId', function* () {
		fields = ['id', 'ClientId'];
		yield seedData();

		let r1 = yield crmCompany.getModel(1, fields);
		let r2 = yield crmCompany.getModel(2, fields);
		let r3 = yield crmCompany.getModel(3, fields);

		expect(r1.ClientId).to.equal(1);
		expect(r2.ClientId).to.equal(2);
		expect(r3.ClientId).to.equal(3);
	});

	it('should update model by ClientId', function* () {
		fields = ['decisionMaker'];
		yield seedData();
		let decisionMaker = randomizeString();
		let updateResult = yield crmCompany.updateModel(1, {decisionMaker: decisionMaker});
		let getResult = yield crmCompany.getModel(1, fields);

		expect(getResult.decisionMaker).to.equal(decisionMaker);
	});

	it('should destroy model by ClientId', function* () {
		yield seedData();
		let destroyResult = yield crmCompany.destroyModel(2);
		let vainDestroy = yield crmCompany.destroyModel(22);

		expect(destroyResult).to.equal(1);
		expect(vainDestroy).to.equal(0);
	});
});





