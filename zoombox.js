/* ------------------------------------------------------------------------
	Class: zoombox
	Author: Jonathan Boyer (http://www.grafikart.fr)
	Version: 1.1
------------------------------------------------------------------------- */
zoombox = {
	/***************************************
	 *
	 *     	CONFIGURATION
	 * 
	 * **********************************/
	Dwidth : 		640, 		// Default width
	Dheight: 		480,		// Default height
	duration:		750,		// Animation duration (ms)
	animation:		"all",		// Do we animate the size of the box ?  (all : animation everytime, img: animation only on link with an img, no : no size animation)
	maskOpacity:	0.4,		// Opacity of the black overlay,
	FLVPlayer:		"/js/zoombox/FLVplayer.swf",   // URL of the FLV Player
	MP3Player:	"/js/zoombox/MP3player.swf",  // URL of the MP3 Player
	allowOverflow:	false,	// Automatically adjust width/height of the box if the content is larger than the window
	bindable:		"a[rel^='zoombox']",  // (jQuery expression) elements which have the zoombox behaviour
	theme:		"default", 			// Define the theme to use
	fixed:		false,			// Do we fix the box ? => when we scroll the box follow the window or not ?

	/**
	 * You can define here your own custom structure to create a new look for the box (\ at the end of lines are used to make multiline string)
	 *	IMPORTANT ELEMENTS
	 *	#zoombox			=> Needed to select all the box elements (don't delete !)
	 *	.zoombox_close 	=> A Click on these elements will close the box
	 *	#zoombox_aplat	=> The black overlay
	 *	#zoombox_content	=> The content will be placed here
	 *	#zoombox_title span		=> Title of the link will be displayed here
	 *	#zoombox_next, zoombox_prev => Clickable button used to navigate in the galery
	 * */
	themes:{
		"default" :	 '\
			<div id="zoombox"> \
				<div id="zoombox_aplat" class="zoombox_close"></div>\
				<div id="zoombox_contener">\
					<div id="zoombox_relative">\
						<div id="zoombox_close" class="zoombox_close"></div>\
						<div id="zoombox_content"></div>\
						<div id="zoombox_bg"><div class="zoombox_bg_h"></div><div class="zoombox_bg_b"></div><div class="zoombox_bg_d"></div><div class="zoombox_bg_g"></div><div class="zoombox_bg_bg"></div><div class="zoombox_bg_bd"></div><div class="zoombox_bg_hg"></div><div class="zoombox_bg_hd"></div></div>\
						<div id="zoombox_nav">\
							<table>\
								<tr>\
									<td width="39"><div id="zoombox_prev"></div></td>\
									<td><div id="zoombox_title"><span></span></div></td>\
									<td width="39"><div id="zoombox_next"></div></td>\
								</tr>\
							</table>\
						</div>\
					</div>\
				</div>\
			</div>\
			',
		// A theme that imitate the lightbox design
		"lightbox" :	 '\
			<div id="zoombox" class="lightbox"> \
				<div id="zoombox_aplat" class="zoombox_close"></div>\
				<div id="zoombox_contener">\
					<div id="zoombox_relative">\
						<div id="zoombox_content"></div>\
						<div id="zoombox_bg"><div class="zoombox_bg_h"></div><div class="zoombox_bg_b"></div><div class="zoombox_bg_d"></div><div class="zoombox_bg_g"></div><div class="zoombox_bg_bg"></div><div class="zoombox_bg_bd"></div><div class="zoombox_bg_hg"></div><div class="zoombox_bg_hd"></div></div>\
						<div id="zoombox_infos"><div id="zoombox_title"><span></span></div></div>\
						<div id="zoombox_close" class="zoombox_close"></div>\
						<div id="zoombox_next"></div><div id="zoombox_prev"></div>\
					</div>\
				</div>\
			</div>\
			'
	},


	/***************************************
	 *
	 *     	VARIABLES
	 * 
	 * **********************************/
	// Needed variable and their explanation
	inCSS:		null, 			// Initial CSS propertires
	
	width:		0,
	height:		0,
	state:          'close',
	url:			null,			// Url loaded in the box
	title:			null,			// Title of the link
	type:		"multimedia",	// Keep the type of media loaded in the box
	animateOpening: false,		// Do we use animation for opening/closing the box ?
	timer:		null,			// Timer to load an img
	loaded:		false,		// Is the image loaded ?
	gallery:		"",			// Gallery of the current element
	position:		0,			// Current position in the gallery
	margesH:		null,			// Horizontal marges of contener
	margesV:		null,			// Vertical marges of contener
	working:	true,
	
	// Regular expressions needed for the content
	filtreImg:			/(\.jpg)|(\.jpeg)|(\.bmp)|(\.gif)|(\.png)/i,
	filtreMP3:			/(\.mp3)/i,
	filtreFLV:			/(\.flv)/i,
	filtreSWF:			/(\.swf)/i,
	filtreQuicktime:	/(\.mov)|(\.mp4)/i,
	filtreWMV:			/(\.wmv)|(\.avi)/i,
	filtreDailymotion:	/(http:\/\/www.dailymotion)|(http:\/\/dailymotion)/i,
	filtreVimeo:		/(http:\/\/www.vimeo)|(http:\/\/vimeo)/i,
	filtreYoutube:		/(youtube\.)/i,
	filtreKoreus:		/(http:\/\/www\.koreus)|(http:\/\/koreus)/i,
	filtreDeezer:		/(http:\/\/www\.deezer)|(http:\/\/deezer)/i,
	
	galleryRegExp:  /\[(?:.*)\]/,
	
	
	/***************************************
	 *
	 *     	FUNCTIONS
	 * 
	 * **********************************/
	/**
	 * Init the box binding "click" on every links with rel="zoombox and doing some cool stuff
	 * */
	init : function(){
		$(zoombox.bindable).each(function(){
			$(this).unbind('click');
		});
		zoombox.images = new Array();	  // Array used to stock the "gallery"
		$(zoombox.bindable).each(function(){
			var gallery = zoombox.galleryRegExp.exec($(this).attr("rel"));
			if(!zoombox.images[gallery]){
				zoombox.images[gallery]=new Array();
			}
			zoombox.images[gallery].push($(this));
			
			//We bind click on every elements
			$(this).bind('click',function(){
				zoombox.click($(this));
				return false;
			});
		});
		// We unbind everything before avoiding bind x2
		$(window).unbind('resize',zoombox.resize);
		$(window).unbind('scroll',zoombox.resize);
		$(document).unbind('keyup',zoombox.keyboard);
		$(window).resize(zoombox.resize);
		$(window).scroll(zoombox.resize);
		$(document).keyup(zoombox.keyboard);
	},
	
	/**
	 * Function called when we click one an element OR when we use next or before
	 * */
	click : function(div){
                if(zoombox.state == 'open'){ return false; }
		zoombox.gallery=zoombox.galleryRegExp.exec(div.attr("rel"));	// The current Gallery
		// The position of the image in the current Gallery
		for (var i = 0; i < zoombox.images[zoombox.gallery].length; i++){
			if($(zoombox.images[zoombox.gallery][i]).html()  == div.html() && $(zoombox.images[zoombox.gallery][i]).attr("href") == div.attr("href") ){
				zoombox.position=i;
				break;
			}
		}
		zoombox.animateOpening=false;
		
		// We adjust the size and position of the box to fit with the current element if animation is needed
		if(zoombox.animation=="all"){
			zoombox.animateOpening=true;
			zoombox.inCSS = {
				"top" :	 div.offset().top,
				"left" :	div.offset().left,
				"width":	div.width(),
				"height":   div.height()
			}
		}
		if(div.children("img").length && (zoombox.animation=="all" || zoombox.animation=="img")){
			zoombox.inCSS = {
				"top" :	 div.children("img").offset().top,
				"left" :	div.children("img").offset().left,
				"width":	div.children("img").width(),
				"height":   div.children("img").height()
			}
			zoombox.animateOpening=true;
		}
						
		// We keep important informations
		zoombox.url=div.attr("href");			// We keep the url
		zoombox.title=div.attr("title");			// We keep the title
		dimensions =div.attr("rel").split(' ');		// We parse the rel attr to get the size of the box
		if((dimensions[1])&&(dimensions[2]) && parseInt(dimensions[1])>0  && parseInt(dimensions[2])>0 ){ zoombox.width = parseInt(dimensions[1]); zoombox.height =  parseInt(dimensions[2]);}
		else{zoombox.width=zoombox.Dwidth; zoombox.height=zoombox.Dheight;}
				
		zoombox.open();
		return false;
	},
	
	/**
	 * Open the box, this function could be called with javascript if you want to open a box with a specific action.
	 * @param url The link that you want to open in the box
	 * @param width (optional) Width of the box
	 * @param height (optional) Height of the box
	 * */
	open : function(url,width,height){
                zoombox.state = 'open';
		zoombox.working = true;
		// Do we use the function alone ?
		if(url!=undefined){
			zoombox.url=url;
			if(width==undefined){	zoombox.width=zoombox.Dwidth;	}	else{	zoombox.width=width;	}
			if(height==undefined){	zoombox.height=zoombox.Dheight;	}	else{	zoombox.height=height;	}	
			zoombox.animateOpening=false;
			zoombox.title = null;
		}
		// if the content is an img
		if(zoombox.filtreImg.test(zoombox.url) && zoombox.loaded==false){
		    img=new Image();
			img.src=zoombox.url;
			zoombox.type="img";
			$("body").append('<div id="zoombox_loader"></div>');
			$("#zoombox_loader").css("marginTop",zoombox.scrollY());
			zoombox.timer = window.setInterval("zoombox.loadImg(img)",100);
			return false;
		}
		zoombox.loaded=false;
		
		// Let's begin !!
		// If there isn't already a zoombox opened
		if(!$("#zoombox").length){
			$("body").append(zoombox.themes[zoombox.theme]);	// We create the zoombox structure
			// We place the overlay
			$("#zoombox_aplat").css({
				"height":zoombox.windowH(),
				"width":zoombox.windowW()
			});
			// we find the width/height of the marges
			if(zoombox.margesH==null){ zoombox.margesH = parseInt($("#zoombox_contener").css("paddingLeft")) + parseInt($("#zoombox_contener").css("paddingRight")) + parseInt($("#zoombox_contener").css("marginLeft")) + parseInt($("#zoombox_contener").css("marginRight")); }
			if(zoombox.margesV==null){ zoombox.margesV = parseInt($("#zoombox_contener").css("paddingTop")) + parseInt($("#zoombox_contener").css("paddingBottom")) + parseInt($("#zoombox_contener").css("marginTop")) + parseInt($("#zoombox_contener").css("marginBottom")); }
			
			$("#zoombox_next").hide();				// We hide some elements, we'll display them later if ther are needed
			$("#zoombox_prev").hide();
			$("#zoombox_title").hide();
			$(".zoombox_close").click(zoombox.close);		// We bind the "close" event
			$("#zoombox_next").click(zoombox.next);		// We bind the "next" event
			$("#zoombox_prev").click(zoombox.prev);		// We bind the "next" event
			$("embed").css("visibility","hidden"); 			// embed and object elements can generate overflow problem so we hide them
			$("object").css("visibility","hidden");
			if(zoombox.gallery){
				if(zoombox.position<zoombox.images[zoombox.gallery].length-1){
					$("#zoombox_next").show();
				}
				if(zoombox.position>0){
					$("#zoombox_prev").show();
				}
			}
			// We animate the black overlay
			$('#zoombox_aplat').css({'opacity': 0});
			$('#zoombox_aplat').fadeTo(zoombox.duration,zoombox.maskOpacity);
			// We adjust Two parameters that calculate the initial position of the box adding box margin
			if(zoombox.inCSS!=null){
				zoombox.inCSS.left-=parseInt($("#zoombox_contener").css("paddingLeft"))+parseInt($("#zoombox_contener").css("marginLeft"));
				zoombox.inCSS.top-=parseInt($("#zoombox_contener").css("paddingTop"))+parseInt($("#zoombox_contener").css("marginTop"));
			}
			var boxBeginCSS = zoombox.inCSS;
		}
		// If there is already a zoombox it's because we want a cool transition, so let's make some change.
		else{
			$("#zoombox_title span").empty();
			$("#zoombox_content").empty();				

			var boxBeginCSS = {
				"width":$("#zoombox_contener").css("width"),
				"height":$("#zoombox_contener").css("height"),
				"top":$("#zoombox_contener").css("top"),
				"left":$("#zoombox_contener").css("left")
			}
			var transition = true;
		}
		
		var content = zoombox.getContent(zoombox.url);					// What we want to insert
		if(zoombox.type=="img"){ $("#zoombox_content").append(content); }		// If it's an image we inset NOW
		if(transition){ $("#zoombox_content img").hide(); }					// If it's a transition (next or prev) we hide the image for a fadeIn
		if(zoombox.title && zoombox.title!="" && zoombox.title!=null){ $("#zoombox_title span").append(zoombox.title); $("#zoombox_title").show();   }  // Do we have a title ?
		else{ $("#zoombox_title").hide();	$("#zoombox_titlel").hide();	$("#zoombox_title").hide(); }// The box won't fit in the window
		if(zoombox.allowOverflow==false && (zoombox.height+120)>zoombox.windowH()){
			zoombox.width=zoombox.width*((zoombox.windowH()-120)/zoombox.height);
			zoombox.height=(zoombox.windowH()-120);
			var content = zoombox.getContent(zoombox.url);
		}
		
		// The new CSS for the box, final position
		var topPos = (zoombox.windowH() - zoombox.height - zoombox.margesV)/2 + zoombox.scrollY();
		var leftPos = (zoombox.windowW() - zoombox.width - zoombox.margesH)/2;

		var cssProp = {
			"width":zoombox.width,
			"height":zoombox.height,
			"top":topPos,
			"left":leftPos
		}

		//Do we want animation ? 
		if(zoombox.animateOpening==false && transition !=true){
			$("#zoombox_contener").css(cssProp);
			$('#zoombox_contener').hide();
			$('#zoombox_contener').show();
			$("#zoombox_content").empty().append(content);
			zoombox.working = false;
		}
		else{
			$("#zoombox_contener").css(boxBeginCSS);
			$("#zoombox_contener").animate(cssProp,zoombox.duration,function(){
				zoombox.working = false;
				if(zoombox.type=="img"){
					$("#zoombox_content img").fadeIn(zoombox.duration/2);
				}
				else{
					$("#zoombox_content").empty().append(content);
				}
			});
		}
	},
	
	/**
	 * Close the box
	 * */
	close : function(){
		window.clearInterval(zoombox.timer);
		// To avoid lags we remove the content before animation if it isn't an image
		if(zoombox.type!="img"){	$("#zoombox_content").empty();	}	
		if(zoombox.animateOpening==true){
			zoombox.inCSS.opacity = 0; 
			$("#zoombox_contener").animate(zoombox.inCSS,zoombox.duration);
		}
		else{
			$("#zoombox_contener").remove();
		}
		$("#zoombox_aplat").animate({"opacity":0},zoombox.duration,zoombox.remove);
                zoombox.state = 'close';
	},
	
	/**
	 * Destroy the zoombox structure
	 * */
	remove : function(){
		$("#zoombox").remove();
		$("#zoombox_loader").remove();
		$("embed").css("visibility","visible");  // embed and object elements can generate overflow problem so we hide them
		$("object").css("visibility","visible");
	},
	
	/**
	 *	When the window is resized we reposition the box
	 * */
	resize : function(){
		// The new CSS for the box, final position
		var topPos = (zoombox.windowH() - zoombox.height - zoombox.margesV)/2 + zoombox.scrollY();
		var leftPos = (zoombox.windowW() - zoombox.width - zoombox.margesH)/2;
		$("#zoombox_contener").css("left",leftPos);
		// We place the overlay
		$("#zoombox_aplat").css({
			"height":zoombox.windowH(),
			"width":zoombox.windowW()
		});
		// Do we fix the box ?
		if(zoombox.fixed){	$("#zoombox_contener").css("top",topPos);	}
	},
	
	/**
	 *   If we press some keys when zoombox is opened
	 *   */
	keyboard : function(event){
      		if(event.keyCode==39){
      			zoombox.next();
      		}
      		else if(event.keyCode==37){
      			zoombox.prev()
      		}
      		else if(event.keyCode==27){
      			zoombox.close();
		}
	},
	/**
	 * Go to the next element in the gallery
	 * */
	next : function(){
                if(zoombox.working) return false;
		if(zoombox.gallery!=null){
			zoombox.position++;
			if(zoombox.position==zoombox.images[zoombox.gallery].length-1){
				$("#zoombox_next").fadeOut();
			}
			if($("#zoombox_prev").is(":hidden")){
				$("#zoombox_prev").fadeIn();
			}
			zoombox.click(zoombox.images[zoombox.gallery][zoombox.position]);
		}
	},
	
	/**
	 * Go to the previous element in the gallery
	 * */
	prev : function(){
                if(zoombox.working) return false;
		if(zoombox.gallery!=null){
			zoombox.position--;
			if(zoombox.position==0){
				$("#zoombox_prev").fadeOut();
			}
			if($("#zoombox_next").is(":hidden")){
				$("#zoombox_next").fadeIn();
			}
			zoombox.click(zoombox.images[zoombox.gallery][zoombox.position]);
		}
	},

	/**
	 * Used with timer this function animate the loading of an image
	 * */
	loadImg : function(img){
			if(img.complete){
				window.clearInterval(zoombox.timer);
				zoombox.loaded=true;
				zoombox.width=img.width;
				zoombox.height=img.height;
				$('#zoombox_loader').remove();
				// There is already an img in the content, FADE OUT !!
				if($('#zoombox_content img').length){
					$('#zoombox_content img').fadeOut(zoombox.duration/2,function(){$('#zoombox_content').empty(); zoombox.open();})
				}
				else{
					$('#zoombox_content').empty();
					zoombox.open();
				}
			}	
			// On anim le loader
			if(typeof(j)=='undefined'){j=0;}
 			$('#zoombox_loader').css({'background-position': "0px "+j+"px"});
			j=j-40;
			if(j<(-440)){j=0;}
	},
	
	 /**
	 * Return the HTML content depending of the link
	 * */
	getContent : function(url){
			var content
			
			// Some regular expression to test the filetype
			zoombox.type="multimedia";
	
			if(zoombox.filtreImg.test(url)){
				content='<img src="'+img.src+'" width="100%" height="100%"/>';
				zoombox.type="img";
			}
			else if(zoombox.filtreMP3.test(url)){
				zoombox.width=300;
				zoombox.height=40;
				content ='<object type="application/x-shockwave-flash" data="'+zoombox.MP3Player+'?son='+url+'" width="'+zoombox.width+'" height="'+zoombox.height+'">';
				content+='<param name="movie" value="'+zoombox.MP3Player+'?son='+url+'" /></object>';
			}		
			
			else if(zoombox.filtreFLV.test(url)){
				content='<embed src="'+zoombox.FLVPlayer+'" width="'+zoombox.width+'" height="'+zoombox.height+'" allowscriptaccess="always" allowfullscreen="true" flashvars="file='+url+'&width='+zoombox.width+'&height='+zoombox.height+'&autostart=true" wmode="transparent" />';			
			}
			
			else if(zoombox.filtreSWF.test(url)){
				content='<object width="'+zoombox.width+'" height="'+zoombox.height+'"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="'+url+'" /><embed src="'+url+'" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="'+zoombox.width+'" height="'+zoombox.height+'" wmode="transparent"></embed></object>';		
			}
			
			else if(zoombox.filtreQuicktime.test(url)){
				zoombox.height = zoombox.height+20;
				content='<embed src="'+url+'" width="'+zoombox.width+'" height="'+zoombox.height+'" controller="true" cache="true" autoplay="true"/>';
			}
			
			else if(zoombox.filtreWMV.test(url)){
				content='<embed src="'+url+'" width="'+zoombox.width+'" height="'+zoombox.height+'" controller="true" cache="true" autoplay="true" wmode="transparent" />';
			}

			else if(zoombox.filtreDailymotion.test(url)){
				id=url.split('_');
				id=id[0].split('/');
				id=id[id.length-1];
				content='<object width="'+zoombox.width+'" height="'+zoombox.height+'"><param name="movie" value="http://www.dailymotion.com/swf/'+id+'&colors=background:000000;glow:000000;foreground:FFFFFF;special:000000;&related=0"></param><param name="allowFullScreen" value="true"></param><param name="allowScriptAccess" value="always"></param><embed src="http://www.dailymotion.com/swf/'+id+'&colors=background:000000;glow:000000;foreground:FFFFFF;special:000000;&related=0" type="application/x-shockwave-flash" width="'+zoombox.width+'" height="'+zoombox.height+'" allowFullScreen="true" allowScriptAccess="always" wmode="transparent" ></embed></object>';
			}
			
			
			else if(zoombox.filtreVimeo.test(url)){
				id=url.split('/');
				id=id[3];
				content='<object width="'+zoombox.width+'" height="'+zoombox.height+'"><param name="allowfullscreen" value="true" />	<param name="allowscriptaccess" value="always" />	<param name="movie" value="http://www.vimeo.com/moogaloop.swf?clip_id='+id+'&amp;server=www.vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=00AAEB&amp;fullscreen=1" />	<embed src="http://www.vimeo.com/moogaloop.swf?clip_id='+id+'&amp;server=www.vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=00AAEB&amp;fullscreen=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="'+zoombox.width+'" height="'+zoombox.height+'" wmode="transparent" ></embed></object>';
			}
			
			
			else if(zoombox.filtreYoutube.test(url)){
				id=url.split('watch?v=');
				id=id[1].split('&');
				id=id[0];
				content='<object width="'+zoombox.width+'" height="'+zoombox.height+'"><param name="movie" value="http://www.youtube.com/v/'+id+'&hl=fr&rel=0&color1=0xFFFFFF&color2=0xFFFFFF&hd=1"></param><embed src="http://www.youtube.com/v/'+id+'&hl=fr&rel=0&color1=0xFFFFFF&color2=0xFFFFFF&hd=1" type="application/x-shockwave-flash" width="'+zoombox.width+'" height="'+zoombox.height+'" wmode="transparent"></embed></object>';
			}
			
			
			else if(zoombox.filtreKoreus.test(url)){
				url=url.split('.html');
				url=url[0];
				content='<object type="application/x-shockwave-flash" data="'+url+'" width="'+zoombox.width+'" height="'+zoombox.height+'"><param name="movie" value="'+url+'"><embed src="'+url+'" type="application/x-shockwave-flash" width="'+zoombox.width+'" height="'+zoombox.height+'"  wmode="transparent"></embed></object>';
			}
			
			
			else if(zoombox.filtreDeezer.test(url)){
				zoombox.width=220;
				zoombox.height=55;
				id=url.split('/');
				id=id[id.length-1];
				content='<object width="220" height="55"><param name="movie" value="http://www.deezer.com/embedded/small-widget-v2.swf?idSong='+id+'&colorBackground=0x000000&textColor1=0xFFFFFF&colorVolume=0xFF6600&autoplay=0"></param><embed src="http://www.deezer.com/embedded/small-widget-v2.swf?idSong='+id+'&colorBackground=0x000000&textColor1=0xFFFFFF&colorVolume=0xFF6600&autoplay=0" type="application/x-shockwave-flash" width="220" height="55" wmode="transparent"></embed></object>';
			}
			
			else{
				if(zoombox.width==zoombox.Dwidth && zoombox.height==zoombox.Dheight){
					zoombox.width=zoombox.windowW()-100;
					zoombox.height=zoombox.windowH()-100;
				}
				content='<iframe src="'+url+'" width="'+zoombox.width+'" height="'+zoombox.height+'" border="0"></iframe>';
			}
			return content;
	},
	
	/**
	* Return the window height
	* */
	windowH : function(){
		if (window.innerHeight) return window.innerHeight  ;
		else{return $(window).height();}
	},
	
	/**
	 * Return the window width
	 * */
	windowW : function(){
		if (window.innerWidth) return window.innerWidth  ;
		else{return $(window).width();}
	},
	
	/**
	 *  Return the position of the top
	 *  */
	scrollY : function() {
		scrOfY = 0;
		if( typeof( window.pageYOffset ) == 'number' ) {
			//Netscape compliant
			scrOfY = window.pageYOffset;
		} else if( document.body && ( document.body.scrollTop ) ) {
			//DOM compliant
			scrOfY = document.body.scrollTop;
		} else if( document.documentElement && ( document.documentElement.scrollTop ) ) {
			//IE6 standards compliant mode
			scrOfY = document.documentElement.scrollTop;
		}
		return scrOfY;
	},

	/**
	 *  Return the position of the left scroll
	 *  */
	scrollX : function() {
		scrOfX = 0;
		if( typeof( window.pageXOffset ) == 'number' ) {
			//Netscape compliant
			scrOfX = window.pageXOffset;
		} else if( document.body && ( document.body.scrollLeft ) ) {
			//DOM compliant
			scrOfX = document.body.scrollLeft;
		} else if( document.documentElement && ( document.documentElement.scrollLeft ) ) {
			//IE6 standards compliant mode
			scrOfX = document.documentElement.scrollLeft;
		}
		 return scrOfX;
	}
};

$(document).ready(function(){
	zoombox.init();
});