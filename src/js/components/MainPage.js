import {templates, classNames} from '../settings.js';
import utils from '../utils.js';

class MainPage{
  constructor(wrapper){
    const thisMainPage = this;

    thisMainPage.renderMainPage(wrapper);
    thisMainPage.renderCarousel();
  }

  renderMainPage(wrapper){
    const thisMainPage = this;

    thisMainPage.wrapper = wrapper;

    const generateHTML = templates.mainPage();
    thisMainPage.wrapper.appendChild(utils.createDOMFromHTML(generateHTML));
  }

  renderCarousel(){
    let slideIndex = 0;
    showSlides();

    function showSlides() {
      let i;
      const slides = document.querySelectorAll(classNames.carousel.comments);
      const dots = document.querySelectorAll(classNames.carousel.dot);
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
      }
      slideIndex++;
      if (slideIndex > slides.length) {slideIndex = 1;}
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(classNames.carousel.active, '');
      }
      slides[slideIndex-1].style.display = 'block';
      dots[slideIndex-1].className += classNames.carousel.active;
      setTimeout(showSlides, 3000);
    }
  }
}

export default MainPage;
