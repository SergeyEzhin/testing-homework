import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import events from '@testing-library/user-event'
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Application } from '../../src/client/Application';
import { CartApi, ExampleApi } from '../../src/client/api';
import { initStore } from '../../src/client/store';
import { server } from '../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Общие требования', () => {
    it('Название магазина должно быть ссылкой на главную страницу', () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const store = initStore(api, cart);
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        const { getByTestId } = render(application);

        const logoElement = getByTestId("logo");
        expect(logoElement).toBeInTheDocument();

        const hrefValue = logoElement.getAttribute("href");
        expect(hrefValue).toEqual("/");
    });

    it('При выборе элемента из меню "гамбургера", меню должно закрываться', () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const store = initStore(api, cart);
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const burgerButton = screen.getByLabelText("Toggle navigation");
        fireEvent.click(burgerButton);

        const menuItem = screen.getByRole("link", {name: "Catalog"});
        fireEvent.click(menuItem);

        const menu = screen.getByTestId("menu");

        const isHaveCollapseClass = menu.classList.contains("collapse");
        expect(isHaveCollapseClass).toBeTruthy();
    });

    it('В шапке должны отображаться ссылки на страницы магазина, а также ссылка на корзину', () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const store = initStore(api, cart);
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const menu = screen.getByTestId("menu");
        expect(menu).toBeInTheDocument();

        const catalogLink = screen.getByRole("link", {name: "Catalog"});
        expect(catalogLink).toBeInTheDocument();

        const deliveryLink = screen.getByRole("link", {name: "Delivery"});
        expect(deliveryLink).toBeInTheDocument();

        const contactsLink = screen.getByRole("link", {name: "Contacts"});
        expect(contactsLink).toBeInTheDocument();

        const cartLink = screen.getByTestId("cart-link");
        expect(cartLink).toBeInTheDocument();
    });
});

// Каталог
describe('Проверка каталога', () => {
    it('Товар при добавлении должен появляться в корзине', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const catalogLink = screen.getByRole("link", {name: "Catalog"});
        fireEvent.click(catalogLink);

        await waitFor(() => {
            const firstProduct = screen.getByTestId("1");
            expect(firstProduct).toBeInTheDocument();
        });

        const firstProduct = screen.getByTestId("1");
        const cardLink = firstProduct.querySelector(".card-link");
        fireEvent.click(cardLink);

        await waitFor(() => {
            const productPage = screen.queryByTestId("product-page");
            expect(productPage).toBeInTheDocument();
        });

        const btnAddCart = screen.getByTestId("button-add-cart");
        fireEvent.click(btnAddCart);

        const cartState = cart.getState();

        expect(cartState).toHaveProperty("1");
        expect(cartState).toHaveProperty("1", expect.objectContaining({
            name: expect.any(String),
            price: expect.any(Number),
            count: expect.any(Number)
        }));
    });

    it('При добавлении одного и того же товара его количество должно увеличиваться в корзине', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const initialState = {
            1: {
                name: "Product 1",
                price: 300,
                count: 1,
            }
        }

        const cart = new CartApi();
        cart.setState(initialState);
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const cartState = cart.getState();
        const count = cartState["1"].count;
        const catalogLink = screen.getByRole("link", {name: "Catalog"});
        fireEvent.click(catalogLink);

        await waitFor(() => {
            const firstProduct = screen.getByTestId("1");
            expect(firstProduct).toBeInTheDocument();
        });

        const firstProduct = screen.getByTestId("1");
        const cardLink = firstProduct.querySelector(".card-link");
        fireEvent.click(cardLink);

        await waitFor(() => {
            const productPage = screen.queryByTestId("product-page");
            expect(productPage).toBeInTheDocument();
        });

        const btnAddCart = screen.getByTestId("button-add-cart");
        fireEvent.click(btnAddCart);

        const updatedCartState = cart.getState();
        const newCount = updatedCartState["1"].count;

        expect(newCount).toBe(count + 1);
    });

    it('Если товар уже добавлен в корзину, в каталоге и на странице товара должно отображаться сообщение об этом', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const initialState = {
            1: {
                name: "Product 1",
                price: 300,
                count: 1,
            }
        }

        const cart = new CartApi();
        cart.setState(initialState);
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const catalogLink = screen.getByRole("link", {name: "Catalog"});
        fireEvent.click(catalogLink);

        await waitFor(() => {
            const firstProduct = screen.getByTestId("1");
            expect(firstProduct).toBeInTheDocument();
        });

        const firstProduct = screen.getByTestId("1");

        const badgeCatalog = firstProduct.querySelector(".CartBadge");
        expect(badgeCatalog).toBeInTheDocument();

        const textBadgeCatalog = badgeCatalog.innerHTML;
        expect(textBadgeCatalog).toBe("Item in cart");

        const cardLink = firstProduct.querySelector(".card-link");
        fireEvent.click(cardLink);

        await waitFor(() => {
            const productPage = screen.queryByTestId("product-page");
            expect(productPage).toBeInTheDocument();
        });

        const productPage = screen.queryByTestId("product-page");

        const badgeProduct = productPage.querySelector(".CartBadge");
        expect(badgeProduct).toBeInTheDocument();
        
        const textBadgeProduct = badgeProduct.innerHTML;
        expect(textBadgeProduct).toBe("Item in cart");
    });
});

