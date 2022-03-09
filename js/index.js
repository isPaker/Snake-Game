var sw=20,	//一个方块的宽度
	sh=20,	//一个方块的高度
	tr=30,	//行数
	td=30;	//列数

var snake=null,	//蛇的实例
	food=null,	//食物的实例
	game=null;	//游戏的实例

//定义一个方块类
class Square{
    constructor(x, y, classname){
        this.x=x*sw;
	    this.y=y*sh;
	    this.class=classname;

        this.viewContent=document.createElement('div');	//方块对应的DOM元素
	    this.viewContent.className=this.class;	
	    this.parent=document.getElementById('snakeWrapper'); //方块的父级
    }
    // 创建方块的方法
    create(){
        this.viewContent.style.position='absolute';
	    this.viewContent.style.width=sw+'px';
	    this.viewContent.style.height=sh+'px';
	    this.viewContent.style.left=this.x+'px';
	    this.viewContent.style.top=this.y+'px';

	    this.parent.appendChild(this.viewContent);
    }
    // 移除方块的方法
    remove(){
        this.parent.removeChild(this.viewContent);
    }
}
// 定义一个蛇类
class Snake{
    constructor(){
        this.head=null;	//存一下蛇头的信息
        this.tail=null;	//存一下蛇尾的信息
        this.pos=[];	//存储蛇身上的每一个方块的位置

        this.directionNum={	//存储蛇走的方向，用一个对象来表示
            left:{
                x:-1,
                y:0,
                rotate:180	//蛇头在不同的方向中应该进行旋转，要不始终是向右
            },
            right:{
                x:1,
                y:0,
                rotate:0
            },
            up:{
                x:0,
                y:-1,
                rotate:-90
            },
            down:{
                x:0,
                y:1,
                rotate:90
            }
        }
    }
    // 初始化方法
    init(){
        //创建蛇头
        var snakeHead=new Square(2,0,'snakeHead');
        snakeHead.create();
        this.head=snakeHead;
        this.pos.push([2,0]);
        //创建蛇身体1
        var snakeBody1=new Square(1,0,'snakeBody');
        snakeBody1.create();
        this.pos.push([1,0]);
        //创建蛇身体2
        var snakeBody2=new Square(0,0,'snakeBody');
        snakeBody2.create();
        this.tail=snakeBody2;
        this.pos.push([0,0]);
        //形成链表关系
        snakeHead.last=null;
        snakeHead.next=snakeBody1;

        snakeBody1.last=snakeHead;
        snakeBody1.next=snakeBody2;

        snakeBody2.last=snakeBody1;
        snakeBody2.next=null;

        //给蛇添加一条属性，用来表示蛇走的方向，默认让蛇往右走
        this.direction=this.directionNum.right;	
    }
    // 获取蛇头下个点的位置方法
    getNextPos(){
        var nextPos=[	//蛇头要走的下一个点的坐标
            this.head.x/sw+this.direction.x,
            this.head.y/sh+this.direction.y
        ];
        // 撞到自己，结束游戏
        var selfCollied=false; // 定义变量表示是否撞到了自己
        this.pos.forEach(function(value){
            if(value[0]==nextPos[0] && value[1]==nextPos[1]){
                //如果数组中的两个数据都相等，就说明下一个点在蛇身上里面能找到，代表撞到自己了
                selfCollied=true;
            }
        });
        if(selfCollied){
            console.log('撞到自己了！');
            this.die.call(this);
            return;
        }
        //下个点是围墙，游戏结束
        if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 || nextPos[1]>tr-1){
            console.log('撞墙了！');
            this.die.call(this);
            return;
        }
        //下个点是食物，吃
        if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
            //如果这个条件成立说明现在蛇头要走的下一个点是食物的那个点
            console.log('撞到食物了！');
            this.eat.call(this);
            return;
        }
        //以上都不是，走
	    this.move.call(this);
    }
    move(format){  //format为true表示吃
        //创建新身体（在旧蛇头的位置）
		var newBody=new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
		//更新链表的关系
		newBody.next=this.head.next;
		newBody.next.last=newBody;
		newBody.last=null;
        //把旧蛇头从原来的位置删除，创建新身体
        this.head.remove();
		newBody.create();
        //创建一个新蛇头(蛇头下一个要走到的点nextPos)
		var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
        //更新链表的关系
		newHead.next=newBody;
		newHead.last=null;
		newBody.last=newHead;
		newHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';
		newHead.create();
        //蛇身上的每一个方块的坐标也要更新
		this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
		this.head=newHead;

        if(!format){  //format为false表示没吃到
            this.tail.remove();
			this.tail=this.tail.last;
			this.pos.pop();
        }

    }
    eat(){
        this.move.call(this,true);
        createFood();
		game.score++;
    }
    die(){
        game.over();
    }
}
snake = new Snake();

