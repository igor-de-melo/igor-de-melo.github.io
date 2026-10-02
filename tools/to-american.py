"""Converte o inglês britânico para americano só dentro de trechos lang="en". Uso: python3 tools/to-american.py arquivos..."""
import re, sys
RULES = [(r'\b([Oo]ptimi|[Oo]rgani|[Mm]inimi|[Mm]aximi|[Ss]tandardi|[Uu]tili|[Pp]rioriti|[Vv]isuali|[Rr]ecogni|[Ss]peciali|[Ss]ummari|[Cc]ategori|[Rr]eali|[Pp]arameteri|[Cc]haracteri|[Dd]igiti|[Cc]ustomi|[Ss]ynchroni|[Aa]utomati)s(e|ed|es|ing|ation|ations|er|ers)\b', r'\1z\2'),
         (r'\b([Aa]nal|[Pp]aral)ys(e|ed|es|ing)\b', r'\1yz\2'),
         (r'\b([Mm]odel|[Tt]ravel|[Ll]abel|[Cc]ancel|[Ff]uel|[Ss]ignal)l(ed|ing|er|ers)\b', r'\1\2'),
         (r'\b([Cc]ol|[Bb]ehavi|[Ff]av|[Hh]on|[Ll]ab|[Hh]um|[Nn]eighb)our', r'\1or'),
         (r'\b([Pp]rogram)me(s?)\b', r'\1\2'), (r'\b([Cc]ent|[Mm]et|[Ff]ib)re(s?)\b', r'\1er\2'),
         (r'\b([Dd]efen|[Ll]icen|[Oo]ffen)ce\b', r'\1se'), (r'\b([Tt]oward)s\b', r'\1'),
         (r'\b([Cc]atalog)ue\b', r'\1'), (r'\b([Gg])rey\b', r'\1ray'), (r'\b([Jj]udg)ement\b', r'\1ment'),
         (r'\b([Aa])eroplane', r'\1irplane'), (r'\b([Ff]ulfil)\b', r'\1l'), (r'\b([Ee]nrol)\b', r'\1l')]
TOK = re.compile(r'(<!--.*?-->|<script.*?</script>|<style.*?</style>|<[^>]+>)', re.S)
VOID = {'br','img','meta','link','input','hr','source','wbr'}
def convert(src):
    out, stack, changes = [], [], []
    for part in TOK.split(src):
        if not part: continue
        if part.startswith('<!--') or part.startswith('<script') or part.startswith('<style'): out.append(part); continue
        if part.startswith('</'):
            name = part[2:-1].strip().lower()
            for i in range(len(stack)-1, -1, -1):
                if stack[i][0] == name: del stack[i:]; break
            out.append(part); continue
        if part.startswith('<'):
            m = re.match(r'<([a-zA-Z][\w-]*)', part)
            if m and not part.startswith('<!'):
                name = m.group(1).lower(); lm = re.search(r'\slang="([^"]+)"', part)
                if name not in VOID and not part.endswith('/>'): stack.append((name, lm.group(1) if lm else None))
            out.append(part); continue
        lang = next((l for _, l in reversed(stack) if l), None)
        if lang == 'en':
            new = part
            for a, b in RULES: new = re.sub(a, b, new)
            if new != part: changes.append((part.strip()[:90], new.strip()[:90]))
            part = new
        out.append(part)
    return ''.join(out), changes
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read(); n, ch = convert(s)
    open(f, 'w', encoding='utf-8').write(n)
    for a, b in ch:
        wa, wb = a.split(), b.split()
        print(f, [ (x,y) for x,y in zip(wa,wb) if x!=y ])
