const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000/blogs', {
    waituntil: 'domcontentloaded',
  });
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'my test title');
      await page.type('.content input', 'my test content');
      await page.click('form button');
    });
    test('Submitting takes user to review screen', async ()=> {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async ()=> {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('my test title');
      expect(content).toEqual('my test content');
    });
  });

  describe('when logged in and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

// describe('User is not logged in', async () => {
//   test('User cannot create blog posts', async () => {
//     // while (true) {
//     //   try {
//     //     await page.waitFor('a[href="/auth/google"]', {
//     //       timeout: 150
//     //     });
//     //     break;
//     //   } catch(err) {
//     //     await page.goto('localhost:3000/blogs');
//     //     await page.reload();
//     //     continue;
//     //   }
//     // }
//     // const result = await page.evaluate(() => {
//     //   return fetch('/api/blogs', {
//     //     method: 'POST',
//     //     credentials: 'same-origin',
//     //     headers: {
//     //       'Content-Type': 'application/json'
//     //     },
//     //     body: JSON.stringify({ "title": 'My Title', "content": 'My Content' })
//     //   }).then(res => res.json());
//     // });

//     const result = await page.post('/api/blogs', { "title": 'My Title', "content": 'My Content' });
//     expect(result).toEqual({ error: 'You must log in!' })
//   });

//   test('User cannot get a list of posts', async () => {
//     // while (true) {
//     //   try {
//     //     await page.waitFor('a[href="/auth/google"]', {
//     //       timeout: 150
//     //     });
//     //     break;
//     //   } catch(err) {
//     //     await page.goto('localhost:3000/blogs');
//     //     await page.reload();
//     //     continue;
//     //   }
//     // }
//     // const result = await page.evaluate(
//     //   () => {
//     //     return fetch('/api/blogs', {
//     //       method: 'GET',
//     //       credentials: 'same-origin',
//     //       headers: {
//     //         'Content-Type': 'application/json'
//     //       },
//     //     }).then(res => res.json());
//     //   }
//     // );
//     const result = await page.get('/api/blogs');
//     expect(result).toEqual({ error: 'You must log in!' });
//   });
// });

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
