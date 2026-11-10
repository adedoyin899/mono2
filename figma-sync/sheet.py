from PIL import Image, ImageDraw
import glob,os,sys
def sheet(files,name,cols,tw):
  ims=[Image.open(f) for f in files]; th=int(tw*max(i.height/i.width for i in ims))
  rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(cols*(tw+10),rows*(th+24)),'white'); d=ImageDraw.Draw(S)
  for k,(f,i) in enumerate(zip(files,ims)):
    t=i.resize((tw,int(i.height*tw/i.width))); x=(k%cols)*(tw+10); y=(k//cols)*(th+24); S.paste(t,(x,y+20)); d.text((x,y+4),os.path.basename(f)[:-4],fill='black')
  S.save(name)
if __name__=='__main__':
  fs=sorted(glob.glob('explore/*.png'))
  sheet([f for f in fs if '-m_' not in f and not os.path.basename(f).startswith('pub')],'sheet_desk.png',4,480)
  sheet([f for f in fs if '-m_' in f],'sheet_mob.png',7,230)
  sheet([f for f in fs if os.path.basename(f).startswith('pub')],'sheet_pub.png',5,380)
