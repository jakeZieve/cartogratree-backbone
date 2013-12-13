//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/query',
	'models/tree_node',
	'collections/queries',
	'views/map',
	'views/sidebar_selection_tree',
	'views/sidebar_filters',
	'views/bottom_tabs',
	'views/bottom_table',
	], function($, _, Backbone, QueryModel, TreeNodeModel, QueriesCollection, MapView, SelectionTreeView, FiltersView, BottomTabsView, BottomTableView) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'(/)':'index',
				// 'about':'about',
				// 'contact':'contact'
			}
		});
	
		var initialize = function(){
			var appRouter = new AppRouter();
			
			appRouter.on('route:index', function(actions){
				var query = new QueryModel();
				var queries = new QueriesCollection();
 				var treeNode = new TreeNodeModel();
				var map = new MapView({collection: queries,model: query}); //get rid of generic endings "view,map"
				var selectionTree = new SelectionTreeView({collection: queries, model: treeNode});
				var filters = new FiltersView({collection: queries,model: query});
				var tabs = new BottomTabsView({collection: queries,model: query});
				var table = new BottomTableView({collection: queries,model: query});
			});
			
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
