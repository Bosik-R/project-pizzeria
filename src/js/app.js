import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import MainPage from './components/MainPage.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.hiddenElements = document.querySelectorAll(classNames.all.unactive);

    const idFromHash = window.location.hash.replace('#/', '');

    thisApp.defaultPage = thisApp.pages[0].id;
    let pageMatchingHash = thisApp.defaultPage;

    for (let page of thisApp.pages){
      if (page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    for (let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for (let elem of thisApp.hiddenElements){
      elem.classList.toggle(classNames.all.hidden, pageId == thisApp.defaultPage);
    }

    for (let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMainPage: function (){
    const thisApp = this;

    const elem = document.querySelector(select.containerOf.mainPage);

    thisApp.mainPage = new MainPage (elem);

    thisApp.subPages = document.querySelectorAll(classNames.pages.subPages);

    for (let subPage of thisApp.subPages){
      subPage.addEventListener('click', function(){
        const id = subPage.id;

        thisApp.activatePage(id);
      });
    }
    thisApp.logoLink = document.querySelector('.logo');

    thisApp.logoLink.addEventListener('click', function(){
      thisApp.activatePage(thisApp.pages[0].id);
    });
  },

  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function(){
    const thisApp = this;

    const bookingElem = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking (bookingElem);
  },

  init: function(){
    const thisApp = this;

    thisApp.initPages();
    thisApp.initMainPage();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
