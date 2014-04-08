    
window.marker_module = function(){
    var private_xmlQueryParams = //' #ALL#'+ 
                                  ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.GIS_ACRES'
                                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.SITUSLINE1'
                                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.SITUSCITY'
                                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.SITUSZIP'
                                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.OWNERNAME'
                                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.PARCEL_ID'
                                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.MKTTL';
    
    var private_interStateShields = [
        ['css/images/I_405.svg', {x: 1297219.7944701847, y: 299087.74347618467}, 20, 24, 'interStateShields' ],
        ['css/images/I_5.svg', {x: 1310690.7391130, y: 365097.7726428}, 20, 20, 'interStateShields' ],
        ['css/images/I_5.svg', {x: 1304692.2556091, y: 439633.3538498} , 20, 20, 'interStateShields' ],
        ['css/images/I_5.svg', {x: 1280535.9065988, y: 299215.0671469}, 20, 20, 'interStateShields' ],
        ['css/images/SR_9.svg', {x: 1327302.7786226, y: 326899.4225040}, 20, 20, 'interStateShields' ],
        ['css/images/SR_9.svg', {x: 1328005.5309462373, y: 407681.92078087135}, 20, 20, 'interStateShields' ],
        ['css/images/SR_530.svg', {x: 1401101.5901171, y: 467397.5034938}, 20, 20, 'interStateShields' ],
        ['css/images/US_2.svg', {x: 1380120.3987939, y: 313828.3406249}, 20, 20, 'interStateShields' ],
        ['css/images/snocoTrees.svg',{x: 1304292.2011418, y: 359470.3808035}, 13, 31, 'interStateShields']
    ];

    function makeInterStateShields(){
        var m = 0;
        while ( private_interStateShields[m] ){
            makeSimpleMarker( private_interStateShields[m][0], private_interStateShields[m][1], private_interStateShields[m][2], private_interStateShields[m][3], private_interStateShields[m][4] );
            ++m;
        }
    }

    var makeSimpleMarker = function( arg_imgUrl, arg_spObj, arg_height, arg_width,  arg_className ){
        var simpleMarker = document.createElement('img');
            simpleMarker.src = arg_imgUrl;
            simpleMarker.style.position = 'absolute';
            simpleMarker.className = arg_className +' simpleMarker';
            simpleMarker.width = arg_width;
            simpleMarker.height = arg_height;
            simpleMarker.statePlaneCoordX = arg_spObj.x;
            simpleMarker.statePlaneCoordY = arg_spObj.y;
            simpleMarker.styleTop  = 0;
            simpleMarker.styleLeft = 0;
            window.$( 'theMap_misc_container' ).appendChild( simpleMarker );
            simpleMarker.offsetwidth = ( arg_width / 2 ) - 3;
            simpleMarker.offsetheight = arg_height / 2;
            window.theMap.markersArray.push( simpleMarker );
            calculateMarkerPosition( simpleMarker );
    } 

    var makeMarker = function( e, arg_infoObject ){
        // TODO: Are all these var's necessary?
        // Don't set a marker if the map is not zoomed in enough, default is 100;
        if ( this.sliderPosition > 120 && !arg_infoObject ){ return; }
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
            markerBody.addEventListener( 'mousedown', function( e ){
                e.stopPropagation();
            });
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
                window.$('smallCountyMarker'+ parentId).parentElement.removeChild( window.$('smallCountyMarker'+ parentId) );
            });
        markerBody.appendChild( deleteButton );

        if ( infoObject && infoObject.a !== '' ){
            var apnContainer = document.createElement( 'div' );
                apnContainer.style.marginTop = "-0.54em";
                apnContainer.style.marginRight = "10px";
            var apn = document.createElement( 'div' );
                apn.className = ( 'markerApnText' );
                apn.innerHTML = 'APN:'
            var anchor = document.createElement( 'a' );
                anchor.className = 'markerApnLink';
                anchor.href = window.parameters.apnUrl + infoObject.a;
                anchor.target = '_blank';
                anchor.innerHTML= '&nbsp;'+ infoObject.a;
            apnContainer.appendChild( apn );
            apnContainer.appendChild( anchor );
            markerBody.appendChild( apnContainer );
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
        this.parentElement.appendChild( markerBody );
        markerBody.setOffSetWH();
        this.markersArray.push( markerBody );
        window.smallCountySvg_module.smallCountySvgMakerMaker({x: markerBody.statePlaneCoordX, y: markerBody.statePlaneCoordY, id: markerBody.id });
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
        
        // The div's with class '.m' are the single homes with owner name, address, ect.
        // don't touch the inline width style of "APN:" it is set in the css.
        // The div's with class'.n' are for apt buildings where there is a list of apn's
        // and the owner info is in a title attribute. Set the inline width style manually.
        if( messageContainer.querySelector('.m') && this.markerBody.querySelector('.markerApnText') ){
            this.markerBody.querySelector('.markerApnText').style.width = '';
        } else if( !messageContainer.querySelector('.n') && this.markerBody.querySelector('.markerApnText') ){
            this.markerBody.querySelector('.markerApnText').style.width = '2.5em';
        }
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
            markersArray = ( singleMarker && singleMarker.id )? [singleMarker]: this.markersArray,
            len = markersArray.length;

        for( var i = 0; i < len; ++i ){
            markersArray[i].styleLeft = ( ( markersArray[i].statePlaneCoordX - this.presentMinX ) / xMultiplier ) - markersArray[i].offsetwidth - 3 ;
            markersArray[i].styleTop  = ( ( this.presentMaxY - markersArray[i].statePlaneCoordY ) / yMultiplier ) - markersArray[i].offsetheight;
            markersArray[i].style[this.cssTransform] = 'translate3d('+ ~~( markersArray[i].styleLeft  + left - this.dragDiv.left ) +'px, '+ ~~( markersArray[i].styleTop + topp - this.dragDiv.topp ) +'px, 0px)';
        }
    }.bind( window.theMap );

    var propertyInfo = function ( x, y ){
        // 'this' equals the marker body.
        var minX = x,
            maxX = x+5,
            minY = y,
            maxY = y+5,
            propXML = '<?xml version="1.0" encoding="UTF-8" ?><ARCXML version="1.1">\r\n<REQUEST>\r\n'
                      + '<GET_FEATURES outputmode="xml" envelope="false" geometry="false" featurelimit="10000">\r\n'
                      + '<LAYER id="11" /><SPATIALQUERY subfields="'
                      + private_xmlQueryParams
                      + '"><SPATIALFILTER relation="area_intersection" >'
                      + '<ENVELOPE maxy="' + maxY + '" maxx="' + maxX + '" miny="' + minY + '" minx="' + minX + '"\/> '
                      + '</SPATIALFILTER></SPATIALQUERY></GET_FEATURES></REQUEST></ARCXML>',
            propXMLPostRequest = window.encodeURIComponent( "ArcXMLRequest" ) + "=" + encodeURIComponent( propXML ),
            propUrl = window.parameters.urlPrefix + window.parameters.propertyInfoUrl,
            propInfoAjax = new XMLHttpRequest();

        propInfoAjax.onreadystatechange = function (){
            var anchor = undefined, apnContainer = undefined,
                apn = undefined, featureCount = undefined;

            if ( propInfoAjax.readyState === 4 && propInfoAjax.status === 200 ){
                if( /error/.test( propInfoAjax.responseText ) ){ console.log(propInfoAjax.responseText.match(/<error.*<\/error/i) )};
                featureCount = +propInfoAjax.responseText.match(/FEATURECOUNT count="(.*?)"/)[1];
                if( featureCount=== 0 || featureCount=== 1 ){ //TODO: Is there a single way of checking for 0 or 1?
                    this.apn = /\d{14}/g.exec( propInfoAjax.responseText )[0];
                    apnContainer = document.createElement( 'div' );
                    apnContainer.style.marginTop = "-0.54em";
                    apnContainer.style.marginRight = "10px";
                    apn = document.createElement( 'div' );
                    apn.className = ( 'markerApnText' );
                    apn.innerHTML = 'APN:'
                    anchor = document.createElement( 'a' );
                    anchor.className = 'markerApnLink';
                    anchor.href = window.parameters.apnUrl + this.apn;
                    anchor.target = '_blank';
                    anchor.innerHTML = '&nbsp;'+ this.apn;
                    apnContainer.appendChild( apn );
                    apnContainer.appendChild( anchor );
                    this.insertBefore( apnContainer, this.children[1] );
                }
                this.style.width = '';
                this.setOffSetWH();
                calculateMarkerPosition( this );
                html = private_makeInfoHtml( propInfoAjax.responseText );
                if ( this.apn && window.theMap.optionsReference.showPropertyImage_CheckMark ){
                    markerAddImageAndText.call( this.querySelector('.markerEdit'), null, {"m":""+ html +"", "i":"http://www.snoco.org/docs/sas/photos/"+ this.apn.replace(/^(\d{4})\d*/, "$1") +"/"+ this.apn +"R011.jpg" } );
                }else {
                    markerAddImageAndText.call( this.querySelector('.markerEdit'), null, {"m": html, "i":"" } );
                }
            }
        }.bind( this );
        propInfoAjax.open( "POST", propUrl, true );
        propInfoAjax.setRequestHeader( "Content-type", "application/x-www-form-urlencoded");
        propInfoAjax.send( propXMLPostRequest );
    }

    var fromAPNtoSP = function( e ){//lat,lng
        var apnArray = window.$('find_parcel_number_input').value.replace(/\s/g, '').split(','),
            //url = "http://korz.tomodo.me/http://gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.3.0&Form=True&Encode=False&CustomService=Query",
            url = window.parameters.urlPrefix + window.parameters.searchByApnUrl,
            xml = undefined, parcel = undefined, lat = undefined, lng = undefined,
            xmlhttp = new XMLHttpRequest(),
            runOnce = true,
            currentAPNs = {};

            xmlRequest = 'ArcXMLRequest=' + encodeURIComponent( xml ),
            
            
        
        e && e.preventDefault;
        if ( apnArray[0] == '' ){ return; }

        // Stick the APN's of the current markers into an object as a key so they
        // can be compared to what the user entered in text box. If an APN is already present
        // it will be skipped...because it already exists.
        window.theMap.markersArray.forEach( 
            function( marker ){ currentAPNs[marker.apn] = '' }
        );
        for( var i = 0; i < apnArray.length; i++ ){
            if ( /^\d{14}$/.test( apnArray[i] ) ){
                if ( apnArray[i] in currentAPNs ){
                    apnArray.splice( i, 1 );
                }
                apnArray[i] = "'"+ apnArray[i] +"'";
            }  else {
                window.alert( "There was an error parsing APN #"+ (i+1) +": "+ apnArray[i].trim() );
                console.error( 'marker_module.fromAPNtoSP - Error parsing: '+ apnArray[i].trim() );
                if ( apnArray.length == 1){ return; }
            }
        }
        xml =   '<?xml version="1.0" encoding="UTF-8" ?><ARCXML version="1.1">\r\n'
                + '<REQUEST>\r\n<GET_FEATURES outputmode="xml" geometry="false" '
                + 'envelope="true" featurelimit="14000" beginrecord="1">\r\n'
                + '<LAYER id="11" /><SPATIALQUERY subfields="'
                + private_xmlQueryParams 
                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.X_COORD'
                + ' GIS_FEATURES.DBA.CADASTRAL_PARCELS_ASSESSOR.Y_COORD'
                + "\" where=\"PARCEL_ID IN ("+ apnArray.join(',') +")\" \/>"
                + '</GET_FEATURES></REQUEST></ARCXML>',
        xmlRequest = 'ArcXMLRequest=' + encodeURIComponent( xml );
        fromAPNtoSPAjax.open( "POST", url, true );
        fromAPNtoSPAjax.onreadystatechange = function(){
            var lat = undefined, lng = undefined, obj = undefined, html = undefined,
                parcelNumber = undefined,
                parcelNumberRegex = /PARCEL_ID="(.*?)"/g,
                latRegex = /X_COORD="(\d+\.\d+)"/g,
                lngRegex = /Y_COORD="(\d+\.\d+)"/g,
                ownerName = /OWNERNAME=".*?" /g,
                addrLine1 = /SITUSLINE1=".*?" /g,
                addrCity = /SITUSCITY=".*?" /g,
                addrZip = /SITUSZIP=".*?" /g,
                mrkTotal = /MKTTL=".*?" /g,
                sizeAcres = /GIS_ACRES=".*?" /g,
                parcelArray = [],
                theString = "";
          
            if ( fromAPNtoSPAjax.readyState == 4 && fromAPNtoSPAjax.status == 200 && fromAPNtoSPAjax.responseText && runOnce ){
                if( /error/.test( fromAPNtoSPAjax.responseText ) ){ console.log(fromAPNtoSPAjax.responseText.match(/\<error.*?\<\/error/i) )}
                while( ( parcelNumber = parcelNumberRegex.exec( fromAPNtoSPAjax.responseText )[1] ) !== null ){
                    lat = latRegex.exec( fromAPNtoSPAjax.responseText )[1];
                    lng = lngRegex.exec( fromAPNtoSPAjax.responseText )[1];
                    theString = ownerName.exec( fromAPNtoSPAjax.responseText )
                                + addrLine1.exec( fromAPNtoSPAjax.responseText )
                                + addrCity.exec( fromAPNtoSPAjax.responseText )
                                + addrZip.exec( fromAPNtoSPAjax.responseText )
                                + mrkTotal.exec( fromAPNtoSPAjax.responseText )
                                + ' FEATURECOUNT count="1" '
                                + sizeAcres.exec( fromAPNtoSPAjax.responseText );
                    runOnce = false;
                    html = private_makeInfoHtml( theString );
                    obj = { "a": parcelNumber, "x": lat, "y": lng, "m": html, "i": "" };
                    if ( window.theMap.optionsReference.showPropertyImage_CheckMark ){
                        obj.i = "http://www.snoco.org/docs/sas/photos/"+ obj.a.replace(/^(\d{4})\d*/, "$1") +"/"+ obj.a +"R011.jpg"
                    }
                    window.marker_module.makeMarker( null, obj );
                }
            }
        }
        fromAPNtoSPAjax.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
        fromAPNtoSPAjax.send( xmlRequest );
      if ( !( apnArray.length === 1 && apnArray[0] === '' ) ){
        window.theMap.zoomAllTheWayOut();
      }
    }

    function private_makeInfoHtml( arg_xml ){ 
        var addBrIncrementor = { a: 0 },
            ownerName = private_normalize( arg_xml.match( /OWNERNAME="(.*?)"/ )[1] ).replace( /(\s)/g, makeInfoHtml_addBr.bind( addBrIncrementor ) ),
            addrLine1 = private_upperCase( arg_xml.match( /SITUSLINE1="(.*?)"/ )[1] ),
            addrCity = private_upperCase( arg_xml.match( /SITUSCITY="(.*?)"/ )[1] ),
            addrZip = arg_xml.match( /SITUSZIP="(.*?)"/ )[1].replace( /-.*/, '' ),
            mrkTotal = ( +arg_xml.match( /MKTTL="(.*?)"/ )[1] ).toLocaleString('en');
            parcelNumber = /PARCEL_ID="(.*?)"/g,
            sizeAcres = arg_xml.match(/GIS_ACRES="(.*?)"/)[1], 
            parcelArray = [],
            otherInfoArray = [],
            featureCount = +arg_xml.match(/FEATURECOUNT count="(.*?)"/)[1];
            lineBreaks = (function( o ){ a = '';s = o.indexOf("<br>");while(s != -1){a += "<br>"; s = o.indexOf("<br>",s+1);}return a;})(ownerName);
            html = undefined;

        if( featureCount === 0 || featureCount === 1 ){
            html =  '<div class="m"><div>Owner:<br>' + lineBreaks
                    + 'Address:<br>'
                    + ( ( !/unknown/i.test( addrLine1 ) )? '<br>':'' )
                    + 'Value:</div><div>'+ ownerName +'<br>'                   
                    + (( !/unknown/i.test( addrLine1 ) )? addrLine1 +'<br>'+ addrCity  +', '
                    +   addrZip : 'Unknown') +'<br>'
                    + '$'+ mrkTotal +' <div>('+ sizeAcres +' acres)</div></div>';
        }else{
            html = '<div class="n"style="'+ ( ( featureCount <= 8 )? 'text-align:center;': 'height:200px;' )+ '">';
            ownerName = /OWNERNAME="(.*?)"/g;
            addrLine1 = /SITUSLINE1="(.*?)"/g;
            addrCity = /SITUSCITY="(.*?)"/g;
            addrZip = /SITUSZIP="(.*?)"/g;
            mrkTotal = /MKTTL="(.*?)"/g;
            while( ( parcelArray = parcelNumber.exec( arg_xml ) ) !== null ){
                html += '<a target="_blank"'
                     + 'title="     \n     '+ private_normalize( ownerName.exec( arg_xml )[1] ) +'     \n    '
                     + ' '+ private_upperCase( addrLine1.exec( arg_xml )[1] ) +'     \n    '
                     + ' '+ private_upperCase( addrCity.exec( arg_xml )[1] ) +', '+ addrZip.exec( arg_xml )[1].replace( /-.*/, '' ) +'     \n    '
                     + ' $'+ ( +mrkTotal.exec( arg_xml )[1] ).toLocaleString('en') +'     \n    "'
                     + 'href="'+ window.parameters.apnUrl + parcelArray[1]+'">'+ parcelArray[1] +'</a>';
            }
            html += '</div>';
        }

        //TODO: This adds a <br> at every space after index 24.
        function makeInfoHtml_addBr( match, p1, index, string ){
            if( index >= ( this.a + 24 ) ){
                this.a += 24;
                return '<br>';
            }
            return p1;
        }
        return html;
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

    function deleteAllMarkers(){
        var markerArray = document.querySelectorAll('.markerParent, .smallCountyMarker'),
            len = markerArray.length,
            i = 0;

        for ( ; i < len; ++i ){
            // Used a setTimeout for visual effect only, nothing special.
            window.setTimeout(function( m ){ m.parentNode.removeChild( m ) }, ( window.Math.random() * 500 ), markerArray[i] );
        }
        window.theMap.markersArray = [];
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
            j = undefined,
            i = undefined, 
            q = undefined;

        for ( i = 0; q = pieces[i]; i++ ){
            j = q.charAt( 0 ).toUpperCase();
            pieces[i] = j + q.substr( 1 ).toLowerCase();
        }
        return pieces.join( " " ).replace( /llc/i, "LLC" );
    }

    var isSimpleMarkerOnImage = function(){
        var markersArray = this.markersArray,
            len = markersArray.length;
        for(var i = 0; i < len; ++i ){
            if( /simpleMarker/.test( markersArray[i].className ) ){
                if( markersArray[i].statePlaneCoordX < this.presentMaxX &&
                    markersArray[i].statePlaneCoordY < this.presentMaxY && 
                    markersArray[i].statePlaneCoordX > this.presentMinX &&
                    markersArray[i].statePlaneCoordY > this.presentMinY ){
                    markersArray[i].style.visibility = 'visible';
                }else{
                    markersArray[i].style.visibility = 'hidden';
                }
            }
        }
    }.bind( window.theMap );
    
    return {
        fromAPNtoSP: fromAPNtoSP,
        makeInterStateShields: makeInterStateShields,
        makeSimpleMarker: makeSimpleMarker,
        makeMarker: makeMarker,
        markerMessageEditor: markerMessageEditor,
        markerAddImageAndText: markerAddImageAndText,
        calculateMarkerPosition: calculateMarkerPosition,
        deleteAllMarkers: deleteAllMarkers,
        isSimpleMarkerOnImage: isSimpleMarkerOnImage,
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