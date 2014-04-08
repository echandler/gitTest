
var // TODO: Only parameters or default values should go in parameters.
    parameters = {
                    //http://korz.tomodo.me/ 
                    //http://192.168.56.1:1000?
        urlPrefix: 'http://korz.tomodo.me/',
        apnUrl: 'https://www.snoco.org/proptax/search.aspx?parcel_number=',
        searchByApnUrl: "http://gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.3.1&Form=True&Encode=False&CustomService=Query",
        mapUrl: "http://gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.4.1&Form=True&Encode=False?",    
        propertyInfoUrl: "http://gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.3.0&Form=True&Encode=False&CustomService=Query",
        propertyImgUrl : "http://www.snoco.org/docs/sas/photos/",
        optionsCheckMarkDefaults: { 
            showCities_CheckMark        : true, 
            showSatelliteView_CheckMark : false,
            show2007YearMap_CheckMark   : false,
            show2012YearMap_CheckMark   : true,
            showPropertyImage_CheckMark : false, 
            showParcelBoundary_CheckMark: true, 
            showParcelNumbers_CheckMark : false, 
            showAddresses_CheckMark     : true,
        },
        showTwoMapsAtTheSameTime: true,
        homesSoldYears: { years: [ [ '2014', 'rgba(255, 0, 0, 0.5)' ], [ '2013', 'rgba(255, 255, 0, 0.5)' ], [ '2012', 'rgba(173, 216, 230, 0.5)' ] ], },
        fullZoomMinX: 1244781.997,
        fullZoomMaxX: 1622342.497,
        fullZoomMinY: 284336.973,
        fullZoomMaxY: 477544.783,
        panningAnimationMultiplier: 20,// If this default is changed from 20, window.panning_module.panningControlsliderMove needs to be changed also with 1 added to it.
        panningAnimationTrueFalse: true, 
        panningAnimationTime: 1000,
        MAX_WIDTH: 1920, // default 1920.
        MAX_HEIGHT: 1080,// default 1080.
        MAX_IMG_PIXELS: 1920*1080, // default 1920*1080. It appears that this is the max amount of pixels for an image, anything larger generates a image too large error.
    }, 
    $ = document.getElementById.bind( document ),
    theMap = window.$( 'theMap_primary' ),
    xmlhttp = new XMLHttpRequest(),
    timeToLoadArray = [], // Used to calculate panning duration.
    startSend = undefined, // Used to calculate panning duration.
    
    // TODO: ↓ this is for the address search ↓
    //MapFrame = { GCvalue : [], setupGeocode: function(){ console.log('mapframe request') } },
    panningObj = {//TODO: Should this be a global?
        panningAnimationMultiplier: window.parameters.panningAnimationMultiplier,
        panningAnimationTime: window.parameters.panningAnimationTime,
    },
    xml = undefined,
    fullZoomUrl = { satelliteView: undefined, src: undefined, height: undefined, width: undefined, minxOld: undefined, minyOld: undefined, maxxOld: undefined, maxxOld: undefined };
    addRemoveEventListenersObj = undefined,
    throttleResize = undefined,
    pageHasFocus = true, // TODO: this is a test.
    addRemoveEventListenersObj = undefined,
    popStateCounter = 0;

    var city = false; //TODO: this is a global for testing.