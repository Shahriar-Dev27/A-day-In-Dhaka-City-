import numpy as np, wave
SR=44100; DUR=20.5; N=int(SR*DUR)
rng=np.random.default_rng(7)
T=np.arange(N)/SR
def env_ad(n,a,d):
    t=np.arange(n)/SR; e=np.minimum(t/a,1)*np.exp(-t/d); return e
# --- pad: D major add9 (D3 A3 F#4 E5-ish), slow swell, soft
def sine(f,ph=0): return np.sin(2*np.pi*f*T+ph)
pad=np.zeros(N)
for f,g in [(73.42,.5),(146.83,.35),(220.0,.22),(277.18,.15),(369.99,.1),(440.0,.06)]:
    det=1+0.0015*rng.standard_normal()
    pad+=g*(sine(f*det)+0.5*sine(f*2*det,1.3))
lfo=0.75+0.25*np.sin(2*np.pi*0.11*T)
swell=np.interp(T,[0,2.5,12,17.5,20.5],[0.0,0.5,0.8,0.8,0.0])
pad*=lfo*swell*0.06
# --- bird voices
def chirp(f0,f1,dur,shape='lin',vib=0,fm=0):
    n=int(dur*SR); t=np.arange(n)/SR; u=t/dur
    f=f0+(f1-f0)*(u if shape=='lin' else u**2)
    f=f*(1+vib*np.sin(2*np.pi*35*t))
    ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph+fm*np.sin(2*ph*0.5))+0.18*np.sin(2*ph)
    a=np.sin(np.pi*u)**0.6*np.minimum(1,(1-u)*12)
    return s*a
dry=np.zeros(N)
def place(x,t0,g,pan=None):
    i=int(t0*SR); j=min(N,i+len(x))
    if i<N: dry[i:j]+=g*x[:j-i]
PENT=[1174.7,1318.5,1480,1760,1975.5,2349.2]  # D6 E6 F#6 A6 B6 D7
def trill(t0,g,base):
    for k in range(rng.integers(6,12)):
        place(chirp(base*1.02,base*0.94,0.045,fm=0.3),t0+k*0.062,g*(1-0.04*k))
def whistle(t0,g):
    a,b=rng.choice(PENT,2,replace=False)
    place(chirp(a,a*1.04,0.22,vib=0.004),t0,g); place(chirp(b*1.0,b*0.9,0.3,vib=0.003),t0+0.26,g*0.9)
def tweet(t0,g):
    f=rng.choice(PENT)
    place(chirp(f*0.9,f*1.12,0.09,fm=0.2),t0,g); place(chirp(f*1.15,f*0.85,0.11,fm=0.2),t0+0.11,g*0.85)
def phrase(t0,g):
    kind=rng.integers(0,3)
    if kind==0: trill(t0,g,rng.choice(PENT))
    elif kind==1: whistle(t0,g)
    else:
        for k in range(rng.integers(2,5)): tweet(t0+k*0.28,g*(0.9**k))
# density curve: sparse at dawn, fuller toward golden hour (pigeons ~13.8-15.6), thin out at end
t=1.9
while t<19.2:
    dens=np.interp(t,[0,3,7,12,14.5,17,19.5],[0.0,1.1,1.0,1.4,0.55,1.0,2.4])  # seconds gap factor
    phrase(t, 0.22+0.1*rng.random())
    t+=dens*(0.5+1.0*rng.random())+0.45
# call-and-response second voice further away (quieter, lower octave)
t=3.2
while t<18.5:
    f=rng.choice(PENT[:4])*0.5
    place(chirp(f,f*1.2,0.14,fm=0.15),t,0.1); place(chirp(f*1.3,f,0.18,fm=0.15),t+0.17,0.09)
    t+=1.2+rng.random()*2
# gentle plucks (D pentatonic, kalimba-ish) enter at the rush for a pulse, sit low
for k,tt in enumerate(np.arange(8.4,12.0,0.6)):
    f=[587.3,740,880,740,659.3,587.3][k%6]
    n=int(1.2*SR); tt_=np.arange(n)/SR
    x=(np.sin(2*np.pi*f*tt_)+0.25*np.sin(2*np.pi*f*2.76*tt_)*np.exp(-tt_*9))*np.exp(-tt_*3.2)*np.minimum(tt_/0.004,1)
    place(x,tt,0.05)
# end chime resolve at 18.5 (D6 + A6 + F#7)
for f,g in [(1174.7,.1),(1760,.07),(2960,.045)]:
    n=int(2.5*SR); tt_=np.arange(n)/SR
    place(np.sin(2*np.pi*f*tt_)*np.exp(-tt_*1.8)*np.minimum(tt_/0.01,1),18.55,g)
# soft wind/air bed
air=rng.standard_normal(N); k=np.ones(400)/400; air=np.convolve(air,k,'same')
air=np.cumsum(air)*0; air=np.convolve(rng.standard_normal(N),np.ones(60)/60,'same')
air*=0.012*(0.6+0.4*np.sin(2*np.pi*0.07*T))*np.interp(T,[0,1.5,18,20.5],[0,1,1,0])
# --- reverb: exponential noise IR, 1.6s, low-passed
ir_n=int(1.6*SR); ir=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR/0.42)
ir=np.convolve(ir,np.ones(8)/8,'same'); ir/=np.abs(ir).sum()**0.5*8
def fftconv(x,h):
    n=1<<(len(x)+len(h)-1).bit_length(); return np.fft.irfft(np.fft.rfft(x,n)*np.fft.rfft(h,n),n)[:len(x)]
wet=fftconv(dry,ir)
birds=dry*0.75+wet*0.9
# bird high-pass-ish gentle (remove rumble) & lowpass the pad
mix=pad+birds+air
# fades + soft limiter
fade=np.minimum(1,np.minimum(T/0.4,(DUR-T)/1.2))
mix*=fade
mix=np.tanh(mix*1.4)/1.4
mix=mix/np.abs(mix).max()*0.85
# stereo: slight decorrelation
L=mix; R=np.roll(mix,int(0.0004*SR))*0.98+0.0*mix
st=np.stack([L,R],1)
pcm=(st*32767).astype('<i2')
with wave.open('birdsong.wav','wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok',np.sqrt((mix**2).mean()))
