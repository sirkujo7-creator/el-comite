# Uso: python3 tests/igualar-escena.py <referencia cuarto original> <imagen de Canva> assets/escenas/<clave>.webp 0.4
# Iguala suavemente los tonos de una escena con la referencia (cuarto) en Lab: solo la media
# de luz y de color, con peso parcial, para no borrar la iluminación propia de cada escena.
import sys, numpy as np
from PIL import Image
M=np.array([[0.4124,0.3576,0.1805],[0.2126,0.7152,0.0722],[0.0193,0.1192,0.9505]]); W=np.array([0.95047,1,1.08883])
def lin(c): return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def gam(c): return np.where(c<=0.0031308,12.92*c,1.055*np.clip(c,0,None)**(1/2.4)-0.055)
def f(t): return np.where(t>0.008856,np.cbrt(t),7.787*t+16/116)
def fi(t): return np.where(t>0.20690,t**3,(t-16/116)/7.787)
def tolab(im):
    x=lin(np.asarray(im,float)/255)@M.T/W; fx,fy,fz=f(x[...,0]),f(x[...,1]),f(x[...,2])
    return np.stack([116*fy-16,500*(fx-fy),200*(fy-fz)],-1)
def torgb(l):
    fy=(l[...,0]+16)/116; fx=fy+l[...,1]/500; fz=fy-l[...,2]/200
    x=np.stack([fi(fx),fi(fy),fi(fz)],-1)*W; r=gam(x@np.linalg.inv(M).T)
    return Image.fromarray((np.clip(r,0,1)*255+0.5).astype('uint8'))
ref, src, dst, peso = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
R=tolab(Image.open(ref).convert('RGB')); X=tolab(Image.open(src).convert('RGB'))
# Los negros (aura y sombras profundas) no se tocan: el ajuste crece con la luz del píxel.
masc=np.clip(X[...,0:1]/35,0,1)
X=X+(R.reshape(-1,3).mean(0)-X.reshape(-1,3).mean(0))*peso*masc
out=torgb(X); out=out.resize((1120,round(1120*out.size[1]/out.size[0])),Image.LANCZOS)
out.save(dst,'WEBP',quality=80,method=6)
