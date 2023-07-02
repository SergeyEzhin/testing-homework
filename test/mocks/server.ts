import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { CheckoutResponse, Product, ProductShortInfo } from '../../src/common/types';
const basename = '/hw/store';

export const server = setupServer(
  rest.get<ProductShortInfo[]>(`${basename}/api/products`, async (req, res, ctx) => {
    // console.log('products');
    // Моковые данные
    const products = [
      { id: 1, name: 'Product 1', price: 300 },
      { id: 2, name: 'Product 2', price: 500 },
      { id: 3, name: 'Product 3', price: 1000 },
    ];
    
    return res(
      ctx.status(200),
      ctx.json(products)
    );
  }),
  
  // Обработчик для метода getProductById(id)
  rest.get<Product>(`${basename}/api/products/:id`, async (req, res, ctx) => {
    // console.log('product');
    const { id } = req.params;
    
    // Моковые данные для продукта с указанным id
    const product = {
      id: +id,
      name: `Product ${id}`,
      description: `Description ${id}`,
      price: 300,
      material: `Material ${id}`,
      color: `Color ${id}`
    };
    
    return res(
      ctx.status(200),
      ctx.json(product)
    );
  }),
  
  // Обработчик для метода checkout(form, cart)
  rest.post<CheckoutResponse>(`${basename}/api/checkout`, async (req, res, ctx) => {
    // console.log('checkout');
    // const { form, cart } = req.json();
    
    // Моковый ответ на запрос checkout()
    const response = {
      id: 'Example number',
    };
    
    return res(
      ctx.status(200),
      ctx.json(response)
    );
  })
);