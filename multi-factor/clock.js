
window.addEventListener("DOMContentLoaded", () => {
    const { context , hankei } =  initialCanvas("analog");
    const cCircle = centerCircle( context );
    const mBan = mojiban ( context , hankei );
    const hourHand = new handObj( handDatas.hour , context , hankei );
    const minuteHand = new handObj( handDatas.minute , context , hankei );
    const secondHand = new handObj( handDatas.second , context , hankei );

    const sideLength = hankei * 2;
    
    setInterval(()=> {
        const date = new Date();
        // 時計を消去
        context.clearRect(-hankei , -hankei , sideLength , sideLength);
        mBan();
        hourHand.rewrite( (date.getHours()%12) * 60 + date.getMinutes() );
        minuteHand.rewrite( date.getMinutes() );
        secondHand.rewrite( date.getSeconds()+date.getMilliseconds() /1000); // 秒針はミリ秒も利用
        cCircle( );
    },10);
});
/*
* キャンバスの作成・初期化
*/
const initialCanvas = id => {

    // div要素を取得
    const viewElm = document.getElementById(id);

    // div要素の縦横短い方を取得
    const minSide = Math.min( viewElm.clientWidth , viewElm.clientHeight );
    // 時計の半径を取得
    const hankei = minSide / 2;

    // キャンバスを作成
    const cvs = document.createElement("canvas");

    // キャンバスの描画コンテキストを取得
    const context = cvs.getContext('2d');

    // キャンバスの描画サイズセット
    cvs.setAttribute( "width" , minSide );
    cvs.setAttribute( "height" , minSide );

    // キャンバスの表示サイズセット
    const style = cvs.style;
    style.width = minSide + "px";
    style.height = minSide + "px";

    // キャンバスをdiv要素の中央にセット
    style.top = ( viewElm.clientHeight  - minSide ) /2 + "px" ;
    style.left =( viewElm.clientWidth  - minSide ) /2 + "px" ;

    // キャンバスにスタイルをセット
    //[ style.position ,  style.boxSizing , style.border ]=
    //            [ "absolute" ,  "border-box" ,"0" ];
    style.padding = style.margin = "0 0 0 0";

    // 描画の原点をキャンバスの中心にセット
    context.translate( hankei , hankei );

    viewElm.appendChild( cvs );

    return { hankei:hankei , context : context };
};

