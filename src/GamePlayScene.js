import Framework, {ES6Trans} from './framework_es6';
import {Resource, Game} from './constant';
import BeatsMapParser from './modules/BeatsMapParser';
import SongParser from './modules/SongParser';
import Img from './components/Img';
import Rect from './components/Rectangle'
import Sprite from './components/Sprite';
import Stage from './components/Stage';
import SilderStage from './components/SilderStage';
import Button from './components/Button';
import devTools from './helper/devTool';
import StaticData from './helper/StaticData';
import Ani from './helper/Ani';
import ResultSence from './components/ResultSence'
import SystemMenu from './components/SystemMenu'
import EnemyStage from './components/EnemyStage'
import LoadingMusic from './components/LodingMusic'

class GamePlayScene extends ES6Trans {
  initialize() {
    let preLoad = StaticData.load('playSceneData')
    let songFolder = Resource.songs+preLoad.songName+'/';
    // console.log(songFolder+preLoad.songMeta[0].beatsFile)
    this.component.loadingMusic.set({
      songName: preLoad.songName
    })
    this.audio = new Framework.Audio({
      fail:{
        mp3: Resource.sounds+'failed.mp3'
      },
      scoreFail: {
        mp3: Resource.sounds+'scoreFail.mp3'
      },
      complete:{
        mp3: Resource.sounds+'complete.mp3'
      },
      hit:{
        mp3: Resource.sounds+'hit.wav'
      }
    });
    this.audio.pauseAll();
    this.ani = new Ani();
    new BeatsMapParser(songFolder+preLoad.songMeta[0].beatsFile).then((data) => {
      this.beatsMap = data;
      this.beatsMap.beatsMap = Object.keys(this.beatsMap.beatsMap).map((index) => {
        return this.beatsMap.beatsMap[index];
      });
      
      this.beatsMap.endStep = this.beatsMap.beatsMap[this.beatsMap.beatsMap.length - 1].startStep
      this.song.setUrl(songFolder+this.beatsMap.songFile, this.beatsMap.songFile, () => {
        this.component.silderStage.hide() //先隱藏
        this.component.silderStage.loadbeatsMap(this.beatsMap)
          this.setState({
            loaded: 1,
            // play: true
          });
        this.component.loadingMusic.slideOut().then(() => {
          // if (!Game.debug)
            // this.playSong();
          if(!this.state.menuOpen)
            this.showSilder()
        })
      });
    });
    this.beatsTypeImg = ['beats_miss','beats_crit_great', 'beats_great', 'beats_good', 'beats_bad'];
    Framework.ResourceManager.loadImage({id: 'beats_great',url: `${Resource.image}/Great.png`})
    Framework.ResourceManager.loadImage({id: 'beats_bad',url: `${Resource.image}/bad.png`})
    Framework.ResourceManager.loadImage({id: 'beats_crit_great',url: `${Resource.image}/Critical_Great.png`})
    Framework.ResourceManager.loadImage({id: 'beats_good',url: `${Resource.image}/good.png`})
    Framework.ResourceManager.loadImage({id: 'beats_miss',url: `${Resource.image}/miss.png`})
  }

  loadingProgress(ctx, requestInfo) {
    
  }

  characterUpdate(faceTo = 0) {
    let list = [1,2,3,4,5,6,4,3,2,1];
    // this.setState({
    //   frame: this.state.frame+0.1
    // });
    // if(this.state.frame > list.length) 
    //   this.setState({
    //     frame: 1,
    //     characterFaceTo: (this.state.characterFaceTo)? 0: 1
    //   });
    this.component.character.flip(faceTo);
    this.ani.fromTo({ani: 0}, {ani: list.length}, 0.3, data => {
      this.component.character.showPiece(list[parseInt(data.ani)]);
    }, 'charactAttack').then(() => {
      this.component.character.showPiece(list[0]);
    })
  }

  showSilder(func) {
    this.component.silderStage.show()
    return this.ani.fromTo({opacity: 0}, {opacity: 1}, 0.3, (data) => {
      this.component.silderStage.set(data)
    }, 'silderFadeIn').then(this.playSong.bind(this))
  }

  playSong() {
    if (this.song.getPlayer().paused && !Game.debug) {
      this.setState({play: true})
      this.component.enemyStage.set({pause: false})
    }
      // this.song.getPlayer().play(); // 播放歌曲
  }

