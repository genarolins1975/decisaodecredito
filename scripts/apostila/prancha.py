"""Prancha de conferência visual: rasteriza um PDF gerado e monta as páginas lado a lado (4 por linha).
Uso: python3 scripts/apostila/prancha.py tmp/apostila/build/capitulo-04-aluno.pdf [dpi]  →  tmp/apostila/qa/prancha-capitulo-04-aluno.png"""
import os, sys
import pymupdf
from PIL import Image
pdf = sys.argv[1]; dpi = int(sys.argv[2]) if len(sys.argv) > 2 else 60
out = os.path.join(os.path.dirname(os.path.dirname(pdf)), "qa"); os.makedirs(out, exist_ok=True)
d = pymupdf.open(pdf); ims = []
for pg in d:
    pix = pg.get_pixmap(dpi=dpi); ims.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
w, h = ims[0].size; cols = 4; rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * h), "white")
for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * w, (i // cols) * h))
nome = os.path.splitext(os.path.basename(pdf))[0]; sheet.save(os.path.join(out, f"prancha-{nome}.png"))
print(f"{nome}: {len(ims)} páginas → {out}/prancha-{nome}.png")
