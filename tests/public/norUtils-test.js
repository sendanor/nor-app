
describe('norUtils', function () {

	var norUtils;
	beforeEach(module('norApp'));

	beforeEach(module('norApp', function($provide) {
		// Output messages
		$provide.value('$log', console);
	}));

	beforeEach(inject(function (_norUtils_) {
		norUtils = _norUtils_;
	}));

	describe('.isUUID', function () {

		it('can detect faulty UUID', function () {
			expect(norUtils.isUUID('Ben')).to.equal(false);
		});

		it('can detect correct UUID', function () {
			expect(norUtils.isUUID('cc8009b1-2731-5a80-a5e8-1a716ed070b2')).to.equal(true);
		});

	});

	describe('.getDataPointerFromPath', function () {

		var data = {"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","$resource":"database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","$user":"demo","$route":{"$id":"a6d24947-7079-5892-a611-2b8f16f0b07b","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-27T08:17:19.590Z","$modified":"2016-07-27T08:17:19.590Z","$documents":{"af536fb7-0c24-5034-b20a-7ec5237ccc86":{"$id":"af536fb7-0c24-5034-b20a-7ec5237ccc86","$type":"Route","path":"/database/types/Route/documents","title":"Documents","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/af536fb7-0c24-5034-b20a-7ec5237ccc86"}},"path":"/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","title":"Cc8009b1-2731-5a80-a5e8-1a716ed070b2","icon":"file-o","parent":"af536fb7-0c24-5034-b20a-7ec5237ccc86","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/a6d24947-7079-5892-a611-2b8f16f0b07b"},"$app":{"name":"neisa-infotip-app","menu":[{"$ref":"http://neisa-app.sendanor.fi/api/tasks","href":"/tasks","title":"Tasks"},{"$ref":"http://neisa-app.sendanor.fi/api/database","href":"/database","title":"Database"},{"$ref":"http://neisa-app.sendanor.fi/api/logout","href":"/logout","title":"Logout"}]},"title":"Document cc8009b1-2731-5a80-a5e8-1a716ed070b2","content":{"$id":"cc8009b1-2731-5a80-a5e8-1a716ed070b2","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-23T18:31:55.173Z","$modified":"2016-07-23T18:31:55.173Z","$documents":{"ae4fd8df-1763-5af2-a4db-22e7cf37aea1":{"$id":"ae4fd8df-1763-5af2-a4db-22e7cf37aea1","$type":"Route","path":"/database/types/Test","title":"Test","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/ae4fd8df-1763-5af2-a4db-22e7cf37aea1"}},"path":"/database/types/Test/documents","title":"Documents","icon":"file-o","parent":"ae4fd8df-1763-5af2-a4db-22e7cf37aea1","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2"},"$type":"Document","links":[{"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/search","title":"Search documents","icon":"search"}]};

		it('can find a title', function () {
			var pointer = norUtils.getDataPointerFromPath(data.content, ['title']);
			expect(pointer.getData()).to.equal('Documents');
		});

		it('can find a parent as UUID', function () {
			var pointer = norUtils.getDataPointerFromPath(data.content, ['parent']);
			expect(pointer.getData()).to.equal('ae4fd8df-1763-5af2-a4db-22e7cf37aea1');
		});

		it('can find a parent.title from external document', function () {
			var pointer = norUtils.getDataPointerFromPath(data.content, ['parent', 'title']);
			expect(pointer.getData()).to.equal('Test');
		});

		it('has same root element', function () {
			var pointer = norUtils.getDataPointerFromPath(data.content, ['title']);
			expect(pointer.getRoot()).to.equal(data.content);
			expect(pointer.getPath().join('.')).to.equal('title');
		});

		it('has same root element with external document', function () {
			var pointer = norUtils.getDataPointerFromPath(data.content, ['parent', 'title']);
			expect(pointer.getRoot()).to.equal(data.content);
			expect(pointer.getPath().join('.')).to.equal('parent.title');
		});

	});

	describe('.getSchemaPointerFromPath', function () {

		var data = {"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","$resource":"database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","$user":"demo","$route":{"$id":"a6d24947-7079-5892-a611-2b8f16f0b07b","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-27T08:17:19.590Z","$modified":"2016-07-27T08:17:19.590Z","$documents":{"af536fb7-0c24-5034-b20a-7ec5237ccc86":{"$id":"af536fb7-0c24-5034-b20a-7ec5237ccc86","$type":"Route","path":"/database/types/Route/documents","title":"Documents","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/af536fb7-0c24-5034-b20a-7ec5237ccc86"}},"path":"/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","title":"Cc8009b1-2731-5a80-a5e8-1a716ed070b2","icon":"file-o","parent":"af536fb7-0c24-5034-b20a-7ec5237ccc86","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/a6d24947-7079-5892-a611-2b8f16f0b07b"},"$app":{"name":"neisa-infotip-app","menu":[{"$ref":"http://neisa-app.sendanor.fi/api/tasks","href":"/tasks","title":"Tasks"},{"$ref":"http://neisa-app.sendanor.fi/api/database","href":"/database","title":"Database"},{"$ref":"http://neisa-app.sendanor.fi/api/logout","href":"/logout","title":"Logout"}]},"title":"Document cc8009b1-2731-5a80-a5e8-1a716ed070b2","content":{"$id":"cc8009b1-2731-5a80-a5e8-1a716ed070b2","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-23T18:31:55.173Z","$modified":"2016-07-23T18:31:55.173Z","$documents":{"ae4fd8df-1763-5af2-a4db-22e7cf37aea1":{"$id":"ae4fd8df-1763-5af2-a4db-22e7cf37aea1","$type":"Route","path":"/database/types/Test","title":"Test","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/ae4fd8df-1763-5af2-a4db-22e7cf37aea1"}},"path":"/database/types/Test/documents","title":"Documents","icon":"file-o","parent":"ae4fd8df-1763-5af2-a4db-22e7cf37aea1","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2"},"type":{"$id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$name":"Route","$schema":{"properties":{"path":{"title":"path","type":"string","description":"Path of the route"},"title":{"title":"title","type":"string","description":"Title of the route"},"parent":{"title":"parent","type":"string","description":"The parent of this route","format":"uuid"},"icon":{"title":"Icon","type":"string","description":"FontAwesome icon name"}},"type":"object","additionalProperties":false,"description":"The app routes requests to operations by associating an operation with an address, known as a route.","required":["path","title"]},"$created":"2016-07-21T22:17:00.231Z","$modified":"2016-07-22T08:03:27.883Z","type":"object","indexes":["path"],"uniqueIndexes":["path"],"documents":["Route#parent|$id,$type,path,title"],"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route"},"$type":"Document","links":[{"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/search","title":"Search documents","icon":"search"}]};

		it('can find a schema for title', function () {
			var pointer = norUtils.getSchemaPointerFromPath(data.type, ['title']);
			var schema = pointer.getSchema();
			expect(schema).to.be.a('object');
			expect(schema.title).to.equal('title');
			expect(schema.type).to.equal('string');
			expect(schema.description).to.equal('Title of the route');
		});

	});

	describe('.getPointerFromPath', function () {

		var data = {"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","$resource":"database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","$user":"demo","$route":{"$id":"a6d24947-7079-5892-a611-2b8f16f0b07b","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-27T08:17:19.590Z","$modified":"2016-07-27T08:17:19.590Z","$documents":{"af536fb7-0c24-5034-b20a-7ec5237ccc86":{"$id":"af536fb7-0c24-5034-b20a-7ec5237ccc86","$type":"Route","path":"/database/types/Route/documents","title":"Documents","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/af536fb7-0c24-5034-b20a-7ec5237ccc86"}},"path":"/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2","title":"Cc8009b1-2731-5a80-a5e8-1a716ed070b2","icon":"file-o","parent":"af536fb7-0c24-5034-b20a-7ec5237ccc86","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/a6d24947-7079-5892-a611-2b8f16f0b07b"},"$app":{"name":"neisa-infotip-app","menu":[{"$ref":"http://neisa-app.sendanor.fi/api/tasks","href":"/tasks","title":"Tasks"},{"$ref":"http://neisa-app.sendanor.fi/api/database","href":"/database","title":"Database"},{"$ref":"http://neisa-app.sendanor.fi/api/logout","href":"/logout","title":"Logout"}]},"title":"Document cc8009b1-2731-5a80-a5e8-1a716ed070b2","content":{"$id":"cc8009b1-2731-5a80-a5e8-1a716ed070b2","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-23T18:31:55.173Z","$modified":"2016-07-23T18:31:55.173Z","$documents":{"ae4fd8df-1763-5af2-a4db-22e7cf37aea1":{"$id":"ae4fd8df-1763-5af2-a4db-22e7cf37aea1","$type":"Route","path":"/database/types/Test","title":"Test","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/ae4fd8df-1763-5af2-a4db-22e7cf37aea1"}},"path":"/database/types/Test/documents","title":"Documents","icon":"file-o","parent":"ae4fd8df-1763-5af2-a4db-22e7cf37aea1","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/cc8009b1-2731-5a80-a5e8-1a716ed070b2"},"type":{"$id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$name":"Route","$schema":{"properties":{"path":{"title":"path","type":"string","description":"Path of the route"},"title":{"title":"title","type":"string","description":"Title of the route"},"parent":{"title":"parent","type":"string","description":"The parent of this route","format":"uuid"},"icon":{"title":"Icon","type":"string","description":"FontAwesome icon name"}},"type":"object","additionalProperties":false,"description":"The app routes requests to operations by associating an operation with an address, known as a route.","required":["path","title"]},"$created":"2016-07-21T22:17:00.231Z","$modified":"2016-07-22T08:03:27.883Z","type":"object","indexes":["path"],"uniqueIndexes":["path"],"documents":["Route#parent|$id,$type,path,title"],"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route"},"$type":"Document","links":[{"$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/search","title":"Search documents","icon":"search"}]};

		it('can find a schema for title', function () {
			var pointer = norUtils.getPointerFromPath(data.content, data.type, ['title']);

			var schema = pointer.getSchema();
			expect(schema).to.be.a('object');
			expect(schema.title).to.equal('title');
			expect(schema.type).to.equal('string');
			expect(schema.description).to.equal('Title of the route');

			expect(pointer.getData()).to.equal('Documents');
		});

	});

	describe('.detectMissingSettings', function () {

		var data = {"$ref":"http://neisa-app.sendanor.fi/api/database/types/InfotipOrder/documents/313d705f-328f-52e4-b001-5437056878aa","$resource":"database/types/InfotipOrder/documents/313d705f-328f-52e4-b001-5437056878aa","$user":"demo","$route":{"$id":"6eb453d7-063f-5deb-bca3-0b8bc7c51a99","$type":"Route","$types_id":"4bfa6f72-d718-581e-bc60-2ae3850975d7","$created":"2016-07-25T06:34:59.204Z","$modified":"2016-07-25T06:34:59.204Z","$documents":{"c6b4f383-953f-5677-b918-1c6de919aca6":{"$id":"c6b4f383-953f-5677-b918-1c6de919aca6","$type":"Route","path":"/database/types/InfotipOrder/documents","title":"Documents","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/c6b4f383-953f-5677-b918-1c6de919aca6"}},"path":"/database/types/InfotipOrder/documents/313d705f-328f-52e4-b001-5437056878aa","title":"313d705f-328f-52e4-b001-5437056878aa","icon":"file-o","parent":"c6b4f383-953f-5677-b918-1c6de919aca6","$ref":"http://neisa-app.sendanor.fi/api/database/types/Route/documents/6eb453d7-063f-5deb-bca3-0b8bc7c51a99"},"$app":{"name":"neisa-infotip-app","menu":[{"$ref":"http://neisa-app.sendanor.fi/api/tasks","href":"/tasks","title":"Tasks"},{"$ref":"http://neisa-app.sendanor.fi/api/database","href":"/database","title":"Database"},{"$ref":"http://neisa-app.sendanor.fi/api/logout","href":"/logout","title":"Logout"}]},"title":"Document 313d705f-328f-52e4-b001-5437056878aa","content":{"$id":"313d705f-328f-52e4-b001-5437056878aa","$type":"InfotipOrder","$types_id":"73cc52dc-255b-5ec6-8382-ffdd82239f4d","$created":"2016-07-21T10:45:59.858Z","$modified":"2016-07-21T10:45:59.858Z","$documents":{},"orders":{"orderId":"1016696","orderName":"IT-TPVision-1016696","orderIssueNr":"IS-tpvision-1016696-425525010-32C9819C","orderSearch":".1016696.ITTPVISION1016696.ELGIGANTENKUNGENSKURVA.42PFT450912.FZ1A1234567890.NEISATPVF.TPV4237020.PLZ42165.ZIP42165.46855247897.MOUSE.COOPELKJP.NEISATPVW.AGENTSIKIDIOPS","orderState":"80","interface":":RTS-Portal","lgId":"se","countryId":"SE","container":"","producer":"tpvision","handlingType":"HOMESERVICE","processType":"","submitGroup":"consumer","brand":"TPVision","productId":"42PFT4509/12","productName":"42PFT4509/12","productSubcat":"FLAT-42","serialNumber":"FZ1A1234567890","noSerialNumber":"0","preclarifyFlag":"0","creatorLoginName":"CC.TPVision-Nordics","creatorName":"Mickey Mouse","creatorRole":"CallCenter","dealerLoginName":"","callCenterAgentId":"SIKIDiopS","orderDate":"01.07.2016 12:01:00","repairNrCustomer":"TPV-4237020","repairName":"Elgiganten, Kungens Kurva","typeOfOrder":"guarantee","contactOwner":"0","homeService":"0","homeServicePreferredDate":"01.01.1900","homeServiceServiceDate":"01.01.1900","typeOfAccounting":"","repairFeeLimit":"","currency":"SEK","customerNumber":"","customerNrManufacturer":"","customerNrWorkshop":"","customerCooperation":"Elkj&#248;p","customerNrCooperation":"","salesStockware":"0","salesDate":"05.10.2015","workshopLoginName":"Neisa-TPV_W","workshopMatchcode":"","workshopName":"Neisa Services Sweden AB","workshopRepairNr":"IT-TPVision-1016696","pickupWay":"","pickupLoginName":"Neisa-TPV_F","pickupName":"Neisa Services Sweden AB","pickupPacketNr":"","pickupPreferredDate":"01.01.1900","pickupTimeslot":"","pickupTransportType":"","returnLoginName":"","returnName":"","returnPacketNr":"","flagToWorkshop":"1","flagToPickup":"0","flagToReturn":"0","flagEskalation":"0","chgDate":"02.07.2016 00:05:18","createDate":"01.07.2016 12:01:30","producerGroup":"group_rts","beleg":"","orderIgnore":"0","packetLoginName":"","packetName":"","packetPacketNr":""},"product":{"producer":"Tpvision","lndId":"SE","modelId":"42PFT4509/12","modelName":"42PFT4509/12","materialNumber":"","EAN":"","modelDescription":"Philips 3100 series Full HD Slim LED TV 42PFT4509 107cm (42&#180;&#180;) Full HD 1080p DVB-T/C with Digital Crystal Clear","brand":"TPVision","subcatId":"FLAT-42","otherText":"LTS,50","otherInt":"","weight":"0","width":"","height":"","depth":"","volume":"","categorie":"","priceGroup":"","tree0":"42PFT4509/12","tree1":"FLAT-42","tree2":"FLATH","tree3":"FLAT-HOME","tree4":"TPV","tree5":"."},"error":{"errorDescription":"Error Description:\\nLine(s) on Screen, shows on all sources including CSM and Demo. \\nTV has been Reinstalled and Reset, tried with no devices connected.\\nTried to leave TV without power, No change.\\n"},"pickup":{"packagingWeight":""},"adr21":{"firstline":"Mickey Mouse","salutation":"mr","firstname":"Mickey","lastname":"Mouse","secondline":"","street":"PURPURGATAN 2","streetnumber":"","postcode":"42165","city":"V&#196;STRA FR&#214;LUNDA","state":"","countryCode":"SE","person":"Mickey Mouse","phone":"46855247897","fax":"","mobil":"46739801306","email":"mickeymouse@hotmail.com"},"adr23":{"firstline":"Mickey Mouse","salutation":"mr","firstname":"Mickey","lastname":"Mouse","secondline":"","street":"PURPURGATAN 2","streetnumber":"","postcode":"42165","city":"V&#196;STRA FR&#214;LUNDA","state":"","countryCode":"SE","person":"Mickey Mouse","phone":"46855247897","fax":"","mobil":"46739801306","email":"mickeymouse@hotmail.com"},"adr24":{"firstline":"Neisa Services Sweden AB","secondline":"","street":"H&#246;jdrodergatan","streetnumber":"4","postcode":"212 39","city":"Malm&#246;","countryCode":"SE","person":"Neisa","phone":"+46 10 130 62 00","mobil":"+46 10 130 62 00","fax":"","email":"dth@infotip.de","person1":"Neisa"},"adr30":{"firstline":"Neisa Services Sweden AB","secondline":"","street":"H&#246;jdrodergatan","streetnumber":"4","postcode":"212 39","city":"Malm&#246;","countryCode":"SE","person":"Neisa","phone":"+46 10 130 62 00","mobil":"+46 10 130 62 00","fax":"","email":"dth@infotip.de","person1":"Neisa"},"adr31":{"firstline":"Mickey Mouse","salutation":"mr","firstname":"Mickey","lastname":"Mouse","secondline":"","street":"PURPURGATAN 2","streetnumber":"","postcode":"42165","city":"V&#196;STRA FR&#214;LUNDA","state":"","countryCode":"SE","person":"Mickey Mouse","phone":"46855247897","fax":"","mobil":"46739801306","email":"mickeymouse@hotmail.com"},"adr43":{"firstline":"Mickey Mouse","salutation":"mr","firstname":"Mickey","lastname":"Mouse","secondline":"","street":"PURPURGATAN 2","streetnumber":"","postcode":"42165","city":"V&#196;STRA FR&#214;LUNDA","state":"","countryCode":"SE","person":"Mickey Mouse","phone":"46855247897","fax":"","mobil":"46739801306","email":"mickeymouse@hotmail.com"},"adr50":{"customerNrManufacturer":"1000138_06","firstline":"Elgiganten Kungens Kurva","secondline":"","street":"Tangentv&#228;gen 10","streetnumber":"","postcode":"14175","city":"Kungens Kurva","state":"","countryCode":"SE","person":"","phone":"","email":""},"others":{"receiptName":"","selForwarder":"","creditReason":"","KVAMode":"","caseClose":"","gvlFlag":"0","gvlCode":"","bookingFlag":"0","selMode":"0","doubleOrderId":"","repeatRepair":"0","diffPickup":"1","diffReturn":"0","chgAdr50":"0","handlingType":"HOMESERVICE","processType":"homeservice","causeFlag":"0","software":"000.150.02.13","mounting":"wall_mounted","assist":"0","causeDoa":"","LTSFee":"","LTS":"0","HTS":"0","backofficeFlag":"0","remoteDiagnoseFlag":"0","callView":"https://test1.infotip-rts.de/View.rts.IS-tpvision-1016696-425525010-32C9819C","callWS":"https://test1.infotip-rts.de/Issue.xhtml?Action=CallWS&#38;OrderId=IS-tpvision-1016696-425525010-32C9819C&#38;Check=240e4bd35306186fa1d3c21e03a898bd","thanks":"78","answerEmail":"cbl.swno.tv@Sitel.com","mail209Id":"34"},"orderIssueNr":"IS-tpvision-1016696-425525010-32C9819C","$ref":"http://neisa-app.sendanor.fi/api/database/types/InfotipOrder/documents/313d705f-328f-52e4-b001-5437056878aa"},"type":{"$id":"73cc52dc-255b-5ec6-8382-ffdd82239f4d","$name":"InfotipOrder","$schema":{"properties":{"orderIssueNr":{"title":"orderIssueNr","type":"string","description":"Order Issue Name"}},"type":"object","additionalProperties":true,"description":"Infotip Order data","title":"JSON Schema","required":["orderIssueNr"]},"$created":"2016-07-21T09:58:32.024Z","$modified":"2016-07-21T16:05:52.607Z","type":"object","indexes":["orderIssueNr"],"$ref":"http://neisa-app.sendanor.fi/api/database/types/InfotipOrder"},"$type":"Document","links":[{"$ref":"http://neisa-app.sendanor.fi/api/database/types/InfotipOrder/search","title":"Search documents","icon":"search"}]};

		it('can create missing schemas', function () {

			var changed = norUtils.detectMissingSettings(data.content, data.type);

			expect(changed).to.equal(true);

			var pointer = norUtils.getSchemaPointerFromPath(data.type, 'orders.orderId');
			var schema = pointer.getSchema();
			expect(schema).to.be.a('object');
			expect(schema.type).to.equal('string');
		});

	});

});
