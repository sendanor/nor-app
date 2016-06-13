"use strict";

var flag_value = {"type": "boolean"};

module.exports = {
        "type": "object",
        "patternProperties": {
                "^[a-z][a-z0-9_]*[a-z0-9]*$": flag_value,
        },
        "additionalProperties": false
};
