var { Subscription, Subject } = require("canal-js-utils/rx");
var { each, extend } = require("canal-js-utils/misc");

var SubscriptionMixin = {
  addSubscription(disposable) {
    if (!this.__subscription) {
      this.__subscription = new Subscription();
    }
    this.__subscription.add(disposable);
  },

  addStore(store, prefix) {
    console.warn("addStore is deprecated. please use Store.connectTo in", this.constructor.displayName);
    this.addSubscription(store.subscribe((state) => {
      if (prefix) {
        state = { [prefix]: state };
      }
      this.setState(state);
    }));
  },

  componentWillUnmount() {
    if (this.__subscription) {
      this.__subscription.unsubscribe();
      this.__subscription = null;
    }
  }
};

var EventHandlerMixin = extend({
  componentWillMount() {
    if (!this.subjects)
      return;

    var handlers = {};
    var subjects = {};

    each(this.subjects, (key) => {
      var subject = new Subject();
      handlers[key] = (data) => subject.next(data);
      subjects[key] = subject;
      this.addSubscription(subject);
    });

    this.handlers = handlers;
    this.subjects = subjects;
  },
  componentDidMount() {
    if (this.subjects && this.plugStreams) {
      this.plugStreams(this.subjects);
    }
  },

  componentWillUnmount() {
    if (this.__subscription) {
      this.__subscription.unsubscribe();
      this.__subscription = null;
    }
  }
}, SubscriptionMixin);

module.exports = { SubscriptionMixin, EventHandlerMixin };