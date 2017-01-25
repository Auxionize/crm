'use strict';

const _ = require('lodash');
const STATUS_TYPES = [
	'PENDING',
	'APPROVED',
	'DECLINED',
	'EXPIRED'
];

module.exports = function(sequelize, CrmCompany, User) {
	let DataTypes = sequelize.Sequelize;

	let CrmRepresentativeRequest = sequelize.define(
		'CrmRepresentativeRequest',
		{
			status: {
				type: DataTypes.ENUM({values: STATUS_TYPES}),
				allowNull: false,
				defaultValue: 'PENDING'
			},
			createdAt: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false
			},
			updatedAt: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false
			}
		});

	/*
	 Relations
	 */
	CrmRepresentativeRequest.belongsTo(User, {foreignKey: {allowNull: false}});
	CrmRepresentativeRequest.belongsTo(CrmCompany, {foreignKey: 'CrmId'});

	return CrmRepresentativeRequest;
};