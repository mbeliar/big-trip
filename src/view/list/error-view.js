import AbstractView from '/src/framework/view/abstract-view.js';


const createErrorTemplate = () =>
  '<p class="trip-events__msg">Failed to load latest route information</p>';


export default class ErrorView extends AbstractView {
  get template() {
    return createErrorTemplate();
  }
}
