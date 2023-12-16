const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFacotry = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFacotry();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session});
    await this.page.setCookie({ name: 'session.sig', value: sig});

    while (true) {
      try {
        await this.page.waitFor('a[href="/auth/logout"]', {
          timeout: 150
        });
        break;
      } catch(err) {
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.reload();
        continue;
      }
    }
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  async get(path) {
    while (true) {
      try {
        await this.page.waitFor('a[href="/auth/google"]', {
          timeout: 150
        });
        break;
      } catch(err) {
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.reload();
        continue;
      }
    }

    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    }, path);
  }

  async post(path, data) {
    while (true) {
      try {
        await this.page.waitFor('a[href="/auth/google"]', {
          timeout: 150
        });
        break;
      } catch(err) {
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.reload();
        continue;
      }
    }
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;