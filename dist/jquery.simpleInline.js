/*
 *  jQuery Simple Inline Edit - v0.1.1
 *  A simple plugin for inline edit using contenteditable.
 *  http://hendrikbeneke.com
 *
 *  Made by Hendrik Beneke
 *  Under MIT License
 */
/*global $:false */
(function($, window, document, undefined) {
  "use strict";

  var NEW_LINE = "\n";

  var pluginName = "simpleInline",
    defaults = {
      allowLineBreaks: false,
      valueChanged: function(newValue) {
        console.log(newValue);
      }
    };

  function Plugin(element, options) {
    this.element = (element instanceof $) ? element : $(element);
    var inlineOptions = getDataAttributes(element);
    this.settings = $.extend({}, defaults, inlineOptions, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  function getDataAttributes(element) {
    var data = $(element).data(),
      inlineOptions = {};
    for (var key in data) {
      var cKey = optionToCamelCase(key);
      inlineOptions[cKey] = data[key];
    }
    return inlineOptions;
  }

  function optionToCamelCase(option) {
    return option.replace(/-([a-z])/g, function(g) {
      return g[1].toUpperCase();
    });
  }

  Plugin.prototype = {
    init: function() {
      if (this.settings.allowLineBreaks) {
        this.convertBrToLf(this.element);
      }
      this.setDefaultEvents();
      this.setPlaceholderAttribute();
      this.setPlaceholderAction();
    },

    setDefaultEvents: function() {
      var _this = this;
      var editingClass = _this.settings.allowLineBreaks ? 'editing-block' : 'editing';
      this.element.on('click.editable', function() {
        $(this).addClass(editingClass);
        $(this).attr("contenteditable", true);
        $(this).focus();
      });
      this.element.on('blur.editable', function() {
        $(this).removeClass(editingClass);
        $(this).attr("contenteditable", false);
        _this.clearContentIfEmpty(this);
        _this.settings.valueChanged.call(_this, _this.getValue());
      });

      this.element.on('keydown.editable', function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          if (_this.settings.allowLineBreaks) {
            _this.pasteIntoInput(NEW_LINE);
          } else {
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

    setPlaceholderAction: function() {
      var $el = this.element,
        hasPlaceholder = this.hasPlaceholder;
      if (this.hasPlaceholder) {
        if (!$el.text().trim()) {
          $el.addClass("inline-placeholder");
        }
        $el.focusin(function() {
          if ($el.hasClass("inline-placeholder")) {
            $el.removeClass("inline-placeholder");
          }
        }).focusout(function() {
          if (hasPlaceholder && !$el.text().trim()) {
            $el.addClass("inline-placeholder");
          }
        });
      }
    },

    hasPlaceholder: function() {
      return !!this.element.data("inline-placeholder-text");
    },

    getValue: function() {
      return this.settings.allowLineBreaks ? this.element.text() : this.element.text();
    },

    convertBrToLf: function(el) {
      el.html(el.html().replace(/<br\s*[\/]?>/gi, NEW_LINE));
    },

    pasteIntoInput: function(html) {
      document.execCommand("insertHTML", false, html);
    },

    clearContentIfEmpty: function(el) {
      if ($(el).text().trim() === "") {
        $(el).empty(); // chrome and FF add an extra <br> if the div is empty. we dont want that
      }
    }
  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };

})($, window, document);