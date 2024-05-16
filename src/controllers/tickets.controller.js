import mailer from "../tools/mailer.js";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import { generateCartErrorInfo } from "../tools/customErrors/info.js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import getEnvironment from "../config/process.config.js";

const env = getEnvironment();

export default class TicketsController {
    constructor(ticketsService, cartsService) {
        this.ticketsService = ticketsService;
        this.cartsService = cartsService;
    }

    createPreference = async (req, res, next) => {
        const { cid } = req.params;
        const purchaserEmail = req.user.email;
        try {
            const cart = await this.cartsService.getCartById(cid);
            if (cart === null) {
                CustomError.createError({
                    message: `Carrito ID: ${cid} no encontrado.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }
            const preferenceItems = await this.ticketsService.preferenceItems(cart);
            if (preferenceItems !== null) {
                const body = {
                items: preferenceItems,
                back_urls: {
                    "success": "https://528b-2803-9800-9802-502e-28d4-c62d-63d-de01.ngrok-free.app/api/tickets/success",
                    "failure": "https://f929-2803-9800-9802-502e-28d4-c62d-63d-de01.ngrok-free.app/api/tickets/failure",
                    "pending": "https://f929-2803-9800-9802-502e-28d4-c62d-63d-de01.ngrok-free.app/api/tickets/pending"
                },
                auto_return: "approved",
                excluded_payment_types: [
                    {
                        id: "ticket"
                    }
                ],
                external_reference: purchaserEmail,
            }

            const client = new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN, options: { timeout: 5000 } })
            const preference = new Preference(client);
            const result = await preference.create({ body });
            return res.status(200).send({ id: result.id })
            }
            CustomError.createError({
                message: `Ups! no hay ningún producto disponible para procesar.`,
                cause: generateCartErrorInfo(),
                code: TErrors.NOT_FOUND,
            });
        } catch (error) {
            next(error)
        }
    }

    getUserTickets = async (req, res, next) => {
        const { userEmail } = req.params;
        try {
            const userTickets = await this.ticketsService.getUserTickets(userEmail);
            if (userTickets === null || userTickets.length === 0) {
                CustomError.createError({
                    message: "Aún No existen tickets.",
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send(userTickets);
        } catch (error) {
            next(error)
        }
    }

    orderSuccess = async (req, res, next) => {
        const { payment_id, status, payment_type, external_reference } = req.query;
        try {
            if (status === "approved") {
                await this.ticketsService.purchaseTicket(external_reference, status, payment_id, payment_type);
                await mailer({ mail: external_reference, name: "usuario" }, "Compra confirmada!. podés ver el ticket en el apartado dentro de tu carrito.")
                res.status(200).redirect("http://localhost:5173");
            }
        } catch (error) {
            next(error)
        }
    }

}