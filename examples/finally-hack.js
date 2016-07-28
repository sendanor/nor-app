

function foo(value) {
	var ret = {};
	try {
		ret.bar = 'foo:' + value;
		return ret;
	} finally {
		ret.foo = 'bar';
	}
}

console.log( JSON.stringify(foo('hello'), null, 2) );
