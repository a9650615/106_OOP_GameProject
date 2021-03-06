import {Game} from '../src/constant';
// By Raccoon
// include namespace
// var Framework = (function (Framework) {
// 	'use strict'
// 	Framework.Config = function () {
// 		this.fps = 60;
// 		this.canvasWidth = 1350;
// 		this.canvasHeight = 700;
// //		this.canvasWidth =  640;
// //		this.canvasHeight = 480;
// 		this.isBackwardCompatiable = false;
// 		this.isOptimize = false;  // 2017.02.20, from V3.1.1
// 		this.isMouseMoveRecorded = false;
// 	};
// 	return Framework;
// })(Framework || {});

export default function(Framework) {
    'use strict'
		Framework.Config = function () {
		this.fps = 60;
		this.canvasWidth = Game.window.width;
		this.canvasHeight = Game.window.height;
//		this.canvasWidth =  640;
//		this.canvasHeight = 480;
		this.isBackwardCompatiable = false;
		this.isOptimize = false;  // 2017.02.20, from V3.1.1
		this.isMouseMoveRecorded = false;
	};
	return Framework;
}
