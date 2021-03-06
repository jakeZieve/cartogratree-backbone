<?php
function ae_detect_ie()
{
        if (isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
                return true;
        else 
                return false;
}

if(ae_detect_ie()) {
        print "Currently, the CartograTree Interface is not compatible with Microsft Internet Explorer but will be shortly.<br>In the meantime, please switch to a standard-complaint brower, like <a href=\"http://www.mozilla.com/firefox/\">Mozilla Firefox</a> or <a href=\"http://www.google.com/chrome\">Google Chrome</a>.<br>-TreeGenes Team";
        exit;
}  
?>

<!--

Author: Jacob Zieve <jjzieve@ucdavis.edu>
Author:  Hans Vasquez-Gross <havasquez-gross@ucdavis.edu>
CartograTree map interface with Google Map API as base

Version: 3.0.0
Released: 
Updated: 

-->
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no"/> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<link type="text/css" href="css/bootstrap.css"  rel="stylesheet"/>
<link type="text/css" href="css/slick.grid.css"  rel="stylesheet"/>
<link type="text/css" href="css/example-bootstrap.css"  rel="stylesheet"/>
<link type="text/css" href="css/bootstrap-switch.css"  rel="stylesheet"/>
<link type="text/css" href="css/tablecloth.css"  rel="stylesheet"/>
<link type="text/css" href="css/jquery.treetable.css"  rel="stylesheet"/>
<link type="text/css" href="css/jquery.treetable.theme.default.css" rel="stylesheet"/>
<link type="text/css" href="js/libs/jquery/select2-3.4.5/select2.css" rel="stylesheet"/> <!-- too lazy to move from js dir :p -->
<link type="text/css" href="js/libs/jquery/select2-3.4.5/select2-bootstrap.css" rel="stylesheet"/>
<link type="text/css" href="css/style.css"  rel="stylesheet"/>
<link rel="shortcut icon" href="images/favicon.ico?" type="image/x-icon"><!-- "?" is a hack for FF -->
<script data-main="js/main" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.8/require.min.js"></script>

<title>CartograTree</title>
</head>

<body>
    <!--MAIN-->
	<div class="container">
		<!--NAVBAR/HEADER-->
		<div id="navbar" class="row">
			<div class="col-xs-4">
				<a href="#"><img class="img-responsive" id="ctree_logo" src="images/logo_cartogratree_v2.png"></a>
			</div>
			<div class="col-xs-7 col-xs-offset-1">
				<ul class="nav nav-pills navbar">
					<li><a target="_blank" href="about.html">About</a></li>
					<li><a target="_blank" href="http://dendrome.ucdavis.edu/treegenes/" >TreeGenes</a></li>
					<li><a target="_blank" href="http://dendrome.ucdavis.edu/DiversiTree/">DiversiTree</a></li>
					<li><a target="_blank" href="https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#cartogratree-3">Documentation</a></li>
					<li><a target="_blank" href="mailto:tg-help.ucdavis.edu">Contact</a>
					<li><a target="_blank" id="credits" data-toggle="popover" data-placement="bottom" title="Credits" href="#">Credits</a></li>
				</ul>
			</div>
		</div>
		<div class="row">
			<!--SIDE BAR/DATA PANE-->
			<div id="sidebar" class="col-xs-4">
				<div id="sidebar_selection" class="well well-sm">
					<div id="select_tree_header">
						<h4>Map Display</h4>
					<div id="tree_id_search_container">
						<div id="tree_id_search"></div>
					</div>
					<span id="display_description">
						Ctrl+Click or Cmd+Click for multiple selections
					</span>
					</div>
					<div class="filler"></div>
					<div class="filler"></div>
					<div id="selection_tree_container">
						<table id="selection_tree">
							<tr data-tt-id="1" class="root">
								<td name="all" value="all">All</td>
							<tr data-tt-id="1-1" data-tt-parent-id="1">
								<td name="studies" value="studies">Published Studies</td>
							</tr>
							<tr data-tt-id="1-2" data-tt-parent-id="1">
								<td name="taxa" value="taxa">Taxa</td>
							</tr>
							<tr data-tt-id="1-3" data-tt-parent-id="1">
								<td name="environmental" value="environmental">Environmental</td>
							</tr>
							<tr data-tt-id="1-3-0" data-tt-parent-id="1-3">
								<td name="ameriflux" value="ameriflux"><img class="inline_image" src="images/ranger_station.png"> Ameriflux</td>
							</tr>
							<tr data-tt-id="1-4" data-tt-parent-id="1">
								<td name="phenotypes" value="phenotypes">Phenotypes</td>
							</tr>
							<tr data-tt-id="1-4-0" data-tt-parent-id="1-4">
								<td name="try_db" value="try_db"><img class="inline_image" src="images/measle_brown.png">TRY-DB</td>
							</tr>
						</table>
					</div>
				</div>
				
				<div id="filters" class="well well-sm">
					<div id="filter_header">
						<h4>Filter Map Display</h4>
					</div>
					<div class="filler2"></div>
					<!-- should load with templates -->
					<div class="checkbox">
					    <label>
					      <input type="checkbox" id="sequenced" value="Sequenced">Sequenced (<span id="sequenced_count">0</span>)
					    </label>
					    <span id="sequenced_qmark" data-original-title="Sequenced samples" data-content="These tree samples have had some amount of sequencing performed on them but not necessarily genotyped" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>				
					</div>
					<div class="checkbox">
					    <label>
					      <input type="checkbox" id="genotyped" value="Genotyped">Genotyped (<span id="genotyped_count">0</span>)	      
					    </label>
					    <span id="genotyped_qmark" data-original-title="Genotyped samples" data-content="These tree samples have been genotyped by SNPs and/or other genetic markers" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>	
					</div>
					<div class="checkbox">
					    <label>
					      <input type="checkbox" id="phenotyped" value="Phenotyped">Phenotyped (<span id="phenotyped_count">0</span>)					      
					    </label>
					    <span id="phenotyped_qmark" data-original-title="Phenotyped samples" data-content="These tree samples have had phenotypes assessed for them" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>	
					</div>
					<b>GPS Resolution</b>
					<br>
					<div class="checkbox gps">
					    <label>
					      <input type="checkbox" id="exact_gps" value="Exact GPS"><img class="inline_image" src="images/small_green.png">Exact (<span id="exact_gps_count">0</span>)			      
					    </label>
					    <span id="exact_gps_qmark" data-original-title="Exact GPS samples" data-content="Sites with specific and well-defined latitude and longitude coordinates" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>		
					</div>
					<div class="checkbox gps">
					    <label>
					      <input type="checkbox" id="approx_gps" value="Approximate GPS"><img class="inline_image" src="images/small_yellow.png">Approximate (<span id="approx_gps_count">0</span>)					      
					    </label>
					    <span id="approx_gps_qmark" data-original-title="Approximate GPS samples" data-content="Sites with estimated coordinates which may be as broadly defined as the region or county" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>	
					</div>
				</div>

			</div>
			<!--MAP-->
			<div class="col-xs-8">
				<div id="map_canvas"></div>
					<div id="toggle_heatmap">
						<a id="heatmap_tooltip" href="#" data-toggle="tooltip">
						<img src="images/heatmap.jpg">
						</a>
					</div>
					<div id="layers">
						<button id="layers_button" type="button" data-toggle="dropdown"><span id="layers_title">Select ArcGIS layer</span> <span class="caret"></span></button>
						<ul class="dropdown-menu pull-right">
						    <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);">Select ArcGIS layer</a></li>
						    <li role="presentation"><a value="http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">Soil Survey</a></li>
						    <li role="presentation"><a value="http://maps3.arcgisonline.com/ArcGIS/rest/services/A-16/K%C3%B6ppen-Geiger_Observed_and_Predicted_Climate_Shifts/MapServer"role="menuitem" tabindex="-1" href="javascript:void(0);">Koppen-Geiger Climate Shifts</a></li>
						    <li role="presentation"><a value="http://maps1.arcgisonline.com/ArcGIS/rest/services/USGS_Forest_Fragmentation/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">USGS Forest Fragmentation</a></li>
						    <li role="presentation"><a value="http://maps1.arcgisonline.com/ArcGIS/rest/services/FIA_Woody_Biomass/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">FIA Woody Biomass</a></li>
						    <li role="presentation"><a value="http://maps1.arcgisonline.com/ArcGIS/rest/services/RMRS_Wildland_Fire_Potential/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">US Wildland Fire Potential</a></li>
						    <li role="presentation"><a value="http://maps1.arcgisonline.com/ArcGIS/rest/services/USGS_Earthquake_Faults/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">USGS Earthquake Faults</a></li>
						    <li role="presentation"><a value="http://maps1.arcgisonline.com/ArcGIS/rest/services/NASS_Croplands_2009/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">NASS Croplands 2009</a></li>
						    <li role="presentation"><a value="http://maps1.arcgisonline.com/ArcGIS/rest/services/EPA_Toxic_Release_Inventory_2010/MapServer" role="menuitem" tabindex="-1" href="javascript:void(0);">EPA Toxic Release Inventory 2010</a></li>
						</ul>
					</div>
					<div id="legend" style="display:none;"></div>
						
						
			</div>

		</div>
			<!--ANALYSIS PANE-->
		<div id= "analysis_pane" class="row">
			<div class="col-xs-12">
				<div id="tabs_container" class="well well-sm">
					<h4>Analyze the data</h4>
					<div class="analysis_pills_container">
					    <ul class="nav nav-pills analysis_pills">
					        <li class="active" ><a data-toggle="pill" href="#map_selection_pill">Map selection</a>
					        </li>
					    </ul>
					</div>
					<div id="analysis_pills_content" class="tab-content">
						<div class="tab-pane fade active in" id="map_selection_pill">
							<div id="tools" class="btn-group pull-right">
								<button class="btn btn-default" type="button" data-toggle="dropdown"><span id="tools_title">Tools</span> <span class="caret"></span></button>
								<ul id="tools_dropdown" class="dropdown-menu">
								    <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);">Tools</a></li>
								  	<li role="presentation"><a id="amplicon_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Find common amplicons</a></li>
								    <li role="presentation"><a id="diversitree_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Download tree ids</a></li>
								    <li role="presentation" class="divider"></li>
								    <li class="dropdown-header"><img src="images/sswapinfoicon.png"> sswap</li>
						    		<li role="presentation"><a id="tassel_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">TASSEL</a></li>
								</ul>
								<div class="btn-group">
						 			<button type="button" class="btn btn-default run_tool">Run tool on selected</button>		
						 		</div>
							</div>
							<div id="views" class="btn-group pull-right">
								<button class="btn btn-default" type="button" data-toggle="dropdown">View<span class="caret"></span></button>
								<ul id="view_dropdown" class="dropdown-menu">
									<li role="presentation"><a id="genotype_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Genotypes</a></li>
									<li role="presentation"><a id="phenotype_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Phenotypes</a></li>
								    <li role="presentation"><a id="worldclim_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Environmental data</a></li>
								</ul>
							</div>
							<ul class="nav nav-tabs" id="data_tabs"> <!--Diversitree, SSWAP, and TASSEL don't have tabs -->
								<li id="samples_tab">
									<a href="#samples" data-toggle="tab">Samples</a>
								</li>
							</ul>
							<div id="data_table_container" class="tab-content">
								<div class="tab-pane fade in" id="samples">
									<div class="button-wrapper">
										<div class="btn-group">
											<button class="btn btn-default" type="button" id="remove_samples">Remove selected samples</button>
											<button id="sswap_demo" type="button" style="color:white;"class="btn btn-success">Tassel demo data</button>
										</div>
									</div>
										<div id="clear_table" style="display: none;"></div> <!-- just used to remove rectangles from map -->
									<table id="data_table"> 
								    	<td valign="top" class="grid-col">
											<div id="sample_grid" class="grid"></div>
										</td>
									</table>
									Total samples selected: <span id="sample_count">0</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

	 <!--FOOTER-->
		<div class="row" id="footer">
			<p>
      			<a href="http://dendrome.ucdavis.edu/treegenes/" target=new>
					<img src="http://dendrome.ucdavis.edu/images/logo_treegenes.png">
				</a>
      			<a href="http://www.iplantcollaborative.org/" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/iplant_collab_logo.jpg">
				</a>
      			<a href="http://public.ornl.gov/ameriflux/index.html" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/amerifluxlogo.gif">
				</a>
		        <a href="http://try-db.org/pmwiki/index.php" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/try_logo.jpg">
				</a>
		        <a href="http://www.worldclim.org" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/worldclim_logo.png">
				</a>
      			</p>
      			<div id="version_num">v3.0.0</div>
		</div>		
	
	<div id="pipelineButton"></div><!--for sswap-->

</body>

</html>
