window.panning_module = function(){
    
    function panningControlsliderMouseDown( e ){
        document.body.style.cursor = 'pointer';
        window.addEventListener( 'mousemove', panningControlsliderMove, true );
        window.addEventListener( 'mouseup', panningControlsliderMouseUp, false );
        panningControlsliderMove( e );
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    var panningControlsliderMouseUp = function ( e ){
        document.body.style.cursor = 'default'; 
        window.removeEventListener( 'mousemove', panningControlsliderMove, true );
        window.removeEventListener( 'mouseup', panningControlsliderMouseUp, false );
        
        // TODO: Find out difference between e.preventDefault() and 
        // e.stopImmediatePropagation().
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    var panningControlsliderMove = function ( e ){
        var sliderRailWidth = this.sliderRail.clientWidth,
            //tick = this.Math.floor( sliderRailWidth / 3 /10)*10,
            z = this.Math.round( ( e.clientX - this.sliderRail.getBoundingClientRect().left ) ) - 8; 
        
        if ( z >= 0 && z < sliderRailWidth - 12 ){
            window.panningObj.panningAnimationMultiplier = ( z / sliderRailWidth ) * 21;// if panningAnimationMultiplier default was changed this needs to be changed and 1 added to it.
            this.slider.style.left = z +'px';
        }
    }.bind({
        sliderRail: window.$( 'panning_control_slider_rail' ),
        slider: window.$( 'panning_control_slider' ),
        Math: Math,
        });

    // Start the panning animation.
    var panningAnimationMouseUp = function( e ){
        if ( this.theMap.pan.panningXYNew && this.date.now() - this.theMap.pan.panningXYNew[2] < 200 ){
            var x = this.theMap.pan.panningXYNew[0],
                y = this.theMap.pan.panningXYNew[1],
                xAdder = (( x - this.theMap.pan.panningXYOld[0] ) * this.panningObj.panningAnimationMultiplier) + x,
                yAdder = (( y - this.theMap.pan.panningXYOld[1] ) * this.panningObj.panningAnimationMultiplier) + y,
                markers = this.theMap.markersArray,
                len = markers.length,
                xyAdderSum = this.abs( xAdder ) + this.abs( yAdder ),
                speed = ( xyAdderSum > 1200 )? 1200: xyAdderSum,
                transitionString = 'all '+ ( ( speed > this.panningObj.panningAnimationTime )? this.panningObj.panningAnimationTime - 50: speed ) +'ms cubic-bezier( 0, 0, 0.25, 1 )';

            if( xyAdderSum > 2000){ xyAdderSum = 2000; }
            this.theMap.dragDiv.style.transition = transitionString;
            this.theMap.dragDiv.style[this.theMap.cssTransform] = 'translate3d('+ xAdder +'px,'+ yAdder +'px, 0px)';
            
            setTimeout( function(){
                var markers = this.markersArray,
                    len = markers.length;

                this.dragDiv.style.transition = "";
                for( var i = 0; i < len; ++i ){
                    markers[i].style.transition = "";
                } 
            }.bind( this.theMap ), 1700 );
        }
        this.theMap.removeEventListener( 'mouseup', panningAnimationMouseUp );
    }.bind( { 
        theMap: window.theMap, 
        abs: window.Math.abs, 
        date: window.Date,
        panningObj: window.panningObj
    } );

    function calculatePanTime( now ){
        var total = 0;
            
        window.timeToLoadArray.push( now - window.startSend );
        window.timeToLoadArray.forEach( function( recordedTime ){
            total = total + recordedTime;
        });
        window.panningObj.panningAnimationTime = ( total / window.timeToLoadArray.length < 1000 )? ~~( total / window.timeToLoadArray.length ): 1000 ;
        if ( window.timeToLoadArray.length > 10 ){ window.timeToLoadArray = [] }
    } 

return {
    panningControlsliderMouseDown: panningControlsliderMouseDown,
    panningControlsliderMove: panningControlsliderMove,
    panningAnimationMouseUp: panningAnimationMouseUp,
    calculatePanTime: calculatePanTime,
}

}();