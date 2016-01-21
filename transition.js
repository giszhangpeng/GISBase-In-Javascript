/**
 * 
 */

//
//仿射变换

var TransitionTool = function(){
	
}
TransitionTool.prototype = new BaseTool();
TransitionTool.prototype.constructor = TransitionTool;

!function(tool){
	
	//平移
	//				| 1  0  0 | 			
	//  ［x y 1］	| 0  1  0 | = [x+dx,y+dy,1]
	//			 	| dx dy 1 |
	tool.prototype.move = function(overlay,dx,dy){
		if(dx === null || dx === undefined){
			dx = 0.0001;
		}
		if(dy === null || dy === undefined){
			dy = 0.0001;
		}
		var points = this.getPoints(overlay);
		for(var i = 0; i < points.length; i++){
			points[i].lng += dx;
			points[i].lat += dy;
		}
		this.setPoints(overlay,points);
	}
	//比例变化
	//			| sx  0   0 |
	//［x y 1］ 	| 0   sy  0 | = [sx*x sy*y 1]
	//			| 0   0   1 |
	
	tool.prototype.stretch = function(overlay,sx,sy){
		if(sx === null || sx === undefined){
			sx = 1.1;
		}
		if(sy === null || sy === undefined){
			sy = 1.1;
		}
		var points = this.getPoints(overlay);
		for(var i = 0; i < points.length; i++){
			points[i].lng = sx * points[i].lng;
			points[i].lat = sy * points[i].lat;
		}
		this.setPoints(overlay,points);
	}
	//对称变化
	//			| a d 0 |
	// [x y 1] 	| b e 0 | = [ax+by dx+ey 1]
	//			| 0 0 1 |
	tool.prototype.symmetry = function(overlay,a,b,d,e){
		if( a === null || a === undefined){
			a = -1;
		}
		if( b === null || b === undefined ){
			b = 0;
		}
		if( d === null || d === undefined){
			d = 0;
		}
		if( e === null || e === undefined){
			e = 1;
		}
		var points = this.getPoints(overlay);
		for(var i = 0; i < points.length; i++){
			var lng = points[i].lng;
			var lat = points[i].lat;
			points[i].lng = lng*a + lat*b;
			points[i].lat = lng*d + lat*e;
		}
		this.setPoints(overlay,points);
	}
	
	//旋转
	//			| cos  sin  0 |   
	// [x y 1] 	| -sin cos  0 | = [ xcos-ysin  xsin+ycos  1]
	//			| 0    0    1 |   
	tool.prototype.rotate = function(overlay,angle){
		if( angle === null || angle === undefined){
			angle = 30*Math.PI/180;
		}
		var points = this.getPoints(overlay);
		for(var i = 0; i < points.length; i++){
			var lng = points[i].lng;
			var lat = points[i].lat
			points[i].lng = lng*Math.cos(angle)-lat*Math.sin(angle);
			points[i].lat = lng*Math.sin(angle)+lat*Math.cos(angle);
		}
		this.setPoints(overlay,points);
	}
	//错切变换　
	//			| 1  d  0 |
	// [x y 1] 	| b  1  0 | = [x+by  dx+y  1]
	//			| 0  0  1 |
	tool.prototype.shear = function(overlay,b,d){
		if( b === null || b === undefined){
			b = 1;
		} 
		if( d === null || d === undefined){
			d = 0;
		}
		var points = this.getPoints(overlay);
		for(var i = 0; i < points.length; i++){
			var lng = points[i].lng;
			var lat = points[i].lat
			points[i].lng = lng + b*lat;
			points[i].lat = lng*d + lat;
		}
		this.setPoints(overlay,points);
	}
	
	//在球面三角形中，经纬度坐标和球面极坐标的转换，熟悉球面三角形基本公式
	tool.prototype.sphereChange = function(){}
	
	// 最小二乘法，利用控制点求仿射变换6参数，包括最小二乘法原理，矩阵乘法元算，逆矩阵解法
	tool.prototype.affineTrans = function(srcs,tars){}
	
}(TransitionTool)
