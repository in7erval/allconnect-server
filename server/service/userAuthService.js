const UserAuth = require('../models/userAuth');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mailService');
const tokenService = require('./tokenService');
const UserDto = require('../dtos/userDto');
const ApiError = require('../exceptions/apiError');

const Logging = require('../logging/index');
const console = new Logging(__filename);

class UserAuthService {

	async registration(email, password, firstName, lastName) {
		const candidate = await UserAuth.findOne({email: email.toString()});

		console.debug(candidate);

		if (candidate) {
			throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
		}
		const hashPassword = await bcrypt.hash(password, 3);
		const activationLink = uuid.v4();
		const user = await User.create({
			firstName: firstName.toString(),
			lastName: lastName.toString(),
			email: email.toString()
		});

		await UserAuth.create({
			email: email.toString(),
			password: hashPassword,
			activationLink,
			user: user._id
		});

		// await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

		const userDto = new UserDto(user); // id, email, isActivated

		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {...tokens, user: userDto};
	}

	// async activate(activationLink) {
	// 	const user = await UserAuth.findOne({activationLink});
	// 	if (!user) {
	// 		throw ApiError.BadRequest('Некорректная ссылка активации');
	// 	}
	// 	user.isActivated = true;
	// 	await user.save();
	// }

	async login(email, password) {
		const user = await UserAuth.findOne({email: email.toString()}).populate('user');
		if (!user) {
			throw ApiError.BadRequest(`Пользователь с email ${email} не найден`);
		}
		const isPassEquals = await bcrypt.compare(password, user.password);
		if (!isPassEquals) {
			throw ApiError.BadRequest('Неверный пароль');
		}
		const userDto = new UserDto(user.user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {...tokens, user: userDto};
	}

	async logout(refreshToken) {
		return tokenService.removeToken(refreshToken);
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			console.debug("refreshToken not found");
			throw ApiError.UnauthorizedError();
		}
		const userData = tokenService.validateRefreshToken(refreshToken);
		const tokenFromDB = await tokenService.findToken(refreshToken);
		if (!userData || !tokenFromDB) {
			console.debug("!userData || !tokenFromDb", userData, tokenFromDB);
			throw ApiError.UnauthorizedError();
		}
		console.debug("userData", userData);
		const user = await UserAuth.findOne({"user": userData.id}).populate('user');
		console.info("user", user);
		const userDto = new UserDto(user.user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {...tokens, user: userDto};

	}

}

module.exports = new UserAuthService();