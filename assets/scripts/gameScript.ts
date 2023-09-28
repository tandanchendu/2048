import { _decorator, Component, Node, Graphics, view, Label, UITransform, EventTouch, Vec2, randomRangeInt, random, tween, input, Input, EventKeyboard, KeyCode, LabelAtlas, AudioClip, AudioSource, Color, Sprite, SpriteFrame, log } from 'cc';
import { Direction } from './commond';
import { numControl } from './numControl';
const { ccclass, property } = _decorator;

@ccclass('gameScript')
export class gameScript extends Component {
    @property(Graphics)
    private graphics:Graphics=null;

    @property(Node)
    private endNode:Node=null;

    @property(Label)
    private labScore:Label=null;

    @property(Label)
    private labBestScore:Label=null;

    @property(LabelAtlas)
    private labAltas:LabelAtlas=null;

    private audio:AudioSource=null;

    private labelNodes:Node[]=[];
    private labels:Label[]=[];

    // private labelNums:number[]=[];
    private touchPos=new Vec2();
    private rcCount=4;//行列数
    private bTouch=false;
    private numCtrl:numControl=null;
    private score=0;
    private bestScore=0;
    private moveSpeed=0.1;
    private startPos:Vec2=new Vec2();
    private rectSize:number=0;
    private material=null;
    private time=0;
    start() {
        let sp=this.node.getChildByName("SpriteBg")?.getComponent(Sprite);
        this.material = sp.customMaterial;
        let winSize=view.getVisibleSize();
        this.rectSize=(winSize.width-100)/4;
        this.startPos.x=-2*this.rectSize;
        this.startPos.y=-winSize.height/2+100+250;
        this.numCtrl=new numControl(this.rcCount);
        this.labScore.string="得分："+this.score;
        let strBestScore=localStorage.getItem("BestScore");
        
        this.bestScore=(strBestScore==null||strBestScore=="")?0:parseInt(strBestScore);
        this.labBestScore.string="最佳得分："+this.bestScore;
        for(let i=0;i<=this.rcCount;++i){
            let index=0;
            if(i<this.rcCount){
                for(let j=0;j<this.rcCount;++j){
                    // this.labelNums[index]=0;
                    index=i*this.rcCount+j;
                    this.labelNodes[index]=new Node();
                    this.node.addChild(this.labelNodes[index]);

                    this.labels[index]=this.labelNodes[index].addComponent(Label);
                    this.labels[index].font=this.labAltas;
                    this.labels[index].overflow=Label.Overflow.SHRINK;
                    this.labels[index].enableWrapText=false;
                    this.labels[index].fontSize=80;
                    let tran = this.labels[index].getComponent(UITransform);
                    tran.setContentSize(this.rectSize,this.rectSize);
                    this.labelNodes[index].setPosition(this.startPos.x+i*this.rectSize+this.rectSize/2,this.startPos.y+j*this.rectSize+this.rectSize/2);
                    // this.labels[index].string=this.labelNums[index].toString();
                    this.labels[index].string=this.numCtrl.getNumber(index).toString();
                    this.labelNodes[index].active=false;
                }
            }            
        }
        this.audio=this.node.getComponent(AudioSource);
        this.updateGame();
        // this.generalGame();
        this.bTouch=true;        
        this.node.on(Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.on(Node.EventType.TOUCH_END,this.onTouchStartEnd,this);
        input.on(Input.EventType.KEY_DOWN,this.onKeyDown,this);        
    }
    private onKeyDown(event:EventKeyboard){
        let direct;
        if(event.keyCode==KeyCode.KEY_W){
            direct=Direction.Up;
        }
        if(event.keyCode==KeyCode.KEY_S){
            direct=Direction.Down;
        }
        if(event.keyCode==KeyCode.KEY_A){
            direct=Direction.Left;
        }
        if(event.keyCode==KeyCode.KEY_D){
            direct=Direction.Right;
        }
        if(this.bTouch==true&&direct!=undefined){            
            // let bNewNum=this.startAdd(direct);
            this.numCtrl.printNums();
            let [bNewNum,moveNums,bPlaySound]=this.numCtrl.startAdd(direct);
            // this.printNum();
            log("moveNums=",moveNums);
            if(typeof(moveNums)=="object"){
                for(let i=0;i<moveNums.length;++i){                                       
                    this.playTween(moveNums[i][0],moveNums[i][1]);
                }
            }
            if(bNewNum==true){
                if(bPlaySound)
                    this.audio.playOneShot(this.audio.clip);
                this.bTouch=false;
                tween(this.node)
                .delay(this.moveSpeed+0.1)
                .call(()=>{
                    this.bTouch=true;
                    this.numCtrl.printNums();
                    this.updateGame();
                })
                .start();           
            } 
        }        
    }
    private updateGame(){
        this.drawGraphics();
        let index=this.numCtrl.randNum();//随机生成2
        if(index==-1){
            this.endNode.active=true;
            this.bTouch=false;
        }
        else{
            this.score+=2;
            this.labScore.string="得分："+this.score;
            if(this.bestScore<this.score){
                this.bestScore=this.score;
                this.labBestScore.string="最佳得分："+this.bestScore;
                localStorage.setItem("BestScore",this.bestScore.toString());
            }
            this.labels[index].string=this.numCtrl.getNumber(index).toString();                            
            if(this.labelNodes[index].active==false){
                this.labelNodes[index].active=true;
            }
        }
        if(this.numCtrl.checkGameEnd()==true){            
            this.endNode.active=true;
            this.bTouch=false;
        }
    }
    private generalGame(){
        this.numCtrl.generalGame();
        for(let i=0;i<this.rcCount*this.rcCount;++i){
            this.labels[i].string=this.numCtrl.getNumber(i).toString();
        }
    }
    //重新开始按钮
    private BtnReStatr(){
        for(let i=0;i<this.rcCount*this.rcCount;++i){
            this.labelNodes[i].active=false;
            this.labels[i].string="0";                            
        }
        this.score=0;
        this.labScore.string="0";
        this.endNode.active=false;
        this.bTouch=true;
        this.updateGame();
    }
    private onTouchStart(event:EventTouch){
        this.touchPos=event.touch.getLocation();
    }
    private onTouchStartEnd(event:EventTouch){
        let pos=event.touch.getLocation();
        log("touchEnd",event);
        this.checkDirection(pos);
    }
    private checkDirection(pos){
        let diffX=pos.x-this.touchPos.x;
        let diffY=pos.y-this.touchPos.y;
        if(diffX*diffX+diffY*diffY<25)
            return;
        let direct=Direction.Up;
        if(diffX!=0){
            let rate=diffY/diffX;
            if(-1<rate&&rate<1){
                if(diffX>0)//右
                    direct=Direction.Right;                
                else
                    direct=Direction.Left;
            }
            else{
                if(diffY>=0)//上
                    direct=Direction.Up;                
                else
                    direct=Direction.Down;
            }
        }
        else{
            if(diffY>=0)//上
                direct=Direction.Up;        
            else
                direct=Direction.Down;
        }
        if(this.bTouch==true){            
            // let bNewNum=this.startAdd(direct);
            let [bNewNum,moveNums,bPlaySound]=this.numCtrl.startAdd(direct);

            // this.printNum();
            log("moveNums=",moveNums);
            if(typeof(moveNums)=="object"){
                for(let i=0;i<moveNums.length;++i){
                    this.playTween(moveNums[i][0],moveNums[i][1]);
                }
            }
            if(bNewNum==true){
                this.bTouch=false;
                if(bPlaySound)
                    this.audio.playOneShot(this.audio.clip);
                tween(this.node)
                .delay(this.moveSpeed+0.1)
                .call(()=>{
                    this.bTouch=true;
                    this.updateGame();
                })
                .start();           
            } 
        }
    }

    private playTween(current,index){
        log("playTween",current,index);
        let [pos1,pos2]=[this.labelNodes[current].getPosition(),this.labelNodes[index].getPosition()];
        tween(this.labelNodes[index])
            .to(this.moveSpeed,{position:pos1})
            .call(()=>{
                this.labels[current].string=this.numCtrl.getNumber(current).toString();
                this.labels[index].string=this.numCtrl.getNumber(index).toString();
                this.labelNodes[index].setPosition(pos2);                
                if(this.labelNodes[current].active==false){
                    this.labelNodes[current].active=true;
                }
                if(this.labelNodes[index].active==true){
                    this.labelNodes[index].active=false;
                }                
            })
            .start();
    }
    private drawGraphics(){
        this.graphics.clear();
        let index=0;
        let level=10;
        this.graphics.strokeColor.fromHEX('#000000');

        for(let i=0;i<this.rcCount;++i){
            //横线
            // this.graphics.moveTo(this.startPos.x,this.startPos.y+i*this.rectSize);
            // this.graphics.lineTo(this.startPos.x+this.rcCount*this.rectSize,this.startPos.y+i*this.rectSize);
            // this.graphics.close();      
            // //竖线
            // this.graphics.moveTo(this.startPos.x+i*this.rectSize,this.startPos.y);
            // this.graphics.lineTo(this.startPos.x+i*this.rectSize,this.startPos.y+this.rcCount*this.rectSize);
            // this.graphics.close();
    
            for(let j=0;j<this.rcCount;++j){
                index=i*this.rcCount+j;
                level=this.numCtrl.getNumberLevel(index);
                this.graphics.fillColor=new Color(255,205-level*5,155-level*10,255);
                this.graphics.fillRect(this.startPos.x+1+i*this.rectSize,this.startPos.y+1+j*this.rectSize,this.rectSize-2,this.rectSize-2);
                this.graphics.close();    
            }
        }
    }

    onDestroy(){
        this.node.off(Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.off(Node.EventType.TOUCH_END,this.onTouchStartEnd,this);
        input.off(Input.EventType.KEY_DOWN,this.onKeyDown,this);        
    }
    update(deltaTime: number) {
        this.time+=deltaTime;
        this.material.setProperty("iTime",this.time);       

        // if(this.time>1){
        //     this.time=0;
        //     let rand=randomRangeInt(0,7);
        //     log(rand);
        //     this.material.setProperty("iTime",rand);       
        // }
    }
}