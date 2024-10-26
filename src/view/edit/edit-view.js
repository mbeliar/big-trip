import createEventHeaderTemplate from './template/event-header';
import createEventDetailsTemplate from './template/event-details';
import AbstractStatefulView from '/src/framework/view/abstract-stateful-view';
import { getObj } from '/src/util/util';
import flatpickr from 'flatpickr';
import '/node_modules/flatpickr/dist/flatpickr.min.css';


const createEditTemplate = (waypoint, allTypeOffers, destinations, isNew) =>
  `<form class="event event--edit" action="#" method="post">
    ${createEventHeaderTemplate(waypoint, destinations, isNew)}
    ${createEventDetailsTemplate(waypoint, allTypeOffers)}
  </form>`;


export default class EditView extends AbstractStatefulView {
  #allTypeOffers = null;
  #handleCloseClick = null;
  #handleFormSubmit = null;
  #handleDeleteClick = null;
  #handleEventTypeChange = null;
  #handleDestinationChange = null;
  #destinations = [];

  #datepickerFrom = null;
  #datepickerTo = null;

  #isNew = false;

  constructor({waypoint, allTypeOffers, destinations, onCloseClick, onFormSubmit, onDeleteClick, onEventTypeChange, onDestinationChange, isNew = false}) {
    super();
    this._setState(EditView.parseWaypointToState(waypoint, allTypeOffers));
    this.#destinations = destinations;
    this.#allTypeOffers = allTypeOffers;
    this.#handleCloseClick = onCloseClick;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleEventTypeChange = onEventTypeChange;
    this.#handleDestinationChange = onDestinationChange;

    this.#isNew = isNew;

    this._restoreHandlers();
  }

  get template() {
    return createEditTemplate(this._state, this.#allTypeOffers, this.#destinations, this.#isNew);
  }

  reset(waypoint) {
    const initialState = EditView.parseWaypointToState(waypoint, this.#allTypeOffers);
    this.updateElement(initialState);
  }

  removeElement() {
    super.removeElement();
    this.#datepickerFrom.destroy();
    this.#datepickerTo.destroy();
    this.#datepickerFrom = null;
    this.#datepickerTo = null;
  }

  _restoreHandlers() {
    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#eventTypeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element.addEventListener('submit', this.#formSubmitHandler);

    this.#setCloseHandlers();
    this.#setDatepicker();
  }


  #setCloseHandlers = () => {
    if (this.#isNew) {
      this.element.querySelector('.event__reset-btn')
        .addEventListener('click', this.#closeClickHandler);
      return;
    }

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#closeClickHandler);

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#formDeleteClickHandler);
  };


  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditView.parseStateToWaypoint(this._state));
  };


  #eventTypeChangeHandler = (evt) =>
    this.#handleEventTypeChange(evt, this, this.updateElement);

  #destinationChangeHandler = (evt) =>
    this.#handleDestinationChange(evt, this, this.updateElement);


  #updatePriceOf = (waypoint) => {
    const newPrice = Number(this.element.querySelector('.event__input--price').value);
    const oldPrice = waypoint['base_price'];

    if (newPrice !== oldPrice) {
      waypoint['base_price'] = newPrice;
    }
  };

  #inputToOffer = (input) => {
    const id = Number(input.dataset.id);
    return getObj(this.#allTypeOffers, 'id', id);
  };

  #updateOffersOf(waypoint) {
    let checkedOffers = this.element.querySelectorAll('.event__offer-checkbox');
    checkedOffers = Array.from(checkedOffers);
    checkedOffers = checkedOffers.filter((input) => input.checked);
    checkedOffers = checkedOffers.map(this.#inputToOffer);

    waypoint.offers = checkedOffers;
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const waypoint = EditView.parseStateToWaypoint(this._state);
    this.#updatePriceOf(waypoint);
    this.#updateOffersOf(waypoint);

    this.#handleFormSubmit(waypoint);
  };


  #dateFromChangeHandler = ([userDate]) =>
    this.updateElement({'date_from': userDate});

  #dateToChangeHandler = ([userDate]) =>
    this.updateElement({'date_to': userDate});

  #makeFlatpickr(selector, dateKey, cb) {
    return flatpickr(
      this.element.querySelector(`[name="event-${selector}-time"]`),
      {
        dateFormat: 'j/m/y H:i',
        defaultDate: this._state[`${dateKey}`],
        enableTime: true,
        onChange: cb
      }
    );
  }

  #setDatepicker() {
    this.#datepickerFrom = this.#makeFlatpickr('start', 'date_from', this.#dateFromChangeHandler);
    this.#datepickerTo = this.#makeFlatpickr('end', 'date_to', this.#dateToChangeHandler);
  }


  static parseWaypointToState(waypoint, allTypeOffers) {
    return {...waypoint, allTypeOffers};
  }

  static parseStateToWaypoint(state) {
    const waypoint = {...state};
    delete waypoint.allTypeOffers;

    return waypoint;
  }
}
