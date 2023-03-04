# SIMDope

**Color trafficking library faster than tools not mentioning it, lighting fast and around 1000 lines of code.**

![MIT](https://img.shields.io/badge/license-MIT-green)

![UraniumJS branding logo](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Branding.png) ![npm](https://img.shields.io/npm/dw/simdope?label=NPM%20DOWNLOAD&logo=NPM)


SIMDope to which the name and more was inspired by Single Instruction Multiple Data, a technic to enhance the speed of processing, it is a parent object of two classes, one which is linked with the one it uses, the "SIMDope.SIMDopeColors" is a class, yet you don't need to use the word new before calling this kind of function and it uses "SIMDope.SIMDopeColor" which is of the same type of constructor, in facts, for any list of colors you better use the first class I mentionned, any element being color within it, will be faster to process and create and it will be still calling the second class I mentionned which has the purpose to tranform, convert, and operate on a single color. Within it, a color, is from a low-level perspective (in this library) using a Buffer of 32bits (4 bytes), each byte but only once represent either : Red, Green, Blue, or Alpha (The inverse of opacity), as we know, one byte contains 256 possibilites, and here inside it, we use numbers fro 0-255.

You need to use a buffer from an array of Uint32 for any lists, or you can look at the code and use the right class for single color, yet creating a color component from any type of data, it will enables you to check opacity, blend them unbelievably fast, and do more. A much more precise documentation should follow as it should be added somehow sooner or later.


## How to use SIMDope.SIMDopeColor?

To see how to use it, and since it is oriented onto performance, you may need to look at the source code. Yet here is the possibilities you have to create a new color object.

### Instanciate an object of the single color class

```JavaScript

// If the first parameter is detected as an ArrayBuffer,
// the second parameters tells the constructor
// where to start the sub view, knowing that it will
// multiply it by 4 since there is 4 bytes per ccolor compoment.

// If the first parameters is a Uint8Array, it will use it
SIMDopeColor(with_main_buffer, offset_4bytes) 

// Create a color of r: 0, g: 0, b: 0, a: 0
SIMDopeColor.new_zero()

// Create a color of r: n, g: n, b: n, a: n
SIMDopeColor.new_splat(n)

SIMDopeColor.new_of(r, g, b, a)

SIMDopeColor.new_safe_of(r, g, b, a)

SIMDopeColor.new_from(agbr_array)

SIMDopeColor.new_array(rgba_array)

SIMDopeColor.new_array_safe(rgba_array)

SIMDopeColor.new_uint32(uint32)

SIMDopeColor.new_hsla(h, s, l, a)

SIMDopeColor.new_hex(hex_anything)

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
color.hsl
color.rgbaon4bits
color.rgbaon6bits
color.rgbaon8bits
color.rgbaon12bits
color.offset
color.buffer
color.subarray // It doesn't copy the data, it creates a "pointer" instance
color.slice // This clone the data, it creates a whole new Uint8Array
```

### Methods

```JavaScript

// Get
color.sum_rgba()
color.sum_rgb()
color.is_dark()
color.is_fully_transparent()
color.is_fully_opaque()
color.is_not_fully_transparent()
color.is_not_fully_opaque()

// Set
color.set(with_buffer) // Uint8Array or ArrayBuffer
color.simplify(divider) // 1.6, 2, 4, ... Simplify means divide all, coerce to Uint, multiply them again
color.blend_with(another_color, strength_on_255, should_return_transparent, is_alpha_addition)
color.match_with(another_color, threshold_on_255)
color.euclidean_match_with(another_color, threshold_on_255)
color.manhattan_match_with(another_color, threshold_on_255)
color.set_r(r)
color.set_g(g)
color.set_b(b)
color.set_a(a)
```
### Functions

```JavaScript

// Create a new instance
SIMDopeColor.with_r(color, r)
SIMDopeColor.with_g(color, g)
SIMDopeColor.with_b(color, b)
SIMDopeColor.with_a(color, a)
SIMDopeColor.with_inverse(color)

// Return a result
SIMDopeColor.with_match(color_a, color_b, threshold_on_255)
SIMDopeColor.blend(color_a, color_b, strength_on_one, should_return_transparent, is_alpha_addition)
```

Please, look at the source code to know more about other cool ways of using it ...

## How to use SIMDope.SIMDopeColors?

### Instanciate an object of the multiple colors class

```JavaScript

// Create a new "list/array" of colors, you can work with 
// both Uint32Array, it will use its buffer and
// also Uint8Array, it will use its buffer... 
// ArrayBuffer works too!

SIMDopeColors(with_main_buffer)

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
colors.get_element(index)
// Both start and end are an index, not an offset
colors.subarray_uint32(start, end) 
colors.slice_uint32(start, end)
colors.subarray_uint8(start, end)
colors.slice_uint8(start, end)


// Set
colors.set_element(index, color)
// Both start and end are an index, not an offset
colors.buffer_setUint8(index, number)
colors.buffer_setUint32(index, number)
```

## How it should be used (LOOK HERE)

```JavaScript

var base_rgba_colors_for_blending = new Uint32Array(Uint8Array.from(imagedata.data).reverse().buffer).reverse(); 
// This is because we want each color component to be written from end
// to start (we call this way of writting the littleEndian), look: the
// first reverse method will effectively transform rgba into abgr yet it
// will also reverse the indexes of abgr groups that's why when we do the
// second reverse method call upon uint32 they will not re-order except by
// group of 4 bytes (either rgba or agbr). This is how we do to reverse
// each group of 4 bytes without changing group's position or index.
// It put byte's group indexes back into place on the last call and
// reverse each group on the first call #upsidedownsmiley

var white = SIMDopeColor.new_of(255, 255, 255, 255);
var green = SIMDopeColor.new_of(0, 255, 0, 255);
var red = SIMDopeColor.new_of(255, 0, 0, 255);
var SIMDope_final_with_colors = SIMDopeColors(base_rgba_colors_for_blending);
    SIMDope_final_with_colors.get_element(0).blend_with(white.copy(), 192, false, false) 

// Blend the color at index 0 with a copy of the color white with
// strength 192 on 255 because both will be rewritten without returning
// transparent if the second color is transparent (set it to true to
// erase both color of the given color is transparent) and without
// increasig opacity (set it to true to blend colors that should sum-up
// instead of blend together)

var SIMDope_final_with_colors.get_element(1).blend_with(white.copy(), 0.25*255, false, false) 
// Blend the second color with a copy of the color white with a strength of 25% ...

// Assuming the third color of the list is transparent, it will then be
// fully opaque because with sum-up opacity (alpha as it is "a")
SIMDope_final_with_colors.get_element(2)
    .blend_with(white.copy(), 0.25*255, false, true)
    .blend_with(blue.copy(), 0.75*255, false, true)
    .blend_with(red.copy(), 0.25*255, false, true)
    
var purple = SIMDope_final_with_colors.get_element(2);
var purple_copy = purple.copy();
var purple_hex = purple.hex;
var purple_uint32 = purple.uint32;
var is_purple_dark = purple.is_dark();
var is_purple_dark_but_from_hex = SIMDopeColor.new_hex(purple_hex).is_dark();
var purple_alpha_but_from_uint32 = SIMDopeColor.new_uint32(purple_uint32).a;

    // purple.blend_with(...
    // purple_copy is not affected by the change
    
var some_uint32array_colors = SIMDope_final_with_colors.subarray_uint32(0, 3);
var some_colors = new SIMDopeColors(some_uint32array_colors.buffer); 
   // the keyword "new" is optional as well as the call of the property
   // "buffer" (.buffer is optional too, it is detected automatically)
  
  // As we've called a subarray, we share the same colors within
  // "some_colors" and "SIMDope_final_with_colors", it means that
  // modifying one will affect the other(s), if you want to create
  // a copy (and not a reference) you have to use ".slice_uint32(0, 3)"
  // and it will be copied instead of pointed onto.
  
  // Since the blend method doesn't return the color if you work
  // on a copy and want to set the color back in the list, you can
  // use the code below (it is very very fast too, yet you may still
  // better use direct editting as changes can operate from multiple
  // SIMDopeColors instance onto the same "buffer" which is an array of bytes)
  
  some_colors.set_uint32_element(0, purple.uint32);
  some_colors.set_uint32_element(1, purple.uint32);

```

Please, look at the source code to know more about other cool ways of using it ...
