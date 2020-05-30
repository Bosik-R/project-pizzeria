import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import BookingWidget from './BookingWidget.js';

class Booking{
  constructor(wrapper){
    const thisBooking = this;

    thisBooking.render(wrapper);
    thisBooking.initWidget();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam   = settings.db.dateEndParamKey   + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepet: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepet:   settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepet.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepet),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepetResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepetResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepet]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepet);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepet){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepet){
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    thisBooking.table = {};
    thisBooking.duration = {};
    thisBooking.hoursAmount.maxValue = settings.amountWidgetHours.defaultMax;
    thisBooking.hoursAmount.minValue = settings.amountWidgetHours.defaultMin;
    thisBooking.hoursAmount.value = settings.amountWidgetHours.defaultValue;
    let allAvalible = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvalible = true;
    }

    for (let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvalible
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }

      table.classList.remove(classNames.booking.forBooking);

      table.addEventListener('click', function(){

        if(!table.classList.contains(classNames.booking.tableBooked)){
          table.classList.add(classNames.booking.forBooking);

          let duration = 0;
          for (let hourBlock = thisBooking.hour; hourBlock < settings.hours.close; hourBlock += 0.5){
            const durationCount = thisBooking.setDuration(hourBlock, tableId, duration);
            if(durationCount == true){
              break;
            }
            if(hourBlock == 0){
              thisBooking.hoursAmount.minValue = 0;
              thisBooking.hoursAmount.value = 0;
              break;
            }
            duration += 0.5;
            if(duration == settings.amountWidgetHours.defaultMin){
              thisBooking.hoursAmount.value = duration;
            }
          }
          thisBooking.table = tableId;
          thisBooking.duration = duration;
          thisBooking.hoursAmount.maxValue = duration;
          console.log('close');
        }
      });
    }
  }

  setDuration(hourBlock, tableId){
    const thisBooking = this;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined'){
      thisBooking.booked[thisBooking.date] = {};
    }

    if (typeof thisBooking.booked[thisBooking.date][hourBlock] == 'undefined'){
      thisBooking.booked[thisBooking.date][hourBlock] = [];
    }
    if (thisBooking.booked[thisBooking.date][hourBlock].includes(tableId)){
      return true;
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.table,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      phoneNumber: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters:[],
    };
    for (let starter of thisBooking.dom.starters){
      if (starter.checked){
        payload.starters.push(starter.value);
      }
    }
    console.log('payload', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
      });
  }

  render(wrapper){
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generateHTML));

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.bookingSubmit = thisBooking.dom.wrapper.querySelector(select.booking.bookingSubmit);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }

  initWidget(){
    const thisBooking = this;

    thisBooking.peopleAmount = new BookingWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new BookingWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.hoursAmount.minValue = settings.amountWidgetHours.defaultMin;
    thisBooking.hoursAmount.maxValue = settings.amountWidgetHours.defaultMax;
    thisBooking.hoursAmount.numberToInDecreese = settings.amountWidgetHours.numberToInDecreese;

    thisBooking.peopleAmount.minValue = settings.amountWidgetPeople.defaultMin;
    thisBooking.peopleAmount.maxValue = settings.amountWidgetPeople.defaultMax;
    thisBooking.peopleAmount.numberToInDecreese = settings.amountWidgetPeople.numberToInDecreese;

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.bookingSubmit.addEventListener('submit', function(){
      event.preventDefault();
      thisBooking.sendBooking();
      thisBooking.getData();
    });
  }
}

export default Booking;