// 创建食物
function createFood(){
	//食物小方块的随机坐标
	var x=null;
	var y=null;

	var include=true;	//循环跳出的条件，true表示食物的坐标在蛇身上（需要继续循环）。false表示食物的坐标不在蛇身上（不循环了）
	while(include){
		x=Math.round(Math.random()*(td-1));
		y=Math.round(Math.random()*(tr-1));

		snake.pos.forEach(function(value){
			if(x!=value[0] && y!=value[1]){
				//这个条件成立说明现在随机出来的这个坐标，在蛇身上并没有找到。
				include=false;
			}
		});
	}

	//生成食物
	food=new Square(x,y,'food');
	food.pos=[x,y];	//存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比

	var foodDom=document.querySelector('.food');
	if(foodDom){
		foodDom.style.left=x*sw+'px';
		foodDom.style.top=y*sh+'px';
	}else{
		food.create();
	}
}

class Game{
    constructor(){
        this.timer=null;
	    this.score=0;
    }
    // 游戏初始化
    init(){
        snake.init();
        createFood();
        document.onkeydown = (ev)=>{
            if(ev.keyCode==37 && snake.direction!=snake.directionNum.right){	//用户按下左键的时候，这条蛇不能是正下往右走
                snake.direction=snake.directionNum.left;
            }else if(ev.keyCode==38 && snake.direction!=snake.directionNum.down){
                snake.direction=snake.directionNum.up;
            }else if(ev.keyCode==39 && snake.direction!=snake.directionNum.left){
                snake.direction=snake.directionNum.right;
            }else if(ev.keyCode==40 && snake.direction!=snake.directionNum.up){
                snake.direction=snake.directionNum.down;
            }
        }
        this.start();
    }
    // 开始游戏
    start(){
        this.timer=setInterval(function(){
            snake.getNextPos();
        },200);
    }
    // 游戏暂停
    pause(){
        clearInterval(this.timer);
    }
    // 游戏结束
    over(){
        clearInterval(this.timer);
	    alert('你的得分为：'+this.score);

        //游戏回到最初始的状态
        var snakeWrap=document.getElementById('snakeWrapper');
        snakeWrap.innerHTML='';

        snake=new Snake();
        game=new Game()

        var startBtnWrap=document.querySelector('.startBtn');
        startBtnWrap.style.display='block';
    }
}
game = new Game();
// 开始按钮点击事件
var startBtn=document.querySelector('.startBtn button');
startBtn.onclick=function(){
	startBtn.parentNode.style.display='none';
	game.init();
};
// 暂停功能
var snakeWrap=document.getElementById('snakeWrapper');
var pauseBtn=document.querySelector('.pauseBtn button');
snakeWrap.onclick=function(){
	game.pause();

	pauseBtn.parentNode.style.display='block';
}
// 暂停按钮点击事件
pauseBtn.onclick=function(){
	game.start();
	pauseBtn.parentNode.style.display='none';
}