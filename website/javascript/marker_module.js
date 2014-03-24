    
window.marker_module = function(){
    var makeMarker = function( e, arg_infoObject ){
        // TODO: Are all these var's necessary?
        // Don't set a marker if the map is not zoomed in enough, default is 100;
        if ( this.sliderPosition > 100 && !arg_infoObject ){ return; }
        var infoObject = arg_infoObject || false; //{"a": "apn number goes here","x": lat,"y": lng,"m":"text message","i":"img url"}
        var statePlaneCoordsXY = !infoObject && utilities_module.convertMouseCoordsToStatePlane( e );
        var xMultiplier = ( this.presentMaxX - this.presentMinX ) / this.resizedMapWidth;
        var yMultiplier = ( this.presentMaxY - this.presentMinY ) / this.resizedMapHeight;
        
        var markerBody = document.createElement( 'div' );
            markerBody.className = 'markerParent';
            markerBody.addEventListener( ( ( /Firefox/i.test( navigator.userAgent ) )? "DOMMouseScroll" : "mousewheel" ), window.zoom_module.mouseWheel );
            markerBody.statePlaneCoordX = +infoObject.x || statePlaneCoordsXY.x;
            markerBody.statePlaneCoordY = +infoObject.y || statePlaneCoordsXY.y;
            //markerBody.setAttribute( 'zind', 1e6 - markerBody.statePlaneCoordY.toFixed( 0 ) ) ;
            markerBody.style.zIndex = 1e6 - markerBody.statePlaneCoordY.toFixed( 0 );
            markerBody.id = 'parcelMarker_x_'+ markerBody.statePlaneCoordX +'_y_'+ markerBody.statePlaneCoordY+'_'+ ~~(Math.random() * 100);
        var wsg84XYCoords = convertSP( markerBody.statePlaneCoordX, markerBody.statePlaneCoordY );
            markerBody.wgs84XCoord = wsg84XYCoords.x;
            markerBody.wgs84YCoord = wsg84XYCoords.y;
            markerBody.styleTop = 0;//styleTop;
            markerBody.styleLeft = 0;//styleLeft;
            markerBody.offsetwidth = undefined;
            markerBody.offsetheight = undefined;
            markerBody.theMap = this;
            markerBody.setOffSetWH = function(){
                    this.offsetwidth  = ( this.offsetWidth / 2 );
                    this.offsetheight =  this.offsetHeight + 30;
                }
            markerBody.apn = infoObject.a || undefined;

            // markerBody.message and markerBody.imgUrl are used by utilities_module.makeUrl();
            markerBody.message = infoObject.m || '';
            markerBody.imgUrl = infoObject.i || '';
            //markerBody.addEventListener( 'click', function(){
            //    window.pageHasFocus = true;
            //});
        var deleteButton = document.createElement( 'div' );
            deleteButton.className = 'markerDeleteButton';
            deleteButton.innerHTML = '&#215;';
            deleteButton.markerBody = markerBody;
            deleteButton.addEventListener( 'click', function(){
                var markerArray = window.theMap.markersArray,
                    markerArrayLen = markerArray.length,
                    parentId = this.markerBody.id;

                while( markerArrayLen-- ){
                    if ( markerArray[markerArrayLen].id === parentId ){
                        markerArray.splice( markerArrayLen, 1 );
                    } 
                }
                this.markerBody.parentElement.removeChild( this.markerBody );
            });
        markerBody.appendChild( deleteButton );

        if ( infoObject && infoObject.a !== '' ){
            var anchor = document.createElement( 'a' );
                anchor.className = 'markerApn';
                anchor.href = window.parameters.apnUrl + infoObject.a;
                anchor.target = '_blank';
                anchor.innerHTML= infoObject.a;
            markerBody.appendChild( anchor );
        }

        var editButton = document.createElement( 'a' );
            editButton.className = 'markerEdit';
            editButton.href = "javascript:return void(0);}";
            editButton.innerHTML = "edit";
            editButton.theMap = this;
            editButton.markerBody = markerBody;
            editButton.addEventListener( 'click', markerMessageEditor, false );
        markerBody.editButton = editButton;
        markerBody.appendChild( editButton );

        var arrow = document.createElement( 'div' );
            arrow.className = 'markerArrow';
        markerBody.appendChild( arrow );
        
        var innerArrow = document.createElement( 'div' );
            innerArrow.className = 'markerInnerArrow';
        arrow.appendChild( innerArrow );

        //document.body.insertBefore( markerBody, document.body.firstChild );
        // this.parentElement should be '#theMap_container'.
        this.parentElement.insertBefore( markerBody, this.parentElement.firstChild );
        markerBody.setOffSetWH();
        this.markersArray.push( markerBody );

        if ( infoObject ){
            markerAddImageAndText.call( editButton, null, infoObject );
        } else {
            propertyInfo.call( markerBody, markerBody.statePlaneCoordX, markerBody.statePlaneCoordY );
            calculateMarkerPosition( markerBody );
        }
    }.bind( window.theMap );

    function markerMessageEditor( e ){
        // TODO: this should be re-factored a little bit.
        // 'this' equals the edit button/link on the marker.
        var createElement = document.createElement.bind( document ),
            text = undefined, 
            imageSrc = undefined,
            messageContainer = createElement( 'div' ),
            coordsDiv = createElement( 'div' ),
            textArea = createElement( 'textarea' ),
            imgArea = createElement( 'textarea' ),
            imgAnchor = createElement('a');

        if ( e ){ 
            e.preventDefault();  
            this.removeEventListener( 'click', markerMessageEditor );
            this.addEventListener( 'click', markerAddImageAndText );
            this.innerHTML = "done";
        }
        if ( this.markerBody.querySelector('.messageContainer') ){
            text = this.previousElementSibling.firstChild.innerHTML;
            if ( this.markerBody.querySelector('.markerImg') ){
                imageSrc = this.markerBody.querySelector('.markerImg').src;
            }
            this.markerBody.removeChild( this.markerBody.querySelector('.messageContainer') );
        }
        messageContainer.className = 'messageContainer';
        coordsDiv.innerHTML = 'x: '+ this.markerBody.wgs84XCoord +' y: '+ this.markerBody.wgs84YCoord;
        coordsDiv.className = 'coordsDiv';
        coordsDiv.title = 'Coordinates are approximate.';
        coordsDiv.setAttribute('data','');
        coordsDiv.markerBody = this.markerBody;
        coordsDiv.theMap = this.theMap;
        coordsDiv.addEventListener( 'click', function(){ 

            // TODO: Should minutes and seconds be an option also?
              if ( this.getAttribute('data') === '' ){ 
                this.innerHTML = "x: "+ this.parentElement.parentElement.statePlaneCoordX.toFixed(7) +" y: " + this.parentElement.parentElement.statePlaneCoordY.toFixed(7);
                this.setAttribute('data','sp' ); 
                this.title = 'State plane coordinates are approximate.'
              } else { 
                this.innerHTML = "x: "+ this.parentElement.parentElement.wgs84XCoord +" y: " + this.parentElement.parentElement.wgs84YCoord; 
                this.setAttribute('data','' ); 
                this.title = 'Coordinates are approximate.'
              }
              this.markerBody.setOffSetWH();
              this.theMap.calculateMarkerPosition( this.markerBody );
         });
        textArea.placeholder = "Enter message here";
        textArea.className = 'textArea';
        textArea.value = ( text )? text : '';
        imgArea.className = 'imgArea';
        imgArea.placeholder = "Enter image URL here"
        imgArea.value = ( imageSrc )? imageSrc : '';
        if ( this.markerBody.apn ){
            imgAnchor.href = 'javascript:function( e ){ e.preventDefault();}';
            imgAnchor.innerHTML = 'Insert county image'
            imgAnchor.imgArea = imgArea;
            imgAnchor.markerBody = this.markerBody;
            imgAnchor.className = 'imgAnchor';
            imgAnchor.onclick = function(){
                this.imgArea.value = window.parameters.propertyImgUrl + this.markerBody.apn.replace(/^(\d{4})\d*/, "$1") +"/"+ this.markerBody.apn +"R011.jpg"
            }
        }
        messageContainer.appendChild( coordsDiv ); 
        messageContainer.appendChild( textArea );
        messageContainer.appendChild( imgArea );
        messageContainer.appendChild( imgAnchor );
        this.markerBody.insertBefore( messageContainer, this );
        this.markerBody.setOffSetWH();
        this.theMap.calculateMarkerPosition( this.markerBody );
    }

    function markerAddImageAndText( e, info ){
        // 'this' equals the edit 'button' (anchor tag actually) on the marker.
        var text = '', 
            imageSrc = '',
            messageContainer = undefined,
            text = undefined,
            textDiv = undefined,
            messageContainer = this.markerBody.querySelector( '.messageContainer' );
        
        if ( e ){
            e.preventDefault(); 
            this.removeEventListener( 'click', markerAddImageAndText );
            this.addEventListener( 'click', markerMessageEditor );
            this.innerHTML = "edit";
        }
        if ( info ){
            text = info.m;
            imageSrc = info.i;
            if ( this.innerHTML === 'done' ){
                if ( messageContainer.querySelector( '.imgArea').value === '' ){
                    messageContainer.querySelector( '.imgArea' ).value = imageSrc;
                }
                return false;
            }
            if ( !messageContainer ){
                messageContainer = document.createElement( 'div' );
                messageContainer.className = 'messageContainer';
                this.markerBody.insertBefore( messageContainer, this );
            }
        } else {
            text = this.markerBody.querySelector( '.textArea' ).value;
            imageSrc = this.markerBody.querySelector( '.imgArea' ).value;
            messageContainer.innerHTML = '';
        }       
        this.markerBody.message = text;
        this.markerBody.imgUrl = imageSrc;
        textDiv = document.createElement( 'div' );
        textDiv.innerHTML = text;
        textDiv.style.fontSize = '17px';
        textDiv.className = 'markerTextDiv';

        Array.prototype.forEach.call( textDiv.getElementsByTagName( 'img' ), function( img ){
            
            // There might be html img tags in the text which will mess up the markers position.
            // So set a onload listener that will recalculate the width and height, then call calculateMarkerPosition again.
            var load = function(){
                this.editButton.markerBody.setOffSetWH(); 
                this.editButton.theMap.calculateMarkerPosition( this.editButton.markerBody );
                this.img.removeEventListener( 'load', load );
            }.bind( { editButton: this, img: img } );
            img.addEventListener( 'load', load );
            
        }.bind( this ) );
        messageContainer.appendChild( textDiv );
        textDiv.querySelector('.n') && textDiv.querySelector('.n').addEventListener( ( /Firefox/i.test( window.navigator.userAgent ) )? "DOMMouseScroll" : "mousewheel", function( e ){ e.stopPropagation(); return false; } );

        if ( imageSrc !== '' ){
            var imageAnchor = document.createElement( 'a' );
                imageAnchor.href = imageSrc;
                imageAnchor.target = '_blank';
                imageAnchor.style.display = 'none';
            var image = document.createElement( 'img' );
                image.src = imageSrc;
                image.width = 150; // height will automatically adjust;
                //image.height = 113;
                image.style.height = '113px';
                image.className = 'markerImg';
                image.theMap = this.theMap;
                image.markerBody = this.markerBody;
                image.onload = function(){ 
                        this.parentElement.style.display = '';
                        this.style.height = 'auto';
                        this.markerBody.setOffSetWH();
                        this.theMap.calculateMarkerPosition( this.markerBody );
                    };
                image.onerror = markerImgError;
            imageAnchor.appendChild( image );
            messageContainer.appendChild( imageAnchor );
        }
        this.markerBody.setOffSetWH();
        this.theMap.calculateMarkerPosition( this.markerBody );
    }

    function markerImgError( e ){
        // what a mess..
        if ( /http:\/\/www.snoco.org\/docs\/sas\/photos/.test( this.src ) ){
            if ( /R01/.test( this.src ) ){
                window.setTimeout( function(){ 
                    this.parentElement.href = this.src.replace( /R01/, 'C01' );
                    this.src = this.src.replace( /R01/, 'C01' );
                }.bind( this ), 10 ); 
            } else if ( /C01/.test( this.src ) ){
                window.setTimeout( function(){ 
                    this.parentElement.href = this.src.replace( /C01/, 'R02' );
                    this.src = this.src.replace( /C01/, 'R02' );
                }.bind( this ), 10 );
            } else if ( /R02/.test( this.src ) ){
                window.setTimeout( function(){ 
                    this.parentElement.href = this.src.replace( /R02/, 'C02' );
                    this.src = this.src.replace( /R02/, 'C02' );
                }.bind( this ), 10 );
            } else if ( /C02/.test( this.src ) ){
                window.setTimeout( function(){ 
                    this.parentElement.href = this.src.replace( /C02/, 'R03' );
                    this.src = this.src.replace( /C02/, 'R03' );
                }.bind( this ), 10 ); 
            } else if ( /R03/.test( this.src ) ){
                window.setTimeout( function(){ 
                    this.parentElement.href = this.src.replace( /R03/, 'C03' );
                    this.src = this.src.replace( /R03/, 'C03' );
                }.bind( this ), 10 );
            }  else {
                // Must not be a county picture so delete the image element and re-calculate the coords.
                window.setTimeout(function(){
                    this.container.setOffSetWH();
                    this.theMap.calculateMarkerPosition( this.container );
                }.bind( { container: this.markerBody, theMap: this.theMap } ), 10 );
                this.parentNode.removeChild( this );                            
            }
        }
    }

    var calculateMarkerPosition = function( singleMarker, Left, Topp, Width, Height ){
        var left = +Left || 0,
            topp = +Topp || 0,
            width  = +Width || this.width,
            height = +Height || this.height,
            xMultiplier = ( this.presentMaxX - this.presentMinX ) / width,
            yMultiplier = ( this.presentMaxY - this.presentMinY ) / height,
            //largImgOffsetX = ( left )? 0 :( ( this.viewPortWidth - this.resizedMapWidth ) / 2 ),// if zooming then largImgOffset needs to be 0;
            //largImgOffsetY = ( topp )? 0 :( ( this.viewPortHeight - this.resizedMapHeight ) / 2 ),// if zooming then largImgOffset needs to be 0;
            markersArray = undefined;

        if ( singleMarker && singleMarker.id ){
            singleMarker.styleLeft  = ( ( singleMarker.statePlaneCoordX - this.presentMinX ) / xMultiplier ) - singleMarker.offsetwidth - 3;
            singleMarker.style.left = singleMarker.styleLeft  + left +'px' ;
            singleMarker.styleTop   = ( ( this.presentMaxY - singleMarker.statePlaneCoordY ) / yMultiplier ) - singleMarker.offsetheight;
            singleMarker.style.top  = singleMarker.styleTop + topp +'px';
        }  else {
            markersArray = this.markersArray;
            for( var i = 0; i < this.markersArray.length; ++i ){
                //smoothTransition.call( this.markersArray[i], 200 );
                markersArray[i].className += " transitionAll2sEaseOut";
                this.setTimeoutt( function( el ){ this.className = this.className.replace( / transitionAll2sEaseOut/, '' ); }.bind( markersArray[i] ), 500 );
                markersArray[i].styleLeft  = ( ( markersArray[i].statePlaneCoordX - this.presentMinX ) / xMultiplier ) - markersArray[i].offsetwidth - 3 ;
                markersArray[i].style.left = markersArray[i].styleLeft  + left +'px';
                markersArray[i].styleTop   = ( ( this.presentMaxY - markersArray[i].statePlaneCoordY ) / yMultiplier ) - markersArray[i].offsetheight;
                markersArray[i].style.top  = markersArray[i].styleTop + topp +'px';
            }
        }
    }.bind( window.theMap );

    var propertyInfo = function ( x, y ){
        // 'this' equals the marker body.
        var minX = x,
            maxX = x+5,
            minY = y,
            maxY = y+5,
            propXML = '<?xml version="1.0" encoding="UTF-8" ?><ARCXML version="1.1">\r\n<REQUEST>\r\n'+
                      '<GET_FEATURES outputmode="xml" envelope="true" geometry="true" featurelimit="10000">\r\n'+
                      '<LAYER id="11" \/><SPATIALQUERY subfields="GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.MKTTL'+
                      ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.SITUSLINE1'+
                      ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.SITUSCITY'+
                      ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.SITUSZIP'+
                      ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.OWNERNAME'+
                      ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.PARCEL_ID"><SPATIALFILTER '+
                      'relation="area_intersection" >'+
                      '<ENVELOPE maxy="' + maxY + '" maxx="' + maxX + '" miny="' + minY + '" minx="' + minX + '"\/> '+
                      "<\/SPATIALFILTER><\/SPATIALQUERY><\/GET_FEATURES><\/REQUEST><\/ARCXML>",
            propXMLPostRequest = encodeURIComponent( "ArcXMLRequest" ) + "=" + encodeURIComponent( propXML ),
            propUrl = window.parameters.urlPrefix + window.parameters.propertyInfoUrl,
            xmlHttp = new XMLHttpRequest(),
            html = ownerName = addrLine1 = addrCity = addrZip = anchor = pacelArray = otherInfoArray = undefined,
            featurCount = undefined;

        xmlHttp.onreadystatechange = function (){
            if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ){
                if( /error/.test( xmlhttp.responseText ) ){ console.log(xmlhttp.responseText.match(/\<error.*?\<\/error/i) )};
                featureCount = +xmlHttp.responseText.match(/FEATURECOUNT count="(.*?)"/)[1];
                if( featureCount=== 0 || featureCount=== 1 ){ //TODO: Is there a single way of checking for 0 or 1?
                    this.apn = /\d{14}/g.exec( xmlHttp.responseText )[0];
                    ownerName = private_normalize( xmlHttp.responseText.match(/OWNERNAME="(.*?)"/)[1] );
                    addrLine1 = xmlHttp.responseText.match(/SITUSLINE1="(.*?)"/)[1];
                    addrCity = xmlHttp.responseText.match(/SITUSCITY="(.*?)"/)[1];
                    addrZip = xmlHttp.responseText.match(/SITUSZIP="(.*?)"/)[1];
                    html = '<div class="m"><div>Owner:<br>Address:</div><div>'+ ownerName +'<br>'+ (( !/unknown/i.test( addrLine1 ) )?private_upperCase( addrLine1 ) +'<br>'+
                                private_upperCase( addrCity ) +', '+ addrZip.replace( /-.*/, '' ) +'</div>': 'Unknown');
                    anchor = document.createElement( 'a' );
                    anchor.className = 'markerApn';
                    anchor.href = window.parameters.apnUrl + this.apn;
                    anchor.target = '_blank';
                    anchor.innerHTML = this.apn;
                    this.insertBefore( anchor, this.children[1] );
                    this.style.width = '';
                    this.setOffSetWH();
                    calculateMarkerPosition( this );
                    if ( window.theMap.optionsReference.showPropertyImage_CheckMark ){
                        markerAddImageAndText.call( this.querySelector('.markerEdit'), null, {"m":""+ html +"", "i":"http://www.snoco.org/docs/sas/photos/"+ this.apn.replace(/^(\d{4})\d*/, "$1") +"/"+ this.apn +"R011.jpg" } );
                    }else {
                        markerAddImageAndText.call( this.querySelector('.markerEdit'), null, {"m": html, "i":"" } );
                    }
                } else {
                    parcelNumber = /PARCEL_ID="(.*?)"/g;
                    ownerName = /OWNERNAME="(.*?)"/g;
                    addrLine1 = /SITUSLINE1="(.*?)"/g;
                    addrCity = /SITUSCITY="(.*?)"/g;
                    addrZip = /SITUSZIP="(.*?)"/g;
                    html = '<div class="n"style="'+ ( ( featureCount <= 8 )? 'text-align:center;': 'height:200px;' )+ '">';
                    parcelArray = [];
                    otherInfoArray = [];
                    while( ( parcelArray = parcelNumber.exec( xmlHttp.responseText )) !== null ){
                        html += '<a target="_blank"';
                        html += 'title="     \n     '+ private_normalize( ownerName.exec( xmlHttp.responseText )[1] ) +'     \n    ';
                        html += ' '+ private_upperCase( addrLine1.exec( xmlHttp.responseText )[1] ) +'     \n    ';
                        html += ' '+ private_upperCase( addrCity.exec( xmlHttp.responseText )[1] ) +', '+ addrZip.exec( xmlHttp.responseText )[1].replace( /-.*/, '' ) +'     \n    "'+
                        'href="'+ window.parameters.apnUrl + parcelArray[1]+'">'+ parcelArray[1] +'</a>';
                    }
                    html += '</div>';
                    
                    markerAddImageAndText.call( this.querySelector('.markerEdit'), null, {"m": html, "i":"" } )
                }
            }
        }.bind( this );
        xmlHttp.open( "POST", propUrl, true );
        xmlHttp.setRequestHeader( "Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send( propXMLPostRequest );
    }

    var deleteAllMarkers = function(){
        var markerArray = window.theMap.markersArray,
            len = markerArray.length,
            container = document.getElementById( 'theMap_container' ),
            i = 0;

        for ( ; i < len; ++i ){

            // Used a setTimeout for visual effect only, nothing special.
            window.setTimeout(function( c, m ){ c.removeChild( m ) }, ( window.Math.random() * 500 ), container, markerArray[i] );
        }
        window.theMap.markersArray = [];
    }

    var fromAPNtoSP = function( e ){//lat,lng
        var apnArray = window.$('find_parcel_number_input').value.split(','),
            //url = "http://korz.tomodo.me/http://gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.3.0&Form=True&Encode=False&CustomService=Query",
            url = window.parameters.urlPrefix + window.parameters.searchByApnUrl;
            xml = undefined,
            currentAPNs = {};
        
        e && e.preventDefault;
        if ( apnArray[0] == '' ){ return; }

        // Stick the APN's of the current markers into an object as a key so they
        // can be compared to what the user entered in text box. If an APN is already present
        // it will be skipped...because it already exists.
        window.theMap.markersArray.forEach( 
            function( marker ){ currentAPNs[marker.apn] = '' } 
        );
        for( var i = 0; i < apnArray.length; i++ ){
            if ( /^\d{14}$/.test( apnArray[i].trim() ) ){
                if ( apnArray[i] in currentAPNs ){ continue; }

                // A closure to get around the classic javascript loop problem.
                ( function( parcel ){
                    var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><ARCXML version=\"1.1\">\r\n<REQUEST>\r\n<GET_FEATURES outputmode=\"xml\" geometry=\"false\" envelope=\"true\" featurelimit=\"14000\" beginrecord=\"1\">\r\n<LAYER id=\"11\" \/><SPATIALQUERY subfields=\"GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.X_COORD GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.Y_COORD\" where=\"PARCEL_ID = '" + parcel.trim()  + "'\" \/><\/GET_FEATURES><\/REQUEST><\/ARCXML>",
                        xmlRequest = 'ArcXMLRequest=' + encodeURIComponent( xml ),
                        lat = undefined, lng = undefined,
                        xmlhttp = new XMLHttpRequest(),
                        runOnce = true;

                    xmlhttp.open( "POST", url, true );
                    xmlhttp.onreadystatechange = function(){
                        var lat = undefined, lng = undefined,
                            google = undefined, state = undefined,
                            obj = undefined;
                      
                        if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText && runOnce ){
                            if( /error/.test( xmlhttp.responseText ) ){ console.log(xmlhttp.responseText.match(/\<error.*?\<\/error/i) )}
                            lat = /X_COORD="(\d+\.\d+)"/g.exec( xmlhttp.responseText )[1],
                            lng = /Y_COORD="(\d+\.\d+)"/g.exec( xmlhttp.responseText )[1];
                            runOnce = false;
                            obj = { "a": parcel.trim(), "x": lat, "y": lng, "m":"", "i":"" };
                            if (  window.theMap.optionsReference.showPropertyImage_CheckMark ){
                                obj.i = "http://www.snoco.org/docs/sas/photos/"+ obj.a.replace(/^(\d{4})\d*/, "$1") +"/"+ obj.a +"R011.jpg"
                            }
                            window.marker_module.makeMarker( null, obj );
                        }
                    }
                    xmlhttp.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
                    xmlhttp.send( xmlRequest );
                })( apnArray[i] )
                
            }  else {
                alert( "There was an error parsing APN #"+ (i+1) +": "+ apnArray[i].trim() );
                console.error( 'marker_module.fromAPNtoSP - Error parsing: '+ apnArray[i].trim() );
                if ( apnArray.length == 1){ return; }
            }

          }
          if ( !( apnArray.length === 1 && apnArray[0] === '' ) ){
            window.theMap.zoomAllTheWayOut();
          }
          
    }

    // TODO: Simplify converSP();
    // Convert state plane coordinates to wgs 84 coordinates...I'm guessing anyway, not sure.
    function convertSP( uX, uY ){ // Copied from scopi! How about that!
        var sqrt = window.Math.sqrt, pow = window.Math.pow,
            atan = window.Math.atan, sin = window.Math.sin,
            abs = window.Math.abs, rho = undefined, 
            theta = undefined, txy = undefined, lon = undefined, 
            lat0 = undefined, part1 = undefined, lat1 = undefined, 
            Lat = undefined, Lon = undefined;

        uX = uX - 1640416.666666667; 
        uY = uY - 0;
        rho = sqrt( pow( uX,2 ) + pow( ( 19205309.96888484 - uY ),2 ) );  
        theta = atan( uX / ( 19205309.96888484 - uY ) ); 
        txy = pow( ( rho / ( 20925646.00* 1.8297521088829285 ) ),( 1 / 0.7445203265542939 ) ); 
        lon = ( theta / 0.7445203265542939 ) + -2.1089395128333326; 
        uX = uX + 1640416.666666667; 
        lat0 = 1.5707963267948966 - ( 2 * atan( txy ) ); 
        part1 = ( 1 - ( 0.08181905782 * sin( lat0 ) ) ) / ( 1 + ( 0.08181905782 * sin( lat0 ) ) ); 
        lat1 = 1.5707963267948966 - ( 2 * atan( txy * pow( part1,( 0.08181905782 / 2 ) ) ) ); 
        while ( ( abs( lat1 - lat0 ) ) > 0.000000002 ){ 
            lat0 = lat1; 
            part1 = ( 1 - ( 0.08181905782 * sin( lat0 ) ) ) / ( 1 + ( 0.08181905782 * sin( lat0 ) ) ); 
            lat1 = 1.5707963267948966 - ( 2 * atan( txy * pow( part1,( 0.08181905782 / 2 ) ) ) ); 
        } 
        Lat = lat1 / 0.01745329252;
        Lon = lon / 0.01745329252; 
        return { x: Lat.toFixed(7), y: Lon.toFixed(7) };
}
    function private_normalize( ownerName ){ // This is basically of a hack job.
        var splitIt = '',
            words = '',
            temp = [],
            hud = ownerName.match( /sec|hous|urb/ig ),
            fannie = ownerName.match( /fed|nation|mor/ig ),
            freddie = ownerName.match( /fed|home|loan/ig );
                                        
        ownerName = ownerName.replace(/\\/,'');
        if ( /LLC|l l c|realt|city of|indian land/i.test( ownerName ) ){ return private_upperCase( ownerName ); }
        if ( hud != null && hud.length >= 3 ) { return "HUD" }
        if ( fannie != null && fannie.length >= 3 ) { return 'Fannie Mae'; }
        if ( freddie != null && freddie.length >= 3 ) { return 'Freddie Mac'; }
        words = ownerName.replace( /&amp;|\&|\+|\/| jr(?!\w)| sr(?!\w)|  /gi, function( match ){ return ( ( /jr|sr/gi ).test( match ) == true ) ? '' : ( ( /  /gi ).test( match ) ) ? ' ' : ' & '; } );
        splitIt = ( ( words.split( ' ' ).length == 3 || words.split( ' ' ).length == 2 ) && ( /\&|bank|corp|llc|credit|union|RESIDENCE|Mortgage|apart|condo|inc.?\w{0}|ASSOC/gi ).test( words ) == false )
                            ? words.replace( /([a-z]*)\s?(\w*)\s?(\w*)/i, function( match,a,b,c,offset,string ){ return ( b.length > 1 ) ? [ b, a ].join( ' ' ) : [ c,a ].join( ' ' ); } ).split( ' ' ) 
                            : words.split( ' ' );
        temp = [];
        splitIt.forEach( function( value, index, array ){
                            if( ( value.length > 1 && ( /II/g ).test( value ) == false ) || ( /\&/g ).test( value ) == true ){
                                value = value.charAt( 0 ).toUpperCase() + value.substring( 1 ).toLowerCase();
                                if( value == 'Llc' ){ value = 'LLC'; }
                                temp[temp.length] = value;
                            }
                         }
        );
        if( ( /\&/ ).test( words ) == true && ( /secretary of housing|bank/i ).test( words ) == false ){//If it finds an '&' then it will assume that the first word is the last name and push it to the end of the array and set the O element to blank;
            if( temp.length == 5 && temp[temp.length-2] != '&' ){
                temp.splice( 2, 0, temp[0] );
                temp.splice( 0, 1 );
                temp.splice( 5, 0, temp[3] );
                temp.splice( 3, 1 );
            }else{
                temp.push( temp[0] );
                temp.splice( 0, 1 );
             }
        }
         return temp.join( ' ' );
    }

    function private_upperCase( str ){
        var pieces = str.split(" "),
            j = i = q = undefined;

        for ( i = 0; q = pieces[i]; i++ ){
            j = q.charAt( 0 ).toUpperCase();
            pieces[i] = j + q.substr( 1 ).toLowerCase();
        }
        return pieces.join( " " ).replace( /llc/i, "LLC" );
    }

    return {
        fromAPNtoSP: fromAPNtoSP,
        makeMarker: makeMarker,
        markerMessageEditor: markerMessageEditor,
        markerAddImageAndText: markerAddImageAndText,
        calculateMarkerPosition: calculateMarkerPosition,
        deleteAllMarkers: deleteAllMarkers,
    }
}();

/* TODO
    * Add the mouse wheel event normalizer statement to a central location, theMap.mWheelEvt?
    * Done: fix mouse calculateMarkerPositionning bug, make dozens of markers and try to calculateMarkerPosition, get error can't set style of undefined.
    * Done: make it so the markers zoom in and out;
    * throttle ajax requests to maybe 500 milliseconds?
    * Done: make a box where someone can enter a message.
    * redo the calculateMarkerPosition and make it more efficient.
    * change "zooming" classname changes to smoothTransition();
    * Done???(added to the_Map ): do something about minxOld ect. they are globals.

AJAX ERRORS:
    * 'Server: Assessor was not found.'
    * from clicking to get apn <ERROR machine="pmz-arcims" processid="3444" threadid="4028">[ERR2407] (SDE error code -10 ) SE_stream_query_with_info : Network I/O error</ERROR>
*/