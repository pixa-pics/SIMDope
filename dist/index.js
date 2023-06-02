"use strict";

require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.typed-array.at.js");
require("core-js/modules/esnext.typed-array.find-last.js");
require("core-js/modules/esnext.typed-array.find-last-index.js");
require("core-js/modules/es.typed-array.set.js");
require("core-js/modules/es.typed-array.sort.js");
require("core-js/modules/esnext.typed-array.to-reversed.js");
require("core-js/modules/esnext.typed-array.to-sorted.js");
require("core-js/modules/esnext.typed-array.with.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/web.dom-collections.iterator.js");
require("core-js/modules/es.array.sort.js");
/*
The MIT License (MIT)

Copyright (c) 2022 - 2023 Matias Affolter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Soft
ware without restriction, including without limitation the rights
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

var SIMDOPE = (function () {
    "use strict";

    var SIMDOPE = {};

    // Order of the color component stored (in order to not meld with endianness when creating a list from a buffer, it is mostly like "reversed")
    var rgba_bytes = 4;
    // Inspired by https://en.wikipedia.org/wiki/Rec._709
    var imul =
        Math.imul ||
        function (a, b) {
            "use strict";

            var ah = (a >>> 16) & 0xffff,
                al = a & 0xffff,
                bh = (b >>> 16) & 0xffff,
                bl = b & 0xffff;
            return (al * bl + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
        };
    var round = Math.round;
    var fr = Math.fround;
    var p2 = function p2(x) {
        "use strict";

        x = x | 0;
        return imul(x | 0, x | 0) | 0;
    };
    var s = function s(x) {
        "use strict";

        // Base cases
        x = (x | 0) >>> 0;
        if ((x | 0) == 0 || (x | 0) == 1) {
            return x | 0;
        }

        // Starting from 1, try all
        // numbers until i*i is
        // greater than or equal to x.
        var i = 1;
        var result = 1;
        while ((result | 0) <= (x | 0)) {
            i = ((i + 1) | 0) >>> 0;
            result = ((i * i) | 0) >>> 0;
        }
        return ((i - 1) | 0) >>> 0;
    };
    var PR = fr(0.2989 * 3),
        PG = fr(0.587 * 3),
        PB = fr(0.114 * 3);
    var PX = Float32Array.of(PR, PG, PB);
    var SV1 = fr(1.185),
        SV2 = fr(0.107),
        SV3 = fr(0.112);
    var SVX = Float32Array.of(SV1, SV2, SV3);
    var RD = 255,
        GD = 255,
        BD = 255,
        AD = 255;
    var XD = Uint8Array.of(RD, GD, BD, AD);
    var LAB_K = 18,
        LAB_Xn = fr(0.96422),
        LAB_Yn = 1,
        LAB_Zn = fr(0.82521),
        LAB_t0 = fr(4 / 29),
        LAB_t1 = fr(6 / 29),
        LAB_t2 = 3 * LAB_t1 * LAB_t1,
        LAB_t3 = LAB_t1 * LAB_t1 * LAB_t1;
    function rgb2lrgb(x) {
        "use strict";

        return (x /= 255) <= 0.04045
            ? x / 12.92
            : Math.pow((x + 0.055) / 1.055, 2.4);
    }
    function xyz2lab(t) {
        "use strict";

        return t > LAB_t3 ? Math.pow(t, 1 / 3) : t / LAB_t2 + LAB_t0;
    }

    // Euclidean or Manhattan color distance
    var EUCLMAX = (s((PR * RD * RD + PG * GD * GD + PB * BD * BD) | 0) | 0) >>> 0;
    var MANHMAX = ((PR * RD + PG * GD + PB * BD) | 0) >>> 0;
    var LABMAX = s((100 * 100 + 128 * 128 + 128 * 128) | 0) >>> 0;
    var FLOAT3P = fr(3 / 100);
    var FLOATONE = fr(1);

    // X11 color names
    var WX3 = {
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflower: "#6495ed",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkslategrey: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        laserlemon: "#ffff54",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrod: "#fafad2",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        maroon2: "#7f0000",
        maroon3: "#b03060",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370db",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#db7093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        purple2: "#7f007f",
        purple3: "#a020f0",
        rebeccapurple: "#663399",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32"
    };

    // Format hexadecimal
    function F_HEX(hex) {
        // Supports #fff (short rgb), #fff0 (short rgba), #e2e2e2 (full rgb) and #e2e2e2ff (full rgba)

        if (typeof hex === "undefined") {
            return "#00000000";
        } else {
            if (WX3.hasOwnProperty(hex)) {
                return WX3[hex] + "ff";
            }
            var a = "",
                b = "",
                c = "",
                d = "";
            var formatted = "#12345678";
            var l = hex.length | 0;
            switch (l) {
                case 9:
                    formatted = hex;
                    break;
                case 7:
                    formatted = hex.concat("ff");
                    break;
                case 5:
                    a = hex.charAt(1);
                    b = hex.charAt(2);
                    c = hex.charAt(3);
                    d = hex.charAt(4);
                    formatted = "#".concat(a, a, b, b, c, c, d, d);
                    break;
                case 4:
                    a = hex.charAt(1);
                    b = hex.charAt(2);
                    c = hex.charAt(3);
                    formatted = "#".concat(a, a, b, b, c, c, "ff");
                    break;
            }
            return formatted;
        }
    }
    function plus_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return ((a + b) | 0) >>> 0;
    }
    function multiply_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (imul(a, b) | 0) >>> 0;
    }
    function multiply_uint_4(a) {
        "use strict";

        a = (a | 0) >>> 0;
        return ((a << 2) | 0) >>> 0;
    }
    function divide_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return ((a / b) | 0) >>> 0;
    }
    function divide_2_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 1) | 0) >>> 0;
    }
    function divide_4_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 2) | 0) >>> 0;
    }
    function divide_16_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 4) | 0) >>> 0;
    }
    function divide_32_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 5) | 0) >>> 0;
    }
    function divide_51_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n / 51) | 0) >>> 0;
    }
    function divide_64_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 6) | 0) >>> 0;
    }
    function divide_85_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n / 85) | 0) >>> 0;
    }
    function divide_128_uint(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 7) | 0) >>> 0;
    }
    function clamp_int(x, min, max) {
        "use strict";

        x = x | 0;
        min = min | 0;
        max = max | 0;
        return (x < min ? min : x > max ? max : x) | 0;
    }
    function clamp_uint8(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return (n | 0) & 0xff;
    }
    function inverse_255(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((255 - n) | 0) & 0xff;
    }
    function divide_255(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n >> 8) | 0) >>> 0;
    }
    function clamp_uint32(n) {
        "use strict";

        n = (n | 0) >>> 0;
        return ((n | 0) >>> 0) >>> 0;
    }
    function uint_not_equal(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a | 0) != (b | 0);
    }
    function abs_int(n) {
        "use strict";

        n = n | 0;
        return (n | 0) < 0 ? -n | 0 : n | 0;
    }
    function boolean_and(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return a && b;
    }
    function min_num(x, y) {
        "use strict";

        x = x | 0;
        y = y | 0;
        return ((x | 0) < (y | 0) ? x : y) | 0;
    }
    function max_num(x, y) {
        "use strict";

        x = x | 0;
        y = y | 0;
        return ((x | 0) > (y | 0) ? x : y) | 0;
    }
    function modulo_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return a % b | 0;
    }
    function modulo_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a % b | 0) >>> 0;
    }
    function plus_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a + b) | 0;
    }
    function minus_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a - b) | 0;
    }
    function minus_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return ((a - b) | 0) >>> 0;
    }
    function multiply_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return imul(a | 0, b | 0) | 0;
    }
    function divide_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a / b) | 0;
    }
    function max_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return ((a | 0) > (b | 0) ? a : b) | 0;
    }
    function min_int(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return ((a | 0) > (b | 0) ? b : a) | 0;
    }
    function max_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return ((a | 0) > (b | 0) ? a : b | 0) >>> 0;
    }
    function min_uint(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return ((a | 0) > (b | 0) ? b : a | 0) >>> 0;
    }
    function multiply_255(n) {
        "use strict";

        n = fr(n);
        return ((n << 8) | 0) >>> 0;
    }
    function int_equal(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a | 0) == (b | 0) && true;
    }
    function int_not_equal(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a | 0) != (b | 0) && true;
    }
    function int_less(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a | 0) < (b | 0) && true;
    }
    function int_less_equal(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a | 0) <= (b | 0) && true;
    }
    function int_greater(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a | 0) > (b | 0) && true;
    }
    function int_greater_equal(a, b) {
        "use strict";

        a = a | 0;
        b = b | 0;
        return (a | 0) >= (b | 0) && true;
    }
    function uint_equal(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a | 0) >>> 0 == (b | 0) >>> 0 && true;
    }
    function uint_less(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a | 0) >>> 0 < (b | 0) >>> 0 && true;
    }
    function uint_less_equal(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a | 0) >>> 0 <= (b | 0) >>> 0 && true;
    }
    function uint_greater(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a | 0) >>> 0 > (b | 0) >>> 0 && true;
    }
    function uint_greater_equal(a, b) {
        "use strict";

        a = (a | 0) >>> 0;
        b = (b | 0) >>> 0;
        return (a | 0) >>> 0 >= (b | 0) >>> 0 && true;
    }
    function format_int(n) {
        "use strict";

        return n | 0;
    }
    function format_uint(n) {
        "use strict";

        return (n | 0) >>> 0;
    }

    // method to calculate hilbert index
    function hilbert_index(r, g, b) {
        "use strict";

        r = r | 0;
        g = g | 0;
        b = b | 0;
        var index = 0,
            mask = 0,
            h = 0,
            temp = 0;
        for (var i = 7; (i | 0) >= 0; i = (i - 1) | 0) {
            mask = 1 << i; // bit mask

            // compute the 3-bit index (between 0 and 7) for this step of the hilbert curve
            h =
                (((r & mask) > 0) << 0) |
                (((g & mask) > 0) << 1) |
                (((b & mask) > 0) << 2);

            // rotate and flip indices as necessary
            if ((h | 0) == 0) {
                temp = r | 0;
                r = g | 0;
                g = temp | 0;
                b = ~b;
            }
            if ((h | 0) == 1) {
                temp = r | 0;
                r = g | 0;
                g = temp | 0;
                b = b ^ -1;
            }

            // append the result to the index
            index = (index << 3) | h;
        }
        return index | 0; // return as int
    }

    var ops = {
        multiply_uint: multiply_uint,
        multiply_uint_4: multiply_uint_4,
        divide_uint: divide_uint,
        divide_2_uint: divide_2_uint,
        divide_4_uint: divide_4_uint,
        divide_16_uint: divide_16_uint,
        divide_32_uint: divide_32_uint,
        divide_64_uint: divide_64_uint,
        divide_85_uint: divide_85_uint,
        divide_128_uint: divide_128_uint,
        abs_int: abs_int,
        plus_uint: plus_uint,
        clamp_int: clamp_int,
        clamp_uint8: clamp_uint8,
        inverse_255: inverse_255,
        divide_255: divide_255,
        uint_not_equal: uint_not_equal,
        clamp_uint32: clamp_uint32,
        boolean_and: boolean_and,
        min_num: min_num,
        max_num: max_num,
        modulo_int: modulo_int,
        modulo_uint: modulo_uint,
        plus_int: plus_int,
        minus_int: minus_int,
        minus_uint: minus_uint,
        multiply_int: multiply_int,
        divide_int: divide_int,
        multiply_255: multiply_255,
        max_int: max_int,
        min_int: min_int,
        max_uint: max_uint,
        min_uint: min_uint,
        int_equal: int_equal,
        int_not_equal: int_not_equal,
        int_less: int_less,
        int_less_equal: int_less_equal,
        int_greater: int_greater,
        int_greater_equal: int_greater_equal,
        uint_equal: uint_equal,
        uint_less: uint_less,
        uint_less_equal: uint_less_equal,
        uint_greater: uint_greater,
        uint_greater_equal: uint_greater_equal,
        format_int: format_int,
        format_uint: format_uint
    };
    var buff = new ArrayBuffer(rgba_bytes * 14);
    var alpha = new Uint8Array(buff, 0, 4);
    var alpha_with = new Uint8Array(buff, 4, 4);
    var alpha_from = new Uint8Array(buff, 8, 4);
    var transparent = new Uint8Array(buff, 12, 4);
    var uint8a0 = new Uint8Array(buff, 16, 4);
    var TEMPUINT8AX4 = new Uint8Array(buff, 20, 4);
    var TEMPFLOAT32X1 = new Float32Array(buff, 24, 2);

    // NEW BASIC : Number object with 4 times 0-255
    var Color = function Color(with_main_buffer, offset_4bytes, tail) {
        "use strict";

        if (!(this instanceof Color)) {
            return new Color(with_main_buffer, offset_4bytes, tail);
        }
        offset_4bytes = offset_4bytes | 0;
        this.storage_uint8_ = new Uint8Array(
            with_main_buffer,
            multiply_uint_4(offset_4bytes),
            max_int(
                min_int(
                    rgba_bytes,
                    minus_int(with_main_buffer.byteLength, multiply_uint_4(offset_4bytes))
                ),
                0
            )
        );
        this.tail_ = tail instanceof Color ? tail : undefined;
    };
    Color.new_zero = function () {
        "use strict";

        return new Color(uint8a0.slice(0, rgba_bytes).buffer);
    };
    Color.new_splat = function (n) {
        "use strict";

        TEMPUINT8AX4.fill(clamp_uint8(n));
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.new_of = function (r, g, b, a) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_uint8(r);
        TEMPUINT8AX4[2] = clamp_uint8(g);
        TEMPUINT8AX4[1] = clamp_uint8(b);
        TEMPUINT8AX4[0] = clamp_uint8(a);
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.new_safe_of = function (r, g, b, a) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_int(r, 0, 255);
        TEMPUINT8AX4[2] = clamp_int(g, 0, 255);
        TEMPUINT8AX4[1] = clamp_int(b, 0, 255);
        TEMPUINT8AX4[0] = clamp_int(a, 0, 255);
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.new_from = function (other) {
        "use strict";

        return new Color(other);
    };
    Color.new_array = function (array) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_uint8(array[0]);
        TEMPUINT8AX4[2] = clamp_uint8(array[1]);
        TEMPUINT8AX4[1] = clamp_uint8(array[2]);
        TEMPUINT8AX4[0] = clamp_uint8(array[3]);
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.new_array_safe = function (array) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_uint8(clamp_int(array[0], 0, 255));
        TEMPUINT8AX4[2] = clamp_uint8(clamp_int(array[1], 0, 255));
        TEMPUINT8AX4[1] = clamp_uint8(clamp_int(array[2], 0, 255));
        TEMPUINT8AX4[0] = clamp_uint8(clamp_int(array[3], 0, 255));
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.new_bool = function (r, g, b, a) {
        "use strict";

        TEMPUINT8AX4[3] = (r | 0) > 0 ? 0x1 : 0x0;
        TEMPUINT8AX4[2] = (g | 0) > 0 ? 0x1 : 0x0;
        TEMPUINT8AX4[1] = (b | 0) > 0 ? 0x1 : 0x0;
        TEMPUINT8AX4[0] = (a | 0) > 0 ? 0x1 : 0x0;
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.new_uint32 = function (n) {
        "use strict";

        return new Color(Uint32Array.of(n | 0).buffer);
    };
    Color.new_hsla = function (h, s, l, a) {
        "use strict";

        h /= 360;
        s /= 100;
        l /= 100;
        a /= 100;
        var r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            var hue_to_rgb = function hue_to_rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue_to_rgb(p, q, h + 1 / 3);
            g = hue_to_rgb(p, q, h);
            b = hue_to_rgb(p, q, h - 1 / 3);
        }
        return Color.new_of(
            format_uint(r * 255),
            format_uint(g * 255),
            format_uint(b * 255),
            format_uint(a * 255)
        );
    };
    Color.new_hex = function (hex) {
        "use strict";

        return Color.new_uint32(parseInt(F_HEX(hex).slice(1), 16));
    };

    // Properties of number object
    Object.defineProperty(Color.prototype, "tail", {
        get: function get() {
            "use strict";

            return this.tail_;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "r", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[3]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "g", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[2]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "b", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[1]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "a", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[0]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "pos", {
        get: function get() {
            "use strict";

            var hsla = this.hsla;
            return ((hsla[0] * 32 + hsla[2] * 16 + hsla[1] * 8) | 0) >>> 0;
        },
        enumerable: false,
        configurable: false
    });

    // Properties of number object
    Object.defineProperty(Color.prototype, "z", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[3]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "y", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[2]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "x", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[1]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "w", {
        get: function get() {
            "use strict";

            return clamp_uint8(this.storage_uint8_[0]);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "uint32", {
        get: function get() {
            "use strict";

            return (
                ((this.storage_uint8_[3] << 24) |
                    (this.storage_uint8_[2] << 16) |
                    (this.storage_uint8_[1] << 8) |
                    this.storage_uint8_[0] |
                    0) >>>
                0
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "hex", {
        get: function get() {
            "use strict";

            return "#".concat("00000000".concat(this.uint32.toString(16)).slice(-8));
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "ycbcra", {
        get: function get() {
            "use strict";

            var y = 0.299 * this.r + 0.587 * this.g + 0.114 * this.b + 0,
                cb = -0.169 * this.r + -0.331 * this.g + 0.5 * this.b + 128,
                cr = 0.5 * this.r + -0.419 * this.g + -0.081 * this.b + 128,
                a = this.a;
            return Uint16Array.of(y | 0, cb | 0, cr | 0, a | 0);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "laba", {
        get: function get() {
            "use strict";

            var r = rgb2lrgb(this.r),
                g = rgb2lrgb(this.g),
                b = rgb2lrgb(this.b),
                y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / LAB_Yn),
                x,
                z;
            if (r === g && g === b) x = z = y;
            else {
                x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / LAB_Xn);
                z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / LAB_Zn);
            }
            return Float32Array.of(
                116 * y - 16,
                500 * (x - y),
                200 * (y - z),
                this.a
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "hsla", {
        get: function get() {
            "use strict";

            var r = clamp_uint8(this.storage_uint8_[3]);
            var g = clamp_uint8(this.storage_uint8_[2]);
            var b = clamp_uint8(this.storage_uint8_[1]);
            var a = clamp_uint8(this.storage_uint8_[0]);
            (r = +r / 255), (g = +g / 255), (b = +b / 255), (a = +a / 255);
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            var h,
                s,
                l = (max + min) / 2;
            if (max == min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return Array.of(
                (h * 360) | 0,
                (s * 100) | 0,
                (l * 100) | 0,
                (a * 100) | 0
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "rgbaon4bits", {
        get: function get() {
            "use strict";

            return (
                ((divide_128_uint(this.storage_uint8_[3]) << 3) |
                    (divide_128_uint(this.storage_uint8_[2]) << 2) |
                    (divide_128_uint(this.storage_uint8_[1]) << 1) |
                    (divide_128_uint(this.storage_uint8_[0]) << 0) |
                    0) >>>
                0
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "rgbaon8bits", {
        get: function get() {
            "use strict";

            return (
                ((divide_64_uint(this.storage_uint8_[3]) << 6) |
                    (divide_64_uint(this.storage_uint8_[2]) << 4) |
                    (divide_64_uint(this.storage_uint8_[1]) << 2) |
                    (divide_64_uint(this.storage_uint8_[0]) << 0) |
                    0) >>>
                0
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "rgbaon12bits", {
        get: function get() {
            "use strict";

            return (
                ((divide_32_uint(this.storage_uint8_[3]) << 9) |
                    (divide_32_uint(this.storage_uint8_[2]) << 6) |
                    (divide_32_uint(this.storage_uint8_[1]) << 3) |
                    (divide_32_uint(this.storage_uint8_[0]) << 0) |
                    0) >>>
                0
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "rgbaon16bits", {
        get: function get() {
            "use strict";

            return (
                ((divide_16_uint(this.storage_uint8_[3]) << 12) |
                    (divide_16_uint(this.storage_uint8_[2]) << 8) |
                    (divide_16_uint(this.storage_uint8_[1]) << 4) |
                    (divide_16_uint(this.storage_uint8_[0]) << 0) |
                    0) >>>
                0
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "offset", {
        get: function get() {
            "use strict";

            return divide_4_uint(this.storage_uint8_.byteOffset);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "slice_", {
        get: function get() {
            "use strict";

            return this.storage_uint8_.slice(0, rgba_bytes);
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "buffer_", {
        get: function get() {
            "use strict";

            return this.storage_uint8_.buffer.slice(
                this.storage_uint8_.byteOffset,
                plus_uint(this.storage_uint8_.byteOffset, rgba_bytes)
            );
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "subarray_", {
        get: function get() {
            "use strict";

            return this.storage_uint8_;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "set", {
        get: function get() {
            "use strict";

            return function (with_buffer) {
                "use strict";

                if (with_buffer instanceof Color) {
                    this.set_from_simdope(with_buffer);
                } else {
                    this.set_from_array(with_buffer);
                }
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "set_from_array", {
        get: function get() {
            "use strict";

            return function (with_buffer) {
                "use strict";

                this.storage_uint8_.set(with_buffer.subarray, 0);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "set_from_simdope", {
        get: function get() {
            "use strict";

            return function (with_buffer) {
                "use strict";

                this.storage_uint8_[0] = clamp_uint8(with_buffer.a);
                this.storage_uint8_[1] = clamp_uint8(with_buffer.b);
                this.storage_uint8_[2] = clamp_uint8(with_buffer.g);
                this.storage_uint8_[3] = clamp_uint8(with_buffer.r);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "set_from_buffer", {
        get: function get() {
            "use strict";

            return function (with_main_buffer, offset_4bytes) {
                "use strict";

                this.storage_uint8_ = new Uint8Array(
                    with_main_buffer,
                    multiply_uint_4(offset_4bytes),
                    max_int(
                        min_int(
                            rgba_bytes,
                            minus_int(
                                with_main_buffer.byteLength,
                                multiply_uint_4(offset_4bytes)
                            )
                        ),
                        0
                    )
                );
                this.tail_ = undefined;
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "get_tail_and_reset", {
        get: function get() {
            "use strict";

            return function () {
                "use strict";

                var tail = this.tail_;
                this.tail_ = undefined;
                return tail;
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "reset_tail", {
        get: function get() {
            "use strict";

            return function () {
                "use strict";

                this.tail_ = undefined;
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "set_tail", {
        get: function get() {
            "use strict";

            return function (simdope_instance, premultiply_alpha) {
                "use strict";

                if (typeof premultiply_alpha != "undefined") {
                    premultiply_alpha = premultiply_alpha | 0;
                    simdope_instance.multiply_a_255(premultiply_alpha | 0);
                }
                this.tail_ = simdope_instance;
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "simplify", {
        get: function get() {
            "use strict";

            return function (of) {
                "use strict";

                of = fr(of);
                this.storage_uint8_[0] = multiply_uint(round(this.a / of), of);
                this.storage_uint8_[1] = multiply_uint(round(this.b / of), of);
                this.storage_uint8_[2] = multiply_uint(round(this.g / of), of);
                this.storage_uint8_[3] = multiply_uint(round(this.r / of), of);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "normalize", {
        get: function get() {
            "use strict";

            return function () {
                "use strict";

                var rgb_sum = (this.r + this.g + this.b) | 0;
                this.storage_uint8_[1] = clamp_int(
                    ((this.b / rgb_sum) * 3) | 0,
                    0,
                    255
                );
                this.storage_uint8_[2] = clamp_int(
                    ((this.g / rgb_sum) * 3) | 0,
                    0,
                    255
                );
                this.storage_uint8_[3] = clamp_int(
                    ((this.r / rgb_sum) * 3) | 0,
                    0,
                    255
                );
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "set_out_of", {
        get: function get() {
            "use strict";

            return function (w, x, y, z) {
                "use strict";

                this.storage_uint8_[0] = clamp_uint8(w);
                this.storage_uint8_[1] = clamp_uint8(x);
                this.storage_uint8_[2] = clamp_uint8(y);
                this.storage_uint8_[3] = clamp_uint8(z);
                return this;
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Color.prototype, "skin", {
        get: function get() {
            "use strict";

            var ycbcra = this.ycbcra;
            var cb = ycbcra[1],
                cr = ycbcra[2];
            return 80 <= cb && cb <= 120 && 133 <= cr && cr <= 173;
        },
        enumerable: false,
        configurable: false
    });
    Color.prototype.get_subarray = function () {
        "use strict";

        return this.subarray_;
    };
    Color.prototype.get_slice = function () {
        "use strict";

        return this.slice_;
    };
    Color.prototype.get_buffer = function () {
        "use strict";

        return this.buffer_;
    };
    Color.blend_all = function (base, colors, amounts) {
        "use strict";

        var sum_r = base.r,
            sum_g = base.g,
            sum_b = base.b,
            sum_a = base.a,
            sum_amount = 1;
        var color,
            amount,
            length = colors.length | 0,
            i;
        for (i = 0; i < length; i++) {
            color = colors[i];
            amount = fr(amounts[i]);
            sum_amount += amount;
            sum_r += (color.r * amount) | 0;
            sum_g += (color.g * amount) | 0;
            sum_b += (color.b * amount) | 0;
            sum_a += (color.a * amount) | 0;
        }
        TEMPUINT8AX4[0] = clamp_uint8((sum_a / sum_amount) | 0);
        TEMPUINT8AX4[1] = clamp_uint8((sum_b / sum_amount) | 0);
        TEMPUINT8AX4[2] = clamp_uint8((sum_g / sum_amount) | 0);
        TEMPUINT8AX4[3] = clamp_uint8((sum_r / sum_amount) | 0);
        base.set_from_array(TEMPUINT8AX4);
        for (i = 0; i < length; i++) {
            colors[i].set_from_array(TEMPUINT8AX4);
        }
    };
    Color.prototype.blend_with_tails = function (alpha_addition) {
        "use strict";

        alpha_addition = alpha_addition | 0;
        var amount_alpha = 0,
            next = this.get_tail_and_reset();
        while (next instanceof Color) {
            amount_alpha = clamp_uint8(
                (alpha_addition | 0) != 0
                    ? divide_2_uint(plus_uint(this.a, next.a))
                    : inverse_255(
                        divide_255(
                            multiply_uint(inverse_255(next.a), inverse_255(this.a))
                        )
                    )
            );
            Color.merge_scale_of_255_a_fixed(
                next,
                divide_uint(multiply_255(next.a), amount_alpha),
                this,
                divide_255(
                    multiply_uint(
                        this.a,
                        divide_uint(multiply_255(inverse_255(next.a)), amount_alpha)
                    )
                ),
                amount_alpha
            );
            next = next.get_tail_and_reset();
        }
    };
    Color.prototype.blend_with = function (
        added_uint8x4,
        amount_alpha,
        should_return_transparent,
        alpha_addition
    ) {
        "use strict";

        should_return_transparent = should_return_transparent | 0;
        alpha_addition = alpha_addition | 0;
        amount_alpha = amount_alpha | 0;
        added_uint8x4.multiply_a_255(amount_alpha | 0);
        if ((should_return_transparent | 0) != 0) {
            if (this.is_fully_transparent()) {
                added_uint8x4.set_from_array(uint8a0);
            } else if (added_uint8x4.is_fully_transparent()) {
                this.set_from_array(uint8a0);
            }
            return this;
        }
        amount_alpha = clamp_uint8(
            (alpha_addition | 0) != 0
                ? divide_2_uint(plus_uint(this.a, added_uint8x4.a))
                : inverse_255(
                    divide_255(
                        multiply_uint(inverse_255(added_uint8x4.a), inverse_255(this.a))
                    )
                )
        );
        Color.merge_scale_of_255_a_fixed(
            added_uint8x4,
            divide_uint(multiply_255(added_uint8x4.a), amount_alpha),
            this,
            divide_255(
                multiply_uint(
                    this.a,
                    divide_uint(multiply_255(inverse_255(added_uint8x4.a)), amount_alpha)
                )
            ),
            amount_alpha
        );
        return this;
    };
    Color.prototype.get_difference_with = function (other) {
        "use strict";

        return Color.new_of(
            abs_int(this.r, other.r),
            abs_int(this.g, other.g),
            abs_int(this.b, other.b),
            abs_int(this.a, other.a)
        );
    };
    Color.prototype.sum_rgba = function () {
        "use strict";

        return plus_uint(plus_uint(this.r, this.g), plus_uint(this.b, this.a));
    };
    Color.prototype.sum_rgb = function () {
        "use strict";

        return plus_uint(plus_uint(this.r, this.g), this.b);
    };
    Color.prototype.is_dark = function () {
        "use strict";

        return uint_less_equal(this.sum_rgb(), 384);
    };
    Color.prototype.is_skin = function () {
        "use strict";

        return this.skin;
    };
    Color.prototype.is_not_skin = function () {
        "use strict";

        return !this.skin;
    };
    Color.prototype.is_fully_transparent = function () {
        "use strict";

        return uint_equal(this.a, 0);
    };
    Color.prototype.is_fully_opaque = function () {
        "use strict";

        return uint_equal(this.a, 255);
    };
    Color.prototype.is_not_fully_transparent = function () {
        "use strict";

        return !this.is_fully_transparent();
    };
    Color.prototype.is_not_fully_opaque = function () {
        "use strict";

        return !this.is_fully_opaque();
    };
    Color.prototype.match_with = function (color, threshold_255) {
        "use strict";

        threshold_255 = (threshold_255 | 0) >>> 0;
        if (threshold_255 === 255) {
            return true;
        } else if (threshold_255 === 0) {
            return this.uint32 == color.uint32;
        } else {
            return (
                abs_int((this.r - color.r) | 0) < (threshold_255 | 0) &&
                abs_int((this.g - color.g) | 0) < (threshold_255 | 0) &&
                abs_int((this.b - color.b) | 0) < (threshold_255 | 0) &&
                abs_int((this.a - color.a) | 0) < (threshold_255 | 0) &&
                true
            );
        }
    };
    Color.prototype.euclidean_match_with = function (color, threshold_float) {
        "use strict";

        threshold_float = fr(threshold_float);
        TEMPFLOAT32X1[0] = fr(
            FLOATONE - fr(abs_int((this.a - color.a) | 0) / XD[3])
        );
        TEMPFLOAT32X1[1] = fr(TEMPFLOAT32X1[0] - FLOAT3P);
        return (
            fr(
                s(
                    (PX[0] * p2((this.r - color.r) | 0) +
                        PX[1] * p2((this.g - color.g) | 0) +
                        PX[2] * p2((this.b - color.b) | 0)) |
                    0
                ) / EUCLMAX
            ) < fr(threshold_float * TEMPFLOAT32X1[1])
        );
    };
    Color.prototype.manhattan_match_with = function (color, threshold_float) {
        "use strict";

        threshold_float = fr(threshold_float);
        TEMPFLOAT32X1[0] = fr(
            FLOATONE - fr(abs_int((this.a - color.a) | 0) / XD[3])
        );
        TEMPFLOAT32X1[1] = fr(TEMPFLOAT32X1[0] - FLOAT3P);
        return (
            fr(
                ((PX[0] * abs_int((this.r - color.r) | 0) +
                        PX[1] * abs_int((this.g - color.g) | 0) +
                        PX[2] * abs_int((this.b - color.b) | 0)) |
                    0) /
                MANHMAX
            ) < fr(threshold_float * TEMPFLOAT32X1[1])
        );
    };
    Color.prototype.cie76_match_with = function (color, threshold_float) {
        "use strict";

        threshold_float = fr(threshold_float);
        TEMPFLOAT32X1[0] = fr(
            FLOATONE - fr(abs_int((this.a - color.a) | 0) / XD[3])
        );
        TEMPFLOAT32X1[1] = fr(TEMPFLOAT32X1[0] * TEMPFLOAT32X1[0] - FLOAT3P);
        var lab1 = this.laba,
            lab2 = color.laba;
        return (
            fr(
                s(
                    (p2(lab1[0] - lab2[0]) +
                        p2(lab1[1] - lab2[1]) +
                        p2(lab1[2] - lab2[2])) |
                    0
                ) / LABMAX
            ) < fr(threshold_float * TEMPFLOAT32X1[1])
        );
    };
    Color.prototype.set_r = function (r) {
        "use strict";

        this.subarray_[3] = clamp_uint8(r);
        return this;
    };
    Color.prototype.set_g = function (g) {
        "use strict";

        this.subarray_[2] = clamp_uint8(g);
        return this;
    };
    Color.prototype.set_b = function (b) {
        "use strict";

        this.subarray_[1] = clamp_uint8(b);
        return this;
    };
    Color.prototype.set_a = function (a) {
        "use strict";

        this.subarray_[0] = clamp_uint8(a);
        return this;
    };
    Color.prototype.to_greyscale = function (a) {
        "use strict";

        var subarray = this.subarray_;
        subarray[1] =
            subarray[2] =
                subarray[3] =
                    clamp_uint8((this.sum_rgb() / 3) | 0);
        return this;
    };
    Color.prototype.to_greyscale_luma = function (a) {
        "use strict";

        var subarray = this.subarray_;
        subarray[1] =
            subarray[2] =
                subarray[3] =
                    clamp_uint8(
                        ((this.r * PX[0] + this.g * PX[1] + this.b * PX[2]) / 3) | 0
                    );
        return this;
    };
    Color.prototype.multiply_a_255 = function (n) {
        "use strict";

        this.subarray_[0] = clamp_uint8(
            divide_255(multiply_uint(this.a | 0, n | 0))
        );
    };
    Color.prototype.copy = function () {
        "use strict";

        return new Color(this.slice_.buffer);
    };
    Color.with_r = function (t, r) {
        "use strict";

        var ta = t.get_slice();
        ta[3] = clamp_uint8(r);
        return new Color(ta.buffer);
    };
    Color.with_g = function (t, g) {
        "use strict";

        var ta = t.get_slice();
        ta[2] = clamp_uint8(g);
        return new Color(ta.buffer);
    };
    Color.with_b = function (t, b) {
        "use strict";

        var ta = t.get_slice();
        ta[1] = clamp_uint8(b);
        return new Color(ta.buffer);
    };
    Color.with_a = function (t, a) {
        "use strict";

        var ta = t.get_slice();
        ta[0] = clamp_uint8(a);
        return new Color(ta.buffer);
    };
    Color.with_inverse = function (t) {
        "use strict";

        var ta = t.get_slice();
        ta[3] = inverse_255(ta[3]);
        ta[2] = inverse_255(ta[2]);
        ta[1] = inverse_255(ta[1]);
        ta[0] = inverse_255(ta[0]);
        return new Color(ta.buffer);
    };
    Color.match = function (base_uint8x4, added_uint8x4, threshold_255) {
        "use strict";

        return base_uint8x4.match_with(added_uint8x4, threshold_255);
    };
    Color.blend = function (
        base_uint8x4,
        added_uint8x4,
        amount_alpha,
        should_return_transparent,
        alpha_addition
    ) {
        "use strict";

        return base_uint8x4
            .copy()
            .blend_with(
                added_uint8x4,
                amount_alpha,
                should_return_transparent,
                alpha_addition
            );
    };
    Color.prototype.merge_with_a_fixed = function (t2, alpha) {
        "use strict";

        alpha = clamp_uint8(alpha);
        var subarray = this.subarray_;
        subarray[0] = clamp_uint8(alpha);
        subarray[1] = plus_uint(this.b, t2.b);
        subarray[2] = plus_uint(this.g, t2.g);
        subarray[3] = plus_uint(this.r, t2.r);
        t2.set_from_simdope(this);
    };
    Color.merge_scale_of_255_a_fixed = function (t1, of1, t2, of2, alpha) {
        "use strict";

        of1 = clamp_uint8(of1);
        of2 = clamp_uint8(of2);
        alpha = clamp_uint8(alpha);
        var subarray1 = t1.get_subarray();
        var subarray2 = t2.get_subarray();
        subarray1[1] = divide_255(multiply_uint(t1.b, of1));
        subarray1[2] = divide_255(multiply_uint(t1.g, of1));
        subarray1[3] = divide_255(multiply_uint(t1.r, of1));
        subarray2[1] = divide_255(multiply_uint(t2.b, of2));
        subarray2[2] = divide_255(multiply_uint(t2.g, of2));
        subarray2[3] = divide_255(multiply_uint(t2.r, of2));
        subarray1[0] = clamp_uint8(alpha);
        subarray1[1] = plus_uint(t1.b, t2.b);
        subarray1[2] = plus_uint(t1.g, t2.g);
        subarray1[3] = plus_uint(t1.r, t2.r);
        subarray2[0] = subarray1[0];
        subarray2[1] = subarray1[1];
        subarray2[2] = subarray1[2];
        subarray2[3] = subarray1[3];
    };
    Color.scale_rgb_of_on_255 = function (t, of_r, of_g, of_b) {
        "use strict";

        var subarray = t.get_subarray();
        subarray[1] = divide_255(multiply_uint(t.b, of_b));
        subarray[2] = divide_255(multiply_uint(t.g, of_g));
        subarray[3] = divide_255(multiply_uint(t.r, of_r));
    };
    Color.merge_with_a_fixed = function (t1, t2, alpha) {
        "use strict";

        var subarray = t1.get_subarray();
        subarray[0] = clamp_uint8(alpha);
        subarray[1] = plus_uint(t1.b, t2.b);
        subarray[2] = plus_uint(t1.g, t2.g);
        subarray[3] = plus_uint(t1.r, t2.r);
        t2.set_from_array(subarray);
    };
    function alpha_add(a, b) {
        "use strict";

        return clamp_uint8(divide_uint(plus_uint(a, b), 2));
    }
    function alpha_euc(a, b) {
        "use strict";

        return clamp_uint8(
            inverse_255(divide_255(imul(inverse_255(a), inverse_255(b))))
        );
    }
    function get_alpha_with(a, b) {
        "use strict";

        return clamp_uint8(divide_uint(multiply_255(a), b));
    }
    function get_alpha_from(a, b, c) {
        "use strict";

        return clamp_uint8(
            divide_255(imul(a, divide_uint(multiply_255(inverse_255(b)), c)))
        );
    }
    Color.blend_all_four = function (
        from_a,
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
        should_return_transparent,
        alpha_addition
    ) {
        "use strict";

        alpha_addition = alpha_addition | 0;
        should_return_transparent = should_return_transparent | 0;
        if (should_return_transparent != 0) {
            if (from_a.is_fully_transparent()) {
                transparent[0] = 1;
            } else if (with_a.is_fully_transparent()) {
                transparent[0] = 1;
            }
            if (from_b.is_fully_transparent()) {
                transparent[1] = 1;
            } else if (with_b.is_fully_transparent()) {
                transparent[1] = 1;
            }
            if (from_c.is_fully_transparent()) {
                transparent[2] = 1;
            } else if (with_c.is_fully_transparent()) {
                transparent[2] = 1;
            }
            if (from_d.is_fully_transparent()) {
                transparent[3] = 1;
            } else if (with_d.is_fully_transparent()) {
                transparent[3] = 1;
            }
        }
        amount_alpha_a = clamp_uint8(amount_alpha_a);
        amount_alpha_b = clamp_uint8(amount_alpha_b);
        amount_alpha_c = clamp_uint8(amount_alpha_c);
        amount_alpha_d = clamp_uint8(amount_alpha_d);
        with_a.multiply_a_255(amount_alpha_a);
        with_b.multiply_a_255(amount_alpha_b);
        with_c.multiply_a_255(amount_alpha_c);
        with_d.multiply_a_255(amount_alpha_d);
        if ((alpha_addition | 0) != 0) {
            alpha[0] = alpha_add(from_a.a, amount_alpha_a);
            alpha[1] = alpha_add(from_b.a, amount_alpha_b);
            alpha[2] = alpha_add(from_c.a, amount_alpha_c);
            alpha[3] = alpha_add(from_d.a, amount_alpha_d);
        } else {
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
        with_a.set_out_of(
            0,
            divide_255(multiply_uint(with_a.b, alpha_with[0])),
            divide_255(multiply_uint(with_a.g, alpha_with[0])),
            divide_255(multiply_uint(with_a.r, alpha_with[0]))
        );
        with_b.set_out_of(
            0,
            divide_255(multiply_uint(with_b.b, alpha_with[1])),
            divide_255(multiply_uint(with_b.g, alpha_with[1])),
            divide_255(multiply_uint(with_b.r, alpha_with[1]))
        );
        with_c.set_out_of(
            0,
            divide_255(multiply_uint(with_c.b, alpha_with[2])),
            divide_255(multiply_uint(with_c.g, alpha_with[2])),
            divide_255(multiply_uint(with_c.r, alpha_with[2]))
        );
        with_d.set_out_of(
            0,
            divide_255(multiply_uint(with_d.b, alpha_with[3])),
            divide_255(multiply_uint(with_d.g, alpha_with[3])),
            divide_255(multiply_uint(with_d.r, alpha_with[3]))
        );
        from_a.set_out_of(
            0,
            divide_255(multiply_uint(from_a.b, alpha_from[0])),
            divide_255(multiply_uint(from_a.g, alpha_from[0])),
            divide_255(multiply_uint(from_a.r, alpha_from[0]))
        );
        from_b.set_out_of(
            0,
            divide_255(multiply_uint(from_b.b, alpha_from[1])),
            divide_255(multiply_uint(from_b.g, alpha_from[1])),
            divide_255(multiply_uint(from_b.r, alpha_from[1]))
        );
        from_c.set_out_of(
            0,
            divide_255(multiply_uint(from_c.b, alpha_from[2])),
            divide_255(multiply_uint(from_c.g, alpha_from[2])),
            divide_255(multiply_uint(from_c.r, alpha_from[2]))
        );
        from_d.set_out_of(
            0,
            divide_255(multiply_uint(from_d.b, alpha_from[3])),
            divide_255(multiply_uint(from_d.g, alpha_from[3])),
            divide_255(multiply_uint(from_d.r, alpha_from[3]))
        );
        from_a.merge_with_a_fixed(with_a, alpha[0]);
        from_b.merge_with_a_fixed(with_b, alpha[1]);
        from_c.merge_with_a_fixed(with_c, alpha[2]);
        from_d.merge_with_a_fixed(with_d, alpha[3]);
        if ((transparent[0] | 0) != 0) {
            from_a.set_out_of(0, 0, 0, 0);
            with_a.set_out_of(0, 0, 0, 0);
        }
        if ((transparent[1] | 0) != 0) {
            from_b.set_out_of(0, 0, 0, 0);
            with_b.set_out_of(0, 0, 0, 0);
        }
        if ((transparent[2] | 0) != 0) {
            from_c.set_out_of(0, 0, 0, 0);
            with_c.set_out_of(0, 0, 0, 0);
        }
        if ((transparent[3] | 0) != 0) {
            from_d.set_out_of(0, 0, 0, 0);
            with_d.set_out_of(0, 0, 0, 0);
        }
    };

    // From a given operation and number object perform the operation and return a the number object
    Color.plus = function (t, other) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_uint8(min_int(255, plus_int(t.r, other.r)));
        TEMPUINT8AX4[2] = clamp_uint8(min_int(255, plus_int(t.g, other.g)));
        TEMPUINT8AX4[1] = clamp_uint8(min_int(255, plus_int(t.b, other.b)));
        TEMPUINT8AX4[0] = clamp_uint8(min_int(255, plus_int(t.a, other.a)));
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.minus = function (t, other) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_uint8(max_int(0, minus_int(t.r, other.r)));
        TEMPUINT8AX4[2] = clamp_uint8(max_int(0, minus_int(t.g, other.g)));
        TEMPUINT8AX4[1] = clamp_uint8(max_int(0, minus_int(t.b, other.b)));
        TEMPUINT8AX4[0] = clamp_uint8(max_int(0, minus_int(t.a, other.a)));
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    Color.average = function (t, other) {
        "use strict";

        TEMPUINT8AX4[3] = clamp_uint8(divide_2_uint(plus_uint(t.r, other.r)));
        TEMPUINT8AX4[2] = clamp_uint8(divide_2_uint(plus_uint(t.g, other.g)));
        TEMPUINT8AX4[1] = clamp_uint8(divide_2_uint(plus_uint(t.b, other.b)));
        TEMPUINT8AX4[0] = clamp_uint8(divide_2_uint(plus_uint(t.a, other.a)));
        return new Color(TEMPUINT8AX4.slice(0, rgba_bytes).buffer);
    };
    var Colors = function Colors(with_main_buffer, bytes_offset, bytes_length) {
        "use strict";

        if (!(this instanceof Colors)) {
            return new Colors(with_main_buffer);
        }
        if (typeof with_main_buffer != "undefined") {
            if (typeof with_main_buffer.data != "undefined") {
                this.storage_ = new Uint32Array(
                    with_main_buffer.data
                        .slice(0, with_main_buffer.data.length)
                        .reverse().buffer
                ).reverse().buffer;
            } else if (typeof with_main_buffer.buffer != "undefined") {
                this.storage_ = with_main_buffer.buffer;
            } else {
                this.storage_ = with_main_buffer;
            }
        } else {
            this.storage_ = new ArrayBuffer(0);
        }
        bytes_offset = bytes_offset | 0;
        bytes_length = bytes_length | 0 || this.storage_.byteLength | 0;
        this.storage_uint8_array_ = new Uint8Array(
            this.storage_,
            bytes_offset,
            bytes_length
        );
        this.storage_uint32_array_ = new Uint32Array(
            this.storage_,
            bytes_offset,
            divide_4_uint(bytes_length)
        );
    };
    Object.defineProperty(Colors.prototype, "length", {
        get: function get() {
            "use strict";

            return this.storage_uint32_array_.length;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "buffer_", {
        get: function get() {
            "use strict";

            return this.storage_;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "buffer_setUint8", {
        get: function get() {
            "use strict";

            return function (i, n) {
                "use strict";

                return (this.storage_uint8_array_[i | 0] = clamp_uint8(n | 0));
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "get_deduplicated_uint32a", {
        get: function get() {
            "use strict";

            return function (i) {
                "use strict";

                return Uint32Array.from(new Set(this.storage_uint32_array_));
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "get_deduplicated_sorted_uint32a", {
        get: function get() {
            "use strict";

            return function (i) {
                "use strict";

                var colors_uint32a = this.get_deduplicated_uint32a(),
                    color_a = new Color(new ArrayBuffer(4)),
                    color_b = new Color(new ArrayBuffer(4));
                colors_uint32a.sort(function (a, b) {
                    color_a = Color.new_uint32(a);
                    color_b = Color.new_uint32(b);
                    return (
                        hilbert_index(color_a.r, color_a.g, color_a.b) -
                        hilbert_index(color_b.r, color_b.g, color_b.b)
                    );
                });
                return colors_uint32a;
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "buffer_getUint8", {
        get: function get() {
            "use strict";

            return function (i) {
                "use strict";

                return this.storage_uint8_array_[i | 0];
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "buffer_getUint8a", {
        get: function get() {
            "use strict";

            return function (i, n) {
                "use strict";

                i = i | 0;
                n = n | 0;
                n = n || 1;
                n = plus_uint(i, multiply_uint_4(n));
                return this.storage_uint8_array_.subarray(i, n);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "buffer_setUint32", {
        get: function get() {
            "use strict";

            return function (i, n) {
                "use strict";

                this.storage_uint32_array_[i | 0] = clamp_uint32(n);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "buffer_getUint32", {
        get: function get() {
            "use strict";

            return function (i) {
                "use strict";

                return this.storage_uint32_array_[i | 0];
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "subarray_uint32", {
        get: function get() {
            "use strict";

            return function (start, end) {
                "use strict";

                start = start | 0;
                end = end | 0;
                end = end || this.length;
                return this.storage_uint32_array_.subarray(start, end);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "slice_uint32", {
        get: function get() {
            "use strict";

            return function (start, end) {
                "use strict";

                start = start | 0;
                end = end | 0;
                end = end || this.length;
                return this.storage_uint32_array_.slice(start, end);
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "subarray_uint8", {
        get: function get() {
            "use strict";

            return function (start, end) {
                "use strict";

                start = start | 0;
                end = end | 0;
                return this.storage_uint8_array_.subarray(
                    multiply_uint_4(start),
                    multiply_uint_4(end)
                );
            };
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(Colors.prototype, "slice_uint8", {
        get: function get() {
            "use strict";

            return function (start, end) {
                "use strict";

                start = start | 0;
                end = end | 0;
                return this.storage_uint8_array_.slice(
                    multiply_uint_4(start),
                    multiply_uint_4(end)
                );
            };
        },
        enumerable: false,
        configurable: false
    });
    Colors.prototype.get_image_data = function () {
        return new Uint8Array(
            this.slice_uint32(0, this.length).reverse().buffer
        ).reverse();
    };
    Colors.prototype.get_element = function (i, old_object) {
        "use strict";

        if (typeof old_object != "undefined") {
            old_object.set_from_buffer(this.buffer_, i | 0);
            return old_object;
        } else {
            return new Color(this.buffer_, i | 0);
        }
    };
    Colors.prototype.subarray = function (i, n) {
        "use strict";

        return this.buffer_getUint8a(i | 0, n | 0);
    };
    Colors.prototype.set_element = function (i, el) {
        "use strict";

        this.buffer_setUint32(i | 0, clamp_uint32(el.uint32));
    };
    Colors.prototype.set_uint32_element = function (i, uint32) {
        "use strict";

        this.buffer_setUint32(i | 0, clamp_uint32(uint32));
    };
    Colors.prototype.get_uint32_element = function (i) {
        "use strict";

        i = i | 0;
        return this.buffer_getUint32(i);
    };
    Colors.prototype.get_sub_uint8a = function (i, n) {
        "use strict";

        i = i | 0;
        n = n | 0;
        return this.buffer_getUint8a(multiply_uint_4(i), n);
    };
    Colors.prototype.get_slice_uint8a = function (i, n) {
        "use strict";

        i = i | 0;
        n = n | 0;
        return this.buffer_getUint8a(multiply_uint_4(i), n).slice(
            0,
            multiply_uint_4(n || 1)
        );
    };
    Colors.prototype.get_buffer = function (i, n) {
        "use strict";

        i = i | 0;
        n = n | 0;
        return this.buffer_getUint8a(multiply_uint_4(i), n).buffer;
    };
    SIMDOPE.simdops = ops;
    SIMDOPE.Color = Color;
    SIMDOPE.SIMDopeColor = SIMDOPE.Color; // Alias
    SIMDOPE.Colors = Colors;
    SIMDOPE.SIMDopeColors = SIMDOPE.Colors; // Alias

    return SIMDOPE;
})();
window.SIMDOPE = SIMDOPE;
