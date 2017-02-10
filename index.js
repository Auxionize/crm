'use strict';
module.exports = function(sequelize, Client, User) {
	let CrmCompany = require('./models/CrmCompany')(sequelize, Client, User);
	let CrmContactPerson = require('./models/CrmContactPerson')(sequelize, CrmCompany);
	let CrmRepresentativeRequest = require('./models/CrmRepresentativeRequest')(sequelize, CrmCompany, User);

	return {
		CrmCompany,
		CrmContactPerson,
		CrmRepresentativeRequest
	};
};