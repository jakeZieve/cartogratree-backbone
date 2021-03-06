//Filename: data_table.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  'models/query',
  'collections/queries',
  'collections/tree_ids',
  'jquery_migrate',
  'jquery_drag',
  'jquery_core',
  'jquery_widget',
  'jquery_mouse',
  'jquery_resizable',
  'jquery_sortable',
  'slick_core',
  'slick_grid',
  'slick_dataview',
  'slick_checkbox',
  'slick_selection',
  'bootstrap'
 ], function($, _, Backbone, QueryModel, QueriesCollection, TreeIDCollection){
	var WorldClimView = Backbone.View.extend({
		el: '#data_table_container',
    type: "worldclim", //workaround to get mixin listenTo functions to get called with no arguments
    model: QueryModel,
    collection: QueriesCollection,

    initColumns: function(){
      this.columns = [
        {id: "id", name: "ID", field: "id",width: 75, sortable:true},
        {id: "mat", name: "Annual Mean Temperature [°C]", field:"mat",width:225,sortable:true},
        {id: "tar", name: "Temperature Annual Range [°C]", field:"tar",width:230,sortable:true},
        {id: "maxtwm", name: "Max Temperature of Warmest Month [°C]", field:"maxtwm",width:300,sortable:true},
        {id: "anntmin", name: "Min Temperature of Coldest Month [°C]", field:"anntmin",width:300,sortable:true},
        {id: "meantdq", name: "Mean Temperature of Driest Quarter [°C]", field:"meantdq",width:300,sortable:true},
        {id: "meantwq", name: "Mean Temperature of Wettest Quarter [°C]", field:"meantwq",width:300,sortable:true},
        {id: "meantwaq", name: "Mean Temperature of Warmest Quarter [°C]", field:"meantwaq",width:310,sortable:true},
        {id: "meantcq", name: "Mean Temperature of Coldest Quarter [°C]", field:"meantcq",width:300,sortable:true},
        {id: "tsd", name: "Temperature Seasonality [CV]", field:"tsd",width:225,sortable:true},
        {id: "mdr", name: "Mean Diurnal Range [°C]", field:"mdr",width:225,sortable:true},
        {id: "iso", name: "Isothermality [°C]", field:"iso",width:150,sortable:true},
        {id: "annprec", name: "Annual Precipitation [mm]", field:"annprec",width:225,sortable:true},
        {id: "precwm", name: "Precipitation of Wettest Month [mm]", field:"precwm",width:275,sortable:true},
        {id: "precdm", name: "Precipitation of Driest Month [mm]", field:"precdm",width:275,sortable:true},
        {id: "precwq", name: "Precipitation of Wettest Quarter [mm]", field:"precwq",width:275,sortable:true},
        {id: "precdq", name: "Precipitation of Driest Quarter [mm]", field:"precdq",width:275,sortable:true},
        {id: "precwarmq", name: "Precipitation of Warmest Quarter [mm]", field: "precwarmq",width:280,sortable:true},
        {id: "preccq", name: "Precipitation of Coldest Quarter [mm]", field:"preccq",width:275,sortable:true},
        {id: "precs", name: "Precipitation Seasonality [CV]", field:"precs",width:250,sortable:true}
      ]
      this.checkboxSelector = new Slick.CheckboxSelectColumn({});
      this.columns.unshift(this.checkboxSelector.getColumnDefinition());
    },

    getCleanedIDs: function(){
      var cleaned = _.map(_.pluck(this.data,"id"),function(id){
        return id.substr(0,id.indexOf('.'))
      });
      return cleaned;
    },

    updateSlickGrid: function(){
      console.log('update worldclim');
      console.log(this.grid);
      var that = this;
      var ids = this.collection.pluck("id").join(","); 
      var lats = this.collection.pluck("lat").join(","); 
      var lngs = this.collection.pluck("lng").join(",");
      console.log(ids);
      console.log(lats);
      console.log(lngs);
      if(typeof(this.grid) === "undefined"){ // first instantiation
        this.initColumns();
        this.initGrid();
        this.listenToSelectedRows(); 
      }

      this.setLoaderIcon();
      $.ajax({
        url : 'GetWorldClimData.php',
        dataType: "json",
        data: {
          "tid":ids,
          "lat":lats,
          "lon":lngs},

        success: function (response) {
          that.unsetLoaderIcon();
          if(response === null){
            $("#message_display_worldclim").text('No environmental data found.');
            return false;
          }
          var prev_ids = _.pluck(that.data,"id");
          var filtered = _.filter(response,function(row){// checks for overlapping markers
            return prev_ids.indexOf(row["id"]) === -1;
          });
          that.data = that.data.concat(filtered);

          that.gridFunctions();
          // DEBUG
          //console.log("Total samples: "+that.grid.getDataLength());
        },
        error: function(response){
          $("#message_display_worldclim").text('Query error, please contact the admin.');
          that.unsetLoaderIcon();
        }
      });
    },

	initialize: function(options){
    this.listenTo(this.collection,"done",this.pollForOpenTab);
    this.listenTo(this.collection,"close_worldclim_tab", this.deleteGrid);
},

  events:{
    "click #remove_worldclim": "removeSelected",
  }

	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return WorldClimView;
  // What we return here will be used by other modules
});

