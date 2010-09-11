Zoombox
=============

Zoombox is an easy to use Javascript class that allow you to overlay images and videos on the current page.

Set up
-------

First, place the whole directory "Zoombox" at the root of your website :

* Zoombox uses 2 different Javascript scripts that you will have to import in this exact same order (in <head> or just before </body>)
	&lt;script type=&quot;text/javascript&quot; src=&quot;/zoombox/jquery.js&quot;&gt;&lt;/script&gt;
	&lt;script type=&quot;text/javascript&quot; src=&quot;/zoombox/zoombox.js&quot;&gt;&lt;/script&gt;
* Link the CSS file to your page in the <head>
	<link href="/zoombox/zoombox.css" rel="stylesheet" type="text/css" media="screen" />

How it works ?
-------
* add rel="zoombox" onto your links in order to add the Zoombox effect
	&lt;a href=&quot;http://www.youtube.com/watch?v=8oejjWGFs6o&quot; title=&quot;Session 2006&quot; rel=&quot;zoombox&quot;&gt;Lien&lt;/a&gt;
* if you would like a group of pictures, you will have to mention a group name in brackets
	&lt;a href=&quot;images/image-1.jpg&quot; rel=&quot;zoombox[vacances]&quot;&gt;image 1&lt;/a&gt;
	&lt;a href=&quot;images/image-2.jpg&quot; rel=&quot;zoombox[vacances]&quot;&gt;image 2&lt;/a&gt;
	&lt;a href=&quot;images/image-3.jpg&quot; rel=&quot;zoombox[vacances]&quot;&gt;image 3&lt;/a&gt;
* You can also mention a length and a height to the Box, rel="zoombox 800 600", in case of a link which is not a picture

Use
-------
* Images : jpg,png,gif,bmp
* MP3
* FLV (An FLV player has been added to the installation file)
* Quicktime links: Mov or MP4
* WMV links
* Dailymotion videos : du type http://www.dailymotion.com/video/x1xhl1_jojodemarrages_creation
* Vimeo links: http://www.vimeo.com/752791
* Youtube links: http://fr.youtube.com/watch?v=8oejjWGFs6o
* On any other links where the iframe system is being used.

Don’t hesitate to contact me if you have any other idea of additional links.

ChangeLog
-------
* v1.1.0 (14/11/2009)
New sourcecode (commented in english)
New configuration variables
You can customize the box editing both CSS and HTML Structure.
You can now launch Zoombox with the function zoombox.open(url,largeur,hauteur)
* v1.0.1 (22/12/2008)
Keyboard is now supported (you can use arrows to switch between images in a galery and echap to close Zoombox)
* v1.0.0 (09/03/2008) :
Class Zoombox created
Resizing pictures when the picture height is too big

FAQ
-------
Can I modify the file ?
Yes, but you will have to inform me of the changes you’ve done