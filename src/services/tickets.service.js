export default class TicketsService {
    constructor(repository) {
        this.ticketsRepo = repository;
    }

    async saveTicket(ticket) {
        try {
            const newTicket = await this.ticketsRepo.saveTicket(ticket)
            return newTicket;
        } catch (error) {
            throw error;
        }
    };

    preferenceItems = async (cart) => {
        const result = await this.ticketsRepo.preferenceItems(cart);
        return result;
    };

    purchaseTicket = async (email, status, paymentId, paymentType) => {
        const result = await this.ticketsRepo.purchaseTicket(email, status, paymentId, paymentType);
        return result;
    };

    getUserTickets = async (userEmail) => {
        const result = await this.ticketsRepo.getUserTickets(userEmail);
        return result;
    };
};