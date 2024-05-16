import UsersDTO from "../DTO/usersDTO.js";

export default class UserService {
    constructor(repository) {
        this.userRepo = repository;
    }

    async getAllUsersFiltered() {
        const result = await this.userRepo.getAllUsersFiltered();
        return result;
    }

    async getUser(id) {
        const result = await this.userRepo.getUser(id);
        return result;
    }

    async getUserById(id) {
        const result = await this.userRepo.getUserById(id);
        return result;
    }

    async saveUser(user) {
        const newUser = new UsersDTO(user);
        newUser["password"] = user.password
        const result = await this.userRepo.saveUser(newUser);
        return result;
    }

    async updateUser(email, password) {
        const result = await this.userRepo.updateUser(email, password);
        return result;
    }

    async userVerification(email) {
        await this.userRepo.userVerification(email);
        return
    }

    async premiumSelector(email, userType) {
        await this.userRepo.premiumSelector(email, userType);
        return
    }

    async deleteUser(id) {
        await this.userRepo.deleteUser(id);
        return;
    }

    async updateField(id, keyToUpdate, valueToUpdate) {
        await this.userRepo.updateField(id, keyToUpdate, valueToUpdate);
        return;
    }
};