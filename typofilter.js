/**
 * Typographus script to work with quotes, replace some symbols etc.
 */

+function() {
  //typographus object
  var Typographus_Lite_UTF8 = new Object();

  //special characters
  Typographus_Lite_UTF8.sp_chars = {
    nbsp     : '\u00A0',
    lnowrap  : '<span style="white-space:nowrap">',
    rnowrap  : '</span>',
    lquote   : '«',
    rquote   : '»',
    lquote2  : '„',
    rquote2  : '“',
    mdash    : '—',
    ndash    : '–',
    minus    : '–',       // width equals to +, present in every font
    hellip   : '…',
    copy     : '©',
    trade    : '™',
    apos     : '&#39;',   // see http://fishbowl.pastiche.org/2003/07/01/the_curse_of_apos
    reg      : '®',
    multiply : '&times;',
    frac_12  : '&frac12;',
    frac_14  : '&frac14;',
    frac_34  : '&frac34;',
    plusmn   : '±',
    rarr     : '→',
    larr     : '←',
    rsquo    : '&rsquo;'
  };

  //safeblocks (as parts of regular expressions)
  //ADD YOUR SAFEBLOCKS HERE AS 'start' : 'end' PAIR
  Typographus_Lite_UTF8.safeblocks = {
    '<safeblock>' : '<\\/safeblock>',
    '<pre[^>]*>' : '<\\/pre>',
    '```' : '```',
    '<style[^>]*>' : '<\\/style>',
    '<script[^>]*>' : '<\\/script>',
    '<code[^>]*>' : '<\\/code>',
    '<!--' : '-->',
    '<\\?php' : '\\?>',
    '<object>' : '<\\/object>',
    '<iframe>' : '<\\/iframe>'
  };

  Typographus_Lite_UTF8.safeblock_storage = [];

  /**
   *
   * Stack safeblock in storage (callback for replace)
   *
   * @param match
   * @return {string}
   * @private
   */
  var __stack = function (match) {
    //get length
    var i = Typographus_Lite_UTF8.safeblock_storage.length;
    //add match
    Typographus_Lite_UTF8.safeblock_storage[i] = match;
    //return replacement
    return "<" + i + ">";
  };


  /**
   *
   * Remove safeblocks from text and replace them with <number> (to bring them back later)
   *
   * @param str
   * @return {void|*|string|XML}
   */
  Typographus_Lite_UTF8.remove_safeblocks = function(str) {
    //empty storage
    this.safeblock_storage = [];
    var pattern = '(';
    for (var key in this.safeblocks) {
      pattern += "(" + key + "(.|\\n)*?" + this.safeblocks[key] + ")|";
    }
    pattern += '<[^>]*[\\s][^>]*>)';
    str = str.replace(RegExp(pattern, "gim"), __stack);
    return str;
  };


  /**
   *
   * Return safeblocks back to text
   *
   * @param str
   * @return {*}
   */
  Typographus_Lite_UTF8.return_safeblocks = function(str) {
    var storage = this.safeblock_storage;
    // Use a replacer function: a string replacement would interpret "$&", "$1"
    // etc. inside the stored block as replacement patterns.
    return str.replace(/<(\d+)>/g, function (match, i) {
      return i < storage.length ? storage[i] : match;
    });
  };


  /**
   *
   *  Process the text
   *
   */
  Typographus_Lite_UTF8.process = function(str) {
    str = this.remove_safeblocks(str);
    str = this.typo_text(str);
    str = this.return_safeblocks(str);
    return str;
  };


  /**
   * Turn quotes nested into «» into „“: «Это „вложенные“ кавычки».
   *
   * Nesting depth is reset at paragraph boundaries (a blank line or a closing
   * block tag), so an unbalanced quote doesn't spoil the rest of the text.
   *
   * @param str
   * @return {string}
   */
  Typographus_Lite_UTF8.nest_quotes = function(str) {
    var sym = this.sp_chars;
    var depth = 0;
    var boundary = /^(?:\n[ \t]*\n|<\/(?:p|li|h[1-6]|td|th|blockquote|div)>)/i;
    var result = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '\n' || ch === '<') {
        var m = boundary.exec(str.slice(i));
        if (m) {
          depth = 0;
          result += m[0];
          i += m[0].length - 1;
          continue;
        }
      }
      if (ch === sym['lquote'] || ch === sym['lquote2']) {
        depth++;
        ch = depth > 1 ? sym['lquote2'] : sym['lquote'];
      }
      else if (ch === sym['rquote'] || ch === sym['rquote2']) {
        ch = depth > 1 ? sym['rquote2'] : sym['rquote'];
        depth = Math.max(0, depth - 1);
      }
      result += ch;
    }
    return result;
  };


  /**
   *
   * Apply rules to text
   *
   */
  Typographus_Lite_UTF8.apply_rules = function(rules, str) {
    for (var key in rules) {
      var rule = new RegExp(key, "gim"); //with global, case-insensitive, multiline flags
      var newstr = rules[key];
      str = str.replace(rule, newstr);
    }
    return str;
  }


  /**
   *
   * The main process function: declare rules and apply them to text
   *
   */
  Typographus_Lite_UTF8.typo_text = function(str) {
    var sym = this.sp_chars;
    // A tag (or a safeblock placeholder <N>) can't contain angle brackets, so it
    // never spans text between two tags. Markdown emphasis (*, **) is
    // transparent for quotes as well.
    var html_tag = '(?:<[^<>]*>|\\*+)';
    var hellip = '\\.{3,5}';
    var word = '[a-zA-Z_абвгдеёжзийклмнопрстуфхцчшщьыъэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЬЫЪЭЮЯ0123456789]';
    var phrase_begin = "(?:" + hellip + "|" + word + '|\\n)';
    // ";" counts only when it doesn't end an entity like &nbsp;
    var phrase_end = '(?:[)!?.:,#\\]]|(?<!&#?[a-z0-9]+);|$|'+ word + '|' + sym['rquote'] + '|' + sym['rquote2'] + '|&quot;|"|' + sym['hellip'] + '|' + sym['copy'] + '|' + sym['trade'] + '|' + sym['apos'] + '|' + sym['reg'] + '|\\\')';
    var any_quote = "(?:" + sym['lquote'] + "|" + sym['rquote'] + "|" + sym['lquote2'] + "|" + sym['rquote2'] + "|&quot;|\\\")";
    //symbols
    var rules_symbols = {};
    //(c)
    rules_symbols['\\((c|с)\\)'] = sym['copy'];
    //(r)
    rules_symbols['\\(r\\)'] = sym['reg'];
    //tm
    rules_symbols['\\(tm\\)'] = sym['trade'];
    //hellip
    rules_symbols[hellip] = sym['hellip'];
    //+-
    rules_symbols['([^\\+]|^)\\+-'] = '$1' + sym['plusmn'];
    //->
    rules_symbols['([^-]|^)-(>|&gt;)'] = '$1' + sym['rarr'];
    //<-
    rules_symbols['([^<]|^)(<|&lt;)-'] = '$1' + sym['larr'];
    //quotes
    var rules_quotes = {};
    rules_quotes['([^"]\\w+)"(\\w+)"'] = '$1 "$2"';
    rules_quotes['"(\\w+)"(\\w+)'] = '"$1" $2';
    rules_quotes["(" + html_tag + "*?)(" + any_quote + ")(" + html_tag + "*" + phrase_begin + html_tag + "*)"] = '$1' + sym['lquote'] + '$3';
    rules_quotes["(" + html_tag + "*(?:" + phrase_end + "|[0-9]+)" + html_tag + "*)(" + any_quote + ")(" + html_tag + "*(?:" + phrase_end + "|\\s|[,<-])" + html_tag + "*)"] = '$1' + sym['rquote'] + '$3';

    //main rules
    var rules_main = {};
    //fix dashes
    rules_main['(?: |\u00A0|&nbsp;)+(?:--?|—|&mdash;)(?=\\s|&nbsp;|$)'] = sym['nbsp'] + sym['mdash'];
    rules_main['^(?:--?|—|&mdash;)(?=\\s|&nbsp;)'] = sym['mdash'];
    //fix digit-dash
    rules_main['(\\d{1,})(-)(?=\\d{1,})'] = '$1' + sym['ndash'];
    //glue percent
    rules_main['([0-9]+)\\s+%'] = '$1%';

    //apply different rules
    str = this.apply_rules(rules_quotes, str);
    str = this.nest_quotes(str);
    str = this.apply_rules(rules_main, str);
    str = this.apply_rules(rules_symbols, str);

    return str;
  };

  // Pass the object to window for global use
  window.Typographus = Typographus_Lite_UTF8;
}();
