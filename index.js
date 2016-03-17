/**
 * Created by yordan on 3/16/16.
 */
'use strict';
module.exports = function(sequelize, clientModel) {
	let crmCompany = require('./models/CrmCompany')(sequelize, clientModel);
	// TODO CRM logic

	return {crmCompany: crmCompany};
};



