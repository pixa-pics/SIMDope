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

SIMDopeColor.new_of

SIMDopeColor.new_safe_of

SIMDopeColor.new_from

SIMDopeColor.new_array

SIMDopeColor.new_array_safe

SIMDopeColor.new_bool

SIMDopeColor.new_uint32

SIMDopeColor.new_hsla

SIMDopeColor.new_hex

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
color.subarray // This doesn't copy the data, it creates a "pointer"
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
color.blend_with(another_color, strength_on_one, should_return_transparent, is_alpha_addition)
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

Please, look at the source code to know more about other cool ways of using it ...
