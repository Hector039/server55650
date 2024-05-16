export const generateUserErrorInfo = (user) => {
    if(!user) return "Usuario inexistente en la base de datos."
    return `Uno o más campos faltan o son inválidos.  * firstName: se recibió ${user.firstName} * lastName: se recibió ${user.lastName} * email: Debe existir, se recibió ${user.email} * password: debe al menos 3 carácteres alfanuméricos, se recibió ${user.password}`;
};

export const generateProductErrorInfo = (product) => {
    if(!product) return "Producto inexistente en la base de datos."
    return `Uno o más campos faltan o son inválidos. * title: se recibió ${product.title} * description: se recibió ${product.description} * code: El código debe ser único, se recibió ${product.code} * price: se recibió ${product.price} * stock: se recibió ${product.stock} * category: se recibió ${product.category} * status: se recibió ${product.status}`;
};

export const generateCartErrorInfo = () => {
    return `Uno o más campos faltan o son inválidos. * Carrito inxistente. * Producto no encontrado en el carrito. * No se recibió cantidad. * No se recibió fecha de compra`;
};