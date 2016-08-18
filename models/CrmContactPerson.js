/**
 * Created by lacho on 8/16/16.
 */
/**
 * Created by yordan on 3/16/16.
 */
'use strict';

let _ = require('lodash');

module.exports = function(sequelize, CrmCompany) {
    let DataTypes = sequelize.Sequelize;

    let CrmContactPerson = sequelize.define(
        'CrmContactPerson',
        {
            name: {
                type: DataTypes.STRING(10000)
            },
            position:{
                //type: DataTypes.ENUM({values: Object.keys(PersonPosition)})
                type: DataTypes.STRING(500)
            },
            isDecisionMaker:{
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isContactPerson:{
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            email: {
                type: DataTypes.STRING(500)
            },
            phone: {
                type: DataTypes.STRING(500)
            }
        });

    /*
     Relations
     */
    CrmContactPerson.belongsTo(CrmCompany, {foreignKey: {allowNull: false}});
    CrmCompany.hasOne(CrmContactPerson, {foreignKey: 'CrmCompanyId'});

    return CrmContactPerson;
}

