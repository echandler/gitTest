window.options_module = function(){ 
    var private_checkMarkArray = [],
        private_bothMapYearsAreCheckedAlertBollean = undefined;

    var private_retrieveAndSaveOptions = function(){
        var checkMarks = private_checkMarkArray,
            optionsObject = {},
            i = undefined;

        for( i = 0; i < checkMarks.length; i++ ){
                optionsObject[checkMarks[i].id] = checkMarks[i].checkedState();
        }
        if( optionsObject.showSatelliteView_CheckMark && optionsObject.show2007YearMap_CheckMark &&
            optionsObject.show2012YearMap_CheckMark ){
            optionsObject.showOverlayMap = true;
        } else {
            optionsObject.showOverlayMap = false;
        }
        this.optionsReference = optionsObject;
        return optionsObject;
    }.bind( window.theMap );

    var private_updateOptions = function(){
        var checkMarks = private_checkMarkArray,
            optionsObject = this.theMap.optionsReference,
            i = undefined;

        for( i = 0; i < checkMarks.length; i++ ){
            if ( optionsObject[checkMarks[i].id] ){
                checkMarks[i].animatedCheck();
            } else {
                checkMarks[i].animatedUnCheck();
            }
        }
        if ( !optionsObject.showSatelliteView_CheckMark ){
            window.$('show2007YearMap_Label').style.color = 'grey';
            window.$('show2012YearMap_Label').style.color = 'grey';
        }
    }.bind( {   optionsTable: window.$( 'options_table' ), 
                theMap: window.theMap, 
            } );

    // setHomesSoldYears() sets the sale records options in the options panel to whatever
    // is enter in window.parameters.homesSoldYears
    var private_setHomesSoldYears =  function(){
        var $ = window.$,
            homesSold = window.parameters.homesSoldYears;

        for ( var i = 0; i < homesSold.years.length; i++ ){
            var trimmedYear = homesSold.years[i][0].replace( /20/, '' );

            // Can't have a number as first letter of variable or property so added the '$' in front of the id's ... plus ya know for the bling.
            $( i +'SaleRecord_CheckBox').id = '$'+ trimmedYear +"SaleRecord_CheckBox";
            $( i +'SaleRecord_CheckMark').id = '$'+ trimmedYear +"SaleRecord_CheckMark";
            $( i +'SaleRecord_Label').innerHTML = "'"+ trimmedYear +' Sale Records';
            $( i +'SaleRecord_Label').style.cssText = 'background-color:'+ homesSold.years[i][1] +';';
            $( i +'SaleRecord_Label').id = '$'+ trimmedYear +"SaleRecord_Label";
        }
    }

    //TODO: make a private_makeSmallerUrl that knocks the decimal places off the coordinates.
    var private_makeUrl = function (){
        var json = { mr: [] ,x: 0 ,mx: 0 ,my: 0 ,z: 0 },
            url = undefined;
            
        this.markersArray.forEach( function( marker ){
           json.mr.push({   a: marker.apn || '',
                            x: marker.statePlaneCoordX,
                            y: marker.statePlaneCoordY,
                            m: marker.message,
                            i: marker.imgUrl
                        });
        } );
        json.x  = this.presentMinX;
        json.mx = this.presentMaxX;
        json.y  = this.presentMinY;
        json.my = this.presentMaxY;
        json.z  = this.sliderPosition;
        url = 'http://' + window.location.host + window.location.pathname + "?=" + JSON.stringify( json );
        return url;
    }.bind( window.theMap );

    var svgController = function( arg ){
        var currentClasses = this.getAttribute( 'class' );

        switch ( arg ){
            case 'start options open':
                    if ( !/ ?spinGear/i.test( currentClasses ) ){
                        this.setAttribute( 'class', currentClasses +' gearOpen gearAnimationOpen' );
                    } else {
                        this.setAttribute( 'class', currentClasses +' gearOpen' );
                    }
                    break;

            case 'start options close':
                    currentClasses = currentClasses.replace( / ?gearAnimationOpen| ?gearOpen/g, '' );
                    if ( /spinGear( ?!DownSlowly )/.test( currentClasses ) ){
                        currentClasses = currentClasses.replace( / ?spinGear( ?!DownSlowly )/g, '' );
                        this.setAttribute( 'class', currentClasses +' transitionAll2sEaseOut' );
                        window.setTimeout( function( currentClasses ){ 
                                svgController( 'start removeListeners' );
                            }, 250 ); //clearTimeout( timeOut );
                    } else {
                        this.setAttribute( 'class', currentClasses +' transitionAll2sEaseOut' );
                    }
                    break;

            case 'finish options close':
                    currentClasses = currentClasses.replace( / ?transitionAll2sEaseOut/g,'' );
                    this.setAttribute( 'class', currentClasses );
                    break;

            case 'start removeListeners':
                    currentClasses = currentClasses.replace( / ?spinGearDownSlowly| ?gearAnimationOpen/g, '' );
                    this.setAttribute( 'class', ' spinGear '+ currentClasses );
                    break;

            case 'start addListeners':
                    currentClasses = currentClasses.replace( / ?spinGear(?!DownSlowly)/g, '' );
                    if ( !/gearOpen/i.test( currentClasses ) ){
                        this.setAttribute( 'class', currentClasses );
                        
                        // This setTimeout is a work around for chrome 33.
                        setTimeout( function( currentClasses ){ this.setAttribute( 'class', currentClasses +' spinGearDownSlowly' ); }.bind( this ), 50, currentClasses );
                    } else {
                        if ( !/gearAnimationOpen/i.test( currentClasses ) ){
                            this.setAttribute( 'class', currentClasses +' gearAnimationOpen' );
                        } else {
                            this.setAttribute( 'class', currentClasses );
                        }
                    }
                    break;

            case 'finish addListeners':
                    currentClasses = currentClasses.replace( / ?spinGearDownSlowly/g, '' ).replace( /\s+/g, ' ' );
                    if ( !/gearOpen/i.test( currentClasses ) ){
                        this.setAttribute( 'class', currentClasses );
                    } else {
                        if ( !/gearAnimationOpen/i.test( currentClasses ) ){
                            this.setAttribute( 'class', currentClasses +' gearAnimationOpen' );
                        } else {
                            this.setAttribute( 'class', currentClasses );
                        }
                    }
                    break;
         } 
    }.bind( window.$( 'options_svg_gear' ) );

    var private_optionsOpenCloseObj = {
            optionsSVGImage:  window.$( 'options_svg_gear' ),
            closeOptions:     window.$( 'closeOptions' ),
            optionsDivStyle:  window.$( 'options_div' ).style,
            snocoTrees:       window.$( 'snoco_trees' ),
            optionsContainer: window.$( 'options_container' ),
            svgController: svgController
        }

    var private_optionsPanelOpen = function ( e ){ 
        this.optionsContainer.className = 'expandOptionsContainer';
        this.optionsContainer.removeEventListener( 'click', private_optionsPanelOpen );
        this.optionsSVGImage.addEventListener( 'click', private_optionsPanelClose );
        this.snocoTrees.addEventListener( 'click', private_optionsPanelClose );
        this.optionsDivStyle.display = 'block';
        this.svgController( 'start options open' );
        this.snocoTrees.setAttribute( 'class', 'snocoTreesOptionsOpen' );
    }.bind( private_optionsOpenCloseObj );

    var private_optionsPanelClose = function( e ){
        this.optionsDivStyle.display = 'none';
        this.optionsContainer.className = '';
        svgController( 'start options close' );
        this.snocoTrees.setAttribute( 'class', '' );
        this.optionsSVGImage.removeEventListener( 'click', private_optionsPanelClose );
        this.snocoTrees.removeEventListener( 'click', private_optionsPanelClose );
        window.setTimeout( function(){
                        this.optionsContainer.addEventListener( 'click', private_optionsPanelOpen );
                        svgController( 'finish options close' );
                        private_updateOptions();
                     }.bind( this ), 500 );
        window.$('make_url_text_input').value = '';
    }.bind( private_optionsOpenCloseObj );

    function private_checkMarkHandler( e ){ /* TODO: this needs to be renamed */
        var id = this.id.replace( /_.*/, '' )+ "_CheckMark"
        var checkMark = window.$( id );

        // If you change this remember to change updateButtonHandler().
        if ( checkMark.checkedState() ){
            checkMark.animatedUnCheck();
        } else {
            checkMark.animatedCheck();
        }
    }

    var updateButtonHandler = function( e ){
        var theMap = window.theMap,
            deleteCheckMark = window.$( 'deleteAllMarkers_CheckMark' );

        if ( deleteCheckMark.checkedState() ){
            window.marker_module.deleteAllMarkers();
            deleteCheckMark.animatedUnCheck();
        }
        if ( window.$( 'showPropertyImage_CheckMark' ).checkedState() && !theMap.optionsReference.showPropertyImage_CheckMark ){
            theMap.markersArray.forEach(
                function( marker ){
                    if ( marker.apn ){
                        if ( !marker.querySelector( '.markerImg' ) ){
                           window.marker_module.markerAddImageAndText.call( marker.editButton, null, {"m":"", "i": window.parameters.propertyImgUrl + marker.apn.replace(/^(\d{4})\d*/, "$1") +"/"+ marker.apn +"R011.jpg" } );
                        }
                    }   
                }
            );
        }
        if( window.$( 'showSatelliteView_CheckMark' ).checkedState() && 
            window.$( 'show2007YearMap_CheckMark' ).checkedState() && 
            window.$( 'show2012YearMap_CheckMark' ).checkedState() ){
                if( !private_bothMapYearsAreCheckedAlertBollean ){
                    if( window.parameters.showTwoMapsAtTheSameTime && 
                        window.confirm( '  The years 2007 and 2012 are checked,\n'+
                                        'this will create an overlay map with\n'+
                                        '2007 on the bottom and 2012 on top.\n\n'+
                                        '  You can compare the two maps to see\n'+
                                        'the changes between 2007 and 2012.\n\n'+
                                        'Warning: Disabling information messages\n'+
                                        'or alerts, will disable this feature also.' ) ){
                        private_bothMapYearsAreCheckedAlertBollean = true;

                    } else if ( window.confirm('Would you like to uncheck 2007?') ) {
                        window.$( 'show2007YearMap_CheckMark' ).animatedUnCheck();
                    } else {
                        window.$( 'show2012YearMap_CheckMark' ).animatedUnCheck();
                    }
                }
        } else {
            window.overlayMap_module.deleteOverlayMap();
        }

        private_retrieveAndSaveOptions();
        if ( e.target.id === 'update_button' ){
            window.utilities_module.makeArcXMLRequest( theMap.presentMinX, theMap.presentMaxX, theMap.presentMinY, theMap.presentMaxY );
        }
        private_optionsPanelClose();
    }   

    var initOptionsPanel = function(){
        var $ = window.$;

        Array.prototype.forEach.call( document.querySelectorAll( '.checkBox, .labelTd, .checkMark' ), function( elm ){
            if( /checkMark/.test( elm.className ) ){
                private_checkMarkArray.push( elm );
                elm.checkedState = function(){
                    return ( this.style.color === '' ); // Defaults to the css color specified in checkMark class.
                }
                elm.animatedCheck = function(){
                    this.style.cssText += 'margin-top: -13px; height: 30px;';
                    this.style.color = '';
                    window.setTimeout( function( checkMark ){
                        checkMark.style.width = '30px';
                    }, 50, this );
                }
                elm.animatedUnCheck = function(){
                    this.style.cssText += 'opacity: 0; color: grey; height: 15px; width: 10px;';
                    window.setTimeout( function( checkMark ){
                        checkMark.style.cssText += 'opacity: 1; margin-top: 0px;';
                    }, 110, this );
                }
            } else { // The elm has the className of .checkBox or labelTd, it's not a checkMark.
                elm.addEventListener( 'click', private_checkMarkHandler );
            }   
        });
        private_setHomesSoldYears();
        private_updateOptions();
        private_retrieveAndSaveOptions();
        $( 'options_container' ).addEventListener( 'click', private_optionsPanelOpen );
        $( 'make_url_anchor' ).addEventListener( 'click', function(){
            var url = private_makeUrl();

            window.$( 'make_url_text_input' ).value = url;
            if ( url.length >= 2000 ){
            window.alert( "  URL length exceeds 2000 characters, it might not work in all browsers.\n\n"+
                        "  There are "+ url.length +" characters in the URL.\n\n"+
                        "  Test this URL by pasting it into the address bar of the intended browser, and/or "+
                        "make a link in a test email, and/or create a test link on your website and test "+
                        "in multiple browsers.\n\n"+
                        "  Consider using fewer markers or make the content of the markers smaller in length "+
                        "and try again.\n\n" );
            }
            try{ 
                window.decodeURIComponent( url )
            } catch( e ){
                alert('  There was a problem test decoding the URL.\n\n'+
                        '  Cryptic Error Message:\n\n'+
                        '    \" '+ e.message +' \"\n\n'+
                        (( /%(?![0-9a-f][0-9a-f])/i.test( url ) )? '  *Atleast one % (percent sign) was found.':'') )
            }
        } );
        $( 'panning_control_slider' ).addEventListener( 'mousedown', window.panning_module.panningControlsliderMouseDown );
        $( 'panning_control_slider_rail' ).addEventListener( 'mousedown', window.panning_module.panningControlsliderMouseDown );
        $( 'find_parcel_number_input' ).addEventListener( 'keyup', private_SearchByAPNEventListener );
        $( 'find_parcel_number_input' ).addEventListener( 'paste', private_SearchByAPNEventListener );
        $( 'showSatelliteView_Label' ).addEventListener( 'click', private_showSataliteViewEventListener );
    }

    function private_showSataliteViewEventListener(){
        window.setTimeout(function(){
             if( window.$('showSatelliteView_CheckMark' ).checkedState() ){
                window.$('show2007YearMap_Label').style.color = '';
                window.$('show2012YearMap_Label').style.color = '';
            } else {
                window.$('show2007YearMap_Label').style.color = 'grey';
                window.$('show2012YearMap_Label').style.color = 'grey';
            }
        }, 100);
    }

    function private_SearchByAPNEventListener( ){
            if ( this.value != '' ){

              // If a change is made here then you might have to change window.createMarkersFromInfoFromUrl() to be consistent.
              window.$( 'find_parcel_number' ).className = 'findParcelNumberBorder';
            } else {
               window.$( 'find_parcel_number' ).className = '';
            }
    }

    return {
        svgController: svgController,
        initOptionsPanel: initOptionsPanel,
        updateButtonHandler: updateButtonHandler,
    }
}();