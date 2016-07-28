
describe('angular', function () {

	describe('.isObject', function () {

		it('does not detect null', function () {
			expect(angular.isObject(null)).to.equal(false);
		});

		it('does detect array', function () {
			expect(angular.isObject(["foo", "bar"])).to.equal(true);
		});

		it('does detect object', function () {
			expect(angular.isObject({"foo":"bar"})).to.equal(true);
		});

	});

});
