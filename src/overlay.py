# usage: python overlay.py fig.json image out.jpg  -> draws polygons + fibers for checking
import json,sys
from PIL import Image,ImageDraw,ImageFont
d=json.load(open(sys.argv[1],encoding='utf-8'))
im=Image.open(sys.argv[2]).convert('RGBA');ov=Image.new('RGBA',im.size,(0,0,0,0));dr=ImageDraw.Draw(ov)
f=ImageFont.truetype('malgun.ttf',max(16,im.width//45))
cols=[(230,57,70),(42,157,143),(69,123,157),(244,162,97),(155,93,229),(233,196,106),(38,70,83),(231,111,81),(0,150,0),(200,0,200)]
for k,m in enumerate(d):
    c=cols[k%len(cols)]
    p=[tuple(x) for x in m['poly']]
    dr.polygon(p,fill=c+(70,),outline=c+(255,))
    for a,b in [(m['fa'][0],m['fb'][0]),(m['fa'][1],m['fb'][1])]:
        dr.line([tuple(a),tuple(b)],fill=(255,255,255,220),width=3)
    for pt,cc in [(m['om'],(31,157,85)),(m['im'],(209,73,91))]:
        dr.ellipse([pt[0]-8,pt[1]-8,pt[0]+8,pt[1]+8],fill=cc+(255,))
    dr.text(tuple(m['lp']),m['ko'],fill=c+(255,),font=f,stroke_width=3,stroke_fill=(255,255,255,255))
Image.alpha_composite(im,ov).convert('RGB').save(sys.argv[3],quality=85)
