export default class UsersRepository {
    constructor(model) {
        this.usersModel = model;
    }

    getAllUsersFiltered = async () => {
        const users = await this.usersModel.find({}).lean();
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
    };

    getUser = async (id) => {
        let user = await this.usersModel.findOne({ $or: [{ email: id }, { idgoogle: id }, { idgithub: id }] }).populate("cart").lean();
        return user;
    };

    getUserById = async (id) => {
        const userById = await this.usersModel.findById(id).populate("cart").lean();
        return userById
    };

    saveUser = async (user) => {
        let newUser = new this.usersModel(user);
        let result = await newUser.save();
        return result;
    };

    updateUser = async (email, toUpdate) => {
        const user = await this.usersModel.findOneAndUpdate({ email: email }, { password: toUpdate });
        return user;
    };

    userVerification = async (email) => {
        await this.usersModel.findOneAndUpdate({ email: email }, { verified: true });
        return
    };

    premiumSelector = async (email, userType) => {
        await this.usersModel.findOneAndUpdate({ email: email }, { role: userType });
        return
    };

    deleteUser = async (id) => {
        await this.usersModel.findOneAndDelete({ _id: id });
        return;
    };

    updateField = async (id, keyToUpdate, valueToUpdate) => {
        const user = await this.getUserById(id)
        let obj = {};
        if (keyToUpdate === "documents") {
            const docsExists = user.documents.find(doc => doc.name === valueToUpdate.name);
            if (!docsExists) await this.usersModel.findByIdAndUpdate(user._id, { $push: { documents: { name: valueToUpdate.name, reference: valueToUpdate.reference } } });
            return
        }
        obj[keyToUpdate] = valueToUpdate;
        await this.usersModel.findOneAndUpdate({ _id: id }, obj);
        return;
    };

}