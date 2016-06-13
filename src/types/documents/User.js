"use strict";

var uuid = require('../schemas/uuid.js');
var flags = require('../schemas/flags.js');

module.exports = {
                "$schema":{
                        "type": "object",
                        "properties": {
                                "name": { "type": "string" },
                                "email": { "type": "string", "format": "email", "pattern": "^.+$" },
                                "phone": { "type": "string" },
                                "password": { "type": "string", "pattern": "^.+$" },
                                "email_valid": { "type": "boolean" },
                                "email_validation_hash": { "type": "string" },
                                "groups": {
                                        "type": "array",
                                        "items": uuid,
                                        "uniqueItems": true
                                },
                                "flags": flags
                        },
                        "required": ["email", "password", "flags"],
                        "additionalProperties": false
                },
                "indexes": ["email"]
};
