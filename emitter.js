'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

function severalDecorator(context, handler, times) {
    let count = 0;

    return () => {
        if (count++ < times) {
            handler.call(context);
        }
    };
}

function throughDecorator(context, handler, frequency) {
    let count = 0;

    return () => {
        if (count++ % frequency === 0) {
            handler.call(context);
        }
    };
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} emitter
         */
        on: function (event, context, handler) {
            if (!(event in events)) {
                events[event] = [];
            }
            events[event].push({ context, handler });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} emitter
         */
        off: function (event, context) {
            [event].concat(Object.keys(events).filter(key => key.startsWith(event + '.')))
                .filter(e => events[e])
                .forEach(function (e) {
                    events[e] = events[e].filter(s => s.context !== context);
                });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} emitter
         */
        emit: function (event) {
            let eventTokens = event.split('.');

            while (eventTokens.length) {
                event = eventTokens.join('.');
                if (events[event]) {
                    events[event].forEach(subscriber =>
                        subscriber.handler.call(subscriber.context));
                }

                eventTokens.pop();
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} emitter
         */
        several: function (event, context, handler, times) {
            this.on(event, context, severalDecorator(context, handler, times));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} emitter
         */
        through: function (event, context, handler, frequency) {
            this.on(event, context, throughDecorator(context, handler, frequency));

            return this;
        }
    };
}
