//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/query',
  'collections/queries',
  'text!templates/infowindow.html',
  'text!templates/infowindow_ameriflux.html',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',
], function($,_, Backbone, QueryModel, QueriesCollection, legendTemplate,amerifluxInfoWindow){

  google.maps.Polygon.prototype.Contains = function(point) {
        // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
        var crossings = 0,
            path = this.getPath();

        // for each edge
        for (var i=0; i < path.getLength(); i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
        }

        // odd number of crossings?
        return (crossings % 2 == 1);

        function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            // alter longitude to cater for 180 degree crossings
            if (px < 0) { px += 360 };
            if (ax < 0) { ax += 360 };
            if (bx < 0) { bx += 360 };

            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);

        }

     };

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: QueryModel,
        collection: QueriesCollection,
        template: _.template(legendTemplate),
        templateAmeriflux: _.template(amerifluxInfoWindow),
        mapOptions : {
          zoom: 4,
          minZoom: 2,
          maxZoom: 25,
          center: new google.maps.LatLng(38.5539,-121.7381), //Davis, CA
          mapTypeId: 'terrain',
          mapTypeControl: true,
          mapTypeControlOptions: { 
            mapTypeIds: [
              'terrain',
              'satellite'
            ],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
          },
          navigationControl: true,
          navigationControlOptions: { 
            style: google.maps.NavigationControlStyle.ZOOM_PAN 
          },
          scrollwheel: false,
          scaleControl: true,
        },

        initInfoWindows: function(){
          var that = this; //to handle closure
          this.infoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.infoWindowAmeriflux = new google.maps.InfoWindow({maxWidth:250});
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
              //remove these if-else branches by reflecting it in the table
              if (e.row["type"].value == "gymno"){ 
                var type = "Gymnosperm";
              }
              else{
                var type = "Angiosperm";
              }
              that.infoWindow.setContent(
                that.template({
                  icon_name: e.row["icon_name"].value,//for icon images -> http://kml4earth.appspot.com/icons.html
                  icon_type: type,
                  family: e.row["family"].value,
                  species: e.row["species"].value,
                  elev: e.row["elev"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  sequenced: e.row["sequenced"].value,
                  genotyped: e.row["genotyped"].value,
                  phenotype: e.row["phenotype"].value,
                  accession: e.row["accession"].value
                  })
              );
              that.infoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.infoWindow.open(that.map);
          });
          google.maps.event.addListener(this.amerifluxLayer, 'click', function(e){
              //remove these if-else branches by reflecting it in the table
              that.infoWindowAmeriflux.setContent(
                that.templateAmeriflux({
                  icon_name: e.row["icon_name"].value,//for icon images -> http://kml4earth.appspot.com/icons.html
                  site_id: e.row["site_id"].value,
                  src_url: e.row["src_url"].value,
                  site_name: e.row["site_name"].value,
                  type: e.row["type"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  })
              );
              that.infoWindowAmeriflux.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.infoWindowAmeriflux.open(that.map);
          });
        },

        initDrawingManager: function() {
          var that = this;
          this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
              ]
            },
          });

          this.drawingManager.setMap(this.map);

          google.maps.event.addListener(this.drawingManager,'polygoncomplete', function(polygon){
            if(that.polygon){
              that.polygon.setMap(null);
              $('#data_table').dataTable().fnClearTable();
            }
            that.polygon = polygon;
            var points = [];
            //  $url="https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20count()%20FROM%201AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8%20WHERE%20ST_INTERSECTS('lat',%20CIRCLE(LATLNG($lat,$lng),%2025000))&key=AIzaSyCuYOWxwU8zbT5oBvHKOAgRYE08Ouoy5Us";
            if (that.collection.meta("currentQuery")){
              $.getJSON(that.model.get("fusion_table_query_url")+
                "SELECT tree_id,lat,lng FROM "+that.model.get("fusion_table_id")+" WHERE "+that.collection.meta("currentQuery")+
                +that.model.get("fusion_table_key")
                ).success(function(result){
                  _.each(result.rows,function(coord){
                    var point = new google.maps.LatLng(coord[1],coord[2]);
                    if(polygon.Contains(point)) {
                      points.push(coord[0]);
                    }
                  });
                  _.each(points,function(point){
                    $("#data_table").dataTable().fnAddData([
                    point,
                    '',
                    '',
                    '',
                  ]);
                  // console.log(points);

                  });
              });
            }
            // google.maps.event.addListener(that.map,'click',function(){
            //   console.log(polygon);
            //   polygon.setMap(null);
            // });
          });

        },
         

        initMap: function() {
          this.map =  new google.maps.Map(this.el, this.mapOptions);
        },

        initLayers: function() {
          //new layers:
          //ameriflux: 1Z_m0uQ3EGpzwVLFq0EwoZ2jwmzdFev4YSN-U8NQ
          //try_db: 1h-KVbQdplul76b2dmVP33E7tEtt3oag44Oeu3oA
          //sts_is: 1lgtcA2ya1n7-3SiF20HNpT0olf00r-UJom9jvkI
          //tgdr: 14bPuIDSr745vX0YjjM4LUr_6eFV45pbbaiKxs98
          // this.tgdrLayer = new google.maps.FusionTablesLayer({
          //   query: {
          //     select: "lat",
          //     from: "14bPuIDSr745vX0YjjM4LUr_6eFV45pbbaiKxs98"
          //   }, 
          //   map: this.map,
          //   styleId: 2,
          //   templateId: 2,
          //   suppressInfoWindows: true
          // });
          // this.sts_isLayer = new google.maps.FusionTablesLayer({
          //   query: {
          //     select: "lat",
          //     from: "1lgtcA2ya1n7-3SiF20HNpT0olf00r-UJom9jvkI"
          //   }, 
          //   map: this.map,
          //   styleId: 2,
          //   templateId: 2,
          //   suppressInfoWindows: true
          // });
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
           this.trydbLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: "1h-KVbQdplul76b2dmVP33E7tEtt3oag44Oeu3oA",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          this.amerifluxLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: "1Z_m0uQ3EGpzwVLFq0EwoZ2jwmzdFev4YSN-U8NQ",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
        },

        initialize: function(){
          var that = this;
          this.initMap();
          this.initLayers();
          this.initInfoWindows();
          this.initDrawingManager();
          this.collection.on('add remove reset',this.refreshMarkersLayer,this);
          google.maps.event.addListener(this.map, 'click', function(){
            $('#data_table').dataTable().fnClearTable();
            if(that.polygon){
              // console.log(that.polygon);
              that.polygon.setMap(null);
            }
          });
        },

        getColumn: function(column){
          return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        },

        genQuery: function(studies,taxa,years,families,genuses,species,accessions,filters){
          var studiesQuery = "";
          var taxaQuery = "";
          var yearsQuery = "";
          var familiesQuery = "";
          var genusesQuery = "";
          var speciesQuery = "";
          var accessionsQuery = "";
          var sequencedQuery = "";
          var genotypedQuery = "";
          var phenotypedQuery = "";
          var gpsQuery = "";
          if (studies.length > 0 ){
            studiesQuery = "data_source = 'tgdr'";
          }
          if (taxa.length > 0){
            taxaQuery = "data_source IN ('is','sts')";
          }
          if (years.length > 0){
            yearsQuery = "'year' IN ('"+years.join("','")+"')";
          }
          if (families.length > 0){
            familiesQuery = "'family' IN ('"+families.join("','")+"')";
          }
          if (genuses.length > 0){
            genusesQuery = "'genus' IN ('"+genuses.join("','")+"')";
          }
          if (species.length > 0){
            speciesQuery = "'species' IN ('"+species.join("','")+"')";
          }
          if (accessions.length > 0){ // uncomment when fusion table is fixed
            accessionsQuery = "'accession' IN ('"+accessions.join("','")+"')";
          }
          if (filters.indexOf("sequenced") != -1) {
            sequencedQuery = "'sequenced' NOT EQUAL TO 'No'";
          }
          if (filters.indexOf("genotyped") != -1) {
            genotypedQuery = "'genotyped' NOT EQUAL TO 'No'";
          }
          if (filters.indexOf("phenotyped") != -1) {
            phenotypedQuery = "'phenotype' NOT EQUAL TO ''";
          }
          if (filters.indexOf("exact_gps") != -1) {
            if (gpsQuery == ""){
              gpsQuery = "'gps' = 'exact'";
            }
            else {
              gpsQuery = "'gps' IN ('exact','estimate')";
            }
          }
          if (filters.indexOf("approx_gps") != -1) {
            if (gpsQuery == ""){
              gpsQuery = "'gps' = 'estimate'";
            }
            else {
              gpsQuery = "'gps' IN ('exact','estimate')";
            }
          }
                              
          return _.filter([
            studiesQuery,
            taxaQuery,
            yearsQuery,
            familiesQuery,
            genusesQuery,
            speciesQuery,
            accessionsQuery,
            sequencedQuery,
            genotypedQuery,
            phenotypedQuery,
            gpsQuery],function(string){ return string != ""}).join(' AND ');          
        },

        allOn: function(){
          this.markersLayer.setOptions({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id"), 

            }
          });
          // console.log('allOn');
          this.phenotypesOn();
          this.environmentalOn();
        },
        allOff: function(){
          this.markersLayer.setOptions({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id"), 
              where: "species = ''"
            }
          });
          // this.phenotypesOff();
          // this.environmentalOff();
          // console.log('allOff');
        },
        phenotypesOn: function(){
          this.trydbLayer.setOptions({
            query: {
              select: "lat",
              from: "1spNwsogd3q7p04Dt26mSAbM6owaPIeFnKBrRM00",
            }, 
           });
          // console.log('phenotypesOn');
        },
        phenotypesOff: function(){
          this.trydbLayer.setOptions({
            query: {
              select: "lat",
              from: "1spNwsogd3q7p04Dt26mSAbM6owaPIeFnKBrRM00",
              where: "id = ''",
            }, 
           });
          // console.log('phenotypesOff');
        },
        environmentalOn: function(){
          this.amerifluxLayer.setOptions({
            query: {
              select: "lat",
              from: "1xr5d5jXjzWZtDxoIOOwXhMQ5yg8_9wn050FkJf0"
            }, 
          });
          // console.log('environmentalOn');
        },
        environmentalOff: function(){
          this.amerifluxLayer.setOptions({
            query: {
              select: "lat",
              from: "1xr5d5jXjzWZtDxoIOOwXhMQ5yg8_9wn050FkJf0",
              where: "site_id = ''"
            }, 
          });
          // console.log('environmentalOff');
        },

        toggleEnvironmentAndPhenotypes:function(environmental,phenotypes,ameriflux,try_db){
           if (environmental.length > 0 || ameriflux.length > 0){// may change if we get more than ameriflux sites
                this.environmentalOn();
              }
              else {
                this.environmentalOff();
              }
              if (phenotypes.length > 0 || try_db.length > 0){
                this.phenotypesOn();
              }
              else {
                this.phenotypesOff();
              }
        },

        refreshMarkersLayer: function(){
          var all = this.getColumn("all");
          var environmental = this.getColumn("environmental");
          var phenotypes = this.getColumn("phenotypes");
          var ameriflux = this.getColumn("ameriflux");
          var try_db = this.getColumn("try_db");
          var studies = this.getColumn("studies");
          var taxa = this.getColumn("taxa");
          var years = this.getColumn("year");
          var families = this.getColumn("family");
          var genuses = this.getColumn("genus");
          var species = this.getColumn("species");
          var filters = this.collection.pluck("filter");
          var accessions = this.getColumn("accession"); // uncomment when fusion table is fixed
          var whereClause = this.genQuery(studies,taxa,years,families,genuses,species,accessions,filters);
          
          if (!whereClause){//essentially nothing is selected
            if (all.length > 0){
              this.allOn();
              this.collection.add({
                id: "1",
                column: "all",
                value: "all"
              });   

            }
            else {
              this.collection.remove("1");
              this.allOff();
              this.toggleEnvironmentAndPhenotypes(environmental,phenotypes,ameriflux,try_db);
            }
          }
          else {
            this.collection.meta("currentQuery",whereClause);        
            this.markersLayer.setOptions({
              query: {
                select: "lat",
                from: this.model.get("fusion_table_id"), 
                where: whereClause
              }
            });
            this.toggleEnvironmentAndPhenotypes(environmental,phenotypes,ameriflux,try_db);
          }
         
        },

        render: function(){
          return this;
    	   }
      });
    	return MapView;
  });
