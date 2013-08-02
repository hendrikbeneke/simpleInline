/*
 *  jQuery Simple Inline Edit - v0.1.0
 *  A simple plugin for inline edit using contenteditable.
 *  http://hendrikbeneke.com
 *
 *  Made by Hendrik Beneke
 *  Under MIT License
 */
/*global $:false */
(function($, window, document, undefined) {
  "use strict";

  var pluginName = "simpleInline",
    defaults = {
      allowLineBreaks: false,
      valueChanged: function(newValue){ console.log(newValue);}
    };

  function Plugin(element, options) {
    this.element = (element instanceof $) ? element : $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      this.setDefaultEvents();
      this.setPlaceholderAttribute();
      this.setPlaceholderAction();
    },

    setDefaultEvents: function(){
      var _this = this;
      this.element.on('click.editable', function(){
        $(this).addClass('editing');
        $(this).attr("contenteditable", true);
      });
      this.element.on('blur.editable', function(){
        $(this).removeClass('editing');
        $(this).attr("contenteditable", false);
        _this.settings.valueChanged.call(_this, _this.getValue());
      });

      this.element.keydown(function(e) {
        if (e.keyCode === "13") {
          if (e.shiftKey && _this.settings.allowLineBreaks) {
            // pasteIntoInput(this, "\n");
          } else {
            e.preventDefault();
            $(this).blur();
          }
        }
      });
    },

    setPlaceholderAttribute: function() {
      if (this.settings.placeholder) {
        this.element.attr("data-inline-placeholder-text", this.settings.placeholder);
      }
    },

    setPlaceholderAction: function(){
      var $el = this.element,
        hasPlaceholder = this.hasPlaceholder;
      if (this.hasPlaceholder) {
        if (!$el.html()) {
          $el.addClass("inline-placeholder");
        }
        $el.focusin(function() {
          if ($el.hasClass("inline-placeholder")) {
            $el.removeClass("inline-placeholder");
          }
        }).focusout(function() {
          if (hasPlaceholder && !$el.html()) {
            $el.addClass("inline-placeholder");
          }
        });
      }
    },

    hasPlaceholder: function()  {
      return !! this.element.data("inline-placeholder-text");
    },

    getValue: function(){
      return this.settings.allowLineBreaks ? this.element.html() : this.element.text();
    },

  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };

})($, window, document);