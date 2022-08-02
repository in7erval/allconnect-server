const axios = require('axios');
const {MongoClient} = require('mongodb');

async function writePostRow(row, collectionStr) {
	const url = 'mongodb://0.0.0.0:27017';
	const client = new MongoClient(url);
	const dbName = 'allconnect';
	await client.connect();
	console.log('Connected successfully to server');
	const db = client.db(dbName);
	const collection = db.collection(collectionStr);
	await collection.insertOne({'_id': row.id, ...row});

	return 'done.';
}

function run() {
	for (var i = 0; i <= 50; i++) {
		axios
			.get('https://dummyapi.io/data/v1/user', {
				params: {
					limit: 50,
					page: i
				},
				headers: {
					'app-id': "62dd0da3d286d10fdfde96dc"
				}
			})
			.then(res => {
				console.log(`statusCode: ${res.status}`);
				console.log(res.data);
				// console.log(res.data.data);
				res.data.data.forEach(async el => {
					axios
						.get(`https://dummyapi.io/data/v1/user/${el.id}`, {
							headers: {
								'app-id': "62dd0da3d286d10fdfde96dc"
							}
						})
						.then(res => {
							console.log(`statusCode: ${res.status}`);
							console.log(res.data);
							writePostRow(res.data, "usersFull")
						})
						.catch(error => {
							console.error(error);
						})
				});
			})
			.catch(error => {
				console.error(error);
			});
	}
}

run();
//
// axios
// 	.get('https://dummyapi.io/data/v1/user', {
// 		params: {
// 			limit: 5,
// 			page: 1
// 		},
// 		headers: {
// 			'app-id': "62dd0da3d286d10fdfde96dc"
// 		}
// 	})
// 	.then(res => {
// 		console.log(`statusCode: ${res.status}`);
// 		console.log(res.data);
// 		// console.log(res.data.data);
// 		res.data.data.forEach(async el => {
// 			axios
// 				.get(`https://dummyapi.io/data/v1/user/${el.id}`, {
// 					headers: {
// 						'app-id': "62dd0da3d286d10fdfde96dc"
// 					}
// 				})
// 				.then(res => {
// 					console.log(`statusCode: ${res.status}`);
// 					console.log(res.data);
// 				})
// 				.catch(error => {
// 					console.error(error);
// 				})
// 		});
//
// 	})
// 	.catch(error => {
// 		console.error(error);
// 	});