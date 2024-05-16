export default class LoggerTestController {

    logTest = async (req, res, next) => {
        try {
            req.logger.debug("Debug");//en modo development, log en consola desde debug level en adelante
            req.logger.http("Http Event");
            req.logger.info("Info log");//en modo production, log n consola desde info level en adelante
            req.logger.warning("Warning error");
            req.logger.error("Error Log");//log en archivo errors.log, desde error level en adelante, los dos modos
            req.logger.fatal("Fatal Error!!!");
            res.status(200).send("Testing Winston Logger");
        } catch (error) {
            next(error)
        }
    }
}