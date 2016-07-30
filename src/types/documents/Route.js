"use strict";

module.exports = {
	"$schema": {
		"type": "object",
		"properties": {
			"path": {
				"title": "path",
				"type": "string",
				"description": "Path of the route"
			},
			"title": {
				"title": "title",
				"type": "string",
				"description": "Title of the route"
			},
			"parent": {
				"title": "parent",
				"type": "string",
				"description": "The parent of this route",
				"format": "uuid"
			},
			"icon": {
				"title": "Icon",
				"type": "string",
				"description": "FontAwesome icon name"
			}
		},
		"additionalProperties": false,
		"description": "The app routes requests to operations by associating an operation with an address, known as a route.",
		"required": [
			"path",
			"title"
		]
	},
	"indexes": [
		"path"
	],
	"uniqueIndexes": [
		"path"
	],
	"documents": [
		"Route#parent|$id,$type,path,title"
	]
};
