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
            this.hiddenImage.style.cssText += 'visibility: visible; left:'+ this.style.left +'; top:'+ this.style.top +'; height:' + this.style.height +'; width:'+ this.style.width +';';
        } catch( e ){ console.dir( e ); }
        this.left = 0;
        this.topp = 0;
        this._height = this.resizedMapHeight;
        this._width  = this.resizedMapWidth;
        this.setAttribute( 'style', 'opacity:0; position:absolute; top:0px; left:0px; height:'+ this._height +'px; width:'+ this._width +'px;' );
        
        // TODO: make an on error function.
        // this.onerror = function( e ){}
        this.presentMinX = +xmlEnvelope.getAttribute( 'minx' );
        this.presentMaxX = +xmlEnvelope.getAttribute( 'maxx' );
        this.presentMinY = +xmlEnvelope.getAttribute( 'miny' );
        this.presentMaxY = +xmlEnvelope.getAttribute( 'maxy' );  
    }.bind( window.theMap );

    var mapLoad = function(){
        //smoothTransition.call( this, 500 );//this.className = "zooming";
        this.className += " transitionAll2sEaseOut";
        this.setTimeoutt( function(){ this.className = this.className.replace( / transitionAll2sEaseOut/, '' ); }.bind( this ), 500 );
        this.calculateMarkerPosition();
        this.style.opacity = '1';
        setTimeout( function(){
            this.hiddenImage.className = "";
            this.hiddenImage.style.visibility = 'hidden';
            this.hiddenImage.src = xml.getElementsByTagName( "OUTPUT" )[0].attributes[0].nodeValue;
            
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
        zoomBox.start = {x: undefined, y: undefined };
        zoomBox.start.clientX = e.clientX;
        zoomBox.start.clientY = e.clientY;
        zoomBox.ratioWH = window.theMap.resizedMapWidth/window.theMap.resizedMapHeight;
        zoomBox.zoomLevel = 0;
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
        private_boxZoom_doTheZoom( {width: widthOfBox, height: heightOfBox, x: mapHalfWidthPoint, y: mapHalfHeightPoint });
        this.boxZoom.style.transition ="opacity 0.15s ease-in-out";
        this.boxZoom.style.opacity = 0;
        setTimeout( function(){ this.mapContainer.removeChild( this.boxZoom ); }.bind( this ), 170);
    }.bind( window.theMap );

    var private_boxZoom_mouseMove = function(e){
        window.theMap.boxZoom.style.width = e.clientX - window.theMap.boxZoom.start.clientX +'px';
        window.theMap.boxZoom.style.height = e.clientY - window.theMap.boxZoom.start.clientY +'px';
    }.bind( theMap )


    var private_boxZoom_doTheZoom = function( arg_zoomBox ){
        
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
            private_boxZoom_doTheZoom( arg_zoomBox );
        }
    }.bind( window.theMap )


    var theMap_mouseDown = function ( e ){ // mouse down on theMap, either set a marker or drag the map.
        if ( e.which !== 1 ){ return; }
        if ( e.shiftKey ){ private_boxZoom_mouseDown( e ); return false; }
        this.clearTimeoutt( this.zoomStartTimer );
        this.className = '';
        this.oldMouseX = e.clientX ;
        this.oldMouseY = e.clientY ;
        this.oldMouseXpan = e.clientX - this.left ;
        this.oldMouseYpan = e.clientY - this.topp ;
        this.panningXYOld = undefined;
        this.panningXYNew = undefined;
        window.utilities_module.removeTransitionFromMarkers();
        document.addEventListener( 'mouseout', private_mapMouseUp );
        document.addEventListener( 'mouseup', private_mapMouseUp );
        if ( this.panningAnimationTrueFalse ){
            document.addEventListener( 'mousemove', private_mapDragAndAnimation );
        } else {
            document.addEventListener( 'mousemove', private_mapDragOnly );
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    var private_mapMouseUp = function ( e ){// mouse up for the image
        if ( e.relatedTarget ){ return }
        e.preventDefault();
        this.document.removeEventListener( 'mouseup', private_mapMouseUp );
        this.document.removeEventListener( 'mouseout', private_mapMouseUp ); 
        if ( this.theMap.panningAnimationTrueFalse ){
            this.document.removeEventListener( 'mousemove', private_mapDragAndAnimation );
        } else {
            this.document.removeEventListener( 'mousemove', private_mapDragOnly );
        }
        if ( !window.pageHasFocus ){ 
            window.pageHasFocus = true;
            if ( e.clientY - this.theMap.oldMouseY === 0 && e.clientX - this.theMap.oldMouseX === 0 ){
                return;
            }
         }
        if ( !this.theMap.zoomStartTimer && e.clientY - this.theMap.oldMouseY === 0 && e.clientX - this.theMap.oldMouseX === 0 ){
            window.marker_module.makeMarker( e );
        } else {
            if ( this.theMap.panningAnimationTrueFalse ){
                 this.panningAnimationMouseUp( e );
            }
            window.zoom_module.zoomStart(
                [( e.clientX - this.theMap.containerStyleLeft - +this.theMap.style.left.replace(/px/, '') ) , 
                 ( e.clientY - this.theMap.containerStyleTop - +this.theMap.style.top.replace(/px/, '') )],
                e.clientX,  e.clientY );
        }
    }.bind( { theMap: window.theMap, document: window.document, panningAnimationMouseUp: window.panning_module.panningAnimationMouseUp } );

    var private_mapDragOnly = function( e ){
        if ( e.clientY - this.oldMouseY == 0 && e.clientX - this.oldMouseX == 0 ){ return; }
        var y = e.clientY - this.oldMouseYpan,
            x = e.clientX - this.oldMouseXpan,
            markers = this.markersArray,
            len = markers.length;

        this.style.top= y +'px';
        this.style.left= x +'px';
        while( len-- ){
            markers[len].style.cssText += "left:"+ ( markers[len].styleLeft + x ) +"px; top:"+( markers[len].styleTop + y )+"px;";
        }    
    }.bind( window.theMap );

    var private_mapDragAndAnimation = function( e ){
        if ( e.clientY - this.theMap.oldMouseY == 0 && e.clientX - this.theMap.oldMouseX == 0 ){ return; }
        var y = e.clientY - this.theMap.oldMouseYpan,
            x = e.clientX - this.theMap.oldMouseXpan,
            markers = this.theMap.markersArray,
            len = markers.length;

        // panningXYOld and panningXYNew are used by the panning animation
        this.theMap.panningXYOld = this.theMap.panningXYNew || [x, y];
        this.theMap.panningXYNew = [x, y, this.date.now()]
        this.theMap.style.top= y +'px';
        this.theMap.style.left= x +'px';
        while( len-- ){
            markers[len].style.cssText += "left:"+ ( markers[len].styleLeft + x ) +"px; top:"+( markers[len].styleTop + y )+"px;";
        }    
    }.bind( { theMap: window.theMap, date: window.Date } );

    var overlayMap_module = function(){
        var private_overlayXmlHttp = new XMLHttpRequest(),
            private_xml = undefined,
            private_overlayMapContainer = undefined,
            private_overlayMapImg = undefined,
            private_topDragDiv = undefined,
            private_rightDragDiv = undefined,
            private_bottomDragDiv = undefined,
            private_leftDragDiv = undefined,
            private_tabCoords = undefined;

        function ajax( arg_xmlRequest ){
            var encodedResponse = undefined,
                url = window.parameters.urlPrefix + window.parameters.mapUrl;

            private_overlayXmlHttp.abort();
            private_overlayXmlHttp.onreadystatechange = function(){
                if ( private_overlayXmlHttp.readyState == 4 && private_overlayXmlHttp.status == 200 ){
                    if( /error/.test( private_overlayXmlHttp.responseText ) ){ console.log(private_overlayXmlHttp.responseText.match(/\<error.*?\<\/error/i) )}
                    private_xml = ( new DOMParser() ).parseFromString( /<\?xml.*>/g.exec( private_overlayXmlHttp.responseText )[0], "application/xml" );
                    private_setoverlayMap();
                }
            }
            encodedResponse = window.encodeURIComponent( 'ArcXMLRequest' ) +'='+ window.encodeURIComponent( arg_xmlRequest );
            private_overlayXmlHttp.open( 'POST', url, true );
            private_overlayXmlHttp.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
            private_overlayXmlHttp.send( encodedResponse );
        }


        function private_setoverlayMap(){
            var xmlOutput = undefined;

             if( !private_overlayMapContainer ){
                private_makeOverlayMap();
            }else {
                xmlOutput = private_xml.getElementsByTagName( "OUTPUT" );
                window.$( 'overlay_map' ).src = xmlOutput[0].getAttribute( 'url' );
                return;
            }
        }

        function private_makeOverlayMap(){
            var theMap = window.theMap,
                tabwidthHeight = ( ( theMap.resizedMapWidth * 0.1 ) < ( theMap.resizedMapHeight * 0.1 ) )? ( theMap.resizedMapWidth * 0.1 ): ( theMap.resizedMapHeight * 0.1 );
                topBottomDivParams = { "height": 20, width: tabwidthHeight }, //width = 10%;
                leftRightDivParams = { height: tabwidthHeight, width: 20 }, //height = 10%;
                xmlOutput = private_xml.getElementsByTagName( "OUTPUT" );

            private_tabCoords = { top: 0, bottom: theMap.resizedMapHeight, left: 0, right: theMap.resizedMapWidth};
            private_overlayMapContainer = document.createElement('div');
                private_overlayMapContainer.id = 'overlay_map_container';
                private_overlayMapContainer.style.position = 'absolute';
                private_overlayMapContainer.style.top = '0px';
                private_overlayMapContainer.style.left= '0px';
                private_overlayMapContainer.style.width = '100%';
                private_overlayMapContainer.style.height = '100%';
                //private_overlayMapContainer.style.clip ='rect( 300px, '+ (private_tabCoords.right-300) +'px, '+ (private_tabCoords.bottom-300) +'px, 300px)';// TODO: The height and width are hard coded, they need to be flexible.
                private_overlayMapContainer.style.clip ='rect( '+ (theMap.resizedMapHeight /2 ) + 'px, '+ (theMap.resizedMapWidth /2 ) + 'px, '+ (theMap.resizedMapHeight /2 ) + 'px, '+ (theMap.resizedMapWidth /2 ) + 'px)';// TODO: The height and width are hard coded, they need to be flexible.
                private_overlayMapContainer.style.transition = 'clip 1s ease'; 
            if( !private_overlayMapImg ){
                private_overlayMapImg = document.createElement('img');
                    private_overlayMapImg.id = 'overlay_map';
                    private_overlayMapImg.style.width = '100%';
                    private_overlayMapImg.style.height = '100%';
                    private_overlayMapImg.addEventListener( 'load', overLayMapImgFirstLoadAlertMessage );
                    private_overlayMapImg.addEventListener( ( /Firefox/i.test( window.navigator.userAgent ) )? "DOMMouseScroll" : "mousewheel", private_shake );
                    private_overlayMapImg.addEventListener('click', function(e){
                        window.marker_module.makeMarker( e );
                    } );
            }
            private_overlayMapImg.addEventListener( 'load', overlayMapImgInitialLoad );
            private_overlayMapImg.src = xmlOutput[0].getAttribute( 'url' ); //window.theMap.src;
            private_topDragDiv = document.createElement('div');
                private_topDragDiv.id = 'top_drag_div';
                private_topDragDiv.className = 'overlayMapTabs';
                private_topDragDiv.style.top = private_tabCoords.top +'px';//TODO: This needs to be 1/2 the container height.
                private_topDragDiv.style.left = ( ( private_tabCoords.right / 2 ) - ( topBottomDivParams.width / 2) ) + 'px';
                private_topDragDiv.style.width = topBottomDivParams.width +'px';
                private_topDragDiv.style.height = topBottomDivParams.height +'px';
                private_topDragDiv.style.borderRadius = '0px 0px 5px 5px';
                private_topDragDiv.container = private_overlayMapContainer;
                private_topDragDiv.addEventListener( 'mousedown',function( e ){
                    this.style.opacity = '0';
                    window.addEventListener('mousemove', top_dragDiv_mouseMove );
                    window.addEventListener('mouseup', dragDiv_mouseUp);
                    e.preventDefault();
                } );
                private_topDragDiv.innerHTML = '2012';
            private_rightDragDiv = document.createElement('div');
                private_rightDragDiv.id = 'right_drag_div';
                private_rightDragDiv.className = 'overlayMapTabs';
                private_rightDragDiv.style.top = ( ( theMap.resizedMapHeight / 2 ) - ( leftRightDivParams.height / 2) ) + 'px';//TODO: This needs to be 1/2 the container height.private_leftDragDiv.style.top;
                private_rightDragDiv.style.left = private_tabCoords.right - 25 +'px';
                private_rightDragDiv.style.width = leftRightDivParams.width +'px';
                private_rightDragDiv.style.height = leftRightDivParams.height +'px';
                private_rightDragDiv.style.borderRadius = '5px 0px 0px 5px';
                private_rightDragDiv.container = private_overlayMapContainer;
                private_rightDragDiv.addEventListener( 'mousedown', function( e ){
                    this.style.opacity = '0';
                    window.addEventListener('mousemove', right_dragDiv_mouseMove );
                    window.addEventListener('mouseup', dragDiv_mouseUp);
                    e.preventDefault();
                });
            private_bottomDragDiv = document.createElement('div');
                private_bottomDragDiv.id = 'bottom_drag_div';
                private_bottomDragDiv.className = 'overlayMapTabs';
                private_bottomDragDiv.style.top = private_tabCoords.bottom - 25 +'px';//TODO: This needs to be 1/2 the container height.
                if ( ( ( ( theMap.resizedMapWidth / 2 ) - ( topBottomDivParams.width / 2) ) + 20 )> document.getElementById( 'mini_footer' ).getBoundingClientRect().left ){
                    private_tabCoords.bottom = +document.getElementById( 'mini_footer' ).getBoundingClientRect().top - 2 /* 2 is a spacer */;
                    private_bottomDragDiv.style.top = ( private_tabCoords.bottom - 25 ) +'px';
                }
                private_bottomDragDiv.style.left = private_topDragDiv.style.left;
                private_bottomDragDiv.style.width = topBottomDivParams.width +'px';
                private_bottomDragDiv.style.height = topBottomDivParams.height +'px';
                private_bottomDragDiv.style.borderRadius = '5px 5px 0px 0px';
                private_bottomDragDiv.container = private_overlayMapContainer;
                private_bottomDragDiv.addEventListener( 'mousedown', function( e ){
                    this.style.opacity = '0';
                    window.addEventListener('mousemove', bottom_dragDiv_mouseMove );
                    window.addEventListener('mouseup', dragDiv_mouseUp);
                    e.preventDefault();
                });
                private_bottomDragDiv.innerHTML = '2012';
            private_leftDragDiv = document.createElement('div');
                private_leftDragDiv.id = 'left_drag_div';
                private_leftDragDiv.className = 'overlayMapTabs';
                private_leftDragDiv.style.top = private_rightDragDiv.style.top;
                private_leftDragDiv.style.left = private_tabCoords +'px';
                private_leftDragDiv.style.width = leftRightDivParams.width +'px';
                private_leftDragDiv.style.height = leftRightDivParams.height +'px';
                private_leftDragDiv.style.borderRadius = '0px 5px 5px 0px';
                private_leftDragDiv.container = private_overlayMapContainer;
                private_leftDragDiv.addEventListener( 'mousedown', function( e ){
                    this.style.opacity = '0';
                    window.addEventListener('mousemove', left_dragDiv_mouseMove );
                    window.addEventListener('mouseup', dragDiv_mouseUp);
                    e.preventDefault();
                });
            private_overlayMapContainer.appendChild( private_overlayMapImg );
            private_overlayMapContainer.appendChild( private_leftDragDiv );
            private_overlayMapContainer.appendChild( private_topDragDiv );
            private_overlayMapContainer.appendChild( private_rightDragDiv );
            private_overlayMapContainer.appendChild( private_bottomDragDiv );
            document.getElementById('theMap_container').appendChild( private_overlayMapContainer );

            var top_dragDiv_mouseMove = function( e ){
                var temp = ( e.clientY - this.theMap.containerStyleTop ) - 10;
                this.overlayMap.removeEventListener( 'mousemove', overLayMap_mouseMove );
                if ( temp < 0 ){ return; }
                if( temp > private_tabCoords.bottom - 50 ){ return; }
                this.private_tabCoords.top = temp;
                this.div.style.top = temp +'px';
                this.div.container.style.clip = this.div.container.style.clip.replace(/(^rect\()-?\d+/, '$1'+ ~~temp);
            }.bind( {theMap: theMap, div: private_topDragDiv, private_tabCoords: private_tabCoords, overlayMap: private_overlayMapImg } );
            
            var right_dragDiv_mouseMove = function( e ){
                var temp = e.clientX - theMap.containerStyleLeft + 10;
                this.overlayMap.removeEventListener( 'mousemove', overLayMap_mouseMove );
                if( temp > theMap.resizedMapWidth ){ return; }
                if( temp < private_tabCoords.left + 50 ){ return; }
                this.private_tabCoords.right = temp;
                this.div.style.left = temp - 25 +'px';
                this.div.container.style.clip = this.div.container.style.clip.replace(/(^rect\(-?\d+px,?\s?)-?\d+/, '$1'+ ~~temp);
            }.bind( { theMap: theMap, div: private_rightDragDiv, private_tabCoords: private_tabCoords, overlayMap: private_overlayMapImg } );
            
            var  bottom_dragDiv_mouseMove = function( e ){
                var temp = e.clientY - theMap.containerStyleTop + 10;
                this.overlayMap.removeEventListener( 'mousemove', overLayMap_mouseMove );
                if( temp > theMap.resizedMapHeight ){ return; }
                if( temp < private_tabCoords.top + 50 ){ return; }
                this.private_tabCoords.bottom = temp;
                this.div.style.top = temp - 25 +'px';
                this.div.container.style.clip = this.div.container.style.clip.replace(/(^rect\(-?\d+px,?\s?-?\d+px,?\s?)-?\d+/, '$1'+ ~~temp);
            }.bind( { theMap: theMap, div: private_bottomDragDiv, private_tabCoords: private_tabCoords, overlayMap: private_overlayMapImg } );
            
            var  left_dragDiv_mouseMove = function( e ){
                var temp = ( e.clientX - this.theMap.containerStyleLeft )-10;
                this.overlayMap.removeEventListener( 'mousemove', overLayMap_mouseMove );
                if ( temp < 0 ){ return; }
                if( temp > private_tabCoords.right - 50 ){ return; }
                this.private_tabCoords.left = temp;
                this.div.style.left = temp +'px';
                this.div.container.style.clip = this.div.container.style.clip.replace(/-?\d+px(?:\))$/, ~~temp+'px');
            }.bind( {theMap: theMap, div: private_leftDragDiv, private_tabCoords: private_tabCoords, overlayMap: private_overlayMapImg } );
            
            var dragDiv_mouseUp = function( e ){
                if( ( e.button && e.button ===1 ) || ( e.which && e.which === 2 ) ){ return; }
                window.removeEventListener( 'mousemove', left_dragDiv_mouseMove );
                window.removeEventListener( 'mousemove', top_dragDiv_mouseMove );
                window.removeEventListener( 'mousemove', right_dragDiv_mouseMove );
                window.removeEventListener( 'mousemove', bottom_dragDiv_mouseMove );
                window.$( 'overlay_map' ).addEventListener( 'mousemove', overLayMap_mouseMove  );
                this.topDragDiv.style.opacity    = '1';
                this.rightDragDiv.style.opacity  = '1';
                this.bottomDragDiv.style.opacity = '1';
                this.leftDragDiv.style.opacity   = '1';               
            }.bind( {rightDragDiv: private_rightDragDiv, leftDragDiv: private_leftDragDiv, topDragDiv: private_topDragDiv, bottomDragDiv: private_bottomDragDiv});

            private_overlayMapImg.removeEventListener( 'mousemove', overLayMap_mouseMove );
            var overLayMap_mouseMove = function( e ){
                this.rightDragDiv.style.top   = e.clientY - 30 +'px';
                this.leftDragDiv.style.top    = e.clientY - 30 +'px';
                this.topDragDiv.style.left    = e.clientX - 30 +'px';
                this.bottomDragDiv.style.left = e.clientX - 30 +'px';
            }.bind( {rightDragDiv: private_rightDragDiv , leftDragDiv: private_leftDragDiv, topDragDiv: private_topDragDiv, bottomDragDiv: private_bottomDragDiv});
            private_overlayMapImg.addEventListener( 'mousemove', overLayMap_mouseMove );
        }

        function overlayMapImgInitialLoad(){
            private_overlayMapContainer.style.clip ='rect( 0px, '+ private_tabCoords.right +'px, '+ private_tabCoords.bottom +'px, 0px)';
            window.setTimeout( function( arg_mapContainer ){ 
                arg_mapContainer.style.transition = '';
            }, 1700, private_overlayMapContainer );
            this.removeEventListener( 'load', overlayMapImgInitialLoad );
        }

        function overLayMapImgFirstLoadAlertMessage(){
            window.setTimeout( function( ){ 
                window.alert(   '  Use the the four tabs on the\n'+
                                'sides to resize the overlay map.\n\n'+
                                '  Move the overlay map out of the way\n'+
                                'to access the bottom map so that you\n'+
                                'can zoom and pan.');
            }, 1100 );
            this.removeEventListener( 'load', overLayMapImgFirstLoadAlertMessage );
        }
        function deleteOverlayMap(){
            if( private_overlayMapContainer ){
                private_overlayMapContainer.parentElement.removeChild( private_overlayMapContainer );
                private_overlayMapContainer = false;
            }
        }

        function resizeOverlayMapContainer(){
            var tabwidthHeight = undefined,
                topBottomDivParams = undefined, //width = 10%;
                leftRightDivParams = undefined;//height = 10%;

            if( private_overlayMapContainer ){
                tabwidthHeight = ( ( theMap.resizedMapWidth * 0.1 ) < ( theMap.resizedMapHeight * 0.1 ) )? ( theMap.resizedMapWidth * 0.1 ): ( theMap.resizedMapHeight * 0.1 );
                topBottomDivParams = { "height": 20, width: tabwidthHeight }, //width = 10%;
                leftRightDivParams = { height: tabwidthHeight, width: 20 }, //height = 10%;
                private_tabCoords.top = 0;
                private_tabCoords.right = theMap.resizedMapWidth;
                private_tabCoords.bottom = theMap.resizedMapHeight;
                private_tabCoords.left = 0;
                private_topDragDiv.style.cssText += 'height: '+ topBottomDivParams.height +'px; width: '+ topBottomDivParams.width +'px; top: '+ ( private_tabCoords.top )+'px; left: '+ ( ( private_tabCoords.right / 2 ) - ( topBottomDivParams.width / 2) ) +'px;';
                private_rightDragDiv.style.cssText += 'height: '+ leftRightDivParams.height +'px; width: '+ leftRightDivParams.width +'px; top: '+ ( ( theMap.resizedMapHeight / 2 ) - ( leftRightDivParams.height / 2) ) +'px; left: '+ ( private_tabCoords.right - 25 ) +'px;'; 
                private_bottomDragDiv.style.cssText += 'height: '+ topBottomDivParams.height  +'px; width: '+ topBottomDivParams.width  +'px; top: '+ ( private_tabCoords.bottom - 20 )+'px; left: '+ private_topDragDiv.style.left;
                if ( ( ( ( theMap.resizedMapWidth / 2 ) - ( topBottomDivParams.width / 2) ) + 20 ) > document.getElementById( 'mini_footer' ).getBoundingClientRect().left ){
                    private_tabCoords.bottom = +document.getElementById( 'mini_footer' ).getBoundingClientRect().top - 2 /* 2 is a spacer */;
                    private_bottomDragDiv.style.top = ( private_tabCoords.bottom - 25 ) +'px';
                }
                private_leftDragDiv.style.cssText += 'height: '+ leftRightDivParams.height +'px; width: '+ leftRightDivParams.width +'px; top: '+ private_rightDragDiv.style.top +'; left: '+ private_tabCoords.left +'px;';
                private_overlayMapContainer.style.clip ='rect( 0px, '+ private_tabCoords.right +'px, '+ private_tabCoords.bottom +'px, 0px)';
            }
        }

        // private_shake() is used by the overlay map, when the person tries to use the mouse wheel
        // the map will shake back and forth instead.
        function private_shake(){
            this.style.position = 'absolute';
            this.style.left = '10px';
            window.setTimeout(function(){
                this.style.position = '';
                this.style.left = '';
            }.bind( this ), 50 );   
        }

        return {
            ajax: ajax,
            deleteOverlayMap: deleteOverlayMap,
            resizeOverlayMapContainer: resizeOverlayMapContainer,
        }
    }();

    return {
        setImg: setImg,
        mapLoad: mapLoad,
        mapLoadError: mapLoadError,
        theMap_mouseDown: theMap_mouseDown,
        overlayMap_module: overlayMap_module,
    }
}();