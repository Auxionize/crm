'use strict';

const _ = require('lodash');
const co = require('co');

module.exports = function(sequelize, Client, User) {
	let DataTypes = sequelize.Sequelize;
	let processEnumObject = require('../utils/enum').processEnumObject;
	let ContactType = {
		Email: '',
		Phone: '',
		Meeting: ''
	};
	let CompanyPriority = {
		HIGH: '',
		NORMAL: '',
		LOW: ''
	};
	let ClientStatus = {
		Lead: '',
		Prospect: '',
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
				sqlExpr: function(alias) {
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
				sqlExpr: function(alias) {
					let condition = ' CASE WHEN "' + alias + '"."ClientId" IS NULL';
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
			},

			salesRepDate: {
				type: DataTypes.DATE,
				defaultValue: null,
				allowNull: true
			},

			gracePeriod: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 20
			},

			available: {
				type: DataTypes.STRING,
				dbFunction: true
			},

			graceRemaining: {
				type: DataTypes.NUMERIC,
				dbFunction: true
			}

		},
		{
			timestamps: true,
			classMethods: {
				addModel: function*(data) {
					return yield this.create(data);
				},

				getModel: function*(ClientId, attributes) {
					let options = _.isArray(attributes) && !_.isEmpty(attributes)
						? {where: {ClientId}, attributes: attributes}
						: {where: {ClientId}};
					let record = yield CrmCompany.findOne(options);

					return record === null ? false : record;
				},

				updateModel: function*(ClientId, data) {
					let updateResult = yield this.update(data, {where: {ClientId}});

					return updateResult;
				},

				destroyModel: function*(ClientId) {
					return yield this.destroy({where: {ClientId}});
				}
			},
			hooks: {
				afterSync: function() {
					return sequelize.transaction(co.wrap(function*(transaction) {
						let t = {transaction};

						let contactIntervalFn = `
							CREATE OR REPLACE FUNCTION "contactInterval"("CrmCompanies")
							RETURNS double precision AS $$
							SELECT date_part('epoch', $1."contact"- NOW())
							$$ STABLE LANGUAGE plpgsql;
						`;

						yield sequelize.query(contactIntervalFn, t);

						let linkStatusFn = `
								CREATE OR REPLACE FUNCTION "linkStatus"("CrmCompanies")
								RETURNS text AS $$
								SELECT
								CASE
								WHEN $1."ClientId" IS NULL THEN 'UNLINKED'
								ELSE 'LINKED'
								END;
								$$ STABLE LANGUAGE plpgsql
						`;

						yield sequelize.query(linkStatusFn, t);

						let availableFn = `
							CREATE OR REPLACE FUNCTION "available"("CrmCompanies") RETURNS text AS $$
							DECLARE  availability text;
								BEGIN
								availability := CASE
									WHEN $1."RepresentativeId" IS NULL THEN 'YES'  
									WHEN 
									$1."ClientId" IS NULL
									AND $1."RepresentativeId" IS NOT NULL 
									AND NOW()::date > ($1."salesRepDate"::date + ($1."gracePeriod"::string || ' day')::interval)::date  THEN 'YES'	
									ELSE 'NO'
								END;
								
								RETURN availability;
							END;
							$$ STABLE LANGUAGE plpgsql;
						`;

						yield sequelize.query(availableFn, t);

						let graceRemainingFn = `
							CREATE OR REPLACE FUNCTION "graceRemaining"("CrmCompanies") RETURNS numeric AS $$
							DECLARE  remaining numeric;
								BEGIN
								remaining := CASE
									WHEN $1."RepresentativeId" IS NULL THEN NULL  
									WHEN 
									$1."RepresentativeId" IS NOT NULL 
									AND NOW()::date > ($1."salesRepDate"::date + ($1."gracePeriod"::string || ' day')::interval)::date THEN -1	
									ELSE 
									(NOW()::date - ($1."salesRepDate"::date + ($1."gracePeriod"::string || ' day')::interval)::date)::numeric
								END;
								
								RETURN remaining;
							END;
							$$ STABLE LANGUAGE plpgsql;
						`;

						yield sequelize.query(graceRemainingFn, t);
					}));
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

