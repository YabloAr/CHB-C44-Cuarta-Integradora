import cartsService from "./carts.service.js";
import TicketDTO from "../models/DTO/ticket.dto.js";
import ticketsDao from "../models/daos/tickets.dao.js"
import productsDao from "../models/daos/products.dao.js";

class TicketService {

    getAll = async (user, cid) => {
        const response = await ticketsDao.getAll()
        return response
    }

    createTicket = async (user, cid) => {
        try {
            const thisCart = await cartsService.getCartById(cid);
            if (!thisCart) return { error: 'Cart id not found.' };
            if (thisCart.products.length === 0) return { error: 'Cart its empty' };

            //--------------Inicia ciclo FOR 
            const cartFilterOutStock = [];
            const productsForTicket = [];
            let totalPrice = 0;
            for (const { product, quantity } of thisCart.products) {

                //Si no hay stock
                if (product.stock < quantity) {
                    cartFilterOutStock.push({
                        product: product,
                        quantity: quantity
                    })
                } else {
                    //Si hay stock
                    const remainingStock = product.stock - quantity;
                    totalPrice += product.price * quantity;

                    await productsDao.updateProduct(product._id, { stock: remainingStock })

                    productsForTicket.push({
                        product: {
                            _id: product._id,
                            title: product.title,
                            price: product.price,
                        },
                        quantity,
                    });
                }
            }
            //--------------Termina ciclo FOR

            //Validamos si al menos un producto fue comprado
            if (productsForTicket.length === 0) {
                return {
                    status: 204,
                    warning: 'no content',
                    message: "No se pudo comprar ningun producto por falta de stock"
                }
            } else {
                //Actualizamos valores del carrito de entrada
                thisCart.products = cartFilterOutStock;
                //Procedemos a realizar la compra
                const newTicket = new TicketDTO(totalPrice, user.email)
                const ticketResponse = await ticketsDao.createTicket(newTicket)
                const updatedCart = await cartsService.replaceProducts(cid, thisCart.products)

                //No escencial
                const info = {
                    status: 200,
                    purchasedItems: productsForTicket,
                    ticket: ticketResponse,
                    remainingCart: updatedCart
                };
                return info;
            }
        } catch (error) {
            throw error
        }
    }
}

export default new TicketService