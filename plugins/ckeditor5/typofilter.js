/**
 * CKEditor 5 plugin: Typofilter button.
 *
 * Applies Typographus.process() to the selected text or, when nothing is
 * selected, to the whole document. Works block by block (paragraphs,
 * headings, list items, table cells) through the editor's HTML data pipeline,
 * so formatting and links are preserved; code blocks and widgets are skipped.
 * The whole run is one undo step.
 *
 * Load typofilter.js first. The plugin class is made from CKEditor's own
 * Plugin, Command and ButtonView, so it fits any CKEditor 5 build:
 * - UMD build (ckeditor5.umd.js, window.CKEDITOR): window.Typofilter;
 * - DLL build (window.CKEditor5.dll, Drupal): CKEditor5.typofilter.Typofilter;
 * - npm / bundler: window.createTypofilterPlugin({ Plugin, Command, ButtonView })
 *   with the classes imported from 'ckeditor5'.
 *
 * Config (all optional):
 *   typofilter: {
 *     label: 'Typography',        // button label and tooltip
 *     keystroke: 'Ctrl+Shift+T',  // false to disable; Ctrl is Cmd on macOS
 *   }
 */
(function (root) {
  'use strict';

  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">' +
    '<path d="M13.3 5.3a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1 0 1.4L4.7 18.1a1 1 0 0 1-1.4 0l-.7-.7a1 1 0 0 1 0-1.4zm-.7 2.8 1 1 1.1-1.1-1-1z" fill-rule="evenodd"/>' +
    '<path d="m15.5 0 .6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6zM7 1.5l.5 1.3 1.3.5-1.3.5L7 5.1l-.5-1.3-1.3-.5 1.3-.5zm11 7 .5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/>' +
    '</svg>';

  // Blocks never processed even though the schema allows text in them.
  var SKIP_BLOCKS = ['codeBlock'];

  /**
   * Creates the Typofilter plugin class.
   *
   * @param {{Plugin: Function, Command: Function, ButtonView: Function}} ck
   *   CKEditor 5 classes of the editor build in use.
   * @return {Function}
   *   The plugin class.
   */
  function createTypofilterPlugin(ck) {

    /**
     * The "typofilter" command.
     */
    class TypofilterCommand extends ck.Command {

      refresh() {
        this.isEnabled = typeof root.Typographus !== 'undefined';
      }

      execute() {
        var editor = this.editor;
        var model = editor.model;
        var selection = model.document.selection;
        var processAll = selection.isCollapsed;

        model.change(function (writer) {
          var docRoot = selection.getFirstPosition().root;
          var scope = processAll ? writer.createSelection(writer.createRangeIn(docRoot)) : selection;
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
              var processed = root.Typographus.process(html);
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
    class Typofilter extends ck.Plugin {

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
          var button = new ck.ButtonView(locale);
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

    return Typofilter;
  }

  root.createTypofilterPlugin = createTypofilterPlugin;

  // UMD build (cdn.ckeditor.com, ckeditor5/dist/browser/ckeditor5.umd.js).
  if (root.CKEDITOR && typeof root.CKEDITOR.Plugin === 'function') {
    root.Typofilter = createTypofilterPlugin(root.CKEDITOR);
  }

  // DLL build (Drupal): plugins are looked up as CKEditor5.<name>.<Plugin>.
  if (root.CKEditor5 && typeof root.CKEditor5.dll === 'function') {
    var core = root.CKEditor5.dll('./src/core.js');
    var ui = root.CKEditor5.dll('./src/ui.js');
    root.CKEditor5.typofilter = {
      Typofilter: createTypofilterPlugin({
        Plugin: core.Plugin,
        Command: core.Command,
        ButtonView: ui.ButtonView,
      }),
    };
  }
})(window);