// Продукт
describe('Проверка страницы продукта', () => {
    it('Кнопка "Добавить в корзину" должна иметь класс "btn-lg", но не должна иметь "btn-sm"', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const store = initStore(api, cart);
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const catalogLink = screen.getByRole("link", {name: "Catalog"});
        fireEvent.click(catalogLink);

        await waitFor(() => {
            const firstProduct = screen.getByTestId("1");
            expect(firstProduct).toBeInTheDocument();
        });

        const firstProduct = screen.getByTestId("1");
        const cardLink = firstProduct.querySelector(".card-link");
        fireEvent.click(cardLink);

        await waitFor(() => {
            const productPage = screen.queryByTestId("product-page");
            expect(productPage).toBeInTheDocument();
        });

        const btnAddCart = screen.getByTestId("button-add-cart");

        const isHaveLgClass = btnAddCart.classList.contains('btn-lg');
        expect(isHaveLgClass).toBeTruthy();

        const isHaveSmClass = btnAddCart.classList.contains('btn-sm');
        expect(isHaveSmClass).toBeFalsy();
    });
});

// Корзина
describe('Проверка корзины', () => {
    it('Проверка валидности телефона в форме на странице корзины', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const initialState = {
            0: {
                name: "Example name 1",
                price: 500,
                count: 3,
            }
        }

        const cart = new CartApi();
        cart.setState(initialState);
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const linkCart = screen.getByTestId("cart-link");
        fireEvent.click(linkCart);

        await waitFor(() => {
            const phoneField = screen.getByTestId("phone-field");
            expect(phoneField).toBeInTheDocument();
        });

        const phoneField = screen.getByTestId("phone-field");

        fireEvent.change(phoneField, {target: {value: "123 456 7890"}});
        fireEvent.click(screen.getByRole("button", {name: "Checkout"}));

        const isInvalidClass = phoneField.classList.contains("is-invalid");
        expect(isInvalidClass).toBeFalsy();
    });

    it('Ссылка на корзину хранит количество не повторяющихся товаров в ней', () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const initialState = {
            0: {
                name: "Example name 1",
                price: 500,
                count: 3,
            },
            1: {
                name: "Example name 2",
                price: 300,
                count: 4,
            }
        }

        const cart = new CartApi();
        cart.setState(initialState);
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const regex = /\((\d+)\)/;
        const linkCart = screen.getByTestId("cart-link");
        const text = linkCart.innerHTML;
        const match = text.match(regex);

        const amountGoods = parseInt(match[1], 10); 
        const countUniqueGoods = Object.keys(cart.getState()).length;

        expect(amountGoods).toBe(countUniqueGoods);
    });

    it('В пустой корзине должна отображаться ссылка на каталог товаров', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        cart.setState({});
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const linkCart = screen.getByTestId("cart-link");
        fireEvent.click(linkCart);

        await waitFor(() => {
            const cartPage = screen.getByTestId("cart-page");
            expect(cartPage).toBeInTheDocument();
        });

        const linkCatalog = screen.getByRole("link", {name: "catalog"});
        expect(linkCatalog).toBeInTheDocument();

        const hrefLinkCatalog = linkCatalog.getAttribute('href');
        expect(hrefLinkCatalog).toBe("/catalog");
    });

    it('В корзине с товарами должна быть кнопка "Очистить корзину" и при ее нажатии товары должны удаляться', () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const initialState = {
            0: {
                name: "Example name 1",
                price: 500,
                count: 3,
            },
            1: {
                name: "Example name 2",
                price: 300,
                count: 4,
            }
        }
        
        cart.setState(initialState);
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const linkCart = screen.getByTestId("cart-link");
        fireEvent.click(linkCart);

        waitFor(() => {
            const cartPage = screen.getByTestId("cart-page");
            expect(cartPage).toBeInTheDocument();
        });

        const btnClearCart = screen.getByRole("button", {name: "Clear shopping cart"});
        expect(btnClearCart).toBeInTheDocument();

        fireEvent.click(btnClearCart);

        const cartState = cart.getState();
        const amountGoods = Object.keys(cartState).length;

        expect(amountGoods).toBe(0);
    });

    it('При оформлении заказа должна очищаться корзина и сообщение о заказе должно быть зеленого цвета', async () => {
        const basename = '/hw/store';
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const initialState = {
            1: {
                name: "Product 1",
                price: 300,
                count: 3,
            }
        }
        
        cart.setState(initialState);
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );

        render(application);

        const linkCart = screen.getByTestId("cart-link");
        fireEvent.click(linkCart);

        await waitFor(() => {
            const cartPage = screen.getByTestId("cart-page");
            expect(cartPage).toBeInTheDocument();
        });

        const phoneField = screen.getByTestId("phone-field");
        fireEvent.change(phoneField, {target: {value: "123 456 7890"}});

        const nameField = screen.getByTestId("name-field");
        fireEvent.change(nameField, {target: {value: "Name"}});

        const addressField = screen.getByTestId("address-field");
        fireEvent.change(addressField, {target: {value: "Address"}});

        const btnCheckout = screen.getByRole("button", {name: "Checkout"});
        await events.click(btnCheckout);

        const cartState = cart.getState();
        const amountGoods = Object.keys(cartState).length;

        expect(amountGoods).toBe(0);

        const alertSuccess = screen.getByTestId("alert-success");

        const isHaveSuccessClass = alertSuccess.classList.contains("alert-success");
        expect(isHaveSuccessClass).toBeTruthy();

        const isHaveDangerClass = alertSuccess.classList.contains("alert-danger");
        expect(isHaveDangerClass).toBeFalsy();
    });
});