import fs from "fs";

class User {
    constructor(id, firstName, lastName, email, password, role, idgoogle, idgithub, cart, verified, documents, last_connection, avatar) {
        this._id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.idgoogle = idgoogle;
        this.idgithub = idgithub;
        this.cart = cart;
        this.verified = verified;
        this.documents = documents;
        this.last_connection = last_connection
        this.avatar = avatar
    }
}

export default class UserService {
    #path;
    #ultimoId = 0;

    constructor() {
        this.#path = "src/dao/repository/fs/data/archivoUsers.json";
        this.#setUltimoId();
    }

    async getUser(emailOrId) {
        try {
            const users = await this.getAllUsers();
            const userByEmail = users.find(user => user.email === emailOrId);
            const userByGoogleId = users.find(user => user.idgoogle === emailOrId);
            const userByGithubId = users.find(user => user.idgithub === emailOrId);
            let user = null;
            if (userByEmail !== undefined) {
                user = userByEmail
                return user;
            }
            if (userByGoogleId !== undefined) {
                user = userByGoogleId
                return user;
            }
            if (userByGithubId !== undefined) {
                user = userByGithubId
                return user;
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const users = await this.getAllUsers();
            const userById = users.find(user => user._id === parseInt(id));
            return userById;
        } catch (error) {
            throw error;
        }
    }

    async guardarUsers(users) {
        try {
            await fs.promises.writeFile(this.#path, JSON.stringify(users));
        } catch (error) {
            throw error;
        }
    }

    async getAllUsersFiltered() {
        try {
            if (fs.existsSync(this.#path)) {
                const users = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
                const usersFilteredData = users.map(user => {
                    return { 
                        _id: user._id, 
                        firstName: user.firstName, 
                        lastName: user.lastName, 
                        email: user.email, 
                        role: user.role, 
                        verified: user.verified,
                        last_connection: user.last_connection
                    }
                })
                return usersFilteredData;
            }
            return [];
        } catch (error) {
            throw error;
        }
    }

    async getAllUsers() {
        try {
            if (fs.existsSync(this.#path)) {
                const users = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
                return users;
            }
            return [];
        } catch (error) {
            throw error;
        }
    }

    async saveUser({ firstName, lastName, email, password, idgoogle, idgithub, cart }) {
        try {
            const role = "user";
            const verified = false
            const last_connection = null;
            const avatar = "http://localhost:8080/userguest3.png";
            let documents = [];
            const users = await this.getAllUsers();

            const newUser = new User(
                ++this.#ultimoId,
                firstName,
                lastName,
                email,
                password,
                role,
                idgoogle,
                idgithub,
                cart,
                verified,
                documents,
                last_connection,
                avatar
            );
            users.push(newUser);
            await this.guardarUsers(users);
            return;
        } catch (error) {
            throw error;
        }
    }

    async updateUser(email, toUpdate) {
        try {
            const users = await this.getAllUsers();
            const userIndex = users.findIndex(user => user.email === email);
            if (userIndex < 0) throw new Error(`Usuario con email:${email} no encontrado`);
            users[userIndex].password = toUpdate;
            users.splice(userIndex, 1, users[userIndex]);
            await this.guardarUsers(users);
            const usersUpdated = await this.getAllUsers();
            const userIndexUpdated = usersUpdated.findIndex(user => user.email === email);
            return usersUpdated[userIndexUpdated];
        } catch (error) {
            throw error;
        }
    }

    async userVerification(email) {
        try {
            const users = await this.getAllUsers();
            const userIndex = users.findIndex(user => user.email === email);
            if (userIndex < 0) throw new Error(`Usuario con email:${email} no encontrado`); 0
            users[userIndex].verified = true;
            users.splice(userIndex, 1, users[userIndex]);
            await this.guardarUsers(users);
            return
        } catch (error) {
            throw error;
        }
    }

    async premiumSelector(email, userType) {
        try {
            const users = await this.getAllUsers();
            const userIndex = users.findIndex(user => user.email === email);
            if (userIndex < 0) throw new Error(`Usuario con email:${email} no encontrado`);
            users[userIndex].role = userType;
            users.splice(userIndex, 1, users[userIndex]);
            await this.guardarUsers(users);
            return
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            const users = await this.getAllUsers();
            const userIndex = users.findIndex(user => user._id === parseInt(id));
            if (userIndex < 0) throw new Error(`Usuario con id:${id} no encontrado`);
            users.splice(userIndex, 1);
            await this.guardarUsers(users);
            return
        } catch (error) {
            throw error;
        }
    }

    async updateField(id, keyToUpdate, valueToUpdate) {
        try {
            const users = await this.getAllUsers();
            const userIndex = users.findIndex(user => user._id === parseInt(id));
            if (keyToUpdate === "documents") {
                    const docsExists = users[userIndex].documents.find(doc => doc.name === valueToUpdate.name);
                    if (!docsExists) users[userIndex].documents.push(valueToUpdate);
                    await this.guardarUsers(users);
                    return;
            }
            users[userIndex][keyToUpdate] = valueToUpdate;
            await this.guardarUsers(users);
            return
        } catch (error) {
            throw error;
        }
    }

    async #setUltimoId() {
        try {
            const users = await this.getAllUsers();
            if (users.length < 1) {
                this.#ultimoId = 0;
                return;
            }
            this.#ultimoId = users[users.length - 1]._id;
        } catch (error) {
            throw error;
        }
    }
}