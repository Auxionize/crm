/**
 * Created by yordan on 3/16/16.
 */
'use strict';

module.exports = function(sequelize, clientModel) {
	let DataTypes = sequelize.Sequelize;
	let processEnumObject = require('../utils/enum').processEnumObject;
	let ContactType = {
		Email: '' ,
		Phone: '' ,
		Meeting: ''
	};
	let CompanyPriority = {
		HIGH: '' ,
		NORMAL: '' ,
		LOW: ''
	};
	let ClientStatus = {
		Lead: '' ,
		Prospect: '' ,
		Customer: ''
	};

	processEnumObject(ContactType);
	processEnumObject(CompanyPriority);
	processEnumObject(ClientStatus);

	// todo make derivation from crmCompany model to client and collaborator

	let crmCompanyModel = sequelize.define(
		'CrmCompany',
		{
			ClientId: {
				type: DataTypes.INTEGER,
				references: {
					model: clientModel,
					key: 'id',
					deferrable: sequelize.Deferrable.INITIALLY_IMMEDIATE
				}
			},
			note: {
				type: DataTypes.STRING(10000)
			},

			owner: {
				type: DataTypes.STRING(500)
			},

			manager: {
				type: DataTypes.STRING(500)
			},

			contactPerson: {
				type: DataTypes.STRING(500)
			},

			decisionMaker: {
				type: DataTypes.STRING(500)
			},

			decisionMakerPosition: {
				type: DataTypes.STRING(500)
			},

			decisionMakerEmail: {
				type: DataTypes.STRING(500)
			},

			decisionMakerPhone: {
				type: DataTypes.STRING(500)
			},

			activity: {
				type: DataTypes.STRING(500)
			},

			howKnow: {
				type: DataTypes.STRING(500)
			},

			contact: {
				type: DataTypes.DATE
			},

			contactInterval: {
				type: DataTypes.VIRTUAL,
				sqlExpr: function (alias) {
					return sequelize.literal(`date_part('epoch', "${alias}"."contact"- NOW())`);
				}
			},

			contactType: {
				type: DataTypes.ENUM({values: Object.keys(ContactType)})
			},

			contactGoal: {
				type: DataTypes.STRING(500)
			},

			priority: {
				type: DataTypes.ENUM({values: Object.keys(CompanyPriority)}),
				defaultValue: CompanyPriority.NORMAL
			},

			clientStatus: {
				type: DataTypes.ENUM({values: Object.keys(ClientStatus)}),
				defaultValue: ClientStatus.Lead
			},

			source: {
				type: DataTypes.STRING(500)
			},

			operator: {
				type: DataTypes.STRING(500)
			},

			contactPersonPosition: {
				type: DataTypes.STRING(500)
			},

			contactPersonEmail: {
				type: DataTypes.STRING(500)
			},

			contactPersonPhone: {
				type: DataTypes.STRING(500)
			},

			purchaseInfo: {
				type: DataTypes.STRING(500)
			},

			purchaseVolume: {
				type: DataTypes.STRING(500)
			}
		},
		{
			timestamps: true,
			classMethods: {
				add: function* (data) {
					return yield this.create(data);
				},
				get: function* (ClientId) {
					let record = yield crmCompanyModel.findOne({where: {ClientId}});

					return record === null ? false : record;
				}
			}
		});

	crmCompanyModel.belongsTo(clientModel, {as: 'Client', foreignKey: {allowNull: false}});
	clientModel.hasOne(crmCompanyModel, {foreignKey: 'ClientId'});

	return crmCompanyModel;
}