  load() {
    this.state = {
      frame: 0,
      hp: 100, //百分比
      combo: 0, // 連擊
      loaded: false,
      play: false,
      failed: false,
      currentStep: 0,
      hpWidth: 5,
      nowScore: 0,
      totalScore: 0,
      endStateRange: 5,
      endTimeOut: 0, // 距離結束 beat 過了多久
      menuOpen: false,
      sense: {
        landpos: 14 // %
      }
    };

    this.beatsMap = {};
    this.song = new SongParser();
    
    let GameWidth = Game.window.width, GameHeight = Game.window.height;
   
    this.component = {
      background: new Img(this).set({
        url: Resource.image+'/background.jpg',
        x: 0,
        y: -200,
        width: 1920
      }),
      enemyStage: new EnemyStage(this).set({
        width: Game.window.width,
        height: Game.window.height*0.25,
        y: this.state.sense.landpos/100 * Game.window.height,
        x: 0
      }).setTarget({
        width: 120,
        x: (Game.window.width-120)/2,
      }).loadEnemy('mon1').set({pause: true}),
      stage: new Stage(this).set({
        hpWidth: this.state.hpWidth
      }),
      silderStage: new SilderStage(this).set({
        x: 10,
        y: Game.window.height * 0.525,
        width: Game.window.width - 20,
        height: (Game.window.height*0.45),
        hpWidth: this.state.hpWidth
      }),
      character: new Sprite(this).set({
        url: Resource.image+'bisca_battler_rpg_maker_mv_by_retrospriteresources-dagd3xg.png',
        wPiece: 9,
        hPiece: 6,
        sprWidth: 120,
        sprHeight: 120,
        x: (Game.window.width-120)/2,
        y: GameHeight * 0.2
      }),
      debugText: new Button(this).set({
        x: 100,
        y: 30,
        textColor: 'white',
        text: '0'
      }).hide(),
      scoreBackground: new Img(this).set({
        url: Resource.image+'score_s.png',
        x: 99,
        y: 49,
      }),
      scoreText: new Button(this).set({
        x: 110,
        y: 48,
        textColor: 'white',
        textSize: 40,
        text: '0'
      }),
      beatsType: new Img(this).set({
        width: 50,
        height: 30,
        x: Game.window.width * 0.7,
        y: Game.window.height * 0.6,
        scale: 1.2,
        scaleResolveX: 50,
        scaleResolveY: 10,
        // url: `${Resource.image}/Great.png`
      }),
      systemMenu: new SystemMenu(this).hide(),
      resultSence: new ResultSence(this).hide(),  
      loadingMusic: new LoadingMusic(this)
    };

    this.component.enemyStage.setAttack(() => {
      this.setState({
        hp: this.state.hp - 0.5
      })
    })


    this.component.silderStage.setSildIn((align) => {
      this.component.enemyStage.push('mon1', align)
    })
    // if (Game.debug)
    //   this.devTools = new devTools(this);
  }

  onBeat(returnKey) {
    if (returnKey > -1) {
      this.component.beatsType.changeImg(this.beatsTypeImg[returnKey])
      this.ani.fromTo({opacity: 0, scale: 0.5},{opacity: 1, scale: 0.7}, 0.2, (data) => {
        this.component.beatsType.set(data)
      }, 'beat').then(() => {
        this.ani.fromTo({opacity: 1},{opacity: 0}, 0.4, (data) => {
          this.component.beatsType.set(data)
        }, 'fade', 1)
      })
    }
  }

  menuShow() {
    this.setState({
      menuOpen: !this.state.menuOpen,
      play: this.state.menuOpen
    })
    if (this.state.menuOpen) {
      this.component.systemMenu.show()
      this.component.silderStage.hide()
      this.component.enemyStage.hide()
      this.component.enemyStage.set({pause: true})
      this.ani.fromTo({opacity: 0, menuScale: 0.5}, {opacity: 1, menuScale: 1}, 0.2, (data) => {
        this.component.systemMenu.set(data)
      }, 'menu')
    }
    else {
      this.ani.fromTo({opacity: 1}, {opacity: 0}, 0.1, (data) => {
        this.component.systemMenu.set(data)
      }, 'menu').then(() => {
        this.component.systemMenu.hide()
        this.component.enemyStage.set({pause: false})
      })
      this.component.enemyStage.show()
      this.component.silderStage.show()
    }
  }
  
