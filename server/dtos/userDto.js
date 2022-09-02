module.exports = class UserDto {
	firstName;
	lastName;
	email;
	id;

	constructor(model) {
		this.id = model._id;
		this.firstName = model.firstName;
		this.lastName = model.lastName;
		this.email = model.email;
	}

}