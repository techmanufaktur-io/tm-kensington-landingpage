/*!
 * SmartMenus jQuery Plugin Bootstrap Addon - v0.2.0 - June 1, 2015
 * http://www.smartmenus.org/
 *
 * Copyright 2015 Vasil Dinkov, Vadikom Web Ltd.
 * http://vadikom.com
 *
 * Licensed MIT
 */
!function(s){s((function(){s("ul.smartmenus:not([data-sm-skip])").each((function(){var i=s(this);i.addClass("sm").smartmenus({subMenusSubOffsetX:0,subMenusSubOffsetY:-7,mainMenuSubOffsetX:0,subIndicators:!1,hideOnClick:!0,showOnClick:!1,showTimeout:100,collapsibleShowFunction:null,collapsibleHideFunction:null,subMenusMinWidth:"15em",subMenusMaxWidth:null,keepInViewport:!1,keepHighlighted:!1});var e=i.data("smartmenus");i.is("[data-sm-skip-collapsible-behavior]")&&i.bind({"click.smapi":function(i,a){if(e.isCollapsible()){var n=s(a),l=n.parent().dataSM("sub");if(l&&l.dataSM("shown-before")&&l.is(":visible"))return e.itemActivate(n),e.menuHide(l),!1}}});var a,n=i.find(".caret");function l(){var s=e.getViewportWidth();s!=a&&(e.isCollapsible()?i.addClass("sm-collapsible"):(i.removeClass("sm-collapsible"),i.is("[data-sm-skip-collapsible-behavior]")||n.removeClass("navbar-toggle sub-arrow")),a=s)}l(),s(window).bind("resize.smartmenus"+e.rootId,l)}))}))}(jQuery);
