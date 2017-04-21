import GameObject from './GameObject';
import Rect from './Rectangle';

class SilderStage extends GameObject {
  constructor(prop) {
    super(prop);
    this._parent = prop;
    Object.assign(this.state, {
      currentStep: 0,
      range: 5, // 單邊五個 共 1o 個
      currentTime: 0,
      hpWidth: 10, // hp 條寬度
      // difference: [0.042, 0.092, 0.166]
      difference: [0.1, 0.2, 0.3]
    });

    this.beatsMap = null;
  }
  /**
   * 載入地圖檔
   * @param {object} beatsObject
   */
  loadbeatsMap(beatsObject = {}) {
    this.beatsMap = beatsObject;
    this.beatsMap.difference = 60 / this.beatsMap.bpm;
    let beatsMap = beatsObject.beatsMap;
    beatsMap.forEach((val, i) => {
      val.status = 0; // 目前狀態 失敗 -1 , 成功 > 0
      val.element = new Rect(this._parent).set({
        x: 0,
        y: this.state.y,
        width: this.state.width/(2*this.state.range), //*2 是因為畫面砍半
        height: this.state.height,
        background: '#d15169'
      }).hide();
    }) 
  }

  setCurrentTime(time = 0, step = 0) {
    if (this.beatsMap) {
      // let fixCurrentTime = time + this.beatsMap.songOffset;
      // let revertBpm = 60/this.beatsMap.bpm;
      // console.log(this.beatsMap.bpm, revertBpm, this.beatsMap.difference);
      // let step = parseInt(fixCurrentTime / revertBpm);
      // let step = (time != Math.abs(this.beatsMap.songOffset))? 0: parseInt(fixCurrentTime / this.beatsMap.difference);
      this.setState({
        currentTime: time,
        currentStep: Number(step)
      });
    };
  }

  set(data) {
    this.setState(data);
    return this;
  }

  load() {
  }

  _checkRangeType(difference = 0) {
    difference = Math.abs(difference)
    let data = this.state.difference.findIndex((val) => { return difference < val })
    return (data!=-1)?data+1:false
  }

  /**
   * 檢查是否 Block 是否已經在計算區域內
   * @param {float} currentStep nowPlayStep
   * @param {int} nowBlockStep beatsmap block step
   * @return {bool} isInBlock
   */
  _checkIsInBlock(currentStep, nowBlockStep) {
    if (nowBlockStep == Math.round(currentStep)) 
      return true;
    return false;
  }

  /**
   * 打擊判定
   * @param {int} type 
   */
  keyHit(type) {
    let beatsMap = this.beatsMap.beatsMap;
    let currentStep = this.state.currentStep;
    beatsMap.forEach((val, i) => {
      if (this._checkIsInBlock(currentStep, val.startStep) && type === val.align) { //節拍數進入範圍時
        let difference = this.state.currentTime - val.startStep * this.beatsMap.difference;
        let type = this._checkRangeType(difference);
        console.log(this.state.currentTime, difference, this._checkRangeType(difference));
        if (type) { //在判斷範圍內
          val.status = type;
        } else {  //範圍外
          val.status = -1;
        }
        val.element.hide();
      }
    });
  }

  _checkSilderInSpace(step, func = () => {}) {
    let currentStep = this.state.currentStep;
    let range = this.state.range;
    if (step > (currentStep-range) && step <= (currentStep+range)) {
      func.call();
    }
  }

  render() {
    if (this.beatsMap) {
      let width = this.state.width;
      let beatsMap = this.beatsMap.beatsMap;
      let currentStep = this.state.currentStep;
      let currentTime = this.state.currentTime;
      let difference = this.beatsMap.difference;
      let rangeTime = difference * this.state.range; //只有一半
      let maxDifference = this.state.difference[this.state.difference.length-1];
      if (beatsMap)
      beatsMap.forEach((val, i) => {
        val.element.hide();
        // let eleWidth = width/(2*this.state.range) - 20;
        let eleWidth = (width/2) * (maxDifference/this.beatsMap.difference) / this.state.range;
        //console.log(eleWidth)
        this._checkSilderInSpace(val.startStep, () => {
          let elementTime = 1-((val.startStep*difference)-currentTime)%rangeTime;
          let x = (val.align==0)?(width*(elementTime/rangeTime) - eleWidth):(width - width*(elementTime/rangeTime));
          if (val.align == 0 && (x+eleWidth)>(width-this.state.hpWidth)/2) {  // 左半部區塊寬度調整
            eleWidth = (((width)/2) - x) - this.state.hpWidth/2;
          }
          if (val.align == 1 && x<(width+this.state.hpWidth)/2) {  // 右半部區塊寬度調整
            eleWidth = eleWidth - (((width)/2) - x) - this.state.hpWidth/2;
            x = (width+this.state.hpWidth)/2;
          }
          if (rangeTime - elementTime <= 0 && val.status === 0) { //滑塊 miss
            val.status = -1;
            console.log('miss:'+i);
          }
          if (val.status === 0)
            val.element.set({
              x: x + 10,
              width: eleWidth
            }).show();
        });
      });
    };
  }
}

export default SilderStage;
