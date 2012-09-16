//フロアークラス
  	enchant.Floor = enchant.Class.create({
		    initialize:function(x,y,xx,yy,id){
		        this.x  = x;
		        this.y  = y;
		        this.w  = xx;
		        this.h  = yy;
		        this.id = 0;
				this.prev   = null;
				this.prevwh = null;
				this.next   = null;
				this.nextwh = null;
		    },
		    tl:function(){
		        return {x:this.x,y:this.y};
		    },
		    tr:function(x){
		        return {x:this.x+this.w,y:this.y};
		    },
		    bl:function(x){
		        return {x:this.x,y:this.y+this.h};
		    },
		    br:function(x){
		        return {x:this.x+this.w,y:this.y+this.h};
		    },		    
		    
		});
		
		//ランダムマップ作成クラス
		enchant.RandMap = 	enchant.Class.create(enchant.Map,{
		    initialize:function(tileWidth, tileHeight,mapx,mapy){
		    	enchant.Map.call(this,arguments[0],arguments[1]);
		    	this.floor = new Array(new Floor(0,0,mapx,mapy,0));
		    	this.mapx   = mapx;		//マップの横の配列の大きさ
		    	this.mapy   = mapy;		//マップの縦の配列の大きさ
		    	this.addway = 20;		//道を追加する確率
		    	this.num    = 5;		//フロアの数
		    	this.fsize  = 5;		//フロアの最低サイズ
		    	this.rsize  = 3;		//部屋の最低サイズ
		    	this.wall	= 1;		//壁タイル
				this.room   = 2;		//部屋タイル
				this.way	= 2;		//通路タイル
				this.free	= 0;		//なにもない空間
		    	if(this.fsize<this.rsize+2){this.rsize=this.fsize-2;}
		    },
		    split:function(id){
		        //分割ルーチン
		        retry = true;
		        rnd_wh  = dice(2,1,0,0);            //縦横どちらで分割するか（0=縦、1=横)
				if(rnd_wh){
					if(this.floor[id].w >= this.fsize*2){
						rnd_part = dice(this.floor[id].w-this.fsize*2,1,this.fsize,0);
						retry = false;
					}
				}else{
					if(this.floor[id].h >= this.fsize*2){
						rnd_part = dice(this.floor[id].h-this.fsize*2,1,this.fsize,0);
						retry = false;
					}												
				}
				if(!retry){
					if(rnd_wh){;
						//横で分割の場合
						old = this.floor[id].w - rnd_part;
						this.floor[id].w = rnd_part;
						this.floor.push(new Floor(this.floor[id].tr().x,this.floor[id].tr().y,old,this.floor[id].h,this.floor.length));
					}else{
						//縦で分割の場合
						old = this.floor[id].h - rnd_part;
						this.floor[id].h = rnd_part;
						this.floor.push(new Floor(this.floor[id].bl().x,this.floor[id].bl().y,this.floor[id].w,old,this.floor.length));
					}
						nid = this.floor.length-1;
						this.floor[nid].id = nid ;

						this.floor[nid].prev = id;
						this.floor[nid].next = this.floor[id].next;
						this.floor[id].next   = this.floor[nid].id;
						if(this.floor[id].next != null){this.floor[this.floor[id].next].prev = nid;}
                                                
                        this.floor[nid].nextwh = this.floor[id].nextwh;
                        this.floor[nid].prevwh  = rnd_wh;
                        this.floor[id].nextwh   = rnd_wh;						
				}         
		        return retry;
		    },
		    crate:function(){
				for(i=0;i<this.num;i++){
					while(this.split(dice(this.floor.length,1,0,0))){};
				}
				
			    this.data = new Array(this.mapy);
			    //マップを埋め
			    for(iy=0;iy<this.mapy;iy++){
			    	this.data[iy] = new Array(this.mapx);
			    	for(ix=0;ix<this.mapx;ix++){
			    		this.data[iy][ix] = this.free;
			    	}
			    }
			    
			    for(i=0;i<this.floor.length;i++){
/*
			    	//区切りをつくる
			    	for(iy=this.floor[i].y;iy<this.floor[i].br().y;iy++){
				    	for(ix=this.floor[i].x;ix<this.floor[i].br().x;ix++){
							if(ix==this.floor[i].x || ix+1==this.floor[i].br().x || iy==this.floor[i].y || iy+1==this.floor[i].br().y){
				    			this.data[iy][ix] = 1;
				    		}else{
				    			this.data[iy][ix] = 0;
				    		}
				    	}			    	
			    	}
*/
			    	
			    	//部屋作成	
				   	this.floor[i].room = new Array();				
					this.floor[i].room.x = dice(this.floor[i].w-this.rsize-2,1,2,this.floor[i].x);
					this.floor[i].room.y = dice(this.floor[i].h-this.rsize-2,1,2,this.floor[i].y);
			    	this.floor[i].room.w =  this.floor[i].room.x+this.rsize+dice((this.floor[i].br().x - this.floor[i].room.x - this.rsize),1,0,0);
			    	this.floor[i].room.h =  this.floor[i].room.y+this.rsize+dice((this.floor[i].br().y - this.floor[i].room.y - this.rsize),1,0,0);
			    	for(iy = this.floor[i].room.y;iy<this.floor[i].room.h;iy++){
						for(ix = this.floor[i].room.x;ix<this.floor[i].room.w;ix++){
							this.data[iy][ix] = this.room;
						}            
					}
				
					//通路作成
					 if(this.floor[i].prev != null){
						if(this.floor[i].prevwh){
							iy = rndlen(this.floor[i].room.y,this.floor[i].room.h);
							for(ix=this.floor[i].room.x - 1;ix>=this.floor[i].x;ix--){
								this.data[iy][ix] = this.way;
							}
						}else{
							ix = rndlen(this.floor[i].room.x,this.floor[i].room.w);
							for(iy=this.floor[i].room.y - 1;iy>=this.floor[i].y;iy--){
								this.data[iy][ix] = this.way;
							}
						}
						this.floor[i].ix = ix;
						this.floor[i].iy = iy;
					}
				 }
				 
				 //通路を連結する
				 for(i=0;i<this.floor.length;i++){
				 	if(this.floor[i].next != null && this.floor[i].nextwh != null){
						if(this.floor[i].nextwh){
							iy = rndlen(this.floor[i].room.y,this.floor[i].room.h);
							for(ix=this.floor[i].room.w;ix<this.floor[this.floor[i].next].x;ix++){
								this.data[iy][ix] = this.way;
							}
							
							if(this.floor[this.floor[i].next].iy > iy){plus=1}else{plus=-1}
							for(ix;iy != this.floor[this.floor[i].next].iy;iy+=plus){
								this.data[iy][ix] = this.way;
							}

													
						}else{
							ix = rndlen(this.floor[i].room.x,this.floor[i].room.w);
							for(iy=this.floor[i].room.h;iy<=this.floor[this.floor[i].next].iy;iy++){
								this.data[iy][ix] = this.way;
							}
							
							if(this.floor[this.floor[i].next].ix > ix){plus=1}else{plus=-1}
							for(ix;ix != this.floor[this.floor[i].next].ix;ix+=plus){
								this.data[iy][ix] = this.way;
							}
				
						}
					}
				 }
				 
				//壁を配置する
				for(iy=0;iy<map.mapy;iy++){
					for(ix=0;ix<map.mapx;ix++){
						if((this.data[iy][ix] == this.way || this.data[iy][ix] == this.room)&&ix+1 < map.mapx && iy+1 <map.mapy){
							for(iyp=iy-1;iyp<=iy+1;iyp++){
								for(ixp=ix-1;ixp<=ix+1;ixp++){
									if(this.data[iyp][ixp] == this.free){
									this.data[iyp][ixp] = this.wall;}
								}						
							}
						}
					}
				}
		}
		});
		
				//比較関数 aがbより大きいならTrue。geがTrueの場合はaとbが同じでもtrue
		function check(a,b,ge){
			return (a >= b && ge)||(a > b);
		}
		
		//ダイス関数 dice面ダイス(最低値min)をnum回振った値にplusを足した数字を返す
		function dice(dice,num,plus,min){
			switch (arguments.length) { 
				case 0: dice = 6; 
				case 1: num = 1; 
				case 2: plus = 0; 
				case 3: min = 1; 
			}
			ret=0;
			for (n=0;n<num;n++){
				ret += Math.floor(Math.random()*dice)+min;
			}
			ret += plus;
			return ret;	 	
		}
		
		//a以上b未満の乱数を発生させる
		function rndlen(a,b){
			return Math.floor(Math.random()*(b-a))+a;
		}