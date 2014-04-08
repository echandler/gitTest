window.zoom_module = function (){
    var math = window.Math,
        theMap = window.theMap;// TODO: can this be deleted?

    var centerMainImage = function ( mousex, mousey, mouseX, mouseY ){

            // Subtract the max coord from the min coord and divide by 2. 
        var halfX = ( this.presentMaxX - this.presentMinX ) / 2, //example: 1311592.01401389 - 1301107.16345745 = 10484.850556439953 / 2 = 5242.4252782199765
            halfY = ( this.presentMaxY - this.presentMinY ) / 2,

            // Make the first x,y multiplier, these are used to scale the screen coordinates to the map.
            xMultiplier = ( this.presentMaxX - this.presentMinX ) / this._width, //example: ( 1311592.01401389 - 1301107.16345745 ) / 2940.414201183432 = 3.5657733363619664. This is the X multiplier.
            yMultiplier = ( this.presentMaxY - this.presentMinY ) / this._height,

            // Multiply the mouse position on the image inside the container (not the screen) by the Multiplier. 
            // Add the current min X coordinate to that.
            // Subtract the difference between current max X and min X divided by 2 and 
            // mouse position on the image inside the container Div multiplied 
            // by the multiplier (x coords only, y coords are slightly different).
            minxOld = ( ( mousex * xMultiplier ) + this.presentMinX ) - halfX, //example: ( ( 1310.9346646942802 * 3.5657733363619664 ) + 1301107.16345745 ) - 5242.4252782199765 = 1300539.2340523093 
            maxxOld = ( ( mousex * xMultiplier ) + this.presentMaxX ) - halfX, 
            minyOld = ( ( this._height - mousey ) * yMultiplier ) + this.presentMinY - halfY,
            maxyOld = ( ( this._height - mousey ) * yMultiplier ) + this.presentMaxY - halfY,

            // Subtract TODO: finish this
            nowX = maxxOld - minxOld,
            nowY = maxyOld - minyOld,

            // This calculates the zooming in or zooming out.
            // The resizedMapHeight and width are divided by the viewPortHeight ( viewPortWidth apparently works also )
            // which returns a ratio that the zoomPower is divided by so the height zoomPower will be different than the width zoomPower.
            // Then then height zoomPower is it subtracted from nowX and width zoomPower is subtracted nowY.
            soonX = nowX - ( /* I got this by accident */ this.zoomPower[this.sliderPosition] / ( this.resizedMapHeight / this.viewPortHeight ) ),
            soonY = nowY - ( /* I got this by accident */ this.zoomPower[this.sliderPosition] / ( this.resizedMapWidth / this.viewPortHeight ) );
        
        halfX = soonX / 2;
        halfY = soonY / 2;
        minxOld = minxOld + halfX;
        maxxOld = maxxOld - halfX;
        minyOld = minyOld + halfY;
        maxyOld = maxyOld - halfY;
        xMultiplier = ( maxxOld - minxOld ) / this.resizedMapWidth;
        yMultiplier = ( maxyOld - minyOld ) / this.resizedMapHeight;
        halfX = ( maxxOld - minxOld ) / 2;
        halfY = ( maxyOld - minyOld ) / 2; 
        mouseX = mouseX - this.containerStyleLeft;
        mouseY = mouseY - this.containerStyleTop;
        minxOld = halfX + minxOld - ( mouseX * xMultiplier );
        maxxOld = halfX + maxxOld - ( mouseX * xMultiplier );
        maxyOld = halfY + maxyOld - ( ( this.resizedMapHeight - mouseY ) * yMultiplier );
        minyOld = halfY + minyOld - ( ( this.resizedMapHeight - mouseY ) * yMultiplier );
        window.utilities_module.makeArcXMLRequest( minxOld , maxxOld , minyOld, maxyOld );
    }.bind( window.theMap );

    

    var plus = function (){
        zoomInOut( {
                    wheelDelta: 120,
                    clientX: this.viewPortWidth/2,
                    clientY: this.viewPortHeight/2,
                    } );
    }.bind( window.theMap );

    var minus = function (){
        zoomInOut( {
                    wheelDelta: -120,
                    clientX: this.viewPortWidth/2,
                    clientY: this.viewPortHeight/2,
                    } );
    }.bind( window.theMap );

    function sliderMouseDown( e ){
        document.body.style.cursor = 'pointer';
        window.addEventListener( 'mousemove', sliderMove, true );
        window.addEventListener( 'mouseup', sliderMouseUp, false );
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    var sliderMouseUp = function ( e ){
        document.body.style.cursor = 'default'; 
        window.removeEventListener( 'mousemove', sliderMove, true );
        window.removeEventListener( 'mouseup', sliderMouseUp, false );
        zoomStart( [ this._width/2, this._height/2 ] , this.viewPortWidth/2, this.viewPortHeight/2 );
        e.preventDefault();
        e.stopImmediatePropagation();
    }.bind( window.theMap )

    var sliderMove = function ( e ){
        var z = this.round( ( e.clientY - this.theMap.zoom_slider_container_styleTop ) / 11 ) * 10; 
        if ( z >= -10 && z < 210 && z  !== this.theMap.sliderPosition && z % 20 === 0 ){
            if ( z > this.theMap.sliderPosition ){
                zoomInOut( {
                            wheelDelta: -120,
                            clientX: this.theMap.viewPortWidth/2,
                            clientY: this.theMap.viewPortHeight/2,
                            }, true );
            } else { 
                zoomInOut( {
                            wheelDelta: 120,
                            clientX: this.theMap.viewPortWidth/2,
                            clientY: this.theMap.viewPortHeight/2,
                            }, true ); 
            }
            this.theMap.sliderPosition = z;
            this.zoom_slider.top = z +'px';
        }
    }.bind( {   theMap: window.theMap,
                zoom_slider: window.$( 'zoom_slider' ).style,
                round: Math.round
            });

    var zoomInOut = function( e, slider ){
         // TODO: Delete these timers.
         //console.time( 'timer' );
         //console.log( 'zoomInOut',e );
        //var start = window.performance.now();
        var //time = 1000,
            evt = undefined, //equalize event object
            delta = ( ( e.wheelDelta )? e.wheelDelta: ( evt = ( window.event || e ), evt.detail * - 120 ) ),
            clientX = e.clientX - this.containerStyleLeft,
            clientY = e.clientY - this.containerStyleTop,
            // Find where the mouse is on the map img its self, not where the mouse is in the viewport (aka screen).
            XcoordOnMapImg = ( clientX - this.dragDiv.left ) - this.left,
            YcoordOnMapImg = (  clientY - this.dragDiv.topp ) - this.topp,
            markers = this.markersArray,
            i = markers.length,
            ratio = undefined,
            xMultiplier = undefined,
            yMultiplier = undefined,
            x = undefined,
            y = undefined;
            
        this.clearTimeoutt( this.zoomStartTimer );
        if ( delta <= -120 && this.sliderPosition <= 200 ){ //zoom out
            ratio = ( this.sliderPosition  !== 200 )? 0.5: 1;
            if ( !slider && this.sliderPosition  !== 200 ){
                this.sliderPosition += 20;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            } else if ( !slider ){
                this.sliderPosition = 200;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            }
        } else if ( delta >= 120 && this.sliderPosition >= 0 ){ // zoom in
            ratio = ( this.sliderPosition  !== 0 )? 2: 1;
            if ( !slider && this.sliderPosition  !== 0 ){
                this.sliderPosition -= 20;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            } else if ( !slider ){
               this.sliderPosition = 0;
            }
        }
        this.className = "smoothTransition";
        this.left = this.left - ( ( XcoordOnMapImg / this._width ) * ( ratio * this._width ) ) + XcoordOnMapImg ;
        this.topp = this.topp - ( ( YcoordOnMapImg / this._height ) * ( ratio * this._height ) - YcoordOnMapImg );
        this._height = this._height * ratio;
        this._width  = this._width * ratio;
        //this.style.left   = this.left +'px';
        //this.style.top    = this.topp +'px';
        //this.style.height = this._height +'px';
        //this.style.width  = this._width +'px';
        if( ratio === 2 ){
            x = clientX - ( this.resizedMapWidth / 2 );
            y = clientY - ( this.resizedMapHeight / 2 );
            this.tempTransformString = 'translate3d('+(0-x)+'px,'+(0-y) +'px, 0px) scale(2)' + this.tempTransformString;
        } else if( ratio === 0.5 ){
            x = ( clientX - (this.resizedMapWidth / 2 ) )/2;
            y = ( clientY - (this.resizedMapHeight / 2 ) )/2;
            this.tempTransformString = 'translate3d('+ x +'px,'+ y +'px, 0px) scale(0.5)' + this.tempTransformString;
        }
        this.style[this.cssTransform] = this.tempTransformText + this.tempTransformString;
        if ( i  !== 0 ){
            var m = undefined;
            xMultiplier = ( this.presentMaxX - this.presentMinX ) / this._width;
            yMultiplier = ( this.presentMaxY - this.presentMinY ) / this._height;
            while( i--){
                m = markers[i];
                m.styleLeft = ( ( m.statePlaneCoordX - this.presentMinX ) / xMultiplier ) - m.offsetwidth - 3;
                m.styleTop  = ( ( this.presentMaxY - m.statePlaneCoordY ) / yMultiplier ) - m.offsetheight;
                //m.style.cssText += 'transition: all 0.4s cubic-bezier( 0,0,0.25,1 ); left:'+ ( m.styleLeft + this.left ) +'px; top:'+ ( m.styleTop + this.topp ) +'px;';
                m.style.transition = 'all 0.4s cubic-bezier( 0,0,0.25,1 )';
                m.style[this.cssTransform] = 'translate3d( '+ ~~( markers[i].styleLeft + this.left ) +'px, '+ ~~( markers[i].styleTop + this.topp ) +'px,0px)';
            }
        }
        if ( !slider ){
            this.zoomStartTimer = this.setTimeoutt( function( newMousePosition, x, y ){ zoomStart( newMousePosition, x, y ); window.utilities_module.removeTransitionFromMarkers(); }, 1000, [ e.clientX - this.containerStyleLeft - this.dragDiv.left - this.left, e.clientY - this.containerStyleTop - this.dragDiv.topp - this.topp ], e.clientX, e.clientY );
        }
        //window.pageHasFocus = true;
        //console.timeEnd( 'timer' );
       // var end = window.performance.now();
        //console.log( end-start );
    }.bind( window.theMap );

    // TODO: rename newMousePostion and x,y to be more readable.
    // @params newMousePostion = mouse x,y coords on map (map could be zoomed in or out);
    // @params x,y = mouse x,y coord on the monitor (e.clientX, e.clientY);
    var zoomStart = function( newMousePosition, x, y ){
        if ( this.sliderPosition === 200 ){ //zoomed all the way out
            fullZoomOut();
        } else {
            window.zoom_module.centerMainImage( newMousePosition[0], newMousePosition[1], x, y );
        }
    }.bind( window.theMap );

    var fullZoomOut = function (){
            var fullZoomUrl = window.fullZoomUrl,
                xml = window.xml;

        if (  false && fullZoomUrl.height === this.resizedMapHeight && fullZoomUrl.width === this.resizedMapWidth ){
                
            //TODO: put this is it's own function?
            //TODO: fullzoom is a global.
            // This is an attempt to speed up zooming full out, the new image is used to check if the
            // fully zoomed out image is still on the server ( my guess is that it gets cleaned up after
            // about 10 min.), if so it will pass it to the onload function which will zip it to the setImg();
            // If however the image isn't there, then load the fully zoomed out image as usual using default
            // parameters.
            window.utilities_module.makeArcXMLRequest( fullZoomUrl.minxOld, fullZoomUrl.maxxOld, fullZoomUrl.minyOld, fullZoomUrl.maxyOld );
            // var img = new Image();
            // img.onload = function(){
            //     console.log('onload');
            //     xml.getElementsByTagName( "OUTPUT")[0].setAttribute( 'url', fullZoomUrl.src );
            //     xml.getElementsByTagName( "ENVELOPE")[0].setAttribute( 'minx', fullZoomUrl.minxOld );
            //     xml.getElementsByTagName( "ENVELOPE")[0].setAttribute( 'maxx', fullZoomUrl.maxxOld );
            //     xml.getElementsByTagName( "ENVELOPE")[0].setAttribute( 'miny', fullZoomUrl.minyOld );
            //     xml.getElementsByTagName( "ENVELOPE")[0].setAttribute( 'maxy', fullZoomUrl.maxyOld );
            //     window.mapControl_module.setImg();
            // }
            // img.onerror = function(){
            //     window.utilities_module.makeArcXMLRequest( window.parameters.fullZoomMinX, window.parameters.fullZoomMaxX, window.parameters.fullZoomMinY, window.parameters.fullZoomMaxY );
            // }
            // img.src = fullZoomUrl.src;
            // document.body.className = 'waiting';
            // this.className = 'waiting';
        } else {
            window.utilities_module.makeArcXMLRequest( window.parameters.fullZoomMinX, window.parameters.fullZoomMaxX, window.parameters.fullZoomMinY, window.parameters.fullZoomMaxY );
        }
    }.bind( window.theMap );

    return {
        zoomStart: zoomStart,
        fullZoomOut: fullZoomOut,
        plus: plus,
        minus: minus,
        sliderMove: sliderMove,
        sliderMouseUp: sliderMouseUp,
        sliderMouseDown: sliderMouseDown,
        zoomInOut: zoomInOut,
        centerMainImage: centerMainImage,
    }
}()
// failed: 3d rendering http://jsfiddle.net/94D62/6/
// !failed: http://jsfiddle.net/Ua5LG/2/
//http://jsbin.com/zasebewu/8/edit
/* TODO
    * clean up makeArcXMLRequest().
    * make it so the pan works on full zoom out.
    * Done: rename "t".
    * delete unused properties and methods in the window.zoom_module.js return object.
    * make it so the marker information ( message, image url ) is saved in local storage.
    * Done: add the "sliderPosition" variable to the "theMap".
*/