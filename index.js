/**
 * Created by yordan on 3/16/16.
 */
'use strict';
module.exports = function(sequalize, clientModel) {
	let crmCompany = require('./models/CrmCompany')(sequalize, clientModel);
	// TODO CRM logic

	return {crmCompany: crmCompany};
};



