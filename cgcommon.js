/**
 * 编写计算机图形学的通用算法
 */

var computerGraphic = computerGraphic || {};

!function(cg){
	
	//递归种子填充算法
	cg.seedFill1 = function(x,y,oldColor,newColor){
		var p = new Point(x,y);
		if(p.getColor() == oldColor){
			p.setColor(newColor);
			this.seedFill1(x,y-1,oldColor,newColor);
			this.seedFill1(x,y+1,oldColor,newColor);
			this.seedFill1(x-1,y,oldColor,newColor);
			this.seedFill1(x+1,y,oldColor,newColor);
		}
	}
	
	//栈改写的种子填充算法,感谢大师兄，教我掌握栈的算法
	cg.seedFill2 = function(x,y,oldColor,newColor){
		
		var stack = new Stack();
		var p = new Point(x,y);
		if(p.getColor() == oldColor){
			stack.push(p);
		}
		while(!stack.empty()){
			var up = new Point(p.x,p.y-1),
			    bottom = new Point(p.x,p.y+1),
			    left = new Point(p.x-1,y),
			    right = new Point(p.x+1,y);
			
			//上下左右搜索
			if(up.getColor() == oldColor){
				p = up;
				stack.push(p);
			}else if(bottom.getColor() == oldColor){
				p = bottom;
				stack.push(p);
			}else if(left.getColor() == oldColor){
				p = left;
				stack.push(p);
			}else if(right.getColor() == oldColor){
				p = right;
				stack.push(p);
			}
			else{
				var p1 = stack.pop();
				p1.setColor(newColor);
				p = stack.top();
			}
			
		}
	}
	//扫描线种子填充算法，效率更高，是种子填充算法的最高效率的方式
	//1、初始化一个空的栈用于存放种子点，将种子点(x, y)入栈
	//2、判断栈是否为空，如果栈为空则结束算法，否则取出栈顶元素作为当前扫描线的种子点(x, y)，y是当前的扫描线
	//3、从种子点(x, y)出发，沿当前扫描线向左、右两个方向填充，直到边界。分别标记区段的左、右端点坐标为xLeft和xRight
	//4、分别检查与当前扫描线相邻的y - 1和y + 1两条扫描线在区间[xLeft, xRight]中的像素，从xLeft开始向xRight方向搜索，
	//若存在非边界且未填充的像素点，则找出这些相邻的像素点中最右边的一个，并将其作为种子点压入栈中，然后返回第（2）步
	cg.seedFill3 = function(x,y,newColor,boundaryColor){
		var stack = new Stack();
		var p = new Point(x,y);
		stack.push(x,y);
		while(!stack.empty()){
			var top = stack.pop();
			setColor(top.x,top.y,newColor);
			var cy = top.y;
			var left = top.x;
			var right = top.x;
			
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
}(computerGraphic);
