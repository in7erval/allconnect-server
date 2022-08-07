const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
		firstName: {type: String, required: true},
		lastName: {type: String, required: true},
		friends: [{type: Schema.Types.ObjectId, ref: 'User', unique: true}],
		picture: String,
		pictureBuf: Buffer,
		email: String,
		gender: {
			type: String,
			enum: {
				values: ['male', 'female'],
				message: '{VALUE} is not supported'
			}
		},
		dateOfBirth: Date
	},
	{
		timestamps: {
			createdAt: 'registerDate',
			updatedAt: 'updatedDate'
		}
	});

UsersSchema.virtual('fullName')
	.get(function () {
		return `${this.firstName} ${this.lastName}`
	})
	.set(function (value, virtual, doc) {
		const parts = value.split(' ');
		this.firstName = parts[0].trim();
		this.lastName = parts[1].trim();
	})
;

module.exports = mongoose.model('User', UsersSchema);


