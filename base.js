/**
 * base function to draw point line polygon..
 */

var ZERO = 0.0000001;
var Vector = function(p1,p2){
	this.x = p2.lng - p1.lng;
	this.y = p2.lat - p1.lat;
}

Vector.prototype.reverse = function(){
	this.x = -this.x;
	this.y = -this.y;
}

var isZero = function(number){
	if(number < ZERO && number > -ZERO){
		return true;
	}else{
		return false;
	}
}
//求解圆的经纬度半径，由于百度不提供获取经纬度半径的方法，因此笨方法做了扩展，该方法不准确，关于圆的算法尽量不实现
var getRadius = function(circle){
	var center = circle.getCenter();
	var points = circle.getPath();
	var num = 0;
	var p = points[num];
	return Math.sqrt((center.lng - p.lng)*(center.lng - p.lng) + (center.lat - p.lat)*(center.lat - p.lat));
}
	
var BaseTool = BaseTool || function(){
	
};

!function(){
	
	//except circle
	BaseTool.prototype.getPoints = function(overlay){
		if(overlay instanceof BMap.Polygon || overlay instanceof BMap.Polyline){
			return overlay.getPath();
		}else if(overlay instanceof BMap.Point){
			return [overlay];
		}else if(overlay instanceof BMap.Marker){
			return [overlay.getPosition()];
		}else{
			return overlay;
		}
	}
	
	//except circle
	BaseTool.prototype.setPoints = function(overlay,points){
		if(overlay instanceof BMap.Polygon || overlay instanceof BMap.Polyline){
			overlay.setPath(points);
		}else if(overlay instanceof BMap.Point){
			overlay.point = points[0];
		}else if(overlay instanceof BMap.Marker){
			overlay.setPosition(points[0]);
		}else{
		}
	}
	//叉积
	BaseTool.prototype.crossProduct = function(v1,v2){
		return v1.x*v2.y-v2.x*v1.y;
	}
	//点积
	BaseTool.prototype.dotProduct = function(v1,v2){
		return v1.x*v2.x + v1.y*v2.y;
	}
	//距离
	BaseTool.prototype.distance = function(p1,p2){
		return Math.sqrt((p1.lng - p2.lng)*(p1.lng - p2.lng) + (p1.lat - p2.lat)*(p1.lat - p2.lat));
	}
	
	//球上两点的距离公式
	//已知（x1,y1） (x2,y2),球面两点的大圆角度余弦如下：
	//cosAngle = cosy1*cosy2*(cos(x1-x2)) + siny1*siny2
	BaseTool.prototype.realDistance = function(p1,p2,r){
		var r = r || 6371.393; //km
		var cosAngle = Math.cos(p1.lat)*Math.cos(p2.lat)*(Math.cos(p1.lng-p2.lng)) + Math.sin(p1.lat)*Math.sin(p2.lat);
		var angle = Math.acos(cosAngle);
		return angle*r;
	}

	//点集合按照x坐标排序
	BaseTool.prototype.pointSortInX = function(points){
		if(points.length > 0 ){
			var p0 = points[0];
			if(p0.hasOwnProperty("x") && p0.hasOwnProperty("y")){
				for(var i = 0; i < points.length - 1 ; i++){
					var k = i;
					for(var j = i + 1; j < points.length; j++){
						if(points[k].x > points[j].x){
							var temp = points[k];
							points[k] = points[j];
							points[j] = temp;
						}
					}
				}
			}else if(p0.hasOwnProperty("lng") && p0.hasOwnProperty("lat")){
				for(var i = 0; i < points.length - 1 ; i++){
					var k = i;
					for(var j = i + 1; j < points.length; j++){
						if(points[i].lng > points[j].lng){
							var temp = points[k];
							points[k] = points[j];
							points[j] = temp;
						}
					}
				}
			}
		}
	}

	//点在矩形内
	BaseTool.prototype.isPointInRectangle = function(p,rec){
		var points = rec.getPath();
		var minx,miny,maxx,maxy;
		if(points[0].lng < points[2].lng){
			minx = points[0].lng;
			maxx = points[2].lng;
		}else{
			minx = points[2].lng;
			maxx = points[0].lng;
		}
		if(points[0].lat < points[2].lat){
			miny = points[0].lat;
			maxy = points[2].lat;
		}else{
			miny = points[2].lat;
			maxy = points[0].lat;
		}
		if(p.lng > minx && p.lng <= maxx && p.lat < maxy && p.lat >= miny){
			return true;
		}else{
			return false;
		}
	}
	
	//点在园内，不在圆上和圆外面
	BaseTool.prototype.isPointInCircleInner = function(p,circle){
		var center = circle.getCenter();
		var radius = getRadius(circle);
		var distanceSquare = (p.lng-center.lng)*(p.lng-center.lng) + (p.lat-center.lat)*(p.lat-center.lat);
		if(distanceSquare < radius*radius){
			return true;
		}else{
			return false;
		}
	}

	//圆在矩形内
	BaseTool.prototype.isCricleInRectangle = function(circle,rec){
		var points = rec.getPath();
		var minx,miny,maxx,maxy;
		var center = circle.getCenter();
		var radius = getRadius(circle);
		if(points[0].lng < points[2].lng){
			minx = points[0].lng;
			maxx = points[2].lng;
		}else{
			minx = points[2].lng;
			maxx = points[0].lng;
		}
		if(points[0].lat < points[2].lat){
			miny = points[0].lat;
			maxy = points[2].lat;
		}else{
			miny = points[2].lat;
			maxy = points[0].lat;
		}
		if(this.isPointInRectangle(center,rec)){
			if(center.lng - minx >= radius && maxx - center.lng >= radius && center.lat - miny >= radius && maxy - center.lat >= radius){
				return true;
			}
		}
		return false;
	}

	//矩形相交
	BaseTool.prototype.isRecCross = function(rec1,rec2){
		var points1 = rec1.getPath();
		var points2 = rec2.getPath();
		var minx1,miny1,maxx1,maxy1,minx2,miny2,maxx2,maxy2;
		if(points1[0].lng < points1[2].lng){
			minx1 = points1[0].lng;
			maxx1 = points1[2].lng;
		}else{
			minx1 = points1[2].lng;
			maxx1 = points1[0].lng;
		}
		if(points1[0].lat < points1[2].lat){
			miny1 = points1[0].lat;
			maxy1 = points1[2].lat;
		}else{
			miny1 = points1[2].lat;
			maxy1 = points1[0].lat;
		}
		
		if(points2[0].lng < points2[2].lng){
			minx2 = points2[0].lng;
			maxx2 = points2[2].lng;
		}else{
			minx2 = points2[2].lng;
			maxx2 = points2[0].lng;
		}
		if(points2[0].lat < points2[2].lat){
			miny2 = points2[0].lat;
			maxy2 = points2[2].lat;
		}else{
			miny2 = points2[2].lat;
			maxy2 = points2[0].lat;
		}
		if(minx1 > maxx2 || maxx1 < minx2 || miny1 > maxy2 || maxy1 < miny2){
			return false;
		}else{
			return true;
		}
	}

	//点在线上
	//叉积为0，并且点在矩形内，
	BaseTool.prototype.isPointInLine = function(p1,l1){
		var points = l1.getPath();
		
		var vector1 = new Vector(p1,points[0]);
		var vector2 = new Vector(p1,points[1]);	
		
		var rec = new BMap.Polygon([
			          points[0],
			          new BMap.Point(points[0].lng,points[1].lat),
			          points[1],
			          new BMap.Point(points[1].lng,points[0].lat)
		          ]);
		if(isZero(this.crossProduct(vector1,vector2)) && this.isPointInRectangle(p1,rec)){
			return true;
		}else{
			return false;
		}
	}

	//线相交
	//两线外接矩形相交，并且两线互跨,则线相交
	BaseTool.prototype.isLineCross = function(l1,l2){
		var points1 = l1.getPath();
		var points2 = l2.getPath();
		
		var rec1 = new BMap.Polygon([
			           points1[0],
			           new BMap.Point(points1[0].lng,points1[1].lat),
			           points1[1],
			           new BMap.Point(points1[1].lng,points1[0].lat)
		           ]);
		var rec2 = new BMap.Polygon([
		               points2[0],
		               new BMap.Point(points2[0],points1[1].lat),
		               points2[1],
		               new BMap.Point(points2[1].lng,points2[0].lat
		            )]);
		//外接矩形判断是否不相交
		if(!this.isRecCross(rec1,rec2)){
			return false
		}else{
			var vector1 = new Vector(points1[0],points2[0]);
			var vector2 = new Vector(points1[0],points2[1]);
			var vector3 = new Vector(points1[0],points1[1]);
			
			var vector4 = new Vector(points2[0],points1[0]);
			var vector5 = new Vector(points2[0],points1[1]);
			var vector6 = new Vector(points2[0],points2[1]);
			
			//线段是否跨立判断
			if(this.crossProduct(vector1,vector3)*this.crossProduct(vector3,vector2)<0 ||
					this.crossProduct(vector4,vector6)*this.crossProduct(vector6,vector5)<0){
				return false;
			}else{
				return true;
			}
		}
	}

	//求两线交点
	//联立参数线段参数方程，求解交点 AB = A + r(B - A)，CD = C + s(D - C)
	BaseTool.prototype.lineCross = function(l1,l2){
		var points1 = l1.getPath();
		var points2 = l2.getPath();
		
		var a = points1[0],
			b = points1[1],
			c = points2[0],
			d = points2[1];
		var denominator = (b.lng - a.lng)*(d.lat - c.lat) - (b.lat-a.lat)*(d.lng - c.lng);
		var numerator = (a.lat-c.lat)*(d.lng - c.lng) - (a.lng - c.lng)*(d.lat -c.lat);
		
		//平行
		if(isZero(denominator)){
			//共线
			if(isZero(numerator)){
				return this.collinearCross(l1,l2);
			}else{
				return [];
			}
		}else{
			var r = numerator/denominator;
			var numerator2 = (a.lat-c.lat)*(b.lng - a.lng) - (a.lng - c.lng)*(b.lat -a.lat);
			var s = numerator2/denominator;
			if(r < 0 || r > 1 || s < 0 || s> 1){
				return [];
			}else{
				var x = a.lng + (b.lng - a.lng)*r;
				var y = a.lat + (b.lat - a.lat)*r;
				return [new BMap.Point(x,y)];
			}
		}
	}

	//两线断交点的一般求解方法
	//1 判断线段是否相交
	//2 l1垂直y轴求交点，考虑共线
	//3 l2垂直y轴求交点，
	//4 l1平行x轴求交点，考虑共线
	//5 l2平行x轴求交点
	//6 l1,l2联立方程组求交点，考虑共线
	BaseTool.prototype.lineCorss2 = function(l1,l2){
		//略
	}

	//判断共线线段的交点
	BaseTool.prototype.collinearCross = function(l1,l2){
		var points1 = l1.getPath();
		var points2 = l2.getPath();
		
		var a = points1[0],
			b = points1[1],
			c = points2[0],
			d = points2[1];
		//判断垂直的情况
		if(isZero(a.lat - b.lat)){
			var minyObj1,maxyObj1,minyObj2,maxyObj2;
			
			if(a.lng > b.lng){
				minyObj1 = b;
				maxyObj1 = a;
			}else{
				minyObj1 = a;
				maxyObj1 = b;
			}
			if(c.lng > d.lng){
				minyObj2 = d;
				maxyObj2 = c;
			}else{
				minyObj2 = c;
				maxyObj2 = d;
			}
			
			//求在上方的线段
			if(maxObj1.lng < maxObj2.lng){
				var temp = maxObj1;
				maxObj1 = maxObj2;
				maxObj2 = temp;
				
				temp = minObj1;
				minObj1 = minObj2;
				minObj2 = temp;
			}
			
			//相离
			if(minObj1.lng > maxObj2.lng){
				return [];
			}
			//顶点相交
			else if(isZero(minObj1.lng - maxObj2.lng)){
				return [minObj1];
			}
			//线段交叉
			else if(minObj1.lng > minObj2.lng ){
				return [minObj1,maxObj2];
			}
			//线段包含
			else{
				return [minObj2,maxObj2];
			}
		}
		//不垂直时，用横坐标求交点
		else{
			var minObj1,maxObj1,minObj2,maxObj2;
			if(a.lat > b.lat){
				minObj1 = b;
				maxObj1 = a;
			}else{
				minObj1 = a;
				maxObj1 = b;
			}
			if(c.lat > d.lat){
				minObj2 = d;
				maxObj2 = c;
			}else{
				minObj2 = c;
				maxObj2 = d;
			}
			//求左边的线
			if(maxObj1.lat > maxObj2.lat){
				var temp = minObj1;
				minObj1 = minObj2;
				minObj2 = temp;
				temp = maxObj1;
				maxObj1 = maxObj2;
				maxObj2 = temp;
			}
			//相离
			if(maxObj1.lat < minObj2.lat){
				return [];
			}
			else if(isZero(maxObj1.lat-minObj2.lat)){
				return [maxObj1];
			}
			else if(maxObj1.lat < maxObj2.lat){
				return [minObj2,maxObj1];
			}else{
				return [minObj2,maxObj2];
			}
		}
		return [];
	}

	// 射线法判断点是否在多边形内
	// 1 方向向上的边包括开始点，不包括终止点
	// 2 方向向下的边不包括开始点，包括终止点
	// 3 水平边不参与穿越测试
	// 4 射线和多边形的边的交点，必需严格在点p的右边，即多边形遵守左下闭，右上开规则
	BaseTool.prototype.isPointInPolygonRay = function(p,polygon){
		var points = polygon.getPath();
		var count = 0;
		var size = points.length;
		
		for(var i = 0; i < size; i++){
			var num = (i + 1) % size;
			//条件3
			if(!isZero(points[i].lng - points[num].lng)){
				
				//a表示y值小的点，b表示y值大的点
				var a = points[i];
				var b = points[num];
				if(b.lat < a.lat){
					var temp = a;
					a = b;
					b = temp;
				}
				//垂直边，直接判断x值大小
				if(isZero(a.lat - b.lat)){
					
					//条件4 p.lng < a.lng
					if(p.lat >= a.lat && p.lat < b.lat && p.lng < a.lng)
					count++;
				}
				//y ＝ kx ＋ b 求解交点
				else{
					var k = (b.lat - a.lat)/(b.lng - a.lng);
					var x = (p.lat - a.lat)/k + a.lng;
					
					//条件4 p.lng < x
					if(p.lat >= a.lat && p.lat < b.lat && p.lng < x){
						count++;
					}
				}
			}
		}
		if(count % 2 == 1){
			return true;
		}else{
			return false;
		}
	}

	// 环绕法判断点是否在多边形内
	// 在射线法的基础上加上线段的方向判断
	BaseTool.prototype.isPointInPolygonSurround = function(p,polygon){
		var points = polygon.getPath();
		var count = 0;
		var size = points.length;
		
		for(var i = 0; i < size; i++){
			var num = (i + 1) % size;
			//条件3
			if(!isZero(points[i].lng - points[num].lng)){
				
				//a表示y值小的点，b表示y值大的点
				var a = points[i];
				var b = points[num];
				if(b.lat < a.lat){
					var temp = a;
					a = b;
					b = temp;
				}
				var v1 = new Vector(points[i],points[num]);
				var v2 = new Vector(points[i],p);
				var direction = this.crossProduct(v1,v2);
				if(p.lat >= a.lat && p.lat < b.lat){
					if(direction > 0){
						count++;
					}else{
						count--;
					}
				}
			}
		}
		if(count == 0){
			return false;
		}else{
			return true;
		}
	}

	//1 线段点在多边形内
	//2 线段与多边形不内交
	//3 线段顶点与多边形边的交点，线段与多边形顶点的所有交点，以及交点的中点都在多边形内
	BaseTool.prototype.isLineInPolygon = function(line,polygon){
		var linePoints = line.getPath();
		var polygonPoints = polygon.getPath();
		var size = polygonPoints.length;
		var crossPoints = [];
		//1 点在多边形内
		if(this.isPointInPolygonSurround(linePoints[0],polygon) && this.isPointInPolygonSurround(linePoints[1],polygon)){
			//2 线段内交
			for(var i = 0; i < size; i++){
				var num = (i + 1) % size;
				var p1 = polygonPoints[i];
				var p2 = polygonPoints[num];
				var line2 = new BMap.Polyline([p1,p2]);
				if(this.isLineCross(line,line2)){
					return false;
				}
			}
			//求交点，加入交点数组
			for(var i = 0; i < size; i++){
				var num = (i + 1) % size;
				var p1 = polygonPoints[i];
				var p2 = polygonPoints[num];
				var line2 = new BMap.Polyline([p1,p2]);
				if(this.isPointInLine(linePoints[0],line2)){
					crossPoints.push(linePoints[0]);
				}
				if(this.isPointInLine(linePoints[1],line2)){
					crossPoints.push(linePoints[1]);
				}
				if(this.isPointInLine(p1,line)){
					crossPoints.push(p1);
				}
			}
			this.pointSortInX(crossPoints);
			for(var i = 0; i < crossPoints.length; i++){
				var num = (i + 1) % crossPoints.length;
				var p1 = crossPoints[i];
				var p2 = crossPoints[num];
				var p = new BMap.Point((p1.lng+p2.lng)/2,(p1.lat+p2.lat)/2);
				if(!this.isPointInPolygonSurround(p,polygon)){
					return false;
				}
			}
		}else{
			return false;
		}
		return true;
	}
	//线段与圆的交点
	BaseTool.prototype.lineCircleCross = function(line,circle){
		var points = line.getPath();
		var center = circle.getCenter();
		var radius = getRadius(circle);
		var crossPoints = [];
		if(this.isPointInCircleInner(points[0],circle) && this.isPointInCircleInner(points[1],circle)){
			return [];
		}else{
			//y轴平行
			if(isZero(points[0].lng - points[1].lng)){
				var xDistance = Math.abs(points[0].lng - center.lng);
				//相离
				if(xDistance > radius){
					return [];
				}
				//相切
				else if(isZero(xDistance - radius)){
					crossPoints.push(new BMap.Point(points[0].lng,center.lat));
					
				}
				//相交
				else{
					var yDistance = Math.sqrt(radius*radius - xDistance*xDistance);
					crossPoints.push(new BMap.Point(points[0].lng,center.lat + yDistance));
					crossPoints.push(new BMap.Point(points[0].lng,center.lat - yDistance));
				}
			}
			//x轴平行
			else if(isZero(points[0].lat - points[1].lat)){
				var yDistance = Math.abs(points[0].lat - center.lat);
				//相离
				if(yDistance > radius){
					return [];
				}
				//相切
				else if(isZero(yDistance - radius)){
					crossPoints.push(new BMap.Point(points[0].lat,center.lat));
				}
				//相交
				else{
					var xDistance = Math.sqrt(radius*radius - yDistance*yDistance);
					crossPoints.push(new BMap.Point(center.lng - xDistance,points[0].lat));
					crossPoints.push(new BMap.Point(center.lng + xDistance,points[0].lat));
				}
			}
			//普通情况，求解y = kx + b，(x-x0)^2 + (y-y0)^2 = r^2方程组 
			else{
				var x0 = points[0].lng,
				    y0 = points[0].lat;
				var k = (points[1].lat - points[0].lat)/(points[1].lng - points[0].lng);
				var b = y0 - k*x0;
				var x1,x2,y1,y2;
				
				var delt = (2*k*b-2*k*y0-2*x0)*(2*k*b-2*k*y0-2*x0)-4*(1+k*k)*((y0-b)*(y0-b) + x0*x0 - radius*radius);
				if(delt < 0){
					return [];
				}else if(isZero(delt)){
					x1 = (2*(k*y0+x0-k*b)+Math.sqrt(delt))/(2 + 2*k*k);
					y1 = k*x1 + b;
					crossPoints.push(new BMap.Point(x1,y1));
				}else{
					x1 = (2*(k*y0+x0-k*b)+Math.sqrt(delt))/(2 + 2*k*k);
					x2 = (2*(k*y0+x0-k*b)-Math.sqrt(delt))/(2 + 2*k*k);
					y1 = k*x1 + b;
					y2 = k*x2 + b;
					crossPoints.push(new BMap.Point(x1,y1));
					crossPoints.push(new BMap.Point(x2,y2));
				}
			}
			//判断点是否在线上
			var cursor = crossPoints.length - 1;
			while(cursor >= 0){
				var p = crossPoints[cursor];
				if(!this.isPointInLine(p,line)){
					crossPoints.slice(cursor,1);
				}
				cursor--;
			}
		}
		return crossPoints;
	}
	//  | x0 y0 1 |
	//  | x1 y1 1 |
	//  | x2 y2 1 |
	//拆分为多个三角形，每个三角形根据上述行列式求解面积，最后累计三角形面积之和为多边形面积
	BaseTool.prototype.polygonArea = function (polygon){
		var points = polygon.getPath();
		var size = points.length;
		var area = 0;
		if(size < 3 ) return null;
		var p0 = points[0];
		for(var i = 0; i < size - 2; i++){
			var p1 = points[i+1];
			var p2 = points[i+2];
			var triangleArea = (p0.lng*p1.lat + p1.lng*p2.lat + p2.lng*p0.lat - p0.lng*p2.lat - p1.lng*p0.lat - p2.lng*p1.lat)/2;
			area += triangleArea;
		}
		return Math.abs(area);
	}

	//更优雅的解决方案
	BaseTool.prototype.polygonArea2 = function(polygon){
		var points = polygon.getPath();
		var size = points.length;
		var original = new BMap.Point(0,0);
		var area = 0;
		for(var i = 0; i < size; i++){
			var p1 = points[i];
			var p2 = points[(i+1)%size];
			var v1 = new Vector(original,p1);
			var v2 = new Vector(original,p2);
			area += this.crossProduct(v1,v2);
		}
		return Math.abs(area/2);
	}

	//划分为多个三角形，根据三角形面积与多边形面积的比重作为权重，计算中心点
	BaseTool.prototype.polygonCenter = function(polygon){
		var points = polygon.getPath();
		var size = points.length;
		var original = new BMap.Point(0,0);
		var area = 0,xMean = 0,yMean = 0;
		var centerX,centerY;
		
		for(var i = 0; i < size; i++){
			var p1 = points[i];
			var p2 = points[(i+1)%size];
			var v1 = new Vector(original,p1);
			var v2 = new Vector(original,p2);
			var tmpArea = this.crossProduct(v1,v2);
			xMean += (p1.lng + p2.lng)*tmpArea;
			yMean += (p1.lat + p2.lat)*tmpArea;
			area += tmpArea;
		}
		
		if(area != 0){
			centerX = xMean/(3*area);
			centerY = yMean/(3*area);
			return new BMap.Point(centerX,centerY);
		}else{
			return null;
		}
	}
	//求过点求垂线
	//垂直点积为0，共线叉积为0
	BaseTool.prototype.verticalLine = function(p,line){
		
		var p = p.getPosition();
		var points = line.getPath();
		
		var x0 = points[0].lng,
			y0 = points[0].lat,
			x1 = points[1].lng,
			y1 = points[1].lat,
			xp = p.lng,
			yp = p.lat;
		
		//点在线上
		if(isZero((x1-x0)*(yp-y0) - (xp-x0)*(y1-y0))){
			return null;
		}
		
		var x = ((x1-x0)*(x1-x0)*xp + (y1-y0)*(y1-y0)*x0 - (y1-y0)*(x1-x0)*(y0-yp))/((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
		var y = (y1-y0)*(x-x0)/(x1-x0) + y0;
		
		if(!isZero((xp-x)*(x1-x0) + (yp-y)*(y1-y0))){
			alert("不垂直");
		}
		var point = new BMap.Point(x,y);
		var resultLine = new BMap.Polyline([p,point],{strokeWeight:1,strokeColor:"blue",strokeStyle:"solid"});
		return resultLine;
	}
	//过点作平行线
	BaseTool.prototype.parallelLine = function(p,line){
		var p = p.getPosition();
		var points = line.getPath();
		
		var x0 = points[0].lng,
			y0 = points[0].lat,
			x1 = points[1].lng,
			y1 = points[1].lat,
			xp = p.lng,
			yp = p.lat;
		
		//点在线上
		if(isZero((x1-x0)*(yp-y0) - (xp-x0)*(y1-y0))){
			return null;
		}
		var x = ((x1-x0)*(x1-x0)*xp + (y1-y0)*(y1-y0)*x0 - (y1-y0)*(x1-x0)*(y0-yp))/((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
		var y = (y1-y0)*(x-x0)/(x1-x0) + y0;
		var dx = p.lng-x;
		var dy = p.lat -y;
		var resultLine = new BMap.Polyline([new BMap.Point(x0+dx,y0+dy),new BMap.Point(x1+dx,y1+dy)],
				{strokeWeight:1,strokeColor:"red",strokeStyle:"solid"});
		return resultLine;
	}
	//伸缩线
	BaseTool.prototype.lineFlex = function(line,ratio){
		var points = line.getPath();
		//var distance = Math.sqrt((points[0].lng-points[1].lng)*(points[0].lng-points[1].lng) + 
		//(points[0].lat-points[1].lat)*(points[0].lat-points[1].lat));
		var x = points[0].lng + (points[1].lng-points[0].lng)*ratio;
		var y = points[0].lat + (points[1].lat-points[0].lat)*ratio;
		return new BMap.Polyline([points[0],new BMap.Point(x,y)],{strokeWeight:1,strokeColor:"blue",strokeStyle:"solid"});
	}
	//角度求交汇点
	BaseTool.prototype.angleJoin = function(line,angleA,angleB){
		var points = line.getPath();
		var xa = points[0].lng,xb = points[1].lng,
			ya = points[0].lat,yb = points[1].lat;
		var x = ((xb-xa)/Math.tan(angleA) - yb + ya)/(1/Math.tan(angleA)+1/Math.tan(angleB)) + xa;
		var y = ((yb-ya)/Math.tan(angleA) + xb - xa)/(1/Math.tan(angleA)+1/Math.tan(angleB)) + ya;
		return new BMap.Point(x,y);
	}
}();
