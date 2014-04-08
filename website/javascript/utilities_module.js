window.utilities_module = function(){ 

    var convertMouseCoordsToStatePlane = function( e ){
        var xMultiplier = ( this.presentMaxX - this.presentMinX ) / this.resizedMapWidth;
        var yMultiplier = ( this.presentMaxY - this.presentMinY ) / this.resizedMapHeight;
        var x = ( ( e.clientX - this.containerStyleLeft ) * xMultiplier + this.presentMinX );
        var y = ( this.presentMaxY - ( ( e.clientY - this.containerStyleTop) * yMultiplier ) );
        
        return { x: x, y: y };
    }.bind( window.theMap );
    
    // firstMapLoad only gets called on the first map load.
    function firstMapLoad(){
        window.$( 'loading_div' ).parentNode.removeChild( window.$( 'loading_div' ) );
        window.$( 'zoom_control' ).style.visibility = 'visible';
        this.removeEventListener( 'load', firstMapLoad );
        
        
        // This primes the first history position so that there will be a "state" if the person
        // uses the back button, then sets the onPopState variable to true so that an identical 
        // "state" won't be pushed onto the history stack.
        window.history.replaceState( {
                    minxOld : this.presentMinX,
                    maxxOld : this.presentMaxX,
                    minyOld : this.presentMinY,
                    maxyOld : this.presentMaxY,
                    zoom: window.$( 'zoom_slider' ).style.top,
                    title: "SnoCo Interactive Map"
                }, 
                "title 1",
                ( !window.theMap.infoFromUrl )?'?={"x":'+ this.presentMinX +',"mx":'+ this.presentMaxX +',"y":'+ this.presentMinY +',"my":'+ this.presentMaxY +',"z":'+ this.sliderPosition +'}' 
                : window.location.search
        );
        this.onPopState = true;
        window.cityCoordinates_module.resizeSvgCities();
        window.marker_module.makeInterStateShields();
        window.marker_module.isSimpleMarkerOnImage();
        window.scaleBarSvg_module.scaleBarInit();
        window.$('small_county_svg').style.opacity = 1;
    }

    function createMarkersFromInfoFromUrl(){
        
        // First check if the first char (after '?=') is a number, if so assume it is an APN that needs to be calculated,
        // otherwise assume it is a JSON object with pre-calculated marker information.
        if ( checkUrlForApn().doesExist ){
            window.$( 'find_parcel_number_input' ).value = checkUrlForApn().contents;
            window.marker_module.fromAPNtoSP();
        } else if( this.infoFromUrl && this.infoFromUrl.x ) {
            //this.infoFromUrl = JSON.parse( window.decodeURIComponent( location.search.replace( /^\?=/,'' ) ) );
            if ( this.infoFromUrl.mr ){
                this.infoFromUrl.mr.forEach( function( mrker ){
                    window.marker_module.makeMarker( null, mrker );
                } );
            }
        }

        // If there was an number pasted into #find_parcel_number_input, then style the "Search by APN"
        // anchor so it looks like a button.
        if ( /^\d/.test ( window.$( 'find_parcel_number_input' ).value ) ){
             window.$( 'find_parcel_number' ).className = 'findParcelNumberBorder';
        }
        this.infoFromUrl = undefined;
        this.removeEventListener( 'load', createMarkersFromInfoFromUrl );
    }

    function testProp( props ) {// Got this from leaflet
        var style = document.documentElement.style;

        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    }
    var getInfoFromUrl = function(){

        // First check to see if it is a JSON object, if it is then stick it in infoFromUrl,
        //  that will be checked for true/false then used to create the first map.
        try{
            if ( /^\?=\{/.test( window.decodeURIComponent( window.location.search ) ) ){
                this.infoFromUrl = JSON.parse( window.decodeURIComponent( window.location.search.replace( /^\?=/,'' ) ) );
                this.presentMinX = this.infoFromUrl.x;
                this.presentMaxX = this.infoFromUrl.mx;
                this.presentMinY = this.infoFromUrl.y;
                this.presentMaxY = this.infoFromUrl.my;
                this.sliderPosition = this.infoFromUrl.z;
            } else if ( checkUrlForApn().doesExist ){
                this.infoFromUrl = checkUrlForApn().contents;
            }
            // Either way call call a function that will attempt to create markers if is APN information.
            this.addEventListener( 'load', window.utilities_module.createMarkersFromInfoFromUrl );
        } catch ( error ){
            window.alert( 'There appears to be a problem with the URL.\n\nCryptic Error Message:\n  "  '+ 
                error +'  "\n\n'+
                'The URL length is: '+ ('1234567'+ location.pathname + location.search).length +
                ' characters.');
        }
    }.bind( window.theMap );

    // TODO: Can popState be re-factored in a smarter way?
    function popStateHandler(){
        var theMap = window.$('theMap_primary');   
        
        if( !event.state ){ return false; }
        document.title = event.state.title;
        xml.getElementsByTagName( "ENVELOPE" )[0].attributes[0].nodeValue = event.state.minxOld;
        xml.getElementsByTagName( "ENVELOPE" )[0].attributes[2].nodeValue = event.state.maxxOld;
        xml.getElementsByTagName( "ENVELOPE" )[0].attributes[1].nodeValue = event.state.minyOld;
        xml.getElementsByTagName( "ENVELOPE" )[0].attributes[3].nodeValue = event.state.maxyOld;
        window.$( 'zoom_slider' ).style.top = event.state.zoom;
        window.theMap.sliderPosition = +event.state.zoom.replace( /px/, '' );
        window.utilities_module.makeArcXMLRequest( event.state.minxOld, event.state.maxxOld, event.state.minyOld, event.state.maxyOld, true );
        getInfoFromUrl();
        window.theMap.addEventListener( 'load', window.utilities_module.createMarkersFromInfoFromUrl );
    }

    var addPageHasFocusClickHandling = function(){

        // This controls pageHasFocus when the browser isn't focused (clicked outside the browser);
        // The visibility api doesn't fire off when someone clicks outside the browser.
        window.onblur = function(){ 
            window.pageHasFocus = false;
            
            // This is used to set the pageHasFocus variable to true if the person uses the mousewheel to 
            // zoom on the map. The zoom_module.zoomInOut function was setting pageHasFocus everytime
            // which was unnecessary.
            window.theMap.addEventListener( private_addRemoveEventListenersObj.mousewheelevt, onFocusMouseWheelEvnt );
            function onFocusMouseWheelEvnt( e ){
                window.pageHasFocus = true;
                this.removeEventListener( private_addRemoveEventListenersObj.mousewheelevt, onFocusMouseWheelEvnt );
            }
        };
        
        // From mdn "Using the Page Visibility API" 1/26/2014.
        // This controls pageHasFocus when switching between tabs.
        // First window.onblur will set pageHasFocus = false, then when switching back the visibly api will set pageHasFocus = true.
        if ( typeof document.hidden !== "undefined" ){ // Opera 12.10 and Firefox 18 and later support 
            document.addEventListener( "visibilitychange", function(){ window.pageHasFocus = true; } );
        } else if ( typeof document.mozHidden !== "undefined" ){
            document.addEventListener( "mozvisibilitychange", function(){ window.pageHasFocus = true; } );
        } else if ( typeof document.msHidden !== "undefined" ){
            document.addEventListener( "msvisibilitychange", function(){ window.pageHasFocus = true; } );
        } else if ( typeof document.webkitHidden !== "undefined" ){
            document.addEventListener( "webkitvisibilitychange", function(){ window.pageHasFocus = true; } );
        }

        // This will set a "click" event listener that will set pageHasFocus = true if the person clicks on 
        // the options panel or the zoom slider.
        window.$( 'options_container' ).addEventListener( 'click', function(){ window.pageHasFocus = true; } );
        window.$( 'zoom_control' ).addEventListener( 'click', function(){ window.pageHasFocus = true; } );
    }

    function checkUrlForApn(){
        return { doesExist: /^\?=\s*\d\d/.test( window.decodeURIComponent( window.location.search ) ) ,
                 contents: window.decodeURIComponent( window.location.search ).replace( /[\s|?=]/g, '' ) };
    }

    private_addRemoveEventListenersObj = {
        array: [
            [ window.$( 'zoom_slider' ), 'mousedown', window.zoom_module.sliderMouseDown ],
            [ window.$( 'zoom_in_button' ), 'click', window.zoom_module.plus ],
            [ window.$( 'zoom_out_button' ), 'click', window.zoom_module.minus],
            [ window.$( 'update_button' ), 'click', window.options_module.updateButtonHandler],
            [ window.$( 'save_button' ), 'click', window.options_module.updateButtonHandler],
            [ window.$( 'find_parcel_number' ), 'click', window.marker_module.fromAPNtoSP],
            [ window.$('theMap_container'), 'mousedown', window.mapControl_module.theMap_mouseDown],
        ],
        updateButton: window.$( 'update_button' ),
        saveButton: window.$( 'save_button' ),
        theMap: window.theMap,
        mousewheelevt: ( /Firefox/i.test( window.navigator.userAgent ) )? "DOMMouseScroll" : "mousewheel",
        svgController: window.options_module.svgController,
    };
    
    var addListeners = function(){
        var i = undefined;

        this.svgController( 'start addListeners' );
        this.theMap.setTimeoutt( function(){ window.options_module.svgController( 'finish addListeners' ); }, 2000 );
        this.theMap.mapContainer.addEventListener( this.mousewheelevt, window.zoom_module.zoomInOut );
        for( i = 0; i < this.array.length; ++i ){
            this.array[i][0].addEventListener( this.array[i][1], this.array[i][2], false);
        }
        for( i = 0; i < this.theMap.markersArray.length; ++i ){
            this.theMap.markersArray[i].addEventListener( this.mousewheelevt, window.zoom_module.zoomInOut );
        }
        this.updateButton.disabled = false;
        this.saveButton.disabled = false;        
    }.bind( private_addRemoveEventListenersObj )

    var removeListeners = function(){
        var i = undefined;

        this.svgController( 'start removeListeners' );
        this.theMap.mapContainer.removeEventListener( this.mousewheelevt, window.zoom_module.zoomInOut, false );
        for( i = 0; i < this.array.length; ++i ){
            this.array[i][0].removeEventListener( this.array[i][1], this.array[i][2]);
        }
        for( i = 0; i < this.theMap.markersArray.length; ++i ){
            this.theMap.markersArray[i].removeEventListener( this.mousewheelevt, window.zoom_module.zoomInOut );
        }
        this.updateButton.disabled = true;
        this.saveButton.disabled = true; 
    }.bind( private_addRemoveEventListenersObj )

    //http://jsfiddle.net/BXWDV/5/
    // getBase64image() is used to save the current map/image into the history so when the
    // user goes back in history the image will instantly appear without hitting the server.
    function getBase64Image( theMap ){
        var canvas = document.createElement( "canvas" );
            canvas.width = theMap.width;
            canvas.height = theMap.height;
        var ctx = canvas.getContext( "2d" );
            ctx.drawImage( theMap, 0, 0 );

        var dataURL = canvas.toDataURL( "image/png" );

        return dataURL;
    }

    function handleResize(){
        var theMap = window.theMap,
            middleOfContainerX = theMap._width / 2,
            middleOfContainerY = theMap._height / 2; 

        theMap.viewPortWidth  = window.innerWidth;
        theMap.viewPortHeight = window.innerHeight;
        calculateMaxWidthHeight();
        theMap.mapContainer.style.width = theMap.resizedMapWidth +'px';
        theMap.mapContainer.style.height = theMap.resizedMapHeight +'px';
        theMap.style.width = theMap.mapContainer.style.width;
        theMap.style.height = theMap.mapContainer.style.height;
        
        // This finds the top of the zoom slider on the screen, it changes when the screen resizes
        // because it's containers (#zoom_control) left and top are set as a percentage of the screen size.
        theMap.zoom_slider_container_styleTop = window.$( 'zoom_slider_container' ).getBoundingClientRect().top;       
        window.overlayMap_module.resizeOverlayMapContainer();
        window.smallCountySvg_module.smallCountySvgResize();
        window.scaleBarSvg_module.scaleBarResize();
        window.zoom_module.zoomStart( [ middleOfContainerX, middleOfContainerY ], theMap.viewPortWidth/2, theMap.viewPortHeight/2 );
    }

    var calculateMaxWidthHeight = function(){
        var maxWidthHeight = window.parameters.MAX_IMG_PIXELS;
            
        // If the viewPortHeight multiplied by viewPortWidth is greater than the max number
        // of pixels the server will serve then find the biggest size the map image can be.
        if ( this.viewPortHeight * this.viewPortWidth > maxWidthHeight ){
            
            // By default it will try to reduce the width of the map and and not touch 
            // the height so it will be full height.
            if ( this.viewPortWidth < window.parameters.MAX_WIDTH ){
                this.resizedMapWidth = ( function ( height, width, maxWidthHeight ){
                            while( true ){
                                --width;
                                if ( height * width > maxWidthHeight ){
                                    continue;
                                }
                                return width;
                            }
                        } )( this.viewPortHeight, this.viewPortWidth, maxWidthHeight );
                this.resizedMapHeight = this.viewPortHeight;
            } else {

                // If the persons resolution is just too big, then revert to the default
                // max width and height settings.
                this.resizedMapWidth = window.parameters.MAX_WIDTH;
                this.resizedMapHeight = window.parameters.MAX_HEIGHT;
            }
        } else {

            // If the view port is smaller than the max size the server will serve, then
            // set the image to fill up the browser window.
            this.resizedMapWidth = this.viewPortWidth;
            this.resizedMapHeight = this.viewPortHeight;
        }

        // Try to center the div that contains the map (#theMap_container).
        this.containerStyleLeft = ( this.viewPortWidth - this.resizedMapWidth ) / 2;
        this.containerStyleTop = ( this.viewPortHeight - this.resizedMapHeight ) / 2;
        this.containerStyleRight =  this.resizedMapWidth + this.containerStyleLeft; //not sure if right and bottom are necessary or used.
        this.containerStyleBottom = this.resizedMapHeight + this.containerStyleTop;
        this.mapContainer.setAttribute( 'style', 'opacity: 1; position:absolute; top:'+ this.containerStyleTop +'px; left:'+ this.containerStyleLeft +'px; height:'+ this._height +'px; width:'+ this._width +'px; ' );
    }.bind( window.theMap );

    // TODO: This was experimental.
    // function iframeLoadHandler(){
    //     var z = document.getElementsByTagName('iframe')[0];
    //         //z.contentDocument.GCvalue = [];
    //         try{ z.contentDocument.forms[0].target = ''; } catch(e){}
    //         console.log('iframeLoadHandler');
    //         try{
    //             var v = z.contentDocument.getElementsByTagName('a');
    //             [].forEach.call(v, function( anchor ){ anchor.onclick = function( e ){ e.preventDefault; window.parent.console.log( this.href ); return false;}; } );
    //         } catch( e ){}
    // }

    var removeTransitionFromMarkers = function(){
        var markers = this.markersArray;
        var len = markers.length;
        while ( len-- ){
            markers[len].style.cssText = markers[len].style.cssText.replace( /(-webkit-|-moz-|-ms-)?transition.*?;/g, '' );
        }
    }.bind( window.theMap );

    function mainAjax( xmlRequest ){// TODO: this should be named better?

        //Remember xmlhttp is a global for testing.
        window.xmlhttp.abort();
        //window.xmlhttp = new XMLHttpRequest();
        var encodedResponse = undefined,
            url = window.parameters.urlPrefix + window.parameters.mapUrl;

        // TODO: Should theMap = 'this'?
        window.cityCoordinates_module.svgCitiesSetOpacityToZero();
        document.body.className = 'waiting';
        window.theMap.className = '';
        xmlhttp.onreadystatechange = function(){
            if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ){
                if( /error/.test( xmlhttp.responseText ) ){ console.error("There was an error in utilities_module.ajax():\n\n" + xmlhttp.responseText )}
                window.xml = ( new DOMParser() ).parseFromString( /<\?xml.*>/g.exec( xmlhttp.responseText )[0], "application/xml" );
                window.mapControl_module.setImg();
            }
        }
        encodedResponse = window.encodeURIComponent( 'ArcXMLRequest' ) +'='+ window.encodeURIComponent( xmlRequest );
        xmlhttp.open( 'POST', url, true );
        xmlhttp.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
        xmlhttp.send( encodedResponse );
    }

    // function smoothTransition( milliseconds ){
    //     this.className += " .transitionAll2sEaseOut";
    //     setTimeout( function( el ){ el.className = el.className.replace( / test/, '' ); }, milliseconds, this );
    // }

    // TODO: Rename send() to something more descriptive like 'createXMLRequest' ?
    var makeArcXMLRequest = function ( minX, maxX, minY, maxY, arg_onPopState, arg_overLayMap ){
        
        //TODO: Make sure all the comma's are there and not semicolons for the variables.
        // TODO: Add some if statements for different states of the map.
        var height = this.resizedMapHeight,
            width  = this.resizedMapWidth,
            options = this.optionsReference,
            sliderPositionNumber = ( function(){
                    var keys = Object.keys( this.zoomPower ).sort( function(a,b){ return a-b; } ),
                        i = 0;
                    for( ; i < keys.length; ++i ){ 
                        if( this.sliderPosition === +keys[i] ){
                            return i; // Supposedly it's bad form to have a return statement in a loop.
                        } 
                    }
                }.bind( this ) )(),
            roadWidth = ~~(( sliderPositionNumber + 2 ) * 5 * (( width * height ) / (( maxX - minX ) * ( maxY - minY ))) + 2),
            roadColor = (( ( roadWidth + 165 ) > 210 )? 210: ( roadWidth + 165 )),
            interStateColor = '138, 173, 96',
            highwayColor = '230,170,150',
            multiplier = theMap.resizedMapWidth * theMap.resizedMapHeight / 5000000,
            roadNameOutlineColor = '0,0,0',
            showCityNames = ( sliderPositionNumber >= 2 ),
            cityNameCase = (( sliderPositionNumber <= 5 )? '': 'titlecaps'), //Title caps = first letter capitalized the rest lowercase.
            cityFontSize = (( sliderPositionNumber >= 8 )? '19': '24'),
            cityFontStyle = (( sliderPositionNumber >= 7 )? 'bold': ''),
            cityFontColor = '60,60,43',
            cityNameOutlineColor = '255,255,255',
            cityBoundaryWidth = (( sliderPositionNumber > 5 )? '2': '3'),
            cityBoundaryDash = 'solid',
            cityBoundaryColor = (( window.city )?'230,100,80': '208, 170, 128' ),
            cityFillTransparency = (( sliderPositionNumber > 6 )? '0.2': '0'),
            showCityBoundaries = (( sliderPositionNumber < 10 )? '9999999999999': '1'),
            cityRoadTransparency = 0.5,
            showParcelNumbers = (( options.showParcelNumbers_CheckMark )? 'PARCEL_ID': 'false'),
            parcelBoundryWidth = (( sliderPositionNumber <= 1 )? 2 : 1),
            parcelBoundryColor = '185,177,169',
            showWaterFeatures = true,
            showTerrain = false,
            // scaleBarWidth = width * 0.2,
            // scaleBarXCoord = (( width - scaleBarWidth ) - 15),
            // scaleBarYCoord = window.$('mini_footer').clientHeight + 5,
            xmlRequest = undefined,
            mapYearSelected = {'2012': false, '2007': false };

        if( window.city ){ //TODO: This is a test.
            cityBoundaryWidth = 4;
        }
        if( options.showSatelliteView_CheckMark ){
            cityFontColor = '255,255,255';
            cityNameOutlineColor = '20,20,10';
            cityBoundaryDash = 'dash';
            parcelBoundryColor = '230,230,230';
            showWaterFeatures = false;
            cityRoadTransparency = 0.3;
            showTerrain = true;
            if( options.show2007YearMap_CheckMark ){
                mapYearSelected['2007'] = true;
            } else {
                mapYearSelected['2012'] = true;
            }
        }
        if( options.showOverlayMap ){
            if( arg_overLayMap ){
                mapYearSelected['2012'] = true;
            } else {
                mapYearSelected['2007'] = true;
                window.setTimeout( function( makeArcXMLRequest ){ makeArcXMLRequest( minX, maxX, minY, maxY, arg_onPopState, true ); },200 ,makeArcXMLRequest );
            }
        }
        ( ( arg_onPopState )? this.onPopState = true: this.onPopState = false );
        roadWidth = ( sliderPositionNumber > 7 )? 2: roadWidth;
        window.startSend = Date.now();
        this.zoomStartTimer = undefined;
        removeListeners();
        xmlRequest = ['<?xml version=\"1.0\" encoding=\"UTF-8\" ?>',
'<ARCXML version=\"1.1\">\n',
'<REQUEST>\n',
'<GET_IMAGE>\n',
'<PROPERTIES>\n',
'<ENVELOPE minx=\"'+ minX +'\" miny=\"'+ minY +'\" maxx=\"'+ maxX +'\" maxy=\"'+ maxY +'\" />\n',
'<IMAGESIZE height=\"'+ height +'\" width=\"'+ width +'\" />\n',
'<LAYERLIST order=\"false\">\n',
'<LAYERDEF id=\"12\" visible=\"true\" >\n', // steet names
'\t<SIMPLELABELRENDERER field=\"TEXT\" labelbufferratio="3.5"  howmanylabels="one_label_per_shape" >\n',
'\t\t<TEXTSYMBOL antialiasing=\"true\" font=\"Verdana\" fontcolor = \"'+ cityFontColor +'\" outline=\"'+ cityNameOutlineColor +'\" printmode=\"\" fontstyle=\"bold\" fontsize=\"'+ (roadWidth * multiplier + 9) +'\" shadow=\"\" transparency =\"1\" blockout=\"\"/>\n',
'\t</SIMPLELABELRENDERER>\n',
'</LAYERDEF>',
'<LAYERDEF id=\"4\" visible=\"'+ options.showCities_CheckMark +'\">\n', //city names and bound
(( window.city )? '<SPATIALQUERY where=" NAME=\''+ window.city +'\'" ></SPATIALQUERY>' :'\n') , // window.city is a global.

'<GROUPRENDERER>\n',// TODO: is this group rendere necessary
'\t<SCALEDEPENDENTRENDERER lower=\"1:1\" upper=\"'+ showCityBoundaries +'\">\n',
'<GROUPRENDERER>',
'\t\t<SIMPLERENDERER>\n',
 '\t\t\t<SIMPLEPOLYGONSYMBOL boundarytype="solid" boundarytransparency=\"1\" filltransparency=\"'+ cityFillTransparency +'\" boundarywidth=\"'+ (+cityBoundaryWidth +2) +'\" fillcolor=\"255,255,255\" boundarycaptype=\"round\"  boundarycolor=\"255,255,255\" />\n',// TODO: Change boundy/fill color, darker with no satellite image, lighter with satellite image.
'\t\t</SIMPLERENDERER>\n',
'\t\t<SIMPLERENDERER>\n',
'\t\t\t<SIMPLEPOLYGONSYMBOL boundarytype="'+ cityBoundaryDash +'" antialiasing=\"true\" boundarytransparency=\"1\" filltransparency=\"0\" boundarywidth=\"'+ cityBoundaryWidth +'\" fillcolor=\"89,137,208\" boundarycaptype=\"round\" boundarycolor=\"'+ cityBoundaryColor +'\" />\n',// TODO: Change boundy/fill color, darker with no satellite image, lighter with satellite image.
'\t\t</SIMPLERENDERER>\n',
 '</GROUPRENDERER>',
'\t</SCALEDEPENDENTRENDERER>\n',
///'<SCALEDEPENDENTRENDERER lower=\"1:3000\" upper=\"1:240000000\">\n','+ cityFontColor +'
'\t<SIMPLELABELRENDERER field=\"'+ ( ( showCityNames && options.showCities_CheckMark )? 'NAME': 'FALSE' ) +'\">\n',
'\t\t<TEXTSYMBOL antialiasing=\"true\" font=\"Calibri\" fontcolor = \"'+ cityFontColor +'\" outline=\"'+ cityNameOutlineColor +'\" printmode=\"'+ cityNameCase +'\" fontstyle=\"'+ cityFontStyle +'\" fontsize=\"'+ cityFontSize +'\" shadow=\"120,120,120\" transparency =\"1\" blockout=\"\"/>\n',
'\t</SIMPLELABELRENDERER>\n',
//'</SCALEDEPENDENTRENDERER>\n',
'</GROUPRENDERER>\n',
'</LAYERDEF>\n',
'<LAYERDEF id=\"11\" visible=\"true\" type=\"\">\n',// parcel numbers and boundary lines
'<GROUPRENDERER>\n',
( ( options.showParcelBoundary_CheckMark )?
'<SIMPLERENDERER>\n'+
'<SIMPLELINESYMBOL type="solid" width=\"'+ parcelBoundryWidth +'\" antialiasing=\"true\" transparency=\"'+( ( ( 11.5 / ( sliderPositionNumber + 2 ) ) *.10 ) + 0.3 ) +'\" captype=\"round\" color=\"'+ parcelBoundryColor +'\" />\n'+
'</SIMPLERENDERER>\n': '' ),
'<SCALEDEPENDENTRENDERER lower=\"1:1\" upper=\"1:2400\">\n',
'<SIMPLELABELRENDERER field=\"'+ showParcelNumbers +'\">\n',
'<TEXTSYMBOL antialiasing=\"true\" font=\"Calibri\" fontstyle=\"\" fontsize=\"14\" fontcolor=\"0, 0, 0\" outline=\"255,255,255\" />\n',
'</SIMPLELABELRENDERER>\n',
'</SCALEDEPENDENTRENDERER>\n',
'</GROUPRENDERER>\n',
'</LAYERDEF>\n',
 (( sliderPositionNumber < 5)?
'<LAYERDEF id=\"13\" visible=\"'+ options.showAddresses_CheckMark +'\" >\n'+
'<SIMPLELABELRENDERER field=\"'+(( sliderPositionNumber < 3 )?'SITUSLINE1': 'SITUSHOUSE')+'\">\n'+
'<TEXTSYMBOL antialiasing=\"true\" font=\"Calibri\" fontstyle=\"\" fontsize=\"12\" fontcolor=\"90, 90, 90\" outline=\"255,255,255\" />\n'+
'</SIMPLELABELRENDERER>\n'+
'</LAYERDEF>\n':
'<LAYERDEF id=\"13\" visible=\"false\" />\n' ),
'<LAYERDEF id=\"20\" visible=\"false\" />\n',
'<LAYERDEF id=\"9\" visible=\"true\" >\n', // County border
'<SPATIALQUERY where="LABEL=\'Snohomish County\'" >',
'</SPATIALQUERY>',
'\t\t<SIMPLERENDERER>\n',
'\t\t\t<SIMPLEPOLYGONSYMBOL boundarytype="solid"  boundarywidth=\"3\" boundarycaptype=\"round\" boundarycolor=\"205,197,189\" filltransparency=\"0\"/>\n',// TODO: Change boundy/fill color, darker with no satellite image, lighter with satellite image.
'\t\t</SIMPLERENDERER>\n',
'</LAYERDEF>',
'<LAYERDEF name="Railroad tracks" visible="true" />\n',
'<LAYERDEF name="National Forest" visible="false" />\n', // displays bright green
//'<LAYERDEF name="2007 Photo Extent" visible="true" />\n',
'<LAYERDEF name="2007 Aerial Photo" visible=\"'+ mapYearSelected['2007'] +'\" />\n',
'<LAYERDEF id=\"19\" visible=\"false\" />\n',
'<LAYERDEF id=\"18\" visible=\"false\" />\n',
'<LAYERDEF id=\"17\" visible=\"false\" />\n',
'<LAYERDEF id=\"31\" visible=\"'+ options.$14SaleRecord_CheckMark +'\" />\n', //TODO: 2013 sales records doesn't work.
'<LAYERDEF id=\"32\" visible=\"true\" />\n',
'<LAYERDEF id=\"33\" visible=\"'+ options.$13SaleRecord_CheckMark +'\" />\n',
'<LAYERDEF id=\"34\" visible=\"false\" />\n',
'<LAYERDEF id=\"35\" visible=\"'+ options.$12SaleRecord_CheckMark +'\" />\n',
'<LAYERDEF id=\"36\" visible=\"false\" />\n',
'<LAYERDEF id=\"30\" visible=\"false\" />\n',// turns on property description, in blue;
'<LAYERDEF id=\"39\" visible=\"'+ mapYearSelected['2012'] +'\" />\n',
'<LAYERDEF id=\"10\" visible=\"'+ showWaterFeatures +'\" />\n',
'<LAYERDEF id=\"8\" visible=\"true\" />\n',
'<LAYERDEF id=\"7\" visible=\"true\" />\n',
'<LAYERDEF id=\"6\" visible=\"'+ (!options.showSatelliteView_CheckMark && sliderPositionNumber < 8) +'\" type=\"polygon\">\n',// roads
'<GROUPRENDERER>\n',//roads
'<SIMPLERENDERER>\n',
'<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth + 2) +'\" antialiasing=\"true\" transparency=\"1\" captype=\"round\" color=\"120,120,120\" overlap=\"true\" />\n',
'</SIMPLERENDERER>\n',
'<SIMPLERENDERER>\n',
'<SIMPLELINESYMBOL type="solid" width=\"'+ roadWidth +'\" antialiasing=\"true\" transparency=\"1\" captype=\"round\" color=\"255,255,255\" overlap=\"true\" />\n',
'</SIMPLERENDERER>\n',
'<VALUEMAPRENDERER lookupfield="NAME" labelfield="HWY_NUM" linelabelposition="placeontop" howmanylabels="one_label_per_shape">',
'<EXACT value="I 5;I 405;SR 526" label="">',
 '<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth) +'\" antialiasing=\"true\" transparency=\"1\" captype=\"round\" color=\"'+ interStateColor +'\" overlap=\"true\" />\n',
'</EXACT>',
'<EXACT value="SR 522;US 2;SR 9;SR 530;" label="">',
 '<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth) +'\" antialiasing=\"true\" transparency=\"1\" captype=\"round\" color=\"'+ highwayColor +'\" overlap=\"true\" />\n',
//  //' <SHIELDSYMBOL antialiasing="true" font="Arial" fontstyle="regular" fontsize="10" type="usroad" />',
// // '\t\t<TEXTSYMBOL antialiasing=\"true\" interval="1130" font=\"Arial\" fontcolor = \"'+ cityFontColor +'\" outline=\"'+ cityNameOutlineColor +'\" printmode=\"'+ cityNameCase +'\" fontstyle=\"\" fontsize=\"15\" shadow=\"120,120,120\" transparency =\"1\" blockout=\"\"/>\n',
 '</EXACT>',
// // '<OTHER>',
// // '\t\t<TEXTSYMBOL antialiasing=\"true\" font=\"Arial\" fontcolor = \"'+ cityFontColor +'\" outline=\"'+ cityNameOutlineColor +'\" printmode=\"'+ cityNameCase +'\" fontstyle=\"\" fontsize=\"10\" shadow=\"120,120,120\" transparency =\"1\" blockout=\"\"/>\n',
// // '</OTHER>',
  '</VALUEMAPRENDERER>',
'</GROUPRENDERER>\n',
'</LAYERDEF>\n',
'<LAYERDEF id=\"5\" visible=\"true\" >\n',
 '<GROUPRENDERER>\n',
 '<SIMPLERENDERER>\n',
 '<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth + 1) +'\" antialiasing=\"true\" transparency=\"'+ cityRoadTransparency +'\" captype=\"round\" color=\"200,200,200\" overlap=\"true\" />\n',
 '</SIMPLERENDERER>\n',
 '<SIMPLERENDERER>\n',
 '<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth - 1) +'\" antialiasing=\"true\" transparency=\"'+ cityRoadTransparency +'\" captype=\"round\" color=\"255,255,255\" overlap=\"true\" />\n',
 '</SIMPLERENDERER>\n',
 '\t<SIMPLELABELRENDERER field=\"HWY_NUM\" labelbufferratio="3.5"  howmanylabels="one_label_per_shape" >\n',
 '\t\t<TEXTSYMBOL antialiasing=\"true\" font=\"Calibri\" fontcolor = \"'+ cityFontColor +'\" outline=\"'+ cityNameOutlineColor +'\" printmode=\"\" fontstyle=\"\" fontsize=\"14\" shadow=\"120,120,120\" transparency =\"1\" blockout=\"\"/>\n',
 '\t</SIMPLELABELRENDERER>\n',
'<VALUEMAPRENDERER lookupfield="HWY_NUM" labelfield="HWY_NUM" linelabelposition="placeontop" howmanylabels="one_label_per_shape">',
'<EXACT value="I-5;I-405;SR 526" label="">',
 '<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth) +'\" antialiasing=\"true\" transparency=\"1\" captype=\"round\" color=\"'+ interStateColor +'\" overlap=\"true\" />\n',
'</EXACT>',
'<EXACT value="SR 522;US 2;SR 9;SR 530;" label="">',
 '<SIMPLELINESYMBOL type="solid" width=\"'+ (roadWidth) +'\" antialiasing=\"true\" transparency=\"1\" captype=\"round\" color=\"'+ highwayColor +'\" overlap=\"true\" />\n',
'</EXACT>',
  '</VALUEMAPRENDERER>',
'</GROUPRENDERER>\n',
'</LAYERDEF>\n',
'<LAYERDEF id=\"38\" visible=\"false\" />\n',
'<LAYERDEF id=\"37\" visible=\"false\" />\n',
'<LAYERDEF id=\"3\" visible=\"false\" />\n',
'<LAYERDEF id=\"1\" visible=\"false\" />\n',
//'<LAYERDEF id=\"2\" visible=\"'+ options.showSatelliteView_CheckMark +'\" />\n', //satellite view
'<LAYERDEF id=\"0\" visible=\"'+ showTerrain +'\" />\n',
'</LAYERLIST>\n',
'<BACKGROUND color=\"245,240,230\"/>\n',
'</PROPERTIES>\n',
// '<LAYER type=\"acetate\" name=\"theScaleBar\">\n',
// '<OBJECT units=\"pixel\">\n',
// '<SCALEBAR coords=\"'+ scaleBarXCoord +' '+ scaleBarYCoord +'\" outline=\"'+ cityNameOutlineColor +'\" font=\"Arial\" fontcolor=\"'+ cityFontColor +'\" style=\"Bold\" barcolor=\"255,255,255\" mapunits=\"feet\" scaleunits=\"feet\" antialiasing=\"True\" screenlength=\"'+ scaleBarWidth +'\" fontsize=\"15\" barwidth=\"7\" overlap=\"False\"/>\n',

// '</OBJECT>\n',
// '</LAYER>\n',
'</GET_IMAGE>\n',
'</REQUEST>\n',
'</ARCXML>'].join( '' );
    window.city = false; // TODO: This is a global.
    if( !arg_overLayMap ){
        mainAjax( xmlRequest );
    } else {
        window.overlayMap_module.ajax( xmlRequest );
    }
    }.bind( window.theMap );

    return {
        convertMouseCoordsToStatePlane: convertMouseCoordsToStatePlane,
        firstMapLoad: firstMapLoad,
        createMarkersFromInfoFromUrl: createMarkersFromInfoFromUrl,
        getInfoFromUrl: getInfoFromUrl,
        popStateHandler: popStateHandler,
        addPageHasFocusClickHandling: addPageHasFocusClickHandling,
        checkUrlForApn: checkUrlForApn,
        addListeners: addListeners,
        removeListeners: removeListeners,
        getBase64Image: getBase64Image,
        handleResize: handleResize,
        calculateMaxWidthHeight:calculateMaxWidthHeight,
        removeTransitionFromMarkers: removeTransitionFromMarkers,
        testProp: testProp,
        mainAjax: mainAjax,
        makeArcXMLRequest: makeArcXMLRequest,
    }
}();