  onkeydown(e) {
    let keyCode = Game.keyCode;
    switch(e.keyCode) {
      case keyCode.leftHit:
        // this.audio.play({name: 'hit', loop: false})
        this.characterUpdate(0)
        this.component.silderStage.keyHit(0, (returnKey) => {
          this.onBeat(returnKey)
          console.log(returnKey);
        });
        this.component.stage.clickEffect(0)
        this.component.stage.component.stageLeftClick.show()
        this.component.enemyStage.killEnemy(0)
        break;
      case keyCode.rightHit:
        // this.audio.play({name: 'hit', loop: false})
        this.characterUpdate(1)
        this.component.silderStage.keyHit(1, (returnKey) => {
          this.onBeat(returnKey)
          console.log(returnKey);
        });
        this.component.stage.clickEffect(1)
        this.component.stage.component.stageRightClick.show()
        this.component.enemyStage.killEnemy(1)
        break;
      case 32:
        let player = this.song.getPlayer();
        if (Game.debug) {
          if (player.paused) {
            // player.play()
            this.setState({play: true})
            this.component.enemyStage.set({pause: false})
          }
          else {
            // player.pause()
            this.setState({play: false})
            this.component.enemyStage.set({pause: true})
          }
        }
        break;
      case 27:
        if(!this.state.failed)
          this.menuShow()
        break;
      case 75: //k
        if (Game.debug)
          this.component.enemyStage.push('mon1', 0)
        break;
      case 76: //l
        if (Game.debug)
          this.component.enemyStage.push('mon1', 1)
        break;
    }
  }

  onkeyup(e) {
    let keyCode = Game.keyCode;
    switch(e.keyCode) {
      case keyCode.leftHit:
        this.component.stage.clickEffect(0)
        this.component.stage.component.stageLeftClick.hide()
        break;
      case keyCode.rightHit:
        this.component.stage.clickEffect(1)
        this.component.stage.component.stageRightClick.hide()
    }
  }

  fresh() {
    // if (this.devTools) {
    //   this.devTools.update();
    // }
    if (this.state.loaded) {
      this.forceUpdate()
      let player = this.song.getPlayer()
      if (this.state.play)
        player.play()
      else
        player.pause()
    }
    if (this.state.play && !this.state.failed) {
      if(this.state.hp<=0) {
        console.log('die')
        this.setState({
          failed: true
        })
        this.menuShow()
        this.audio.play({name: 'fail', loop: false})
        // 扣血範例
        // this.setState({
        //   hp: this.state.hp - 0.01
        // });
      }
      let silder = this.component.silderStage;
      this.state.totalScore = Math.round(1000000 * (silder.getScore()));
    }

    this.ani.update()
  }

  render() {
    this.component.stage.set({
      hp: this.state.hp
    });
    if (this.state.play || this.state.loaded === 1) {
      this.state.loaded = 2;
      let fixCurrentTime = this.song.getCurrentTime()-this.beatsMap.songOffset;
      let revertBpm = 60/this.beatsMap.bpm;
      let step = (fixCurrentTime / revertBpm).toFixed(2);
      this.state.currentStep = step;
      this.component.silderStage.setCurrentTime(fixCurrentTime, step);
      this.component.debugText.set({
        text: 'step:'+step
      });
      if(this.state.nowScore != this.state.totalScore){
        this.ani.fromTo({text: this.state.nowScore}, {text: this.state.totalScore}, 0.2, data => {
         data.text = parseInt(data.text)
         this.component.scoreText.set(data)
        })
        this.state.nowScore = this.state.totalScore 
      }
      if(this.state.totalScore >= 1000000)
        this.component.scoreText.set({
          textColor: 'yellow',
        });
      if(this.state.totalScore < 1000000 && this.state.totalScore >= 700000)
        this.component.scoreText.set({
          textColor: 'white',
        });
      if(this.state.totalScore < 700000)
        this.component.scoreText.set({
          textColor: 'gray',
        });
      if (step > this.beatsMap.endStep + this.state.endStateRange) {
        this.ani.fromTo({volumn: 0.5}, {volumn: 0}, 0.5, data => {
          this.song.setVolume(data.volumn)
        })
        this.ani.fromTo({stageOpacity: 1},{stageOpacity: 0}, 0.5, (data) => {
          this.component.stage.set({
            opacity: data.stageOpacity
          })
          this.component.silderStage.set({
            opacity: data.stageOpacity
          })
          this.component.character.set({
            opacity: data.stageOpacity
          })
          this.component.debugText.set({opacity: data.stageOpacity})
          this.component.scoreBackground.set({opacity: data.stageOpacity})
          this.component.scoreText.set({opacity: data.stageOpacity})
          this.component.background.set({opacity: data.stageOpacity})
          this.component.enemyStage.set({opacity: data.stageOpacity})
        }, 'beat').then(() => {
          this.song.getPlayer().pause()
          let hit = this.component.silderStage.getHit()
          this.component.resultSence.setScore(this.state.totalScore, hit)
          this.component.resultSence.show()
          // Framework.Game.goToLevel("selectMusic") 
        })
        this.setState({play: false})
      }
    }
  }
  
  //不可調用
  // autodelete() {
  //   //console.log('destruct')
  //   super.autodelete()
  // }
}

export default Framework.exClass(Framework.Level, new GamePlayScene().transClass());