const centerCircleData = {
    hankei:1,          // 円の半径
    width:1,            // 線の太さ
    lineColor: "black", // 線色
    fillColor: "silver", // 塗りつぶし色
};
const centerCircle = ( context ) =>{
    const ctx = context;
    return () =>{
        ctx.lineWidth = 0;

        // 半径：centerCircleData.hankei の円を書く
        ctx.beginPath();
        ctx.fillStyle = centerCircleData.lineColor;
        ctx.arc( 0 , 0 , centerCircleData.hankei  , 0 , Math.PI * 2 );
        ctx.fill();

        // 半径：centerCircleData.hankei - centerCircleData.width の円を書く
        ctx.beginPath();
        ctx.fillStyle  = centerCircleData.fillColor;
        ctx.arc( 0 , 0 , centerCircleData.hankei - centerCircleData.width , 0 , Math.PI * 2 );
        ctx.fill();
    };
};
/*
* 文字盤描画データ
*/
const mojibanInfo ={
    borderWidth : 0,   // 外周の円の太さ
    borderColor: "#fff",  // 外周の色
    line1:{             // 太い目盛り
        width: 0,       // 線幅
        height: 0      // 線の長さ
    },
    line2:{             // 細い目盛り
        width: 0,       // 線幅
        height: 0       // 線の長さ
    },
    text:{              // 数字
        dist: 7,        // 数字の中心の外周からの距離
        color:"#000",   // 数字の色
        font:"300 0.16em sans-serif"  // 数字のフォント
    }
};
/*
* 文字盤の描画
*/
const mojiban = ( context , hankei  ) =>{

    const ctx = context;

    // パスを記憶
    const memoriPath = ( hankei , type ) => {
        const linePath = new Path2D();
        linePath.lineWidth = type.width;
        linePath.moveTo( 0 , hankei );
        linePath.lineTo( 0 , hankei - type.height );
        return linePath;
    };

    return ( ) => {

        // 外側の円
        ctx.beginPath();
        //ctx.arc( 0 , 0 , hankei - mojibanInfo.borderWidth / 2, 0, Math.PI * 2, true);
        ctx.arc( 0 , 0 , hankei - 3, 0, Math.PI * 2, true);
        // 塗りつぶしを実行
        ctx.fillStyle = mojibanInfo.borderColor;
        ctx.fill();
        // 文字の描画
        ctx.strokeStyle = mojibanInfo.borderColor;
        ctx.fillStyle = mojibanInfo.text.color;
        ctx.lineWidth = mojibanInfo.borderWidth;
        ctx.stroke();

        // 目盛りの表示
        const topPos = hankei - mojibanInfo.borderWidth; // 外周分内側に置く
        const rotateAngle   = Math.PI * ( 360 / 60 ) / 180 ;  // 一目盛りの角度
        const line1 = memoriPath( topPos , mojibanInfo.line1);  // 太い線のパスを取得
        const line2 = memoriPath( topPos , mojibanInfo.line2);  // 細い線のパスを取得

        ctx.save();     // 回転させる前のコンテキストを保存

        for( let i = 0 ; i < 60 ; i ++ ){   // キャンバスを回転させながら目盛りを描く
            const line =  i % 5 === 0 ? line1 : line2;
            ctx.beginPath();
            ctx.stroke( line );
            ctx.rotate( rotateAngle );
        }
        ctx.restore();  // 保存したコンテキストを復元

        // 時刻文字の表示
        const r12  = 360 / 12;          // 一文字の角度
        const moziPos =  topPos - mojibanInfo.text.dist;
        const MathPi = Math.PI / 180;

        // 文字の基準位置・フォントを設定
        [ ctx.textAlign , ctx.textBaseline , ctx.font ] =
                    [ "center" , "middle" , mojibanInfo.text.font ];

        for( let i = 0 ; i < 12 ; i ++){
            const deg = i * r12 * MathPi ;
            const [ mojiX , mojiY ] =
                [ moziPos * Math.sin( deg  ) , -moziPos * Math.cos( deg  ) ] ;

            ctx.fillText( i === 0 ? "12" : i.toString() , mojiX, mojiY );
        }
    };
};
/*
*  針のデータ
*/
const handDatas = {
    hour : {        // 時針
        width : 2 ,    // 幅
        color : "#000", // 色
        LengthPer:55,   // 長さ（半径に対する割合)
        handGapPer:5,  // 反対側に飛び出る長さ（半径に対する割合)
        divNum:12 * 60  // 一周の分割数
    },
    minute : {        // 分針
        width : 2 ,
        color : "#000",
        LengthPer:80,
        handGapPer:5,
        divNum:60
    },
    second : {        // 秒針
        width : 1,
        color : "#f00",
        LengthPer:85,
        handGapPer:10,
        divNum:60
    },
};
/*
* 針の描画をおこなうオブジェクト
 */
const handObj = function( handData , context , hankei ){
    this.handData = handData;
    this.rotateAngle = Math.PI * ( 360 / handData.divNum ) / 180;
    this.ctx = context;
    const topPos = hankei - mojibanInfo.borderWidth;

    // パスを作成
    const pathCtx = new Path2D();
    [ pathCtx.lineWidth , pathCtx.strokeStyle ] = [ handData.width , handData.color ];
    pathCtx.moveTo( 0 , - ( topPos * handData.LengthPer / 100 ));
    pathCtx.lineTo( 0 ,  topPos * handData.handGapPer / 100  );
    this.pathCtx = pathCtx;
};

handObj.prototype={

    rewrite : function ( val ) {

        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        [ ctx.lineWidth , ctx.strokeStyle ] = [ this.handData.width , this.handData.color ];
        if( val !== 0 ){
            ctx.rotate( this.rotateAngle * val  );
        }
        ctx.stroke( this.pathCtx );
        ctx.restore();
    }
};

