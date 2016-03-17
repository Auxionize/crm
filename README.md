# Crm - Generic CRM for Sequalize

## Simple to use

Crm is designed to be simplest way to integrate and use CRM system.

```
var client = require('index')(sequalize, clientModel);
```
 
``` 
/**
 * Add new model
 * @param {Object} data (required attribute CliendId)
 * @return {Object}
 */
 
var newModel = yield client.crmCompany.addModel(data);
```

```
/**
 * Get model
 * @param {Int} id (required)
 * @param {Array} fields (optional)
 * @return {Mixed} false | Object
 */
 
var model = yield client.crmCompany.getModel(id, fields);
```

```
/**
 * Update model
 * @param {Int} ClientId (required)
 * @param {Object} data (required)
 * @return {Int}
 */
 
var updateResult = yield client.crmCompany.updateModel(ClientId, data);
```

```
/**
 * Destroy model
 * @param {Int} ClientId (required)
 * @return {Int}
 */
 
var destroyResult = yield client.crmCompany.destroyModel(ClientId);
```

