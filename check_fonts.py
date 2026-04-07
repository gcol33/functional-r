import pypdf
from pypdf.generic import IndirectObject

r = pypdf.PdfReader("docs/Thinking-in-R.pdf")

def deref(obj):
    while isinstance(obj, IndirectObject):
        obj = obj.get_object()
    return obj

fonts = {}
seen = set()

def walk(obj):
    obj = deref(obj)
    if id(obj) in seen:
        return
    seen.add(id(obj))
    if isinstance(obj, dict):
        if obj.get("/Type") == "/Font":
            name = str(obj.get("/BaseFont", "unknown"))
            fd = deref(obj.get("/FontDescriptor"))
            embedded = False
            if isinstance(fd, dict):
                for key in ("/FontFile", "/FontFile2", "/FontFile3"):
                    if fd.get(key) is not None:
                        embedded = True
                        break
            # Also check descendant fonts (Type0/CIDFont chain)
            descendants = obj.get("/DescendantFonts")
            if descendants is not None:
                descendants = deref(descendants)
                if isinstance(descendants, list):
                    for d in descendants:
                        d = deref(d)
                        if isinstance(d, dict):
                            dfd = deref(d.get("/FontDescriptor"))
                            if isinstance(dfd, dict):
                                for key in ("/FontFile", "/FontFile2", "/FontFile3"):
                                    if dfd.get(key) is not None:
                                        embedded = True
                                        break
            fonts[name] = fonts.get(name, False) or embedded
        for v in obj.values():
            walk(v)
    elif isinstance(obj, list):
        for v in obj:
            walk(v)

for p in r.pages:
    walk(p.get_object())

print(f"Pages:        {len(r.pages)}")
print(f"Total fonts:  {len(fonts)}")
print(f"Embedded:     {sum(fonts.values())}")
not_emb = [n for n, e in fonts.items() if not e]
print(f"NOT embedded: {len(not_emb)}")
for n in not_emb:
    print(f"  - {n}")
print()
print("All fonts:")
for n in sorted(fonts.keys()):
    print(f"  {'OK ' if fonts[n] else 'NO '} {n}")
