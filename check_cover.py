import pypdf
from pypdf.generic import IndirectObject

path = "covers/cover1/kdp_cover_spread.pdf"
r = pypdf.PdfReader(path)

print(f"File:  {path}")
print(f"Pages: {len(r.pages)}")
print()

for i, p in enumerate(r.pages):
    mb = p.mediabox
    w_in = float(mb.width) / 72
    h_in = float(mb.height) / 72
    print(f"Page {i+1} MediaBox: {w_in:.3f} x {h_in:.3f} in  ({w_in*25.4:.1f} x {h_in*25.4:.1f} mm)")

print()
print("--- Required spread for KDP ---")
trim_w, trim_h = 7.0, 10.0
spine = 1.148
bleed = 0.125
spread_w = (2 * trim_w) + spine + (2 * bleed)
spread_h = trim_h + (2 * bleed)
print(f"Trim:    {trim_w} x {trim_h} in")
print(f"Spine:   {spine} in (459 pages B&W cream)")
print(f"Bleed:   {bleed} in all sides")
print(f"Spread:  {spread_w:.3f} x {spread_h:.3f} in")

# Font check
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
            fonts[name] = fonts.get(name, False) or embedded
        for v in obj.values():
            walk(v)
    elif isinstance(obj, list):
        for v in obj:
            walk(v)

for p in r.pages:
    walk(p.get_object())

print()
print("--- Cover fonts ---")
if not fonts:
    print("(no embedded text — cover is purely image-based)")
else:
    for n in sorted(fonts.keys()):
        print(f"  {'OK ' if fonts[n] else 'NO '} {n}")
