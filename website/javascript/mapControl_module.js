window.mapControl_module = function(){

    var setImg = function(){
        var xmlEnvelope = window.xml.getElementsByTagName( "ENVELOPE" )[0],
            xmlOutput = window.xml.getElementsByTagName( "OUTPUT" );

        try{
            if ( this.src !== xmlOutput[0].getAttribute( 'url' ) ){
                this.src = xmlOutput[0].getAttribute( 'url' );
            } else {
                window.utilities_module.addListeners();
                this.className = '';
                document.body.className = '';
                return;
            }
            this.hiddenImage.style.cssText += 'visibility: visible;';
            this.hiddenImage.style[this.cssTransform] = this.style[this.cssTransform];
        } catch( e ){ console.dir( e );
            utilities_module.addListeners();
            return;
        }
        this.left = 0 - this.dragDiv.left;
        this.topp = 0 - this.dragDiv.topp;
        this._height = this.resizedMapHeight;
        this._width  = this.resizedMapWidth;
        this.setAttribute( 'style', 'opacity: 0; height:'+ this._height +'px; width:'+ this._width +'px;' );
        this.tempTransformText = 'translate3d('+ this.left +'px,'+ this.topp +'px, 0px)';
        this.style[this.cssTransform] = this.tempTransformText;
        this.tempTransformString = '';
        
        // TODO: make an on error function.
        // this.onerror = function( e ){}
        this.presentMinX = +xmlEnvelope.getAttribute( 'minx' );
        this.presentMaxX = +xmlEnvelope.getAttribute( 'maxx' );
        this.presentMinY = +xmlEnvelope.getAttribute( 'miny' );
        this.presentMaxY = +xmlEnvelope.getAttribute( 'maxy' );
        window.smallCountySvg_module.smallCountySvgReCalc();
        window.overlayMap_module.overlayMapUpdateTopLeft( this.left, this.topp );
    }.bind( window.theMap );

    var mapLoad = function(){
        //smoothTransition.call( this, 500 );//this.className = "zooming";
        this.className += " transitionAll2sEaseOut";
        this.setTimeoutt( function(){ this.className = this.className.replace( / transitionAll2sEaseOut/, '' ); }.bind( this ), 500 );
        this.calculateMarkerPosition();
        this.style.opacity = '1';
        //this.style.webkitTransformOrigin = '0% 0%';
        this.style.top  = '';
        this.style.left = '';
        this._left = 0;
        this._top = 0;
        this.ratio = 1;
        //this.style.webkitTransformOrigin = '0% 0%'
        setTimeout( function(){
            this.hiddenImage.className = "";
            this.hiddenImage.style.visibility = 'hidden';
            this.hiddenImage.src = this.src;
            // TODO: Should fullzoom height/width be compared to viewport height/width?
            if (  +window.$( 'zoom_slider' ).style.top.replace( /px/, '' ) == 200  && ( fullZoomUrl.height !== this.resizedMapHeight && fullZoomUrl.width !== this.resizedMapWidth )
                || window.fullZoomUrl.satelliteView !== this.optionsReference.showSatelliteView_CheckMark ){
                
                window.fullZoomUrl.src = this.src;//getBase64Img(); // Used to cache a base64 of the zoomed out map so that it would load instantly, but I'm not sure if it will work in all browsers.
                window.fullZoomUrl.height = this.resizedMapHeight; //TODO: This should not be resizedMapHeight.
                window.fullZoomUrl.width = this.resizedMapWidth; //TODO: This should not be resizedMapWidth.
                window.fullZoomUrl.minxOld = this.presentMinX;
                window.fullZoomUrl.maxxOld = this.presentMaxX;
                window.fullZoomUrl.minyOld = this.presentMinY;
                window.fullZoomUrl.maxyOld = this.presentMaxY;
                window.fullZoomUrl.satelliteView = this.optionsReference.showSatelliteView_CheckMark;
            }
            if ( !this.onPopState ){
                window.history.pushState( {
                
                // getBase64Image() was hard to test on IE and firefox. In chrome you can use --disable-web-security.
                // It works well in chrome. Basically it saves a base64 of the current map image, then when the person goes back in the history,
                // it instantly pastes the image in without hitting the server. But need to test what happens when they resize the browser.
                  //img: getBase64Image( this ),
                    minxOld : this.presentMinX,
                    maxxOld : this.presentMaxX,
                    minyOld : this.presentMinY,
                    maxyOld : this.presentMaxY,
                    zoom: window.$( 'zoom_slider' ).style.top,
                    title: "SnoCo Interactive Map "+ (++window.popStateCounter),
                },
                "title 1", 
                '?={"x":'+ this.presentMinX +',"mx":'+ this.presentMaxX +',"y":'+ this.presentMinY +',"my":'+ this.presentMaxY +',"z":'+ this.sliderPosition +'}' 
                );
                document.title = "SnoCo Interactive Map "+ window.popStateCounter;
            } 
            
        }.bind( this ), 500);
        window.marker_module.isSimpleMarkerOnImage();
        window.utilities_module.addListeners();
        document.body.className = '';
        if ( this.panningAnimationTrueFalse ){
            window.panning_module.calculatePanTime( Date.now() );
        }
    }

    var mapLoadError = function( e ){
        window.utilities_module.addListeners();
        this.className = '';
        document.body.className = '';
        console.dir( e );
        window.alert(' There was a problem, the map image didn\'t load properly.\n\n Please try again.\n\n');
    }

// TODO: Re-factor these 'box' functions.
    function private_boxZoom_mouseDown(e){
        var zoomBox = document.createElement('div');

        e.preventDefault();
        zoomBox.id = 'boxZoom';
        zoomBox.className = 'boxZoom';
        window.$( 'theMap_container' ).appendChild( zoomBox );
        zoomBox.style.top  = e.clientY - window.theMap.containerStyleTop +'px';
        zoomBox.style.left = e.clientX - window.theMap.containerStyleLeft +'px';
        zoomBox.start = {x: undefined, y: undefined };// TODO: is this still used anywhere?
        zoomBox.start.clientX = e.clientX;
        zoomBox.start.clientY = e.clientY;
        //zoomBox.ratioWH = window.theMap.resizedMapWidth/window.theMap.resizedMapHeight;
        //zoomBox.zoomLevel = 0;
        window.pageHasFocus = true;
        window.theMap.boxZoom = zoomBox;
        window.addEventListener('mousemove', private_boxZoom_mouseMove );
        window.addEventListener('mouseup', private_boxZoom_mouseUp );
    }

    var private_boxZoom_mouseUp = function( e ){
        var widthOfBox = e.clientX - this.boxZoom.start.clientX,
            heightOfBox = e.clientY - this.boxZoom.start.clientY,
            mapHalfWidthPoint =  this.resizedMapWidth / 2 + this.containerStyleLeft,
            mapHalfHeightPoint = this.resizedMapHeight / 2+ this.containerStyleTop,
            centerPointOfBox = {x: ( widthOfBox / 2 ) + this.boxZoom.start.clientX + this.containerStyleLeft,
                                y: ( heightOfBox / 2) + this.boxZoom.start.clientY + this.containerStyleTop };

        window.removeEventListener( 'mousemove', private_boxZoom_mouseMove );
        window.removeEventListener( 'mouseup', private_boxZoom_mouseUp );
        
        // Move the maps virtual left and top so that the middle of the zoom box is in the middle of the screen.
        this.left = ( mapHalfWidthPoint - centerPointOfBox.x ) + this.containerStyleLeft;
        this.topp = ( mapHalfHeightPoint - centerPointOfBox.y ) + this.containerStyleTop;
        boxZoom_doTheZoom( {width: widthOfBox, height: heightOfBox, x: mapHalfWidthPoint, y: mapHalfHeightPoint });
        this.boxZoom.style.transition ="opacity 0.15s ease-in-out";
        this.boxZoom.style.opacity = 0;
        setTimeout( function(){ this.mapContainer.removeChild( this.boxZoom ); }.bind( this ), 170);
    }.bind( window.theMap );

    var private_boxZoom_mouseMove = function(e){
        window.theMap.boxZoom.style.width = e.clientX - window.theMap.boxZoom.start.clientX +'px';
        window.theMap.boxZoom.style.height = e.clientY - window.theMap.boxZoom.start.clientY +'px';
    }.bind( theMap )


    var boxZoom_doTheZoom = function( arg_zoomBox ){
        
            // X,YcoordOnMapImg is where the mouse is on the map image its self, not where the mouse is in the viewport (aka screen).
        var XcoordOnMapImg = ( arg_zoomBox.x - this.containerStyleLeft ) - this.left,
            YcoordOnMapImg = ( arg_zoomBox.y - this.containerStyleTop ) - this.topp,
            ratio = undefined,
            tempHeight = undefined,
            tempWidth = undefined,
            heightRatioOfBoxToMap = undefined,
            widthRatioOfBoxToMap = undefined;

        if(  this.sliderPosition >= 0 ){ // zoom in
            ratio = this.zoomPower[this.sliderPosition] / this.zoomPower[( this.sliderPosition  !== 0 )? ( this.sliderPosition - 20 ): this.sliderPosition];
            if ( this.sliderPosition  !== 0 ){
                this.sliderPosition -= 20;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            } else {
               this.sliderPosition = 0;
            }
        }
        
        heightRatioOfBoxToMap = arg_zoomBox.height / this._height;
        widthRatioOfBoxToMap = arg_zoomBox.width / this._width;
        this.left = this.left - ( ( XcoordOnMapImg / this._width ) * ( ratio * this._width ) ) + XcoordOnMapImg ;
        this.topp = this.topp - ( ( YcoordOnMapImg / this._height ) * ( ratio * this._height ) - YcoordOnMapImg );
        this._height = this._height * ratio;
        this._width  = this._width * ratio;
        tempWidth =  this._width * widthRatioOfBoxToMap;
        tempHeight = this._height * heightRatioOfBoxToMap;

        if( tempWidth > this.resizedMapWidth ){
            this.sliderPosition += 20;
            this.zoomSliderStyle.top = this.sliderPosition +'px';
            zoom_module.zoomStart( [ arg_zoomBox.x - this.containerStyleLeft - this.left, arg_zoomBox.y - this.containerStyleTop - this.topp ], arg_zoomBox.x, arg_zoomBox.y );
        }else if( tempHeight > this.resizedMapHeight ){
            this.sliderPosition += 20;
            this.zoomSliderStyle.top = this.sliderPosition +'px';
            zoom_module.zoomStart( [ arg_zoomBox.x - this.containerStyleLeft - this.left, arg_zoomBox.y - this.containerStyleTop - this.topp ], arg_zoomBox.x, arg_zoomBox.y );
        }else if( this.sliderPosition === 0 ){
            zoom_module.zoomStart( [ arg_zoomBox.x - this.containerStyleLeft - this.left, arg_zoomBox.y - this.containerStyleTop - this.topp ], arg_zoomBox.x, arg_zoomBox.y );
        } else {
            arg_zoomBox.height = tempHeight;
            arg_zoomBox.width = tempWidth;
            boxZoom_doTheZoom( arg_zoomBox );
        }
    }.bind( window.theMap )


    var theMap_mouseDown = function ( e ){ // mouse down on theMap, either set a marker or drag the map.
        if ( e.which !== 1 ){ return; }
        if ( e.shiftKey ){ private_boxZoom_mouseDown( e ); return false; }
        e.preventDefault();
        this.clearTimeoutt( this.zoomStartTimer );
        this.className = '';
        this.pan.oldMouseX = e.clientX;
        this.pan.oldMouseY = e.clientY;
        this.pan.oldMouseXpan = e.clientX - this.dragDiv.left ;
        this.pan.oldMouseYpan = e.clientY - this.dragDiv.topp ;
        this.pan.panningXYOld = undefined;
        this.pan.panningXYNew = undefined;
        window.utilities_module.removeTransitionFromMarkers();
        window.cityCoordinates_module.svgCitiesMouseDown();
        document.addEventListener( 'mouseout', private_mapMouseUp );
        document.addEventListener( 'mouseup', private_mapMouseUp );
        document.addEventListener( 'mousemove', this.pan.mouseMoveFunction );
    }.bind( window.theMap );

    var private_mapMouseUp = function ( e ){// mouse up for the image
        var xyCoords = undefined;

        if ( e.relatedTarget ){ return }
        e.preventDefault();
        this.document.removeEventListener( 'mouseup', private_mapMouseUp );
        this.document.removeEventListener( 'mouseout', private_mapMouseUp ); 
        this.document.removeEventListener( 'mousemove',  this.theMap.pan.mouseMoveFunction );
        if ( !window.pageHasFocus ){ 
            window.pageHasFocus = true;
            if ( e.clientY - this.theMap.pan.oldMouseY === 0 && e.clientX - this.theMap.pan.oldMouseX === 0 ){
                return;
            }
         }
        if ( !this.theMap.zoomStartTimer && e.clientY - this.theMap.pan.oldMouseY === 0 && e.clientX - this.theMap.pan.oldMouseX === 0 ){
            window.marker_module.makeMarker( e );
        } else {
            if ( this.theMap.panningAnimationTrueFalse ){
                 this.panningAnimationMouseUp( e );
            }
            xyCoords = theMap.dragDiv.style[this.theMap.cssTransform].match(/(-?[\d.]*?)px, (-?[\d.]*?)px/);
            theMap.dragDiv.topp = +xyCoords[2];
            theMap.dragDiv.left = +xyCoords[1];
            window.zoom_module.zoomStart(
                [( e.clientX - this.theMap.containerStyleLeft  - theMap.dragDiv.left - +this.theMap.left ) , 
                 ( e.clientY - this.theMap.containerStyleTop - theMap.dragDiv.topp - +this.theMap.topp )],
                e.clientX,  e.clientY );
        }
    }.bind( { theMap: window.theMap, document: window.document, panningAnimationMouseUp: window.panning_module.panningAnimationMouseUp } );

    var mapDragOnly = function( e ){
        if ( e.clientY - this.pan.oldMouseY == 0 && e.clientX - this.pan.oldMouseX == 0 ){ return; }
        var y = e.clientY - this.pan.oldMouseYpan,
            x = e.clientX - this.pan.oldMouseXpan,
            markers = this.markersArray,
            len = markers.length;

        this.dragDiv.style.top = this.dragDiv.topp + (e.clientY - this.pan.oldMouseY) +'px';
        this.dragDiv.style.left= this.dragDiv.left + (e.clientX - this.pan.oldMouseX) +'px';
    }.bind( window.theMap );

    var mapDragAndAnimation = function( e ){
        if ( e.clientY - this.theMap.pan.oldMouseY == 0 && e.clientX - this.theMap.pan.oldMouseX == 0 ){ return; }
        var y =  e.clientY - this.theMap.pan.oldMouseYpan,
            x =  e.clientX - this.theMap.pan.oldMouseXpan,
            markers = this.theMap.markersArray,
            len = markers.length;

        this.theMap.pan.panningXYOld = this.theMap.pan.panningXYNew || [x, y];
        this.theMap.pan.panningXYNew = [x, y, this.date.now()];
        //this.theMap.dragDiv.style.top = this.theMap.dragDiv.topp + (e.clientY - this.theMap.pan.oldMouseY) +'px';
        //this.theMap.dragDiv.style.left= this.theMap.dragDiv.left + (e.clientX - this.theMap.pan.oldMouseX) +'px';
        this.theMap.dragDiv.style[this.theMap.cssTransform] = 'translate3d('+ (this.theMap.dragDiv.left + (e.clientX - this.theMap.pan.oldMouseX)) +'px,'+ (this.theMap.dragDiv.topp + (e.clientY - this.theMap.pan.oldMouseY)) +'px, 0px)';
    }.bind( { theMap: window.theMap, date: window.Date } );

    var webkitMapDragAndAnimation = function( e ){
        if ( e.clientY - this.theMap.pan.oldMouseY == 0 && e.clientX - this.theMap.pan.oldMouseX == 0 ){ return; }
        var y =  e.clientY - this.theMap.pan.oldMouseYpan,
            x =  e.clientX - this.theMap.pan.oldMouseXpan,
            markers = this.theMap.markersArray,
            len = markers.length;

        this.theMap.pan.panningXYOld = this.theMap.pan.panningXYNew || [x, y];
        this.theMap.pan.panningXYNew = [x, y, this.date.now()];
        this.theMap.dragDiv.style.top = this.theMap.dragDiv.topp + (e.clientY - this.theMap.pan.oldMouseY) +'px';
        this.theMap.dragDiv.style.left= this.theMap.dragDiv.left + (e.clientX - this.theMap.pan.oldMouseX) +'px';
        //this.theMap.dragDiv.style[this.theMap.cssTransform] = 'translate3d('+ (this.theMap.dragDiv.left + (e.clientX - this.theMap.pan.oldMouseX)) +'px,'+ (this.theMap.dragDiv.topp + (e.clientY - this.theMap.pan.oldMouseY)) +'px, 0px)';
    }.bind( { theMap: window.theMap, date: window.Date } );

    return {
        setImg: setImg,
        mapLoad: mapLoad,
        mapLoadError: mapLoadError,
        boxZoom_doTheZoom: boxZoom_doTheZoom,
        theMap_mouseDown: theMap_mouseDown,
        mapDragOnly: mapDragOnly,
        mapDragAndAnimation: mapDragAndAnimation,
        webkitMapDragAndAnimation: webkitMapDragAndAnimation,
    }
}();