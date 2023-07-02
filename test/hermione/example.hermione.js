const { assert } = require('chai');

// describe('microsoft', async function() {
// 	it('Тест, который пройдет', async function() {
// 		await this.browser.url('https://www.microsoft.com/ru-ru/');
// 		await this.browser.assertView('plain', 'header');

// 		const title = await this.browser.$('#uhfLogo').getText();
// 		assert.equal(title, 'Microsoft');
// 	});
// });

describe('Проверка адаптивной верстки', async function() {
	it("При ширине экрана меньше 576px должна появляться burger кнопка и меню должно скрываться", async ({ browser }) => {
		const puppeteer = await browser.getPuppeteer();
		const [ page ] = await puppeteer.pages();

		await page.goto("http://localhost:3000/hw/store");
		await browser.pause(1000);
		await this.browser.assertView('plain', 'nav');
  });
});