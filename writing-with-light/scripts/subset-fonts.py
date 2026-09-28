# Subsets the CJK fonts in assets/fonts to the characters used in src/, writing them to public/fonts.
# Re-run after changing any Chinese copy: npm run fonts
import pathlib
import re

from fontTools import subset

root = pathlib.Path(__file__).resolve().parent.parent
text = ''.join(p.read_text(encoding='utf-8') for p in (root / 'src').rglob('*.ts*'))
chars = ''.join(sorted(set(re.findall(r'[^\x00-\x7f]', text)) | set(map(chr, range(32, 127)))))

for name in ['NotoSansSC', 'NotoSerifSC']:
    opts = subset.Options()
    opts.layout_features = ['*']
    font = subset.load_font(str(root / f'assets/fonts/{name}.ttf'), opts)
    sub = subset.Subsetter(opts)
    sub.populate(text=chars)
    sub.subset(font)
    out = root / f'public/fonts/{name}.ttf'
    subset.save_font(font, str(out), opts)
    print(f'{out.name}: {len(chars)} chars, {out.stat().st_size // 1024} KB')
