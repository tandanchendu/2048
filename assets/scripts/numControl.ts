import { log, randomRangeInt } from "cc";
import { Direction } from "./commond";

export class numControl{
    private current=0;
    private index=-1;
    private bExChange=false;
    private addIndex=-1;
    private rcCount=0;
    private labelNums:number[]=[];
    private direct;

    constructor(rcCount:number){
        this.rcCount=rcCount;
        for(let i=0;i<this.rcCount*this.rcCount;++i){
            this.labelNums[i]=0;
        }
    }
    public startAdd(direct){
        this.direct=direct;
        let bNewNum=false;
        let bPlaySound=false;
        let moveNums=[];
        this.addIndex=-1;

        for(let i=0;i<this.rcCount;++i){
            this.setCurrent(i);//每个方向的第一个
            for(let j=0;j<this.rcCount;++j){
                this.setIndex(i,j);
                log("1=",i,j,this.current,this.index,this.addIndex,this.labelNums[this.current],this.labelNums[this.index],direct);
                if(this.labelNums[this.index]!=0){
                    this.setExChange(i);
                    if(this.bExChange==true){
                        if(this.current!=this.index){
                            bNewNum=true;
                            [this.labelNums[this.current],this.labelNums[this.index]]=[this.labelNums[this.index],this.labelNums[this.current]];                        
                            // let [firstPos,secondePos]=[this.labelNodes[this.current].getPosition(),this.labelNodes[this.index].getPosition()];
                            // this.playTween(current,index,firstPos,secondePos);   
                            moveNums.push([this.current,this.index]); 
                            log("true",this.current,this.addIndex,this.index);
                        }
                        this.setCurrent(-1);
                        // --this.current;
                    }
                    else{
                        bNewNum=true;
                        bPlaySound=true;
                        // this.labelNums[current+1]+=this.labelNums[current+1];
                        this.labelNums[this.index]=0;
                        // addIndex=current+1;
                        this.addNum();
                        log("false",this.current,this.addIndex,this.index);
                        moveNums.push([this.addIndex,this.index]);
                        // let [firstPos,secondePos]=[this.labelNodes[current+1].getPosition(),this.labelNodes[index].getPosition()];
                        // this.playTween(current+1 ,index,firstPos,secondePos);
                    }   
                }              
                log("2=",i,j,this.current,this.index,this.addIndex,this.labelNums[this.current],this.labelNums[this.index],direct);
            }
        }
        return [bNewNum,moveNums,bPlaySound];
    }
    private addNum(){
        switch(this.direct){
            case Direction.Up:{
                this.addIndex=this.current+1;
                break;
            }
            case Direction.Down:{
                this.addIndex=this.current-1;                
                break;
            }
            case Direction.Left:{
                this.addIndex=this.current-this.rcCount;
                break;
            }
            case Direction.Right:{
                this.addIndex=this.current+this.rcCount;
                break;
            }
        }
        this.labelNums[this.addIndex]+=this.labelNums[this.addIndex];
    }
    public getNumber(index){
        return this.labelNums[index];
    }
    public getNumberLevel(index: number): number {
        let level=10;
        let compareNum=2;
        for(let i=0;i<10;++i){
            if(this.labelNums[index]<=compareNum)
            {
                level=i;
                break;
            }                
            else
                compareNum*=2;
        }
        return level;
    }
    public generalGame(){
        let nums=[8,2,0,0, 
            8,16,4,0, 
            8,0,0,0, 
            64,2,2,0];           
                  
        for(let i=0;i<this.rcCount;++i){
            for(let j=0;j<this.rcCount;++j){
                this.labelNums[i*this.rcCount+j]=nums[i*this.rcCount+j];
            }
        }
    }
    public randNum(){
        let randNum=randomRangeInt(0,65535)%(this.rcCount*this.rcCount);

        for(let i=randNum;i<this.rcCount*this.rcCount;++i){
            if(this.labelNums[i]==0){
                this.labelNums[i]=2;               
                return i;
            }            
        }
        for(let i=0;i<randNum;++i){
            if(this.labelNums[i]==0){
                this.labelNums[i]=2;
                return i;
            }  
        }
        return -1;//生成失败，游戏结束
        //gameOver
    }
    public checkGameEnd(){
        let bFull=true;
        for(let i=0;i<this.rcCount*this.rcCount;++i){
            if(this.labelNums[i]==0){
                bFull=false;
                break;
            }
        }
        if(bFull){
            let bEnd=true;
            for(let i=0;i<this.rcCount;++i){
                for(let j=0;j<this.rcCount;++j){
                    if(j<this.rcCount-1&&this.labelNums[i*this.rcCount+j]==this.labelNums[i*this.rcCount+j+1]||
                        i<this.rcCount-1&&this.labelNums[i*this.rcCount+j]==this.labelNums[(i+1)*this.rcCount+j]){
                        bEnd=false;
                        break;
                    }
                }
            }
            if(bEnd){
                for(let i=0;i<this.rcCount*this.rcCount;++i){
                    this.labelNums[i]=0;
                }
                return true;
            }
        }
        return false;
    }
    public printNums(){
        let str="";
        for(let i=0;i<this.rcCount;++i){
            for(let j=0;j<this.rcCount;++j){
                str+=this.labelNums[i*this.rcCount+j]+" ";
            }
            str+="\n";
        }
        log(str);
    }
    private setCurrent(i){
        //i为-1时控制移到下一个
        if(i!=-1)
            this.current=0;
        switch(this.direct){
            //每列最上边一个
            case Direction.Up:{
                if(i!=-1)
                    this.current=i*this.rcCount+this.rcCount-1;
                else
                    --this.current;
                break;
            }
            //每列最下边一个
            case Direction.Down:{
                if(i!=-1)
                    this.current=i*this.rcCount;
                else
                    ++this.current;
                break;
            }
            //每行最左边一个
            case Direction.Left:{
                if(i!=-1)
                    this.current=i;
                else
                    this.current+=this.rcCount;
                break;
            }
            //每行最右边一个
            case Direction.Right:{
                if(i!=-1)
                    this.current=this.rcCount*(this.rcCount-1)+i;
                else
                    this.current-=this.rcCount;
                break;
            }
        }
    }
    private setIndex(i,j){
        this.index=-1;
        switch(this.direct){
            //从上往下遍历
            case Direction.Up:{
                this.index=i*this.rcCount+this.rcCount-1-j;
                break;
            }
            //从下往上遍历
            case Direction.Down:{
                this.index=i*this.rcCount+j;
                break;
            }
            //从左往右遍历
            case Direction.Left:{
                this.index=j*this.rcCount+i;
                break;
            }
            //从右往左遍历
            case Direction.Right:{
                this.index=i+(this.rcCount-1-j)*this.rcCount;
                break;
            }
        }
    }
    private setExChange(i){
        this.bExChange=false;
        switch(this.direct){
            case Direction.Up:{
                //越界判断
                if(this.current+1<i*this.rcCount+this.rcCount){
                    //翻倍判断
                    if(this.labelNums[this.index]==this.labelNums[this.current+1]&&
                        this.addIndex!=this.current+1)
                        this.bExChange=false;                                
                    else
                        this.bExChange=true;
                }
                else
                    this.bExChange=true;        
                break;
            }
            case Direction.Down:{                    
                if(this.current-1>=i*this.rcCount){
                    if(this.labelNums[this.index]==this.labelNums[this.current-1]&&
                        this.addIndex!=this.current-1)
                        this.bExChange=false;                                
                    else
                        this.bExChange=true;
                }
                else
                    this.bExChange=true;
                     
                break;
            }
            case Direction.Left:{
                if(this.current-this.rcCount>=0){
                    if(this.labelNums[this.index]==this.labelNums[this.current-this.rcCount]&&
                        this.addIndex!=this.current-this.rcCount)
                        this.bExChange=false;                                
                    else
                        this.bExChange=true;
                }
                else
                    this.bExChange=true;        
                break;
            }
            case Direction.Right:{
                if(this.current+this.rcCount<this.rcCount*this.rcCount){
                    if(this.labelNums[this.index]==this.labelNums[this.current+this.rcCount]&&
                        this.addIndex!=this.current+this.rcCount)
                        this.bExChange=false;                                
                    else
                        this.bExChange=true;
                }
                else
                    this.bExChange=true;
                break;
            }
        }
    }
}