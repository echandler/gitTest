// This is a hack job that I threw together in a couple of days. I wanted the map to have a better
// way of measuring distance but couldn't figure out the best way. This will likely be overhauled in the
// future.

var scaleBarSvg_module = function(){
    var theScaleBarParent = window.$('scale_svg'),
        theBar = window.$('scale_bar'),
        resizeHandle = window.$('scale_resize_handle'),
        pivotHandle = window.$('scale_pivot_handle');

    

  function handleMouseDown(e){
      var feetDiv = document.createElement('div'),
          theMap = window.theMap;

      e.preventDefault();
      e.stopPropagation();
      feetDiv.style.position = 'absolute'; 
      feetDiv.style.color = 'rgb(60, 60, 43)';
      feetDiv.style.width = 'auto';
      feetDiv.style.padding = '10px';
      feetDiv.style.backgroundColor = 'white';
      feetDiv.style.boxShadow = '0px 0px 0px 1px rgb(211, 211, 211)';
      feetDiv.style.borderRadius = '2px';
      feetDiv.style.height = 'auto';
      feetDiv.feetPerPixel = ( theMap.presentMaxX - theMap.presentMinX ) / theMap.resizedMapWidth;
      //feetDiv.style.fontFamily = 'arial';
      feetDiv.innerHTML = '';
      feetDiv.id = 'feetDiv';
      feetDiv.minX = +theScaleBarParent.style.left.replace( /px/, '' ) + 3;
      feetDiv.maxY = window.theMap.resizedMapHeight - +theScaleBarParent.style.bottom.replace( /px/, '' ) + 3;
      document.body.appendChild( feetDiv );
      this.feetDiv = feetDiv;
      theBar.style.cursor = 'pointer';
      document.body.style.cursor = 'pointer';

      function handleMouseUp(e){
        $('feetDiv').parentNode.removeChild( $('feetDiv') );
        if ( theScaleBarParent.data.orientation === 'vert' ){
          document.removeEventListener('mousemove', verthandleMouseMove );
        }else {
          document.removeEventListener('mousemove', horizhandleMouseMove );
        }
        document.removeEventListener('mouseup', handleMouseUp );
        theBar.style.cursor = '';
        document.body.style.cursor = '';
      }
      if ( theScaleBarParent.data.orientation === 'vert' ){
        document.addEventListener('mousemove', verthandleMouseMove );
        feetDiv.innerHTML = ~~(feetDiv.feetPerPixel * ((e.clientX) - (feetDiv.minX + 5) )) +' ft';
        feetDiv.style.left = ( ( e.clientX - feetDiv.minX ) / 2 ) + feetDiv.minX - (feetDiv.clientWidth / 2) + 'px';
        feetDiv.style.top = e.clientY + 20 +'px';
       }else {
        document.addEventListener('mousemove', horizhandleMouseMove );
        feetDiv.style.left = e.clientX + 20 +'px'; 
        feetDiv.style.top = feetDiv.maxY - ( ( feetDiv.maxY - e.clientY) /2 ) -30 + 'px';
        feetDiv.innerHTML = ~~( feetDiv.feetPerPixel * ( ( feetDiv.maxY - 5 ) - ( e.clientY )) ) +' ft';
      }
      document.addEventListener('mouseup', handleMouseUp);
    }

    var verthandleMouseMove = function( e ){
      var x = e.clientX - +this.resizeHandle.parentNode.style.left.replace(/px/,'');

      if( x < 25 ){ return; }
      this.resizeHandle.feetDiv.innerHTML = (~~(this.resizeHandle.feetDiv.feetPerPixel * (e.clientX - (this.resizeHandle.feetDiv.minX + 5)))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +' ft';
      //this.resizeHandle.feetDiv.style.top = (400-40) +'px';
      this.resizeHandle.setAttribute( 'd', 'M'+ (x-5)+',20 l10,0 l0,-10 l-5,-10 l-5,10 z' );
      this.Bar.setAttribute( 'd', 'M5,12  l'+ (x-5)+',0 l0,5 l-'+ (x-5)+',0 z' );
      this.resizeHandle.parentNode.style.width = (x+7) +'px';
      this.resizeHandle.feetDiv.style.left = ( ( e.clientX - this.resizeHandle.feetDiv.minX + 5) / 2 ) + this.resizeHandle.feetDiv.minX - (feetDiv.clientWidth / 2) + 'px';
    }.bind( { resizeHandle: resizeHandle,
             pivotHandle: pivotHandle,
             Bar: theBar }  );

    var horizhandleMouseMove = function( e ){
      var y = (window.theMap.resizedMapHeight - e.clientY ) - +this.pivotHandle.parentNode.style.bottom.replace(/px/,'');
      
      if( y < 25 ){ return; }
      this.resizeHandle.feetDiv.innerHTML = (~~(this.resizeHandle.feetDiv.feetPerPixel * ( ( this.resizeHandle.feetDiv.maxY - 5 ) - ( e.clientY )))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +' ft';
      //this.resizeHandle.feetDiv.style.top = (400-40) +'px';
      this.pivotHandle.setAttribute( 'd', 'M10,'+ ( y + 4)+' l10,0 l0,-10 l-10,0 l-10,5 l10,5 z' );
      this.Bar.setAttribute( 'd', 'M13,5 l0,'+ ( y + 4)+ ' l5,0 l0,-'+ ( y + 4)+' z' );
      this.resizeHandle.parentNode.style.height = (y + 5 ) +'px';
      this.resizeHandle.feetDiv.style.top = this.resizeHandle.feetDiv.maxY - (( this.resizeHandle.feetDiv.maxY - e.clientY) /2) -30 + 'px';
      //this.resizeHandle.feetDiv.style.left = e.clientX + 20 +'px';
    }.bind( { resizeHandle: resizeHandle,
             pivotHandle: pivotHandle,
             Bar: theBar } );

    function scaleBarMouseDown( e ){
      this.offSetX = e.clientX - +theScaleBarParent.style.left.replace( /px/, '' );
      this.offSetY = ( window.theMap.resizedMapHeight - e.clientY ) - +theScaleBarParent.style.bottom.replace( /px/, '' );
      e.preventDefault();
      e.stopPropagation();
      document.body.style.cursor = 'all-scroll';
      var moveScale = function( e ){
        this.parent.data.left = ( e.clientX - this.Bar.offSetX );
        this.parent.data.bottom = (( this.resizedMapHeight - e.clientY  ) - this.Bar.offSetY );
        this.parent.style.left = this.parent.data.left +'px';
        this.parent.style.bottom  = this.parent.data.bottom +'px';
      }.bind( { parent: theScaleBarParent, Bar: this, resizedMapHeight: window.theMap.resizedMapHeight } );
      function mouseUp( e ){
        document.removeEventListener('mousemove', moveScale);
        document.removeEventListener('mouseup', mouseUp);
        document.body.style.cursor = '';
      }
      document.addEventListener('mousemove', moveScale);
      document.addEventListener('mouseup', mouseUp);
    }

    function changeScaleBarOrientation(){
        var width = theScaleBarParent.style.height.replace( /px/, '' ),
            height = theScaleBarParent.style.width.replace( /px/, '' );

        theScaleBarParent.style.width = width +'px';
        theScaleBarParent.style.height = height +'px';
        if( theScaleBarParent.data.orientation === 'vert' ){
          theScaleBarParent.data.orientation = 'horiz';
          resizeHandle.setAttribute( 'd', 'M10,11 l10,0 l0,-10 l-10,0 l-10,5 l10,5 z' );
          theBar.setAttribute( 'd', 'M13,5 l0,'+ ( height )+' l5,0 l0,-'+ ( height )+' z' );
          pivotHandle.setAttribute( 'd', 'M10,'+ ( height - 1)+' l10,0 l0,-10 l-10,0 l-10,5 l10,5 z' );
        } else {
          theScaleBarParent.data.orientation = 'vert';
          resizeHandle.setAttribute( 'd', 'M'+ (width-11)+',20 l10,0 l0,-10 l-5,-10 l-5,10 z' );
          theBar.setAttribute( 'd', 'M5,12  l'+ (width-5)+',0 l0,5 l-'+ (width-5)+',0 z' );
          pivotHandle.setAttribute( 'd', "M5,20 l10,0 l0,-10 l-5,-10 l-5,+10 z" );
        }
        // vert
        // left = M10,499 l10,0 l0,-10 l-10,0 l-10,5 l10,5 z;
        // right = M10,11 l10,0 l0,-10 l-10,0 l-10,5 l10,5 z;
        // bar = M13,5 l0,499 l5,0 l0,-499 z;
    }

    var scaleBarResize = function(){
        var width =  window.theMap.resizedMapWidth * 0.2,
            scaleBarXCoord = (( window.theMap.resizedMapWidth - width ) - 30),
            scaleBarYCoord = window.$('mini_footer').clientHeight + 5;
        theScaleBarParent.style.bottom = scaleBarYCoord+'px';
        theScaleBarParent.style.left = scaleBarXCoord+'px';
        theScaleBarParent.style.width = width +'px';
        resizeHandle.setAttribute( 'd', 'M'+ (width-11)+',20 l10,0 l0,-10 l-5,-10 l-5,10 z' );
        theBar.setAttribute( 'd', 'M5,12  l'+ (width-5)+',0 l0,5 l-'+ (width-5)+',0 z' );
    }
    function scaleBarInit(){
      theBar.addEventListener('mousedown', scaleBarMouseDown );
      resizeHandle.addEventListener('mousedown', handleMouseDown );
      pivotHandle.addEventListener('click', changeScaleBarOrientation );
      theScaleBarParent.data = {  bottom: 400,
                                  left: (window.theMap.resizedMapWidth - (window.theMap.resizedMapWidth * 0.2)),
                                  orientation: 'vert',
                                  width: 500,
                                  height: 21,
                          };
      scaleBarResize();
    }

    // http://jsbin.com/xopidezu/5/edit
    return{
      scaleBarResize: scaleBarResize,
      scaleBarInit: scaleBarInit,
    };
}()