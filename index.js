const puppeteer = require("puppeteer");
const express = require("express");

const cors = require("cors");

require("dotenv").config();

const { dbConnection } = require("./database/config");

// create exress app
const app = express();

app.use(cors());


// db connection
dbConnection();

// Routes
app.get("/", (req, res) => {
  res.json({
    ok: true,
    msg: "Products",
  });
});

app.listen(process.env.PORT, () => {
  console.log("server started on port 3000");
});

async function getProducts() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 390,
      height: 844,
      isMobile: true,
    },
  });
  const page = await browser.newPage();
  await page.goto("https://www.hiperdino.es");
  const categories =
    "ul.category__list li.sidebar-item--wrapper a.link--wrapper";
  page.waitForSelector(categories);
  const categoriesList = await page.$$eval(categories, (categories) =>
    categories.map((category) => {
      const cat = {
        name: category.href.split("/").pop().slice(0, -5),
        url: category.href,
      };
      return cat;
    })
  );

  //pop first element
  categoriesList.shift();
  const allProducts = [];

  for (let i = 0; i < categoriesList.length / 2; i++) {
    console.log(categoriesList[i]);
    var cat = categoriesList[i].name;
    console.log(cat);
    await page.goto(categoriesList[i].url);
    await page.waitForSelector("ul.products-list");
    const products = await page.$$eval(
      "ul.products-list li.product-list-item",
      (products) =>
        products.map((product) => {
          const pr = {
            super: "Hiperdino",
            cat: this.cat,
            name: product.querySelector(".description__text").innerText,
            img: product.querySelector("img").dataset.src,
            price: product.querySelector(".price__text").innerText,
          };
          return pr;
        })
    );
    allProducts.push(...products);
  }
  browser.close();
  console.log(allProducts);
}
