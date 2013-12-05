//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable',
  'models/map',
  // 'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, MapModel,stickyScroll){//MapModel){
		var SelectionTreeView = Backbone.View.extend({
			el: "#selection_tree",

			loadBranch: function(data,node_num,index){ //need to add type genus, year, species, accession,etc.
				var that = this;
				if( (typeof data) != "object"){//base case
					var parent_node = that.$el.treetable("node", node_num);
					var new_node_num = node_num+'-'+index
					that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="'+node_num+'" data-tt-id="'+new_node_num+'"><td>'+data+'</td></tr>');
					that.$el.treetable("collapseNode",node_num);
				}
				else{
					index = 0;
					$.each(data,function(value,object){
						if( (typeof object) != "object"){
							that.loadBranch(object,node_num,index++);//throw to base case
						}
						else{
							var parent_node = that.$el.treetable("node", node_num);
							var new_node_num = node_num+'-'+index
							that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="'+node_num+'" data-tt-id="'+new_node_num+'"><td>'+value+'</td></tr>');
							that.loadBranch(object,new_node_num,index++);//recurse
						}
					});
					that.$el.treetable("collapseNode",node_num);
				}
			},
    			

			initialize: function(){
				var that = this;
				this.$el.treetable({expandable:true});

				$.getJSON('data/studies.JSON',
					function(data){
						that.loadBranch(data,"1");
					}
				);
				$.getJSON('data/taxa.JSON',
					function(data){
						that.loadBranch(data,"2");
					}
				);				

			},

			events: {
			    "click": "toggleSelection",
			},

  			toggleSelection: function(event){
  				$(event.target).toggleClass('selected');
  				this.model.toggleSelection(event);
  			},

			render: function(){
				return this
			}
	});
  return SelectionTreeView;
  // What we return here will be used by other modules
});
