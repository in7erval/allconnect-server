async function test() {
	const a = new Promise((resolve, reject) => {
		if (Math.random() > 0.5) {
			resolve(123);
		} else {
			reject(321);
		}
	})
		.catch(err => console.error("err", err));

	console.log("a", await a);

}

test();