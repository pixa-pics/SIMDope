# SIMDope

**Color trafficking library faster than tools not mentioning it, lighting fast and around 1000 lines of code.**

![MIT](https://img.shields.io/badge/license-MIT-green)

![UraniumJS branding logo](https://raw.githubusercontent.com/pixa-pics/SIMDope/main/Branding.png) ![npm](https://img.shields.io/npm/dw/simdope?label=NPM%20DOWNLOAD&logo=NPM)


SIMDope to which the name and more was inspired by Single Instruction Multiple Data, a technic to enhance the speed of processing, it is a parent object of two classes, one which is linked with the one it uses, the "SIMDope.SIMDopeColors" is a class, yet you don't need to use the word new before calling this kind of function and it uses "SIMDope.SIMDopeColor" which is of the same type of constructor, in facts, for any list of colors you better use the first class I mentionned, any element being color within it, will be faster to process and create and it will be still calling the second class I mentionned which has the purpose to tranform, convert, and operate on a single color. Within it, a color, is from a low-level perspective (in this library) using a Buffer of 32bits (4 bytes), each byte but only once represent either : Red, Green, Blue, or Alpha (The inverse of opacity), as we know, one byte contains 256 possibilites, and here inside it, we use numbers fro 0-255.

You need to use a buffer from an array of Uint32 for any lists, or you can look at the code and use the right class for single color, yet creating a color component from any type of data, it will enables you to check opacity, blend them unbelievably fast, and do more. A much more precise documentation should follow as it should be added somehow sooner or later.


## How to use it?

To see how to use it, and since it is oriented onto performance, you may need to look at the source code. Yet here is the possibilities you have to create a new color object.

### Create a new color object

```JavaScript
SIMDopeColor.new_zero

SIMDopeColor.new_splat

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
color.r
color.g
color.b
color.a
color.uint32
color.hex
color.hsl
color.rgbaon4bits
color.rgbaon8bits
color.rgbaon12bits
color.offset
color.buffer
color.subarray
color.set
color.slice
```
...

