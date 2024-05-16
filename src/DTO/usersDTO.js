export default class UsersDTO {
    constructor(user) {
        this.firstName = user.firstName === undefined ? "no data" : user.firstName;
        this.lastName = user.lastName === undefined ? "no data" : user.lastName;
        this.email = user.email;
        this.cart = user.cart._id === undefined ? user.cart : user.cart._id;
        this.idgoogle = user.idgoogle === undefined ? null : user.idgoogle;
        this.idgithub = user.idgithub === undefined ? null : user.idgithub;
        this.verified = user.verified === undefined ? false : user.verified;
        this.avatar = user.avatar;
    }
}