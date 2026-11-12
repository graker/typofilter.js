/**
 * CKEditor 5 plugin: Typofilter button.
 *
 * Applies Typographus.process() to the selected text or, when nothing is
 * selected, to the whole document. Works block by block (paragraphs,
 * headings, list items, table cells) through the editor's HTML data pipeline,
 * so formatting and links are preserved; code blocks and widgets are skipped.
 * The whole run is one undo step.
 *
 * Requires a CKEditor 5 DLL build (window.CKEditor5.dll, as in Drupal) and
 * typofilter.js loaded before this file. Registers CKEditor5.typofilter.Typofilter.
 *
 * Config (all optional):
 *   typofilter: {
 *     label: 'Typography',        // button label and tooltip
 *     keystroke: 'Ctrl+Shift+T',  // false to disable; Ctrl is Cmd on macOS
 *   }
 */
(function (CKEditor5) {
  'use strict';

  var core = CKEditor5.dll('./src/core.js');
  var ui = CKEditor5.dll('./src/ui.js');

  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">' +
    '<path d="M13.3 5.3a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1 0 1.4L4.7 18.1a1 1 0 0 1-1.4 0l-.7-.7a1 1 0 0 1 0-1.4zm-.7 2.8 1 1 1.1-1.1-1-1z" fill-rule="evenodd"/>' +
    '<path d="m15.5 0 .6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6zM7 1.5l.5 1.3 1.3.5-1.3.5L7 5.1l-.5-1.3-1.3-.5 1.3-.5zm11 7 .5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/>' +
    '</svg>';

  // Blocks never processed even though the schema allows text in them.
  var SKIP_BLOCKS = ['codeBlock'];

  /**
   * The "typofilter" command.
   */
  class TypofilterCommand extends core.Command {

    refresh() {
      this.isEnabled = typeof window.Typographus !== 'undefined';
    }

    execute() {
      var editor = this.editor;
      var model = editor.model;
      var selection = model.document.selection;
      var processAll = selection.isCollapsed;

      model.change(function (writer) {
        var root = selection.getFirstPosition().root;
        var scope = processAll ? writer.createSelection(writer.createRangeIn(root)) : selection;
        var blocks = Array.from(scope.getSelectedBlocks()).filter(function (block) {
          return SKIP_BLOCKS.indexOf(block.name) === -1 &&
            model.schema.checkChild(block, '$text');
        });

        blocks.forEach(function (block) {
          var blockRange = writer.createRangeIn(block);
          var ranges = processAll ? [blockRange] : Array.from(selection.getRanges())
            .map(function (range) { return blockRange.getIntersection(range); })
            .filter(function (range) { return range && !range.isCollapsed; });

          ranges.forEach(function (range) {
            var content = model.getSelectedContent(writer.createSelection(range));
            var html = editor.data.stringify(content);
            var processed = window.Typographus.process(html);
            if (processed !== html) {
              model.insertContent(editor.data.parse(processed, block), range);
            }
          });
        });
      });
    }

  }

  /**
   * The Typofilter plugin: command, toolbar button and keystroke.
   */
  class Typofilter extends core.Plugin {

    static get pluginName() {
      return 'Typofilter';
    }

    init() {
      var editor = this.editor;
      var config = editor.config.get('typofilter') || {};
      var label = config.label || 'Typography';
      var keystroke = config.keystroke === undefined ? 'Ctrl+Shift+T' : config.keystroke;

      editor.commands.add('typofilter', new TypofilterCommand(editor));

      editor.ui.componentFactory.add('typofilter', function (locale) {
        var command = editor.commands.get('typofilter');
        var button = new ui.ButtonView(locale);
        button.set({
          label: label,
          icon: ICON,
          tooltip: true,
          keystroke: keystroke || undefined,
        });
        button.bind('isEnabled').to(command, 'isEnabled');
        button.on('execute', function () {
          editor.execute('typofilter');
          editor.editing.view.focus();
        });
        return button;
      });

      if (keystroke) {
        editor.keystrokes.set(keystroke, function (data, cancel) {
          editor.execute('typofilter');
          cancel();
        });
      }
    }

  }

  CKEditor5.typofilter = { Typofilter: Typofilter };
})(window.CKEditor5);
