# SIMDope 3.5.0

**Color trafficking library faster than tools not mentioning it, lighting fast and around 1000 lines of code.**

![MIT](https://img.shields.io/badge/license-MIT-green)

![SIMDope branding logo](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Branding.png)

SIMDOPE is a library that enhances processing speed of colors by using an array of bytes with view of it using a secondary classes. The first class, called SIMDOPE.Colors, should be used for any list of colors because it allows for faster processing and creation. The second class, called SIMDope.Color, is used to transform, convert, and operate on a single color. It's important to note that when you retrieve an element from a new instance of the SIMDope.Colors class, it's not copied (That's also why it's fast no work to do for the garbage collector).

## Performance

![SIMDope performance in use](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Performance.png) ![npm](https://img.shields.io/npm/dw/simdope?label=NPM%20DOWNLOAD&logo=NPM)


Instead, gracefully, a view of the TypedArray colors data is obtained (and you can do `new SIMDOPE.Colors(imagedata || new Uint32Array(16)))`, which allows for faster operation. This means that any changes made to the retrieved element will be reflected in the original TypedArray, it already is optimized for performance.

Then it operate simply mostly on four Uint8 elements inside it's method's functionalities and single Uint32 for outside operations onto the array of colors.

## FUN FACT
 > Through our color quantization alg. (soon on NPM) we can go from 250K colors to 1K in just 0.3-0.4 sec. BLENDING QUITE ALL THEM TOGETHER #MADNESS
 > A canvas of 512x512 is ~250k pixels... but this lib. handle **multiple millions ops per second**! Not yet compared but for sure between 4-16x faster than most other libraries (thanks SIMD JS & ASM JS)!
 
## How to use SIMDope.Color?

To see how to use it, and since it is oriented onto performance, you may need to look at the source code. Yet here is the possibilities you have to create a new color object.

### Installing the library
```script
npm install simdope
```

### Importing the library

#### Browser
```javascript
// Use the file located in /dist/index.min.js because it has polyfills required for < Chrome 61.0 (September 5, 2017)
var Color = window.SIMDOPE.Color;
var Colors = window.SIMDOPE.Colors;
```

#### NodeJS
```javascript
// Use the file located in / because it will be parsed properly by piece of code such as Babel
import {Color, Colors} from "simdope";
```

### Instantiate an object of the single color class

```JavaScript

// If the first parameter is detected as an ArrayBuffer,
// the second parameters tells the constructor
// where to start the sub view, knowing that it will
// multiply it by 4 since there is 4 bytes per ccolor compoment.

// If the first parameters is a Uint8Array, it will use it
Color(with_main_buffer, offset_4bytes) 

// Create a color of r: 0, g: 0, b: 0, a: 0
Color.new_zero()
Color.new_of(r, g, b, a)
Color.new_safe_of(r, g, b, a)
Color.new_from(agbr_array)
Color.new_array(rgba_array)
Color.new_array_safe(rgba_array)
Color.new_uint32(uint32)
Color.new_hsla(h, s, l, a)
Color.new_hex(hex_anything)

```

### Properties

```JavaScript

// Get only
color.r
color.g
color.b
color.a
color.uint32
color.hex
color.hsla
color.lab
color.ycbcra
color.skin // Boolean is skin
color.tail // Tail, usefull for chaining multiple color before blending witin the object AND list at once
color.rgbaon4bits
color.rgbaon6bits
color.rgbaon8bits
color.rgbaon12bits
color.offset

// Private properties (see methods to access them preferably)
color.buffer_
color.subarray_ // It doesn't copy the data, it creates a "pointer" instance
color.slice_ // This clone the data, it creates a whole new Uint8Array
```

### Methods

```JavaScript

// Get
color.get_buffer()
color.get_subarray()
color.get_slice()
color.sum_rgba()
color.sum_rgb()
color.is_dark()
color.is_skin()
color.is_fully_transparent()
color.is_fully_opaque()
color.is_not_skin()
color.is_not_fully_transparent()
color.is_not_fully_opaque()

// Set
color.set(with_buffer) // Uint8Array or ArrayBuffer, it will check the type of the parameter but it will be slower
color.set_from_simdope(color);
color.set_from_array(new Uint8Array(4)); // ABGR
color.set_from_buffer(with_buffer, offset_four_bytes); // Used to reuse the instanciated object when you need to retrieve an el.
// You need to premultiply alpha to tell to which intensity you'll blend the color when calling `.blend_with_tails()`
// We don't want to store yet another property especially just for maybe blending them once then
color.set_tail(simdope_instance, premultiply_alpha_255_optional) 
color.simplify(divider) // 1.6, 2, 3.2, 4, 4.8, 6... Simplify means divide all, coerce to Uint, multiply them again
color.blend_with(another_color, strength_on_255, should_return_transparent, is_alpha_addition)
color.blend_with_tails(is_alpha_addition); // This method will delete all tail's "links" then, for memory concerns
color.match_with(another_color, threshold_on_255) // This was an old function I kept
color.manhattan_match_with(another_color, threshold_float) // This is the fastest color matching algh.
color.euclidean_match_with(another_color, threshold_float) // This is a fast and great color matching algh.
color.cie76_match_with(another_color, threshold_float) // This is a great color matching algh. but it requires more efforts
color.set_r(r)
color.set_g(g)
color.set_b(b)
color.set_a(a)
color.to_greyscale();
color.to_greyscale_luma();
```
### Functions

```JavaScript

// Create + copy a new instance
Color.with_r(color, r)
Color.with_g(color, g)
Color.with_b(color, b)
Color.with_a(color, a)
Color.with_inverse(color)

// Return a result YET YOU DON'T NEED THE RETURN VALUE
// TYPED ARRAY ARE MUTABLE, THEY MUTATE STATE FOR EVERY "REFERENCE" 
// WHEN YOU MODIFY AN ELEMENT, IT MODIFY THE LIST TOO
Color.with_match(color_a, color_b, threshold_on_255)
Color.blend(color_a, color_b, strength_on_one, should_return_transparent, is_alpha_addition)
```

Please, look at the source code to know more about other cool ways of using it ...

## How to use SIMDope.Colors?

### Instantiate an object of the multiple colors class

```JavaScript

// Create a new "list/array" of colors, you can work with 
// both Uint32Array, it will use its buffer and
// also Uint8Array, it will use its buffer... 
// ArrayBuffer works too!

Colors(with_main_buffer)

```

### Properties

```JavaScript
// Get only
colors.length
colors.buffer
```

### Methods

```JavaScript
// Get
colors.get_element(index, old_color_object_optional_faster)
// But often except if you `.copy()` the color... yet even if you reuse the same single color object:
// It update the color within your list's buffer when you get an element and apply changes

// Both start and end are an index, not an offset
colors.subarray_uint32(start, end) 
colors.slice_uint32(start, end)
colors.subarray_uint8(start, end)
colors.slice_uint8(start, end)
// It uses the `Set` class to remove similar uint32 entries, yet it might need some polyfills for old browser.
colors.get_deduplicated_uint32a()
// It uses a high-performance 8bits 3D Hilbert curve algorithm to sort them on one dimension, very efficient...
colors.get_deduplicated_sorted_uint32a() 

// Set
colors.set_element(index, color_object) 
// Both start and end are an index, not an offset
colors.buffer_setUint8(index, number)
colors.buffer_setUint32(index, number)
```

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

Please, look at the source code to know more about other cool ways of using it ...
