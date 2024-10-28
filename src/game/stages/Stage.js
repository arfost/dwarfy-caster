class Stage {
  constructor() {
    this.datas = [];
    this.events = {};
  }

  update(input) {
    throw new Error("Method not implemented.");
  }

  getDatas() {
    throw new Error("Method not implemented.");
  }

  getComponents() {
    throw new Error("Method not implemented.");
  }

  update(input) {
    if (input) {
      this.reactToInput(input);
    }
  }

  reactToInput(input) {}

  on(eventName, eventAction){
    this.events[eventName] = eventAction;
  }

  emit(eventName, options){
    this.events[eventName](options);
  }
}

module.exports = { Stage };