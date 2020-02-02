/**
 * Leaflet plugin animated marker
 *
 * Javascript
 *
 * @category  GLICER
 * @author    Emmanuel ROECKER
 * @author    Rym BOUCHAGOUR
 * @copyright 2015 GLICER
 * @license   MIT
 * @link      http://dev.glicer.com/
 *
 * Created : 01/07/15
 * File : leaflet-glicer-animated.js
 *
 */

L.GlAnimatedMarkerPlugin = L.Marker.extend({
    options: {
        speed: 200,          // meters / seconds
        autoStart: true,     // animate on add
        loop: true,          // autorestart reverse animation at end
        waitingLoop: 2000,   // waiting before restart reverse animation
        waitingStart: 1000,  // waiting before first start
        onEnd: function () {
        },
        clickable: true
    },

    initialize: function (latlngs, options) {
        this._originalLatlngs = latlngs;
        this._end = true;
        this._tid = null;
        this._started = false;
        this.speed = options.speed / 1000; //translate to meters / milliseconds

        var self = this;

        document.addEventListener("visibilitychange", function () { //stop css animation when page invisible
            if (document.hidden) {
                self.pause();
            } else {
                self.start();
            }
        }, false);
        L.Marker.prototype.initialize.call(this, latlngs[0], options);
    },

    onAdd: function (map) {
        this._map = map;
        this.initevents();
        L.Marker.prototype.onAdd.call(this, map);
        if (this.options.autoStart) {
            var self = this;
            setTimeout(function () {
                self.restart(false);
            }, this.options.waitingStart);
        }
    },


    initevents: function () {
        var self = this;

        this._map.on('zoomstart', function () {
            self.pause();
        });

        this._map.on('zoomend', function () {
            self.start();
        });


        this.on("mouseover", function (e) {
            self.pause();
        });

        this.on("mouseout", function (e) {
            self.start();
        });

    },

    restart: function (reverse) {
        if (reverse) {
            this._originalLatlngs.reverse();
        }

        this._latlngs = this._originalLatlngs.slice();
        this._latlngslen = this._originalLatlngs.length;
        this._end = false;
        this._started = false;
        this._i = 1;
        this.start();
    },

    pause: function () {
        if (this._end)
            return;

        if (!this._started)
            return;
        this._started = false;

        clearTimeout(this._tid);
        delete this._tid;

        var position = this._icon.getBoundingClientRect();
        var container = this._map._container.getBoundingClientRect();

        var x = position.left - container.left - this._icon.offsetLeft;
        var y = position.top - container.top - this._icon.offsetTop;

        var point = L.point(x, y);
        var latlng = this._map.containerPointToLatLng(point);

        this.stopTransition();
        this.setLatLng(latlng);

        this._i--;
        this._latlngs[this._i - 1] = latlng;
    },

    startTransition: function (timems) {
        if (this._icon) {
            this._icon.style[L.DomUtil.TRANSITION] = 'all ' + timems + 'ms linear';
        }
        if (this._shadow) {
            this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + timems + 'ms linear';
        }
    },

    stopTransition: function () {
        if (this._icon) {
            this._icon.style[L.DomUtil.TRANSITION] = '';
        }
        if (this._shadow) {
            this._shadow.style[L.DomUtil.TRANSITION] = '';
        }
    },

    start: function () {
        if (this._end)
            return;

        if (this._started)
            return;
        this._started = true;

        var self = this;
        var timems = this._latlngs[this._i - 1].distanceTo(this._latlngs[this._i]) / this.speed;

        this.startTransition(timems);
        this.setLatLng(this._latlngs[this._i]);

        if (this._i < (this._latlngslen - 1)) {
            this._tid = setTimeout(function () {
                self._started = false;
                self.start();
            }, timems);
        } else {
            if (this.options.loop) {
                this._tid = setTimeout(function () {
                    self._end = true;
                    self.stopTransition();
                    self.restart(true);
                }, timems + this.options.waitingLoop);
            } else {
                this._tid = setTimeout(function () {
                    self._end = true;
                    self._started = false;
                    self.stopTransition();
                    self.options.onEnd.apply(self, Array.prototype.slice.call(arguments));
                }, timems);
            }
        }
        this._i++;
    }
});

L.GlAnimatedMarker = function (latlngs, options) {
    return new L.GlAnimatedMarkerPlugin(latlngs, options);
};