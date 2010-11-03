/**
 * @license
 * @author Jason Green [guileen AT gmail.com]
 *
 * Migrate from jquery Form Plugin : http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function() {

/**
 * Returns the value of the field element.
 */
var fieldValue = function(el) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();

    if (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1) {
            return null;
    }

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) {
            return null;
        }
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index + 1 : ops.length);
        for (var i = (one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
                var v = op.value;
                if (!v) { // extra pain for IE...
                    v = (op.attributes && op.attributes['value'] &&
                            !(op.attributes['value'].specified)) ?
                            op.text : op.value;
                }
                if (one) {
                    return v;
                }
                a.push(v);
            }
        }
        return a;
    }
    return el.value;
};


/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example
 * of an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' },
 * { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to
 * the ajaxSubmit() and ajaxForm() methods.
 */
var formToArray = function(form) {
    var a = [];

    var els = form.elements;
    if (!els) {
        return a;
    }

    var i, j, n, v, el, max, jmax;
    for (i = 0, max = els.length; i < max; i++) {
        el = els[i];
        n = el.name;
        if (!n) {
            continue;
        }

        v = fieldValue(el);
        if (v && v.constructor == Array) {
            for (j = 0, jmax = v.length; j < jmax; j++) {
                a.push({name: n, value: v[j]});
            }
        }
        else if (v !== null && typeof v != 'undefined') {
            a.push({name: n, value: v});
        }
    }

    return a;
}


// Serialize an array of form elements or a set of
// key/values into a query string
var param = function(a) {

    var s = [];
    var isArray = a.constructor == Array;

    for (var key in a) {
        var value = a[key];
        if (isArray) {
            key = value.name;
            value = value.value;
        }
        value = typeof value == 'function' ? value() : value;
        s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    // Return the resulting serialization
    return s.join('&').replace(' ', '+');
}

/**
 * serialize the form to query string
 */
var formSerialize = function(form) {
    return param(formToArray(form));
}

/**
 * oncomplet is a function takes 1 argument instance of XMLHttpRequest
 */
var ajaxForm = function(form, oncomplet) {
    var url = form.action;
    var method = form.method.toUpperCase();
    var q = formSerialize(form);
    var data = null;
    if (method == 'GET') {
        url += url.indexOf('?') >= 0 ? '&' : '?' + q;
    } else {
        data = q;
    }

    var xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() :
                        new ActiveXObject('Microsoft.XMLHTTP');
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4)
            oncomplet(xmlHttp);
    };
    xmlHttp.open(method, url, true);
    xmlHttp.send(data);
}

window['formSerialize'] = formSerialize;
window['ajaxForm'] = ajaxForm;

})();
