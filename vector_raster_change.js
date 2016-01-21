/**
 * 矢量和栅格数据转换
 */

var vectorRasterTool = function(){
	
}
vectorRasterTool.prototype = new BaseTool();
vectorRasterTool.prototype.constructor = vectorRasterTool;

!function(tool){
	
	//扫描线填充算法NET-AET
	tool.prototype.v2rPolygon = function(polygon,color){
		var points = polygon.getPath();
		var size = points.length;
		//简化为屏幕坐标进行计算
		var pixels = [];
		for(var i = 0; i < size; i++){
			pixels.push(map.pointToPixel(points[i]));
		}
		var ymin = pixels[0].y,ymax = pixels[0].y;
		for(var i = 1; i < size; i++){
			if(ymin > pixels[i].y){
				ymin = pixels[i].y;
			}
			if(ymax < pixels[i].y){
				ymax = pixels[i].y;
			}
		}
		//构建活性边表,将顶点加入边表中
		var net = {};
		var filledLines = [];
		
		for(var i = 0; i < size; i++){
			var aets = [];
			var p = pixels[i];
			var pnext = pixels[(i+1)%size];
			var pbefore = pixels[(i+size-1)%size];
			//左水平边则画出线,以后不做交点处理计算
			if(pnext.y == p.y && p.x > pnext.x){
				filledLines.push([pnext,p]);
			}else if(p.y < pnext.y){
				var aet = {};
				aet.x = p.x;
				aet.ymax = pnext.y;
				aet.dx = (pnext.x-p.x)/(pnext.y-p.y);
				aets.push(aet);
			}else{
				
			}
			
			if(pbefore.y == p.y && p.x > pbefore.x){
				filledLines.push([pbefore,p]);
			}else if(p.y < pbefore.y){
				var aet = {};
				aet.x = p.x;
				aet.ymax = pbefore.y;
				aet.dx = (pbefore.x-p.x)/(pbefore.y-p.y);
				aets.push(aet);
			}else{
				
			}
			
			//key值为顶点的y坐标
			if(aets && aets.length > 0){
				if(net[p.y]){
					net[p.y].concat(aets);
				}else{
					net[p.y] = aets;
				}
			}
		}
		//开始遍历
		for(var i = ymin; i <= ymax; i++){
			var crossings = [];
			//搜索扫描线扫过的边
			for(var j in net){
				
				//扫描线在点的上边
				if(i >= j){
					var ates = net[j];
					if(ates && ates.length > 0){
						var k = ates.length - 1;
						while(k >= 0){
							//删除活性边表中的边
							if(ates[k].ymax == i){
								ates.splice(k,1);
							}
							//扫描线小于aets[k].ymax的情况
							else{
								var x = ates[k].dx * (i - j) + ates[k].x;
								var y = i;
								crossings.push(new BMap.Pixel(x,y));
							}
							k--;
						}
					}
				}
			}
			//交点数组排序
			this.pointSortInX(crossings);
			for(var j = 0; j < crossings.length; j=j+2){
				//filledLines.push([crossings[j],crossings[j+1]]);
				var start = map.pixelToPoint(crossings[j]);
				var end = map.pixelToPoint(crossings[j+1]);
				var polyline = new BMap.Polyline([start,end],{strokeColor:color,strokeWeight: 1});
				map.addOverlay(polyline);
			}
		}
		//转化坐标填充
		for(var i = 0; i < filledLines.length; i++){
			var line = filledLines[i];
			var start = map.pixelToPoint(line[0]);
			var end = map.pixelToPoint(line[1]);
			var polyline = new BMap.Polyline([start,end],{strokeColor:color,strokeWeight: 1});
			map.addOverlay(polyline);
		}
	}
	//扫描线种子填充算法
	tool.prototype.v2rPolygonSeed = function(seed,polygon,newColor,boundaryColor){
		
		var pixel = map.pointToPixel(seed);
		var stack = [];
		var results = [];
		stack.push(pixel);
		while(!stack){
			var top = stack.pop();
			results.push(top);
			var cy = top.y;
			var left = top.x;
			var right = top.x;
			
			//该如何getColor呢？毕竟不是绘图系统，蛋疼！
			while(getColor(left-1,cy) != boundaryColor){
				setColor(left,cy);
				left--;
			}
			while(getColor(right+1,cy) != boundaryColor){
				setColor(right,cy);
				right++;
			}
			var ydown = cy - 1;
			var yup = cy+ 1;
			var xcursor = left;
			var needFill = false;
			while(xcursor <= right){
				var needFill = false;
				while(getColor(xcursor,ydown) != boundaryColor && xcursor <= right){
					xcursor++;
					needFill = true;
				}
				if(needFill){
					stack.push(new Point(xcursor - 1,ydown));
				}
				while(getColor(xcursor,ydown) == boundaryColor && xcursor <= right){
					xcursor++;
				}
			}
			
			xcursor = left;
			while(xcursor <= right){
				var needFill = false;
				while(getColor(xcursor,yup) != boundaryColor && xcursor <= right){
					xcursor++;
					needFill = true;
				}
				if(needFill){
					stack.push(new Point(xcursor - 1,yup));
				}
				while(getColor(xcursor,yup) == boundaryColor && xcursor <= right){
					xcursor++;
				}
			}
			
		}
	}
}(vectorRasterTool);
