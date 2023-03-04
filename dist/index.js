
require("core-js/modules/es.array-buffer.slice.js");
require("core-js/modules/es.typed-array.uint8-array.js");
require("core-js/modules/es.typed-array.at.js");
require("core-js/modules/es.typed-array.fill.js");
require("core-js/modules/esnext.typed-array.find-last.js");
require("core-js/modules/esnext.typed-array.find-last-index.js");
require("core-js/modules/es.typed-array.set.js");
require("core-js/modules/es.typed-array.sort.js");
require("core-js/modules/esnext.typed-array.to-reversed.js");
require("core-js/modules/esnext.typed-array.to-sorted.js");
require("core-js/modules/esnext.typed-array.with.js");
require("core-js/modules/es.typed-array.of.js");
require("core-js/modules/es.typed-array.uint16-array.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.typed-array.uint32-array.js");

/*
The MIT License (MIT)

Copyright (c) 2022 - 2023 Matias Affolter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
 
 "use strict";

// Order of the color component stored (in order to not meld with endianness when creating a list from a buffer, it is mostly like "reversed")

// Inspired by https://en.wikipedia.org/wiki/Rec._709
var imul = function(a, b){
    "use strict";
    var ah = (a >>> 16) & 0xffff,
        al = a & 0xffff,
        bh = (b >>> 16) & 0xffff,
        bl = b & 0xffff;
    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
};
var round = Math.round;
var fr = Math.fround;
var p2 = function(x){"use strict"; x = x|0; return imul(x|0, x|0)|0; };
var s = function(x){
    "use strict";
    // Base cases
    x = (x | 0)>>>0;
    if ((x|0) == 0 || (x|0) == 1){

        return x | 0;
    }

    // Starting from 1, try all
    // numbers until i*i is
    // greater than or equal to x.
    var i = 1;
    var result = 1;

    while ((result|0) <= (x|0)) {
        i = (i+1|0)>>>0;
        result = (i * i | 0)>>>0;
    }

    return (i - 1 | 0)>>>0;
};
var PR = fr(0.299), // +0.08
    PG = fr(0.587), // -0.16
    PB = fr( 0.114), // +0.08
    PA = fr(1.0000);

var RD = 255,
    GD = 255,
    BD = 255,
    AD = 255;

// Euclidean or Manhattan color distance
var EUCLMAX = (s(PR*RD*RD + PG*GD*GD + PB*BD*BD | 0) | 0) >>> 0;
var MANHMAX = (PR*RD + PG*GD + PB*BD|0) >>> 0;

function plus_uint(a, b) {
    "use strict";
    a = a | 0;
    b = b | 0;
    return (a + b | 0) >>> 0;
}
function multiply_uint(a, b) {
    "use strict";
    a = a | 0;
    b = b | 0;
    return Math.imul(a, b)|0;
}
function multiply_uint_4(a) {
    "use strict";
    return a << 2;
}
function divide_uint(a, b) {
    "use strict";
    a = a | 0;
    b = b | 0;
    return (a / b | 0) >>> 0;
}
function divide_4_uint(n) {
    "use strict";
    return (n >> 2 | 0) >>>0;
}
function divide_16_uint(n) {
    "use strict";
    return (n >> 4 | 0) >>> 0;
}
function divide_32_uint(n) {
    "use strict";
    return (n >> 5 | 0) >>>0;
}
function divide_64_uint(n) {
    "use strict";
    return (n >> 6 | 0) >>>0;
}
function divide_85_uint(n) {
    "use strict";
    return (n / 85 - 0.012 | 0) >>>0;
}
function divide_128_uint(n) {
    "use strict";
    return (n >> 7 | 0) >>> 0;
}
function clamp_int(x, min, max) {
    "use strict";
    x = x | 0;
    min = min | 0;
    max = max | 0;
    return (x < min ? min: x > max ? max: x) | 0;
}
function clamp_uint8(n) {
    "use strict";
    n = n | 0;
    return (n | 0) & 0xFF;
}
function inverse_255(n) {
    "use strict";
    n = n | 0;
    return (255 - n | 0) & 0xFF;
}
function divide_255(n) {
    "use strict";
    n = n | 0;
    return (n / 255 | 0) & 0xFF;
}
function clamp_uint32(n) {
    "use strict";
    n = n | 0;
    return ((n|0)>>>0) >>> 0;
}
function uint_not_equal(a, b) {
    "use strict";
    a = a | 0;
    b = b | 0;
    return (a | 0) != (b | 0);
}
function uint_equal(a, b) {
    "use strict";
    a = a | 0;
    b = b | 0;
    return (a | 0) == (b | 0);
}
function abs_int(n) {
    "use strict";
    n = n | 0;
    return (n | 0) < 0 ? (-n | 0) : (n | 0);
}


// X11 color names
var WX3 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };

// Format hexadecimal
var F_HEX = function(hex) { // Supports #fff (short rgb), #fff0 (short rgba), #e2e2e2 (full rgb) and #e2e2e2ff (full rgba)
    

    if(typeof hex === "undefined"){

        return "#00000000";
    } else {

        if(WX3.hasOwnProperty(hex)){return WX3[hex] + "ff";}
        var a = "", b = "", c = "", d = "";
        var formatted = "#12345678";
        var l = hex.length | 0;

        switch(l) {

            case 9:
                formatted = hex;
                break;
            case 7:
                formatted = hex.concat("ff");
                break;
            case 5:
                a = hex.charAt(1); b = hex.charAt(2); c = hex.charAt(3); d = hex.charAt(4);
                formatted =  "#".concat(a, a, b, b, c, c, d, d);
                break;
            case 4:
                a = hex.charAt(1); b = hex.charAt(2); c = hex.charAt(3);
                formatted = "#".concat(a, a, b, b, c, c, "ff");
                break;
        }

        return formatted;
    }
};

var operators = {
    unary_neg(a) { return -a; },
    unary_bitwise_not(a) { return ~a; },
    unary_logical_not(a) { return !a; },
    boolean_and(a, b) {
        return a && b;
    },
    binary_and(a, b) {
        return a & b;
    },
    binary_or(a, b) {
        return a | b;
    },
    binary_xor(a, b) {
        return a ^ b;
    },
    binary_add(a, b) {
        return a + b;
    },
    binary_sub(a, b) {
        return a - b;
    },
    binary_mul(a, b) {
        return a * b;
    },
    binary_div(a, b) {
        return a / b;
    },
    binary_equal(a, b) {
        return a == b;
    },
    binary_not_equal(a, b) {
        return a != b;
    },
    binary_less(a, b) {
        return a < b;
    },
    binary_less_equal(a, b) {
        return a <= b;
    },
    binary_greater(a, b) {
        return a > b;
    },
    binary_greater_equal(a, b) {
        return a >= b;
    },
    binary_shift_left(a, bits) {
        return a << bits;
    },
    binary_shift_right_arithmetic(a, bits) {
        return a >> bits;
    },
    binary_shift_right_logical(a, bits) {
        return a >>> bits;
    },
    min_num(x, y) {
        return x != x ? y : y != y ? x : Math.min(x, y);
    },
    max_num(x, y) {
        return x != x ? y : y != y ? x : Math.max(x, y);
    },
    modulo_int(a, b) {
        return a % b | 0;
    },
    modulo_uint(a, b) {
        return (a % b | 0) >>> 0;
    },
    plus_int(a, b) {
        return a + b | 0;
    },
    minus_int(a, b) {
        return a - b | 0;
    },
    plus_uint,
    minus_uint(a, b) {
        return (a - b | 0) >>>0;
    },
    multiply_int(a, b) {
        return imul(a|0, b|0)|0;
    },
    divide_int(a, b) {
        return a / b | 0;
    },
    multiply_uint,
    multiply_uint_4,
    divide_uint,
    divide_four_uint: divide_4_uint,
    divide_16_uint,
    divide_32_uint,
    divide_64_uint,
    divide_85_uint,
    divide_128_uint,
    abs_int,
    max_int(a, b) {
        a = a | 0;
        b = b | 0;
        return a > b ? b : a;
    },
    min_int(a, b) {
        a = a | 0;
        b = b | 0;
        return a < b ? a : b;
    },
    max_uint(a, b) {
        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a > b ? b : a | 0) >>> 0;
    },
    min_uint(a, b) {
        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return a > b ? a : b | 0;
    },
    clamp_int,
    clamp_uint8,
    inverse_255,
    divide_255,
    multiply_255(n) {
        return imul(n|0, 255) | 0;
    },
    clamp_uint32,
    int_equal(a, b) {
        return (a | 0) == (b | 0);
    },
    int_not_equal(a, b) {
        return (a | 0) != (b | 0);
    },
    int_less(a, b) {
        return (a | 0) < (b | 0);
    },
    int_less_equal(a, b) {
        return (a | 0) <= (b | 0);
    },
    int_greater(a, b) {
        return (a | 0) > (b | 0);
    },
    int_greater_equal(a, b) {
        return (a | 0) >= (b | 0);
    },
    uint_equal(a, b) {
        return ((a | 0) >>>0) == ((b | 0) >>>0);
    },
    uint_not_equal,
    uint_equal,
    uint_less(a, b) {
        return ((a | 0) >>>0) < ((b | 0) >>>0);
    },
    uint_less_equal(a, b) {
        return ((a | 0) >>>0) <= ((b | 0) >>>0);
    },
    uint_greater(a, b) {
        return ((a | 0) >>>0) > ((b | 0) >>>0);
    },
    uint_greater_equal(a, b) {
        return ((a | 0) >>>0) >= ((b | 0) >>>0);
    },
    format_int(n) {
        return (n | 0);
    },
    format_uint(n) {
        return (n | 0) >>>0;
    }
};

var {
    unary_neg,
    unary_bitwise_not,
    unary_logical_not,
    boolean_and,
    binary_and,
    binary_or,
    binary_xor,
    binary_add,
    binary_sub,
    binary_mul,
    binary_div,
    binary_equal,
    binary_not_equal,
    binary_less,
    binary_less_equal,
    binary_greater,
    binary_greater_equal,
    binary_shift_left,
    binary_shift_right_arithmetic,
    binary_shift_right_logical,
    min_num,
    max_num,
    modulo_int,
    modulo_uint,
    plus_int,
    minus_int,
    minus_uint,
    multiply_int,
    divide_int,
    multiply_255,
    divide_four_uint,
    max_int,
    min_int,
    max_uint,
    min_uint,
    int_equal,
    int_not_equal,
    int_less,
    int_less_equal,
    int_greater,
    int_greater_equal,
    uint_equal,
    uint_less,
    uint_less_equal,
    uint_greater,
    uint_greater_equal,
    format_int,
    format_uint,
} = operators;

// NEW BASIC : Number object with 4 times 0-255
var SIMDopeColor = function(with_main_buffer, offset_4bytes){
    "use strict";
    offset_4bytes = offset_4bytes || 0;
    if (!(this instanceof SIMDopeColor)) {
        return new SIMDopeColor(with_main_buffer, offset_4bytes);
    }

    if(with_main_buffer instanceof Uint8Array) {

        this.storage_uint8_ =  with_main_buffer;
    }else {

        this.storage_uint8_ = new Uint8Array("buffer" in with_main_buffer ? with_main_buffer.buffer: with_main_buffer, imul(offset_4bytes, 4));
    }
};

// NEW PARTICULAR : Number object other means of varruct
SIMDopeColor.new_zero = function() {
    
    return new SIMDopeColor(new Uint8Array(4));
};
SIMDopeColor.new_splat = function(n) {
    
    var uint8ca = new Uint8ClampedArray(4);
    uint8ca.fill(clamp_uint8(n));
    return new SIMDopeColor(uint8ca);
};
SIMDopeColor.new_of = function(r, g, b, a) {
    "use strict";
    var uint8ca = new Uint8ClampedArray(4);
    uint8ca[3] = clamp_uint8(r);
    uint8ca[2] = clamp_uint8(g);
    uint8ca[1] = clamp_uint8(b);
    uint8ca[0] = clamp_uint8(a);
    return SIMDopeColor(uint8ca);
}

SIMDopeColor.new_safe_of = function(r, g, b, a) {
    
    var uint8ca = new Uint8ClampedArray(4);
    uint8ca[3] = clamp_int(r, 0, 255);
    uint8ca[2] = clamp_int(g, 0, 255);
    uint8ca[1] = clamp_int(b, 0, 255);
    uint8ca[0] = clamp_int(a, 0, 255);
    return new SIMDopeColor(uint8ca);
};
SIMDopeColor.new_from = function(other) {
    
    return new SIMDopeColor(other);
};

SIMDopeColor.new_array = function(array) {
    
    var uint8ca = new Uint8ClampedArray(4);
    uint8ca[3] = clamp_uint8(array[0]);
    uint8ca[2] = clamp_uint8(array[1]);
    uint8ca[1] = clamp_uint8(array[2]);
    uint8ca[0] = clamp_uint8(array[3]);
    return new SIMDopeColor(uint8ca);
};

SIMDopeColor.new_array_safe = function(array) {
    
    var uint8ca = new Uint8ClampedArray(4);
    uint8ca[3] = clamp_uint8(clamp_int(array[0], 0, 255));
    uint8ca[2] = clamp_uint8(clamp_int(array[1], 0, 255));
    uint8ca[1] = clamp_uint8(clamp_int(array[2], 0, 255));
    uint8ca[0] = clamp_uint8(clamp_int(array[3], 0, 255));
    return new SIMDopeColor(uint8ca);
};

SIMDopeColor.new_bool = function(r, g, b, a) {
    
    var uint8ca = new Uint8ClampedArray(4);
    uint8ca[3] = (r|0) > 0 ? 0x1 : 0x0;
    uint8ca[2] = (g|0) > 0 ? 0x1 : 0x0;
    uint8ca[1] = (b|0) > 0 ? 0x1 : 0x0;
    uint8ca[0] = (a|0) > 0 ? 0x1 : 0x0;
    return new SIMDopeColor(uint8ca);
};

SIMDopeColor.new_uint32 = function(n) {

    return new SIMDopeColor(Uint32Array.of(n|0).buffer);
};

SIMDopeColor.new_hsla = function(h, s, l, a) {

    h /= 360;
    s /= 100;
    l /= 100;
    a /= 100;

    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        function hue_to_rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue_to_rgb(p, q, h + 1 / 3);
        g = hue_to_rgb(p, q, h);
        b = hue_to_rgb(p, q, h - 1 / 3);
    }
    return SIMDopeColor.new_of(format_uint(r * 255), format_uint(g * 255), format_uint(b * 255), format_uint(a * 255));
};

SIMDopeColor.new_hex = function (hex) {

    return SIMDopeColor.new_uint32(parseInt(F_HEX(hex).slice(1), 16));
}

// Properties of number object
Object.defineProperty(SIMDopeColor.prototype, 'r', {
    get: function() {  return clamp_uint8(this.storage_uint8_[3]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'g', {
    get: function() {  return clamp_uint8(this.storage_uint8_[2]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'b', {
    get: function() {  return clamp_uint8(this.storage_uint8_[1]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'a', {
    get: function() {  return clamp_uint8(this.storage_uint8_[0]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'pos', {
    get: function() { 

        var hsl = this.hsl;
        return (hsl[0]*32+hsl[2]*16+hsl[1]*8|0) >>>0
    },
});

// Properties of number object
Object.defineProperty(SIMDopeColor.prototype, 'z', {
    get: function() {  return clamp_uint8(this.storage_uint8_[3]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'y', {
    get: function() {  return clamp_uint8(this.storage_uint8_[2]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'x', {
    get: function() {  return clamp_uint8(this.storage_uint8_[1]); },
});
Object.defineProperty(SIMDopeColor.prototype, 'w', {
    get: function() {  return clamp_uint8(this.storage_uint8_[0]); },
});

Object.defineProperty(SIMDopeColor.prototype, 'uint32', {
    get: function() { 
        return ((this.storage_uint8_[3] << 24) | (this.storage_uint8_[2] << 16) | (this.storage_uint8_[1] <<  8) | this.storage_uint8_[0] | 0) >>> 0;
    }
});

Object.defineProperty(SIMDopeColor.prototype, 'hex', {
    get: function() {  return "#".concat("00000000".concat(this.uint32.toString(16)).slice(-8));}
});

Object.defineProperty(SIMDopeColor.prototype, 'hsla', {
    get: function() {
        
        var r = clamp_uint8(this.storage_uint8_[3]);
        var g = clamp_uint8(this.storage_uint8_[2]);
        var b = clamp_uint8(this.storage_uint8_[1]);
        var a = clamp_uint8(this.storage_uint8_[0]);

        r = +r/255, g = +g/255, b = +b/255, a = +a/255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return Array.of(h* 360|0, s*100|0, l*100|0, a*100|0);
    }
});


Object.defineProperty(SIMDopeColor.prototype, 'rgbaon4bits', {
    get: function() {
        "use strict";
        var r = divide_128_uint(this.storage_uint8_[3]);
        var g = divide_128_uint(this.storage_uint8_[2]);
        var b = divide_128_uint(this.storage_uint8_[1]);
        var a = divide_128_uint(this.storage_uint8_[0]);

        return ((r << 3) | (g << 2) | (b <<  1) | (a << 0) | 0) >>> 0;
    }
});

Object.defineProperty(SIMDopeColor.prototype, 'rgbaon6bits', {
    get: function() {
        "use strict";
        var r = divide_85_uint(this.storage_uint8_[3]);
        var g = divide_85_uint(this.storage_uint8_[2]);
        var b = divide_85_uint(this.storage_uint8_[1]);
        var a = divide_85_uint(this.storage_uint8_[0]);

        return ((r ^ 0b010000) + (g ^ 0b001000) + (b ^ 0b000100) + (a ^ 0b000000) | 0) >>> 0;
    }
});

Object.defineProperty(SIMDopeColor.prototype, 'rgbaon8bits', {
    get: function() {
        "use strict";
        var r = divide_64_uint(this.storage_uint8_[3]);
        var g = divide_64_uint(this.storage_uint8_[2]);
        var b = divide_64_uint(this.storage_uint8_[1]);
        var a = divide_64_uint(this.storage_uint8_[0]);

        return ((r << 6) | (g << 4) | (b <<  2) | (a << 0) | 0) >>> 0;
    }
});

Object.defineProperty(SIMDopeColor.prototype, 'rgbaon12bits', {
    get: function() {
        "use strict";
        var r = divide_32_uint(this.storage_uint8_[3]);
        var g = divide_32_uint(this.storage_uint8_[2]);
        var b = divide_32_uint(this.storage_uint8_[1]);
        var a = divide_32_uint(this.storage_uint8_[0]);

        return ((r << 9) | (g << 6) | (b <<  3) | (a << 0) | 0) >>> 0;
    }
});

Object.defineProperty(SIMDopeColor.prototype, 'offset', {
    get: function() { return divide_four_uint(this.storage_uint8_.byteOffset);}
});

Object.defineProperty(SIMDopeColor.prototype, 'buffer', {
    get: function() {  return this.storage_uint8_.buffer.slice(this.storage_uint8_.byteOffset, plus_uint(this.storage_uint8_.byteOffset, 4)); }
});
Object.defineProperty(SIMDopeColor.prototype, 'subarray', {
    get: function() {  return this.storage_uint8_.subarray(0, 4); }
});
Object.defineProperty(SIMDopeColor.prototype, 'set', {
    get: function() {  return function(with_buffer) {

        if(with_buffer instanceof SIMDopeColor) {

            this.storage_uint8_.set(new Uint8Array(with_buffer.buffer));

        }else if("subarray" in with_buffer) {

            this.storage_uint8_.set(with_buffer.subarray(0, 4));
        }else {

            this.storage_uint8_.set(with_buffer);
        }
    }}
});
Object.defineProperty(SIMDopeColor.prototype, 'set_out_of', {
    get: function() {  return function(w, x, y, z) {
        this.storage_uint8_[0] = clamp_uint8(w);
        this.storage_uint8_[1] = clamp_uint8(x);
        this.storage_uint8_[2] = clamp_uint8(y);
        this.storage_uint8_[3] = clamp_uint8(z);

    }}
});
Object.defineProperty(SIMDopeColor.prototype, 'slice', {
    get: function() {  return this.storage_uint8_.slice(0, 4);}
});


SIMDopeColor.prototype.simplify = function(of) {
    var temp = Uint8ClampedArray.of(
        multiply_uint(round(this.a / of), of),
        multiply_uint(round(this.b / of), of),
        multiply_uint(round(this.g / of), of),
        multiply_uint(round(this.r / of), of),
    );
    this.set(temp);
    return this;
}


SIMDopeColor.blend_all = function (base, colors, amounts) {

    var sum_r = base.r, sum_g = base.g, sum_b = base.b, sum_a = base.a, sum_amount = 1;
    var color, amount, length = colors.length|0, i;

    for(i = 0; i < length; i++){
        color = colors[i];
        amount = fr(amounts[i]);
        sum_amount += amount;
        sum_r += color.r * amount | 0;
        sum_g += color.g * amount | 0;
        sum_b += color.b * amount | 0;
        sum_a += color.a * amount | 0;
    }

    var uint8 = Uint8Array.of(
        sum_a / sum_amount | 0,
        sum_b / sum_amount | 0,
        sum_g / sum_amount | 0,
        sum_r / sum_amount | 0
    );

    base.set(uint8);
    for(i = 0; i < length; i++) {
        colors[i].set(uint8);
    }
}



SIMDopeColor.prototype.blend_with = function(added_uint8x4, amount_alpha, should_return_transparent, alpha_addition) {

    "use strict";
    should_return_transparent = should_return_transparent | 0;
    alpha_addition = alpha_addition | 0;
    amount_alpha = amount_alpha | 0;
    added_uint8x4.multiply_a_255(amount_alpha|0);

    if((should_return_transparent|0)!=0) {

        if(this.is_fully_transparent()) {
            added_uint8x4.set(new ArrayBuffer(4));
        }else if(added_uint8x4.is_fully_transparent()) {
            this.set(new ArrayBuffer(4));
        }
    }else {

        var alpha = (alpha_addition|0) != 0 ?
            divide_uint(plus_uint(this.a, added_uint8x4.a), 2):
            inverse_255(divide_255(imul(inverse_255(added_uint8x4.a), inverse_255(this.a))));

        this.set(SIMDopeColor.merge_scale_of_255_a_fixed(
            added_uint8x4, divide_uint(imul(added_uint8x4.a, 255), alpha),
            this, divide_255(imul(this.a, divide_uint(imul(inverse_255(added_uint8x4.a), 255), alpha))),
            alpha
        ));

        added_uint8x4.set(this);
    }
};


SIMDopeColor.prototype.get_difference_with = function(other) {
    return SIMDopeColor.new_of(
        abs_int(this.r, other.r),
        abs_int(this.g, other.g),
        abs_int(this.b, other.b),
        abs_int(this.a, other.a),
    );
};

SIMDopeColor.prototype.sum_rgba = function() {
    return plus_uint(plus_uint(this.r, this.g), plus_uint(this.b, this.a));
};

SIMDopeColor.prototype.sum_rgb = function() {
    return plus_uint(plus_uint(this.r, this.g), this.b);
};

SIMDopeColor.prototype.is_dark = function() {
    return uint_less_equal(this.sum_rgb(), 384);
};
SIMDopeColor.prototype.is_fully_transparent = function() {
    return uint_equal(this.a, 0);
};
SIMDopeColor.prototype.is_fully_opaque = function() {
    return uint_equal(this.a, 255);
};
SIMDopeColor.prototype.is_not_fully_transparent = function() {
    return !this.is_fully_transparent();
};
SIMDopeColor.prototype.is_not_fully_opaque = function() {
    return !this.is_fully_opaque();
};

SIMDopeColor.prototype.match_with = function(color, threshold_255) {
    

    threshold_255 = (threshold_255 | 0) >>> 0;
    if(threshold_255 === 255) {

        return true;
    }else if(threshold_255 === 0){

        return (this.uint32 == color.uint32);
    }else {

        return (
            abs_int(this.r - color.r | 0) < (threshold_255|0) &&
            abs_int(this.g - color.g | 0) < (threshold_255|0) &&
            abs_int(this.b - color.b | 0) < (threshold_255|0) &&
            abs_int(this.a - color.a | 0) < (threshold_255|0));
    }
}


SIMDopeColor.prototype.euclidean_match_with = function(color, threshold_1000) {
    "use strict";

    threshold_1000 = (threshold_1000 | 0) >>> 0;
    if((threshold_1000|0) == 1000) {

        return true;
    }else if((threshold_1000|0) == 0){

        return ((this.uint32|0) == (color.uint32|0));
    }else {

        var ao = ((AD-abs_int(this.a - color.a|0)|0)/AD*PA);
        return (s(
            PR * p2(this.r - color.r | 0) +
            PG * p2(this.g - color.g | 0) +
            PB * p2(this.b - color.b | 0)
        ) / EUCLMAX * 1000 | 0) < (threshold_1000*ao|0);
    }
};

SIMDopeColor.prototype.manhattan_match_with = function(color, threshold_1000) {
    "use strict";

    threshold_1000 = (threshold_1000 | 0) >>> 0;
    if((threshold_1000|0) == 1000) {

        return true;
    }else if((threshold_1000|0) == 0){

        return ((this.uint32|0) == (color.uint32|0));
    }else {

        var ao = ((AD-abs_int(this.a - color.a|0)|0)/AD*PA);
        return ((
            PR * abs_int(this.r - color.r | 0) +
            PG * abs_int(this.g - color.g | 0) +
            PB * abs_int(this.b - color.b | 0) | 0
        ) * 1000 / MANHMAX | 0) < (threshold_1000*ao|0);
    }
};


SIMDopeColor.prototype.set_r = function(r) {
    
    var uint8a = this.subarray;
    uint8a[3] = clamp_uint8(r);
    return this;
};
SIMDopeColor.prototype.set_g = function(g) {
    
    var uint8a = this.subarray;
    uint8a[2] = clamp_uint8(g);
    return this;
};
SIMDopeColor.prototype.set_b = function(b) {
    
    var uint8a = this.subarray;
    uint8a[1] = clamp_uint8(b);
    return this;
};
SIMDopeColor.prototype.set_a = function(a) {
    
    var uint8a = this.subarray;
    uint8a[0] = clamp_uint8(a);
    return this;
};
SIMDopeColor.prototype.multiply_a_255 = function(n) {
    
    this.subarray[0] = clamp_uint8(divide_255(multiply_uint(this.a|0, n|0)));
};
SIMDopeColor.prototype.copy = function(a) {
    
    return SIMDopeColor(this.slice);
};
// get a the number object wile modifying property values
SIMDopeColor.with_r = function(t, r) {
    
    var ta = t.slice;
    ta[3] = clamp_uint8(r);
    return SIMDopeColor(ta);
};
SIMDopeColor.with_g = function(t, g) {
    
    var ta = t.slice;
    ta[2] = clamp_uint8(g);
    return SIMDopeColor(ta);
};
SIMDopeColor.with_b = function(t, b) {
    
    var ta = t.slice;
    ta[1] = clamp_uint8(b);
    return SIMDopeColor(ta);
};
SIMDopeColor.with_a = function(t, a) {
    
    var ta = t.slice;
    ta[0] = clamp_uint8(a);
    return SIMDopeColor(ta);
};
SIMDopeColor.with_inverse = function(t) {
    
    var ta = t.slice;
    ta[3] = minus_uint(255 - ta[3]);
    ta[2] = minus_uint(255 - ta[2]);
    ta[1] = minus_uint(255 - ta[1]);
    ta[0] = minus_uint(255 - ta[0]);
    return SIMDopeColor(ta);
};

// Get various operation on number object
SIMDopeColor.sumarray = function(other, start, end) {
    
    start = start | 0;
    start = min_uint(start, 3);
    end = end | 0; end = end || 4;
    end = min_uint(end, 4);

    var sum = 0;
    for(var i = start; uint_less(i, end); i = plus_uint(i, 1)) {
        sum = plus_uint(sum, other[CONFIG_UINT8X4.charAt(i|0)]);
    }
    return sum|0;
};

// from a given number object and a second one, test values and return boolean
SIMDopeColor.row_is_equal = function(t, other) {
    return SIMDopeColor.new_bool(
        uint_equal(t.r, other.r),
        uint_equal(t.g, other.g),
        uint_equal(t.b, other.b),
        uint_equal(t.a, other.a),
    );
};
SIMDopeColor.row_is_greater = function(t, other) {
    return SIMDopeColor.new_bool(
        uint_greater(t.r, other.r),
        uint_greater(t.g, other.g),
        uint_greater(t.b, other.b),
        uint_greater(t.a, other.a),
    );
};
SIMDopeColor.row_is_less = function(t, other) {
    return SIMDopeColor.new_bool(
        uint_less(t.r, other.r),
        uint_less(t.g, other.g),
        uint_less(t.b, other.b),
        uint_less(t.a, other.a),
    );
};
SIMDopeColor.row_is_greater_equal = function(t, other) {
    return SIMDopeColor.new_bool(
        uint_greater_equal(t.r, other.r),
        uint_greater_equal(t.g, other.g),
        uint_greater_equal(t.b, other.b),
        uint_greater_equal(t.a, other.a),
    );
};
SIMDopeColor.row_is_less_equal = function(t, other) {
    return SIMDopeColor.new_bool(
        uint_less_equal(t.r, other.r),
        uint_less_equal(t.g, other.g),
        uint_less_equal(t.b, other.b),
        uint_less_equal(t.a, other.a),
    );
};

SIMDopeColor.row_get_difference = function(t, other) {
    return SIMDopeColor.new_of(
        abs_int(t.r, other.r),
        abs_int(t.g, other.g),
        abs_int(t.b, other.b),
        abs_int(t.a, other.a),
    );
};

SIMDopeColor.match = function(base_uint8x4, added_uint8x4, threshold_255) {
    

    return base_uint8x4.match_with(added_uint8x4, threshold_255);
}


SIMDopeColor.blend = function(base_uint8x4, added_uint8x4, amount_alpha, should_return_transparent, alpha_addition) {

    return base_uint8x4.copy().blend_with(added_uint8x4, amount_alpha, should_return_transparent, alpha_addition);
};

SIMDopeColor.prototype.merge_with_a_fixed = function(t2, alpha) {
    var uint8a = this.subarray;
    uint8a[0] = clamp_uint8(alpha);
    uint8a[1] = plus_uint(this.b, t2.b);
    uint8a[2] = plus_uint(this.g, t2.g);
    uint8a[3] = plus_uint(this.r, t2.r);
}


SIMDopeColor.merge_scale_of_255_a_fixed = function(t1, of1, t2, of2, alpha) {

    of1 = clamp_uint8(of1);
    of2 = clamp_uint8(of2);
    alpha = clamp_uint8(alpha);

    return SIMDopeColor.merge_with_a_fixed(
        SIMDopeColor.scale_rgb_of_on_255(t1, of1, of1, of1),
        SIMDopeColor.scale_rgb_of_on_255(t2, of2, of2, of2),
        alpha
    );
}

SIMDopeColor.scale_rgb_of_on_255 = function(t, of_r, of_g, of_b) {
    return SIMDopeColor(
        Uint8ClampedArray.of(
            0,
            divide_255(imul(t.b, of_b)),
            divide_255(imul(t.g, of_g)),
            divide_255(imul(t.r, of_r))
        )
    );
}

SIMDopeColor.merge_with_a_fixed = function(t1, t2, alpha) {
    return SIMDopeColor(
        Uint8ClampedArray.of(
            clamp_uint8(alpha),
            plus_uint(t1.b, t2.b),
            plus_uint(t1.g, t2.g),
            plus_uint(t1.r, t2.r),
        )
    );
}

function alpha_add(a, b) {
    return clamp_uint8(divide_uint(plus_uint(a, b), 2));
}
function alpha_euc(a, b) {
    return clamp_uint8(inverse_255(divide_255(multiply_uint(inverse_255(a), inverse_255(b)))));
}
function get_alpha_with(a, b){
    return clamp_uint8(divide_uint(multiply_255(a), b));
}
function get_alpha_from(a, b, c){
    return clamp_uint8(divide_255(multiply_uint(a, divide_uint(multiply_255(inverse_255(b)), c))))
}

SIMDopeColor.blend_all_four = function(from_a,
                                       from_b,
                                       from_c,
                                       from_d,
                                       with_a,
                                       with_b,
                                       with_c,
                                       with_d,
                                       amount_alpha_a,
                                       amount_alpha_b,
                                       amount_alpha_c,
                                       amount_alpha_d,
                                       should_return_transparent, alpha_addition) {

    alpha_addition = alpha_addition | 0;
    should_return_transparent = should_return_transparent | 0;
    var alpha = new Uint8Array(4);
    var alpha_with = new Uint8Array(4);
    var alpha_from = new Uint8Array(4);
    var transparent = new Uint8Array(4);

    if((should_return_transparent) != 0) {

        if(from_a.is_fully_transparent()) {transparent[0] = 1;
        }else if(with_a.is_fully_transparent()) {transparent[0] = 1;}

        if(from_b.is_fully_transparent()) {transparent[1] = 1;
        }else if(with_b.is_fully_transparent()) {transparent[1] = 1;}

        if(from_c.is_fully_transparent()) {transparent[2] = 1;
        }else if(with_c.is_fully_transparent()) {transparent[2] = 1;}

        if(from_d.is_fully_transparent()) {transparent[3] = 1;
        }else if(with_d.is_fully_transparent()) {transparent[3] = 1;}
    }

    amount_alpha_a = clamp_uint8(amount_alpha_a);
    amount_alpha_b = clamp_uint8(amount_alpha_b);
    amount_alpha_c = clamp_uint8(amount_alpha_c);
    amount_alpha_d = clamp_uint8(amount_alpha_d);

    with_a.multiply_a_255(amount_alpha_a);
    with_b.multiply_a_255(amount_alpha_b);
    with_c.multiply_a_255(amount_alpha_c);
    with_d.multiply_a_255(amount_alpha_d);

    if((alpha_addition|0) != 0){
        alpha[0] = alpha_add(from_a.a, amount_alpha_a);
        alpha[1] = alpha_add(from_b.a, amount_alpha_b);
        alpha[2] = alpha_add(from_c.a, amount_alpha_c);
        alpha[3] = alpha_add(from_d.a, amount_alpha_d);
    }else {

        alpha[0] = alpha_euc(with_a.a, from_a.a);
        alpha[1] = alpha_euc(with_b.a, from_b.a);
        alpha[2] = alpha_euc(with_c.a, from_c.a);
        alpha[3] = alpha_euc(with_d.a, from_d.a);
    }

    alpha_with[0] = get_alpha_with(with_a.a, alpha[0]);
    alpha_with[1] = get_alpha_with(with_b.a, alpha[1]);
    alpha_with[2] = get_alpha_with(with_c.a, alpha[2]);
    alpha_with[3] = get_alpha_with(with_d.a, alpha[3]);

    alpha_from[0] = get_alpha_from(from_a.a, with_a.a, alpha[0]);
    alpha_from[1] = get_alpha_from(from_b.a, with_b.a, alpha[1]);
    alpha_from[2] = get_alpha_from(from_c.a, with_c.a, alpha[2]);
    alpha_from[3] = get_alpha_from(from_d.a, with_d.a, alpha[3]);

    with_a.set_out_of(0, divide_255(multiply_uint(with_a.b, alpha_with[0])), divide_255(multiply_uint(with_a.g, alpha_with[0])), divide_255(multiply_uint(with_a.r, alpha_with[0])));
    with_b.set_out_of(0, divide_255(multiply_uint(with_b.b, alpha_with[1])), divide_255(multiply_uint(with_b.g, alpha_with[1])), divide_255(multiply_uint(with_b.r, alpha_with[1])));
    with_c.set_out_of(0, divide_255(multiply_uint(with_c.b, alpha_with[2])), divide_255(multiply_uint(with_c.g, alpha_with[2])), divide_255(multiply_uint(with_c.r, alpha_with[2])));
    with_d.set_out_of(0, divide_255(multiply_uint(with_d.b, alpha_with[3])), divide_255(multiply_uint(with_d.g, alpha_with[3])), divide_255(multiply_uint(with_d.r, alpha_with[3])));

    from_a.set_out_of(0, divide_255(multiply_uint(from_a.b, alpha_from[0])), divide_255(multiply_uint(from_a.g, alpha_from[0])), divide_255(multiply_uint(from_a.r, alpha_from[0])));
    from_b.set_out_of(0, divide_255(multiply_uint(from_b.b, alpha_from[1])), divide_255(multiply_uint(from_b.g, alpha_from[1])), divide_255(multiply_uint(from_b.r, alpha_from[1])));
    from_c.set_out_of(0, divide_255(multiply_uint(from_c.b, alpha_from[2])), divide_255(multiply_uint(from_c.g, alpha_from[2])), divide_255(multiply_uint(from_c.r, alpha_from[2])));
    from_d.set_out_of(0, divide_255(multiply_uint(from_d.b, alpha_from[3])), divide_255(multiply_uint(from_d.g, alpha_from[3])), divide_255(multiply_uint(from_d.r, alpha_from[3])));

    from_a.merge_with_a_fixed(with_a, alpha[0]);
    from_b.merge_with_a_fixed(with_b, alpha[1]);
    from_c.merge_with_a_fixed(with_c, alpha[2]);
    from_d.merge_with_a_fixed(with_d, alpha[3]);

    if((transparent[0]|0) != 0){ from_a.set_out_of(0, 0, 0, 0); with_a.set_out_of(0, 0, 0, 0); }
    if((transparent[1]|0) != 0){ from_b.set_out_of(0, 0, 0, 0); with_b.set_out_of(0, 0, 0, 0); }
    if((transparent[2]|0) != 0){ from_c.set_out_of(0, 0, 0, 0); with_c.set_out_of(0, 0, 0, 0); }
    if((transparent[3]|0) != 0){ from_d.set_out_of(0, 0, 0, 0); with_d.set_out_of(0, 0, 0, 0); }
};

// From a given operation and number object perform the operation and return a the number object
SIMDopeColor.plus = function(t, other) {
    var temp = new Uint8Array(4);
    temp[3] = clamp_uint8(min_int(255, plus_int(t.r, other.r)));
    temp[2] = clamp_uint8(min_int(255, plus_int(t.g, other.g)));
    temp[1] = clamp_uint8(min_int(255, plus_int(t.b, other.b)));
    temp[0] = clamp_uint8(min_int(255, plus_int(t.a, other.a)));
    return SIMDopeColor(temp);
}
SIMDopeColor.minus = function(t, other) {
    var temp = new Uint8Array(4);
    temp[3] = clamp_uint8(max_int(0, minus_int(t.r, other.r)));
    temp[2] = clamp_uint8(max_int(0, minus_int(t.g, other.g)));
    temp[1] = clamp_uint8(max_int(0, minus_int(t.b, other.b)));
    temp[0] = clamp_uint8(max_int(0, minus_int(t.a, other.a)));
    return SIMDopeColor(temp);
}
SIMDopeColor.average = function(t, other) {
    var temp = new Uint8Array(4);
    temp[3] = clamp_uint8(divide_uint(plus_int(t.r, other.r), 2));
    temp[2] = clamp_uint8(divide_uint(plus_int(t.g, other.g), 2));
    temp[1] = clamp_uint8(divide_uint(plus_int(t.b, other.b), 2));
    temp[0] = clamp_uint8(divide_uint(plus_int(t.a, other.a), 2));
    return SIMDopeColor(temp);
}
SIMDopeColor.merge_scale_of_255 = function(t1, of1, t2, of2) {

    return SIMDopeColor.merge(
        SIMDopeColor.scale_of_on_255(t1, of1, of1, of1, of1),
        SIMDopeColor.scale_of_on_255(t2, of2, of2, of2, of2)
    );
}

SIMDopeColor.scale_of_on_255 = function(t, of_r, of_g, of_b, of_a) {
    return SIMDopeColor(
        Uint8Array.of(
            divide_255(multiply_uint(t.a, of_a)),
            divide_255(multiply_uint(t.b, of_b)),
            divide_255(multiply_uint(t.g, of_g)),
            divide_255(multiply_uint(t.r, of_r))
        )
    );
}


SIMDopeColor.merge = function(t1, t2) {
    return SIMDopeColor(
        Uint8Array.of(
            plus_uint(t1.a, t2.a),
            plus_uint(t1.b, t2.b),
            plus_uint(t1.g, t2.g),
            plus_uint(t1.r, t2.r),
        )
    );
}
SIMDopeColor.merge_with_a_fixed = function(t1, t2, alpha) {
    return SIMDopeColor(
        Uint8Array.of(
            clamp_uint8(alpha),
            plus_uint(t1.b, t2.b),
            plus_uint(t1.g, t2.g),
            plus_uint(t1.r, t2.r),
        )
    );
}


var SIMDopeColors = function(with_main_buffer, bytes_offset, bytes_length){
    "use strict";

    if (!(this instanceof SIMDopeColors)) {
        return new SIMDopeColors(with_main_buffer);
    }

    this.storage_ = "buffer" in with_main_buffer ? with_main_buffer.buffer: with_main_buffer;

    bytes_offset = bytes_offset | 0;
    bytes_length = (bytes_length | 0) || (this.storage_.byteLength | 0);

    this.storage_uint8_array_ = new Uint8Array(this.storage_, bytes_offset, bytes_length);
    this.storage_uint32_array_ = new Uint32Array(this.storage_, bytes_offset, divide_4_uint(bytes_length));
};


Object.defineProperty(SIMDopeColors.prototype, 'length', {
    get: function() {  return this.storage_uint32_array_.length; }
});
Object.defineProperty(SIMDopeColors.prototype, 'buffer', {
    get: function() {  return this.storage_uint8_array_.buffer; }
});
Object.defineProperty(SIMDopeColors.prototype, 'buffer_setUint8', {
    get: function() {  return function (i, n) {
        i = i | 0;
        n = n | 0;
        return this.storage_uint8_array_[i] = clamp_uint8(n);
    }}
});
Object.defineProperty(SIMDopeColors.prototype, 'buffer_getUint8', {
    get: function() {  return function (i) {
        i = i | 0;
        return this.storage_uint8_array_[i];
    }}
});
Object.defineProperty(SIMDopeColors.prototype, 'buffer_getUint8a', {
    get: function() {  return function (i, n) {
        i = i|0;
        n = n|0; n = n || 1;
        n = plus_uint(i, multiply_uint_4(n));
        return this.storage_uint8_array_.subarray(i, n);
    }}
});
Object.defineProperty(SIMDopeColors.prototype, 'buffer_setUint32', {
    get: function() {  return function (i, n) {
        this.storage_uint32_array_[i|0] = clamp_uint32(n);
    }}
});
Object.defineProperty(SIMDopeColors.prototype, 'buffer_getUint32', {
    get: function() {  return function (i) {
        return  this.storage_uint32_array_[i|0];
    }}
});
Object.defineProperty(SIMDopeColors.prototype, 'subarray_uint32', {
    get: function() {  return function (start, end){ start = start|0; end = end | 0; end = end || this.length; return this.storage_uint32_array_.subarray(start, end); }}
});
Object.defineProperty(SIMDopeColors.prototype, 'slice_uint32', {
    get: function() {  return function (start, end){ start = start|0; end = end | 0; end = end || this.length; return this.storage_uint32_array_.slice(start, end); }}
});
Object.defineProperty(SIMDopeColors.prototype, 'subarray_uint8', {
    get: function() {  return function (start, end){ start = start | 0; end = end | 0; return this.storage_uint8_array_.subarray(multiply_uint_4(start), multiply_uint_4(end)); }}
});
Object.defineProperty(SIMDopeColors.prototype, 'slice_uint8', {
    get: function() {  return function (start, end){ start = start | 0; end = end | 0; return this.storage_uint8_array_.slice(multiply_uint_4(start), multiply_uint_4(end)); }}
});

SIMDopeColors.prototype.get_element = function (i) {
    return SIMDopeColor(this.buffer, i|0);
}
SIMDopeColors.prototype.subarray = function (i, n) {
    i = i | 0;
    n = n | 0;
    return this.buffer_getUint8a(i, n);
}

SIMDopeColors.prototype.set_element = function (i, el) {
    this.buffer_setUint32(i|0, clamp_uint32(el.uint32));
}
SIMDopeColors.prototype.set_uint32_element = function (i, uint32) {
    this.buffer_setUint32(i|0, clamp_uint32(uint32));
}
SIMDopeColors.prototype.get_uint32_element = function (i) {
    i = i | 0;
    return this.buffer_getUint32(i);
}
SIMDopeColors.prototype.get_sub_uint8a = function (i, n) {
    i = i | 0;
    n = n | 0;
    return this.buffer_getUint8a(multiply_uint_4(i), n);
}
SIMDopeColors.prototype.get_slice_uint8a = function (i, n) {
    i = i | 0;
    n = n | 0;
    return this.buffer_getUint8a(multiply_uint_4(i), n).slice(0, multiply_uint_4(n||1));
}
SIMDopeColors.prototype.get_buffer = function (i, n) {
    i = i | 0;
    n = n | 0;
    return this.buffer_getUint8a(multiply_uint_4(i), n).buffer;
}



var SIMDope = {};
SIMDope.simdops = operators;
SIMDope.SIMDopeColor = SIMDopeColor;
SIMDope.SIMDopeColors = SIMDopeColors;

if(module){

    module.exports = SIMDope;
}
    
window.SIMDope = SIMDope;




