const axios = require('axios');
const {MongoClient} = require('mongodb');

function randomInt(min, max) {
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}

async function updateUserRow(row) {
	const url = 'mongodb://0.0.0.0:27017';
	const client = new MongoClient(url);
	const dbName = 'allconnect';
	await client.connect();
	console.log('Connected successfully to server');
	const db = client.db(dbName);
	const collection = db.collection("users");
	await collection.updateOne({'_id': row._id}, {'$set': row});

	const collection2 = db.collection("usersFull");
	await collection2.updateOne({'_id': row._id}, {'$set': row});
	return 'done.';
}

async function getUsers() {
	const url = 'mongodb://0.0.0.0:27017';
	const client = new MongoClient(url);
	const dbName = 'allconnect';
	await client.connect();
	console.log('Connected successfully to server');
	const db = client.db(dbName);
	const collection = db.collection("users");
	return collection.find({}).toArray();
}

const users = [];
const usersId = [];

getUsers()
	.then(res => res.forEach(el => {
		users.push(el);
		usersId.push(el._id)
	}))
	.then(() => {
		users.forEach(el => {
			let friends = [];
			const friendsCount = randomInt(0, 50);
			let usersIdsLocal = JSON.parse(JSON.stringify(usersId));
			// убираем самого себя
			for(let i = 0; i < usersIdsLocal.length; i++){
				if (usersIdsLocal[i] === el._id) {
					usersIdsLocal.splice(i, 1);
					break;
				}
			}

			for (let i = 0; i < friendsCount; i++) {
				let friendNum = randomInt(0, usersIdsLocal.length - 1);
				friends.push(usersIdsLocal[friendNum]);
				usersIdsLocal.splice(friendNum, 1);
			}
			el.friends = friends;
			console.log(friends, friends.length);
		})
	})
	.then(() =>  users.forEach(el => {
		updateUserRow(el).then(r => console.log(r));
	}));
