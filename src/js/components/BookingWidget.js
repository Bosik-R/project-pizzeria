import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class BookingWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidgetHours.defaultValue);

    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.initActions();
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    const thisWidget = this;
    return !isNaN(value)
    && value >= thisWidget.minValue
    && value <= thisWidget.maxValue;

  }

  parseValue(value){
    return parseFloat(value);
  }


  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - thisWidget.numberToInDecreese);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + thisWidget.numberToInDecreese);
    });
  }

  announce(){
  }
}

export default BookingWidget;
