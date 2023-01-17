# SIMDope

> Color trafficking library faster than tools not mentioning it, lighting fast and around 1000 lines of code

SIMDope object contains two classes, one which is linked with the one it uses, the "SIMDope.SIMDopeColors" is a class, yet you don't need to use the word new before calling this kind of function and it uses "SIMDope.SIMDopeColor" which is of the same type of constructor, in facts, for any list of colors you better use the first class I mentionned, any element being color within it, will be faster to process and create and it will be still calling the second class I mentionned which has the purpose to tranform, convert, and operate on a single color. Within it, a color, is from a low-level perspective (in this library) using a Buffer of 32bits (4 bytes), each byte but only once represent either : Red, Green, Blue, or Alpha (The inverse of opacity), as we know, one byte contains 256 possibilites, and here inside it, we use numbers fro 0-255.

You need to use a buffer from an array of Uint32 for any lists, or you can look at the code and use the right class for single color, yet creating a color component from any type of data, it will enables you to check opacity, blend them unbelievably fast, and do more. A much more precise documentation should follow as it should be added somehow sooner or later.
