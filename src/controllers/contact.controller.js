import nodemailer from "nodemailer";
import __dirname from "../tools/utils.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
    }
})

export default class ContactController {

    sendContactMail = async (req, res, next) => {//post
        const { name, email, tel, subject, message } = req.body;
        try {
            const telephone = !tel ? "Sin datos" : tel

            await transport.sendMail({
                from: `Coder Test ${process.env.MAILER_USER}`,
                to: process.env.MAILER_USER,
                subject: `${name} envió una consulta.`,
                html: `
            <div>
            <h1>Asunto: ${subject}</h1>
            <p>Mensaje: ${message}</p>
            <h3>Información del contacto:</h3>
            <p>Nombre: ${name}</p>
            <p>E-mail: ${email}</p>
            <p>Teléfono: ${telephone}</p>
            <img src="cid:logo" style="width: 300px"/>
            </div>
            `,
                attachments: [{
                    filename: "logo.jpg",
                    path: `${__dirname}/logo.jpg`,
                    cid: "logo"
                }]
            });
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }
}