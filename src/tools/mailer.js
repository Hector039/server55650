import nodemailer from "nodemailer";
import __dirname from "./utils.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
    }
})

export default async function mailer(user, message) {
    try {
        if(!user.name || !user.mail || !message) return "Error o falta de datos de usuario. No se envió el email."
        await transport.sendMail({
            from: `Coder Test ${process.env.MAILER_USER}`,
            to: user.mail,
            subject: `Tenemos noticias ${user.name}!`,
            html: `
            <div>
            <h1>${message}</h1>
            <div>
            <img src="cid:logo" style="width: 300px"/>
            </div>
            </div>
            `,
            attachments: [{
                filename: "logo.jpg",
                path: `${__dirname}/logo.jpg`,
                cid: "logo"
            }] 
        });
        return;
    } catch (error) {
        throw error;
    }
}
