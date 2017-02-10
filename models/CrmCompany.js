/**
 * Created by yordan on 3/16/16.
 */
'use strict';

let _ = require('lodash');

module.exports = function(sequelize, Client, User) {
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

	let CrmCompany = sequelize.define(
		'CrmCompany',
		{
			name: {
				type: DataTypes.STRING(10000)
			},

			countryOfReg: {
				type: DataTypes.STRING(10000)
			},

			regNumber: {
				type: DataTypes.STRING(10000)
			},

			bulstatNumber: {
				type: DataTypes.STRING(50)
			},

			vatNumber: {
				type: DataTypes.STRING(50)
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
			},

			linkStatus: {
				type: DataTypes.VIRTUAL,
				sqlExpr: function (alias) {
					let condition = ' CASE WHEN "' + alias+ '"."ClientId" IS NULL';
					condition += " THEN 'UNLINKED'";
					condition += " ELSE 'LINKED'";
					condition += " END";

					return sequelize.literal(condition);
				}
			},
			turnover: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},

			url: {
				type: DataTypes.STRING(1000)
			},

			supplyDirector: {
				type: DataTypes.STRING(500),
				defaultValue: null,
				allowNull: true
			},

			supplyDirectorEmail: {
				type: DataTypes.STRING(500),
				defaultValue: null,
				allowNull: true
			},

			supplyDirectorPhone: {
				type: DataTypes.STRING(500),
				defaultValue: null,
				allowNull: true
			},

			commercialDirector: {
				type: DataTypes.STRING(500),
				defaultValue: null,
				allowNull: true
			},

			commercialDirectorEmail: {
				type: DataTypes.STRING(500),
				defaultValue: null,
				allowNull: true
			},

			commercialDirectorPhone: {
				type: DataTypes.STRING(500),
				defaultValue: null,
				allowNull: true
			}

		},
		{
			timestamps: true,
			classMethods: {
				addModel: function* (data) {
					return yield this.create(data);
				},

				getModel: function* (ClientId, attributes) {
					let options = _.isArray(attributes) && !_.isEmpty(attributes)
									? {where: {ClientId}, attributes: attributes}
									: {where: {ClientId}};
					let record = yield CrmCompany.findOne(options);

					return record === null ? false : record;
				},

				updateModel: function* (ClientId, data) {
					let updateResult = yield this.update(data, {where: {ClientId}});

					return updateResult;
				},

				destroyModel: function* (ClientId) {
					return yield this.destroy({where: {ClientId}});
				}
			},
			hooks:{
				afterSync:function(){
					return  sequelize.transaction(function(t){
						let query = ' CREATE OR REPLACE FUNCTION "contactInterval"("CrmCompanies")' ;
							query+=' RETURNS double precision AS $$' ;
							query+=' SELECT date_part(\'epoch\', $1."contact"- NOW())' ;
							query+=' $$ STABLE LANGUAGE plpgsql' ;
						return sequelize.query(query, {transaction: t})
							.then(function(){
								let query = ' CREATE OR REPLACE FUNCTION "linkStatus"("CrmCompanies")' ;
									query+=' RETURNS text AS $$' ;
									query+=' SELECT' ;
									query+=' CASE' ;
									query+=' WHEN $1."ClientId" IS NULL THEN \'UNLINKED\'' ;
									query+=' ELSE \'LINKED\'' ;
									query+=' END' ;
									query+=' $$ STABLE LANGUAGE plpgsql' ;
								return sequelize.query(query, {transaction: t});
							});
					});
				}
			}
		});

	/*
		Relations
	 */
	CrmCompany.belongsTo(Client, {as: 'Client', foreignKey: {allowNull: true}});
	Client.hasOne(CrmCompany, {foreignKey: 'ClientId'});

	CrmCompany.belongsTo(User, {as: 'Representative', foreignKey: {allowNull: true}});
	User.hasOne(CrmCompany, {foreignKey: 'RepresentativeId'});

	return CrmCompany;
}

