import HoursWidget from './HoursWidget.js';
import {settings, select} from '../settings.js';

class PeopleWidget extends HoursWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisPeopleWidget = this;
    thisPeopleWidget.getElements();
    thisPeopleWidget.initActions();
  }

  getElements(){
    const thisPeopleWidget = this;

    thisPeopleWidget.dom.input = thisPeopleWidget.dom.wrapper.querySelector(select.widgets.peopleAmount.input);
    thisPeopleWidget.dom.linkDecrease = thisPeopleWidget.dom.wrapper.querySelector(select.widgets.peopleAmount.linkDecrease);
    thisPeopleWidget.dom.linkIncrease = thisPeopleWidget.dom.wrapper.querySelector(select.widgets.peopleAmount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin
    && value <= settings.amountWidget.defaultMax;
  }

  initActions(){
    const thisPeopleWidget = this;

    thisPeopleWidget.dom.input.addEventListener('change', function(){
      thisPeopleWidget.value = thisPeopleWidget.dom.input.value;
    });

    thisPeopleWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisPeopleWidget.setValue(thisPeopleWidget.value - 1);
    });

    thisPeopleWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisPeopleWidget.setValue(thisPeopleWidget.value + 1);
    });
  }
}

export default PeopleWidget;
