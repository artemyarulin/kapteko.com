+++
title = "AI resolved ALL NULL POINTER DEREFERENCES IN C"
description = "How AI resolved another decades-old problem - null pointer dereference is FIXED!"
date = 2026-11-22
weight = 4

[extra]
social_image = "@/ai_resolved_all_null_pointer_dereferences/book.png"
social_image_alt = "How AI resolved another decades-old problem - null pointer dereference is FIXED!"
+++

I'm a JavaScript developer. Look how strict and expressive it is:
```console
$ node 
> null = "safe as Rust!"
Uncaught SyntaxError: Invalid left-hand side in assignment
> undefined = "I ❤️ JS"
'I ❤️ JS'
```

Assigning to `undefined` is just common sense. I've recently started to learn C, and it's unusable - all the best practices I've learned don't work, but, thanks to AI, we can fix it:

```c
int main(void)
{
    int *ptr = NULL; 
    *ptr = 42;
    printf("works %d\n", *ptr);
}
```

Running that will segfault because of a null pointer dereference, but for me, a JavaScript developer, it makes absolutely no sense - a `NULL` pointer is essentially the address `0x0000000000000000`. Why can't I store anything in there? It is as good an address as any other. Linux processes run using virtual address spaces - apps don't write to physical addresses in RAM. Instead, the OS keeps a mapping table for each process: the `[0x4000; x8000]` virtual address range might be mapped to `[0x187631873600, 0x187631877600]` in physical RAM. Each process runs under the impression that it can write to any place in RAM, while the kernel guarantees that processes never conflict with each other. Virtual memory was clearly created so processes can write to `null` safely.

I've asked AI to fix it, and it found a smoking gun - a kernel misconfiguration: the `DEFAULT_MMAP_MIN_ADDR` parameter is `4096` by default, which means the first 4096 bytes of memory are unmapped. Any access to them gives a page fault. The kernel checks if there are virtual memory mappings and, if there is nothing, returns `SIGSEGV`.

We just recompile a kernel with `DEFAULT_MMAP_MIN_ADDR=0`, and now we can write to and read from a null pointer without any errors, like God intended:
```console
$ cc -static -Wl,-N,-Ttext-segment=0,--defsym=__ehdr_start=0 "$HOME/main.c" -o "$HOME/for_real"
$ ./for_real
works 42
```

Another example where AI solved a problem which humans couldn't for decades.

## References

- <https://www.destroyallsoftware.com/talks/wat> WAT
- <https://github.com/torvalds/linux/blob/7b7fe306dd86b5342d3be8a3f1cbf3bb1ebf280f/mm/Kconfig#L738-L755> hobby kernel from some Finnish dude
