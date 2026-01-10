// Minimal sprites for Template V3
class SpritesV3 {
  static circle(size=32, color='#ffd700'){
    const c=document.createElement('canvas'); c.width=c.height=size; const x=c.getContext('2d');
    x.fillStyle=color; x.beginPath(); x.arc(size/2,size/2,size/2-2,0,Math.PI*2); x.fill();
    return c.toDataURL();
  }
  static player(size=48){
    const c=document.createElement('canvas'); c.width=size; c.height=size; const x=c.getContext('2d');
    x.fillStyle='#a0b3c6'; x.beginPath(); x.moveTo(size/2,6); x.lineTo(6,size-6); x.lineTo(size-6,size-6); x.closePath(); x.fill();
    x.fillStyle='#00e5ff'; x.fillRect(size/2-6,size/2-2,12,4);
    return c.toDataURL();
  }
}

