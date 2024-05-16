import TErrors from "../tools/customErrors/enum.js";

export default (error, req, res, next) => {
    switch (error.code) {
        case TErrors.INVALID_TYPES:
            res.status(400).json({
                message: error.message,
                code: error.code,
                cause: error.cause,
            });
            break;
        case TErrors.DATABASE:
            res.status(500).json({
                message: error.message,
                code: error.code,
                cause: error.cause,
            });
            break;

        case TErrors.ROUTING:
            res.status(404).json({
                name: error.name,
                message: error.message,
                code: error.code,
                cause: error.cause,
            });
            break;

        case TErrors.NOT_FOUND:
            res.status(404).json({
                message: error.message,
                code: error.code,
                cause: error.cause,
            });
            break;

        case TErrors.CONFLICT:
            res.status(409).json({
                message: error.message,
                code: error.code,
                cause: error.cause,
            });
            break;

        default:
            res.status(500).json({
                message: "Error inesperado",
                code: 0,
                cause: error.message,
            });
            break;
    }
};