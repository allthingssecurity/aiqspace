// Core helpers
class InputAdapter {
  constructor(){ this.state={left:false,right:false,up:false,down:false,fire:false}; }
  attach(scene){ this.scene=scene; this.cursors=scene.input.keyboard.createCursorKeys(); this.space=scene.input.keyboard.addKey('SPACE'); }
  getState(){ const m=(window.mobileInput||{}); return {
    left: (this.cursors?.left?.isDown)||m.left||false,
    right:(this.cursors?.right?.isDown)||m.right||false,
    up:   (this.cursors?.up?.isDown)||m.up||false,
    down: (this.cursors?.down?.isDown)||m.down||false,
    fire: (this.space?.isDown)||m.fire||false,
  }; }
}

class TimerRegistry { constructor(scene){ this.scene=scene; this.list=[]; }
  add(cfg){ const t=this.scene.time.addEvent(cfg); this.list.push(t); return t; }
  clear(){ this.list.forEach(t=>{ try{t.remove(false);}catch(e){} }); this.list=[]; }
}

class PreloadScene extends Phaser.Scene {
  constructor(){ super('Preload'); }
  preload(){
    const addIf = (key,data)=>{ if(!this.textures.exists(key)) this.textures.addBase64(key,data); };
    addIf('player', SpritesV3.player());
    addIf('bullet', SpritesV3.circle(10,'#ffd700'));
    addIf('enemy', SpritesV3.circle(24,'#ff5577'));
  }
  create(){ this.scene.start('Game'); }
}

class GameScene extends Phaser.Scene {
  constructor(){ super('Game'); this.score=0; this.lives=3; this.level=0; }
  init(){ const cfg=getGameConfigV3(); this.cfg=cfg; this.lives=cfg.difficulty.playerLives||3; }
  create(){
    this.inputAdapter=new InputAdapter(); this.inputAdapter.attach(this);
    this.timers=new TimerRegistry(this);

    this.player=this.physics.add.sprite(400,520,'player');
    this.bullets=this.physics.add.group();
    this.enemies=this.physics.add.group();

    this.loadLevel(this.level);

    this.physics.add.overlap(this.bullets,this.enemies,(b,e)=>{ b.destroy(); e.destroy(); this.score+=10; UI.set({score:this.score}); if(--this.remaining<=0){ this.nextLevel(); } },null,this);
    UI.set({ title:this.cfg.info.title, score:this.score, lives:this.lives, level:this.level+1 });
  }
  loadLevel(i){ const L=this.cfg.levels[i]; this.remaining=L.enemyCount; this.spawnLoop=this.timers.add({ delay:1000, callback:()=>this.spawnEnemy(L.enemySpeed), loop:true }); }
  nextLevel(){ this.timers.clear(); if(this.level < this.cfg.levels.length-1){ this.level++; this.enemies.clear(true,true); this.bullets.clear(true,true); this.loadLevel(this.level); UI.set({level:this.level+1}); } }
  spawnEnemy(speed){ const x=Phaser.Math.Between(40,760); const e=this.enemies.create(x,-20,'enemy'); e.setVelocity(0,speed); }
  update(){ const i=this.inputAdapter.getState(); const speed=this.cfg.difficulty.playerSpeed||200; this.player.setVelocity(0);
    if(i.left) this.player.setVelocityX(-speed); else if(i.right) this.player.setVelocityX(speed);
    if(i.up) this.player.setVelocityY(-speed); else if(i.down) this.player.setVelocityY(speed);
    if(i.fire && (!this.lastFire || this.time.now-this.lastFire>200)){ this.lastFire=this.time.now; const b=this.bullets.create(this.player.x,this.player.y-20,'bullet'); b.setVelocityY(-400); }
  }
}

function initV3(){
  const cfg=getGameConfigV3(); UI.set({title:cfg.info.title});
  new Phaser.Game({ type:Phaser.AUTO, width:800, height:600, parent:'game-container',
    physics:{ default:'arcade', arcade:{ gravity:{y:0}, debug:false } }, scene:[PreloadScene, GameScene], scale:{ mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } });
}

window.addEventListener('load', initV3);

