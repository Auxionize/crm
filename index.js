/**
 * Created by yordan on 3/16/16.
 */
'use strict';
module.exports = function(sequelize, Client, User) {
	let CrmCompany = require('./models/CrmCompany')(sequelize, Client, User);
	// TODO CRM logic

	return {CrmCompany: CrmCompany};
};



