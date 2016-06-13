"use strict";

var flags = require('../schemas/flags.js');

module.exports = {
                "$schema":{
                        "type": "object",
                        "properties": {
                                "name": { "type": "string", "pattern": "^.+$" },
                                "flags": flags
                        },
                        "required": ["name", "flags"],
                        "additionalProperties": false
                }
        };
