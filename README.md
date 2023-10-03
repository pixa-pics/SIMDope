### Introducing SIMDope 5.5.0: The Pinnacle of Color Processing in JavaScript

**Unleash the Power of Exceptional Color Handling with Unparalleled Speed**

![MIT License](https://img.shields.io/badge/license-MIT-green)

![SIMDope Branding Logo](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Branding.png)

Welcome to SIMDope, a revolutionary color library designed not just to meet, but to exceed the expectations of developers in the realm of color processing! Empowering you with the ability to blend colors using "fast", "great", or even "majestic" instance's methods just like: `color.manhattan_match_with(color, float); color.euclidean_match_with(color, float); color.cie76_match_with(color, float)` algorithms, this library also paves the way for simplifying colors down to ratios like 1/8, 1/6, or even 1/1.6.

🎨 **Blend, Simplify, and Categorize Colors Like Never Before!**

Bring 250K colors (still manageable) down to a "BEST" manageable 25K with methods such as `.simplify(ex: 1.6)`, or categorize skin tones using the (Boolean) property of Color's instances named `.skin` and other ones into clusters of 64, 256, or even 4096 possibilities, utilizing the `.rgbaon[6,8,12,16]bits`, and witness the magic of simplification and categorization like never before!

🚀 **Incomparable Speed and Efficiency!**

Experience unparalleled speed with the ability to process 2M operations a second, reducing ~103K colors down to 624 in just 162ms on an average "Intel I5" (CPU) equipped computer - an achievement of 2M+ OPS / SEC. that redefines the boundaries of traditional JavaScript!
> Even tho we casually get outrageously too much inspired by SIMD.JS and ASM.JS...

![SIMDope Performance](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Performance.png) ![NPM Downloads](https://img.shields.io/npm/dw/simdope?label=NPM%20Downloads&logo=NPM)

📊 **Transform 3D Color Data (r, g, b) to 1D Arrays!**

Employ Lebesgue, Hilbert, and Moore algorithms to convert complex 3D color sets into neatly ordered 1D arrays, navigating through various hues, tones, saturations, chroma, and luminosity with finesse. SIMDope offers the only authentic way to navigate through complex color sets with such ease and precision! See: `colors.get_deduplicated_sorted_uint32a(limit=200, background="#FFFFFFFF", algorithm="lebesgue")`

```JavaScript
_get_most_used_color_sorted_well_html5 = (simdopeColors) => {
    "use strict";
    // Optional "but" faaaaster as it recycles it (being a sequencial operation, only one isntance of "Color" is needed).
    var recycolor = new SIMDopeColor(new ArrayBuffer(4)), categories = new Map();
    for(var i = 0; i < simdopeColors.length; i++) {
        // Give you access to all properties and method of Color's instance
        recycolor = simdopeColors.get_element(i, recycolor);
        // Simplify the color of 320% (YEAH FAAAST)
        recycolor.simplify(3.2);
        // The color "i" is in the category being N (64 possibilities using 6 bits)
        // 4, 6, 8, 12, 16 BITS RESULTS IN (16, 64, 256, 4096, 65536) CATEGORIES
        categories.set(i, recycolor.rgbaon6bits);
        // = CLUSTERING METHOD FASTER THAN A thunderbolt being faster than a "TR-3B"
    }
    // Constants like "limit" is simply ignoring less redundant ones before sorting them (after "background" enabling us to ignore alpha) with the fine tuned and chosen "algorithm".
    var LIMIT = 999, BACKGROUND = "#FFFFFFFF", ALGORITHM = ["hilbert", "moore", "lebesgue"][Math.floor(Math.random() * 3 - 0.1)];
    // List of colors, given a uint32array's buffer, we get a SIMDope's Colors' instance right back into our JS code
    var colors = new SIMDopeColors(simdopeColors.get_deduplicated_sorted_uint32a(LIMIT, BACKGROUND, ALGORITHM).buffer);
    // Array of hexadecimal colors in the starting block
    var hexs1D = [], arrayTemp = [], hexs2D = new Array(64).fill([]);
    // Filling the 2D "list" with our champion's hexadecimal outputs
    for(var i = 0; i < LIMIT; i++) {
        recycolor = colors.get_element(i, recycolor);
        if(recycolor.is_not_skin()){ // Ignoring skin toned colours
            arrayTemp = hexs2D[recycolor.rgbaon6bits]; // Select the color's cluster
            arrayTemp.push(recycolor.hex); // Add color's "HEX" value to one of the 64 clusters
        }
    }
    // Returning an array of HTML5/CSS3 (ready) colors from a two dimension array of clusters with hexadecimal colors
    hexs1D = Array.prototype.concat.apply([], hexs2D);
    return hexs1D;
};
```

![SIMDope Sorting Colors](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Sorting.png)

## How to Integrate SIMDope into Your Projects

```script
npm install simdope
```

### Importing the Library

#### Browser
```javascript
// Use the file located in /dist/browser.min.js for proper polyfill support (pre-Chrome 61.0)
var Color = window.SIMDOPE.Color;
var Colors = window.SIMDOPE.Colors;
```

#### NodeJS
```javascript
// simdope/dist/index.min.js is also available
import { Color, Colors } from "simdope";
```

## How to use SIMDope.Color?

### 🔧 Functions, Methods, and Properties of SIMDope.Color

#### Instantiate an object of the single color class

```JavaScript
// We often use a uint32array just as: new Uint32Array(imagedata.data.buffer)
// Better just put the uint32array inside the constructor Colors using the class named: Color
Color(with_main_buffer, offset_4bytes_optional) // Uint8Array.of(127, 95, 0, 255) as "r, g, b, a" works too
Color.new_zero()
Color.new_of(r, g, b, a)
Color.new_safe_of(r, g, b, a)
Color.new_from(agbr_array)
Color.new_array(rgba_array)
Color.new_array_safe(rgba_array)
Color.new_uint32(uint32) 
Color.new_uint32b(uint32b)
Color.new_hsla(h, s, l, a)
Color.new_hex(hex_anything)
```

#### 🔍 **Properties**:

| Property                          | Description                                                  |
|-----------------------------------|--------------------------------------------------------------|
| ```color.r ```         | Red component (readonly)                                     |
| ```color.g ```         | Green component (readonly)                                   |
| ```color.b ```         | Blue component (readonly)                                    |
| ```color.a ```         | Alpha component (readonly)                                   |
| ```color.uint32 ```    | Integer representation (readonly)                            |
| ```color.uint32b ```   | Integer representation (readonly)                            |
| ```color.hex ```       | Hex representation (readonly)                                |
| ```color.hsla ```      | HSLA representation (readonly)                               |
| ```color.lab ```       | LAB color space (readonly)                                   |
| ```color.ycbcra ```    | YCbCrA color representation (readonly)                       |
| ```color.skin ```      | Indicates if the color matches skin tones (Boolean)          |
| ```color.tail ```      | Utility for chaining multiple colors before blending         |
| ```color.hilbert ```   | Indicates the 1D (uint32) index of the RGB coordinates       |
| ```color.moore ```     | Indicates the 1D (uint32) index of the RGB coordinates       |
| ```color.lebesgue ```  | Indicates the 1D (uint32) index of the RGB coordinates       |
| ```color.rgbaon4bits ``` | RGBA on 4 bits representation (readonly)                     |
| ```color.rgbaon6bits ``` | RGBA on 6 bits representation (readonly)                     |
| ```color.rgbaon8bits ``` | RGBA on 8 bits representation (readonly)                     |
| ```color.rgbaon12bits ``` | RGBA on 12 bits representation (readonly)                    |
| ```color.offset ```    | Offset of the color data (readonly)                          |
| ```color.buffer_ ```   | Primary buffer (private; use methods for access)             |
| ```color.subarray_ ``` | Provides a "pointer" instance without copying data (private) |
| ```color.slice_ ```    | Clones the data into a new Uint8Array (private)              |

#### 🔍 **Methods**:

**Get**:

| Method | Description |
| ------ | ----------- |
|  ```color.get_buffer( )``` | Retrieve the primary buffer |
|  ```color.get_subarray( )``` | Access the "pointer" instance of the color data |
|  ```color.get_slice( )``` | Clone and retrieve the color data |
|  ```color.sum_rgba( )``` | Sum of RGBA values |
|  ```color.sum_rgb( )``` | Sum of RGB values |
|  ```color.is_dark( )``` | Check if color is dark |
|  ```color.is_skin( )``` | Check if color matches skin tones |
|  ```color.is_fully_transparent( )``` | Check if color is fully transparent |
|  ```color.is_fully_opaque( )``` | Check if color is fully opaque |
|  ```color.is_not_skin( )``` | Check if color doesn't match skin tones |
|  ```color.is_not_fully_transparent( )``` | Check if color isn't fully transparent |
|  ```color.is_not_fully_opaque( )``` | Check if color isn't fully opaque |

**Set**:

| Method | Description                                    |
| ------ |------------------------------------------------|
|  ```color.set(with_buffer )``` | Set the color using (Uint8Array or ArrayBuffer) |
|  ```color.set_from_simdope(color )``` | Set a color from a Color instance  |
|  ```color.set_from_array(new Uint8Array(4) )``` | Set the color from an ABGR  |
|  ```color.set_from_buffer(with_buffer, offset_four_bytes )``` | Reuse the instanced object  |
|  ```color.set_tail(simdope_instance, premultiply_alpha_255_optional )``` | Set a tail |
|  ```color.simplify(divider )``` | Peg the color (e.g., 1.6, 2, 3.2)  |
|  ```color.blend_with(another_color, strength_on_255, should_return_transparent, is_alpha_addition )``` | Blend |
|  ```color.blend_first_with(another_color, strength_on_255, should_return_transparent, is_alpha_addition )``` | Blend |
|  ```color.blend_first_with_tails(is_alpha_addition )``` | Blend color with tails then deletes tail links |
|  ```color.match_with(another_color, threshold_on_255 )``` | Match color   |
|  ```color.manhattan_match_with(another_color, threshold_float )``` | Match color using Manhattan algorithm  |
|  ```color.euclidean_match_with(another_color, threshold_float )``` | Match color using Euclidean algorithm  |
|  ```color.cie76_match_with(another_color, threshold_float )``` | Match color using CIE76 algorithm  |
|  ```color.set_r(r )``` | Set red component to `r`   |
|  ```color.set_g(g )``` | Set green component to `g`  |
|  ```color.set_b(b )``` | Set blue component to `b`  |
|  ```color.set_a(a )``` | Set alpha component to `a`  |
|  ```color.to_greyscale( )``` | Convert color to greyscale  |
|  ```color.to_greyscale_luma( )``` | Convert color to greyscale using luma  |

#### 🔍 **Functions**:

| Function | Description |
| -------- | ----------- |
|  ```Color.with_r(color, r )``` | Create a new color instance using `color` with specified red component `r` |
|  ```Color.with_g(color, g )``` | Create a new color instance using `color` with specified green component `g` |
|  ```Color.with_b(color, b )``` | Create a new color instance using `color` with specified blue component `b` |
|  ```Color.with_a(color, a )``` | Create a new color instance using `color` with specified alpha component `a` |
|  ```Color.with_inverse(color )``` | Create a new color instance with inverted colors of `color` |
|  ```Color.with_match(color_a, color_b, threshold_on_255 )``` | Match two colors `color_a` and `color_b` with a threshold `threshold_on_255` |
|  ```Color.blend(color_a, color_b, strength_on_one, should_return_transparent, is_alpha_addition )``` | Blend two colors `color_a` and `color_b` with `strength_on_one`, `should_return_transparent`, and `is_alpha_addition` |

Please, look at the source code to know more about other cool ways of using it ...

## How to use SIMDope.Colors?

### 🔧 Functions, Methods, and Properties of SIMDope.Colors

#### 🔍 **Properties**:

| Property | Description |
| -------- | ----------- |
|  ```colors.length ``` | Number of colors in the list (readonly) |
|  ```colors.buffer ``` | Buffer containing the color data (readonly) |

#### 🔍 **Methods**:

**Get**:

| Method                                                                 | Parameters                                                                                                                         | Description |
|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------| ----------- |
|  ```colors.get_element(index, old_color_object_optional_faster )```          | `index`: Position of color in the list <br> `old_color_object_optional_faster`: (Optional) Previous color object for faster access | Retrieve the color at a specified index. When you get an element and apply changes, it updates the color within your list's buffer. |
|  ```colors.subarray_uint32(start, end )```                                   | `start`: Start index <br> `end`: End index                                                                                         | Get a subarray from the Uint32Array representation |
|  ```colors.slice_uint32(start, end )```                                      | `start`: Start index <br> `end`: End index                                                                                         | Get a slice from the Uint32Array representation |
|  ```colors.subarray_uint8(start, end )```                                    | `start`: Start index <br> `end`: End index                                                                                         | Get a subarray from the Uint8Array representation |
|  ```colors.slice_uint8(start, end )```                                       | `start`: Start index <br> `end`: End index                                                                                         | Get a slice from the Uint8Array representation |
|  ```colors.get_deduplicated_uint32a( )```                                    | None                                                                                                                               | Removes duplicate uint32 entries. May need polyfills for older browsers. |
|  ```colors.get_deduplicated_sorted_uint32a(limit, background, algorithm )``` | Optional                                                                                                                           | Use a high-performance 8bits curve algorithm |

**Set**:

| Method | Parameters | Description |
| ------ | ---------- | ----------- |
|  ```colors.set_element(index, color_object )``` | `index`: Position in the list to set the color <br> `color_object`: The color object to set | Set a color at the specified index |
|  ```colors.buffer_setUint8(index, number )``` | `index`: Position in the buffer to set the byte <br> `number`: Byte value to set | Set a byte in the buffer |
|  ```colors.buffer_setUint32(index, number )``` | `index`: Position in the buffer to set the Uint32 value <br> `number`: Uint32 value to set | Set a Uint32 value in the buffer |


## How it should be used (LOOK HERE)

```JavaScript

var white = Color.new_of(255, 255, 255, 255);
var green = Color.new_of(0, 255, 0, 255);
var red = Color.new_of(255, 0, 0, 255);

var simdope_my_colors = Colors(imagedata);
    // That rewrite the inner data of our array but also white if we don't copy it
    simdope_my_colors.get_element(0).blend_with(white.copy(), 192, false, false);
    simdope_my_colors.get_element(1).blend_with(white, 0.25*255, false, false) ;

simdope_my_colors.get_element(2)
    .blend_with(white.copy(), 0.25*255, false, true)
    .blend_with(green.copy(), 0.75*255, false, true)
    .blend_with(red.copy(), 0.25*255, false, true)
    
var purple = simdope_my_colors.get_element(2);
var purple_copy = purple.copy();
var purple_hex = purple.hex;
var purple_uint32 = purple.uint32;
var is_purple_dark = purple.is_dark();
var is_purple_dark_but_from_hex = Color.new_hex(purple_hex).is_dark();
var purple_alpha_but_from_uint32 = Color.new_uint32(purple_uint32).a;

var some_uint32array_colors = simdope_my_colors.subarray_uint32(0, 3);
var some_colors = new Colors(some_uint32array_colors.buffer);

  some_colors.set_uint32_element(0, purple.uint32);
  some_colors.set_uint32_element(1, purple.uint32);

```


For more usage scenarios, explore the source code.

Please refer to the source code for additional information and advanced usage scenarios.


## About me

```shell
..................            ..
.......                         
.....                           
.........       ...             
......- .  .#######+.           
....    . .##########+.         
.....-+#++###+++++++#+-         
....-######+--------.++-.       
.. .-#######++++-+++-++##+      
... +######++##+-##+-.-##+.     
.. .#######+--+-----..-###.     
...-########--++++---+####.     
...+########+++##++.-####-      
...##########+++++-.#####.      
...#########++####--#####+.     
..-###########+++++.+######- ...
.-##############-++--#######-. .
```

> "Philosophy is the science of estimating values, yet technology is the value of estimating science. My design is my voice while my code is my weapon of choice..."

I am (sometimes) open to work^^ ==> https://www.linkedin.com/in/matias-affolter/