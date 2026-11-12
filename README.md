# typofilter.js
JavaScript functions to add special symbols, dashes, ellipsis and Russian-style quotes.

A bit of script's history can be found [here](http://graker.ru/project/typofilter_js).

## Description

The script does transforms and replacements over selected text or the whole textarea. Here's the list of functions:

* replaces (c) with ©
* replaces (r) with ®
* replaces multiple dots with ellipsis
* replaces +- with ±
* replaces -> with →
* replaces <- with ←
* replaces quotes with laquo/raquo (Russian-style quotes), nested quotes with „“
* replaces hyphens with mdash in text when appropriate (with a non-breaking space before it)
* replaces hyphens with ndash in number ranges
* removes spaces between a number and the percent sign

## How to use

Include `typofilter.js` script to the page. `Typographus` global object will be available globally.

Call `Typographus.process(text)` to process text with safeblocks.

Call `Typographus.typo_text(text)` to process a text without applying safeblocks.

### Safeblocks

Safeblock is a pair of start and end values marking start and end of the block to which the typofilter processing must not apply. It is useful to avoid replacements in code blocks or embedded frames. Check out `Typographus_Lite_UTF8.safeblocks` value in the script to see defined safeblocks or to add new ones.

## Plugins

### OctoberCMS Markdown

To add Typographus button to [OctoberCMS](http://octobercms.com), include `typofilter.js` and `typofilter-markdown-extend.js` to any backend page displaying Markdown editor. The button will appear with a magic wand icon.

OctoberCMS plugin supports both selection and full text processing.

### CKEditor 5

`plugins/ckeditor5/typofilter.js` adds a Typography button (magic wand) and the
`Ctrl+Shift+T` keystroke. It processes the selected text or, if nothing is selected,
the whole document. Processing goes block by block (paragraphs, headings, list items,
table cells) through the editor's HTML data pipeline, so links and formatting survive;
code blocks and widgets are skipped. One run is one undo step.

The plugin is plain JavaScript with no build step. Load `typofilter.js` first, then
`plugins/ckeditor5/typofilter.js`. The plugin class is made from the editor's own `Plugin`,
`Command` and `ButtonView`, so it works with any CKEditor 5 build:

* **UMD build** (`ckeditor5/dist/browser/ckeditor5.umd.js` or the CKEditor CDN, global `CKEDITOR`):
  the plugin is available as the global `Typofilter`.

  ```html
  <link rel="stylesheet" href="ckeditor5/dist/browser/ckeditor5.css">
  <script src="ckeditor5/dist/browser/ckeditor5.umd.js"></script>
  <script src="typofilter.js"></script>
  <script src="plugins/ckeditor5/typofilter.js"></script>
  <script>
    const { ClassicEditor, Essentials, Paragraph, Bold, Link } = CKEDITOR;
    ClassicEditor.create(document.querySelector('#editor'), {
      licenseKey: 'GPL',
      plugins: [Essentials, Paragraph, Bold, Link, Typofilter],
      toolbar: ['bold', 'link', '|', 'typofilter'],
    });
  </script>
  ```

* **npm / bundler**: import both scripts for their side effects and build the class from
  the `ckeditor5` package:

  ```js
  import { ClassicEditor, Essentials, Paragraph, Plugin, Command, ButtonView } from 'ckeditor5';
  import 'typofilter.js/typofilter.js';
  import 'typofilter.js/plugins/ckeditor5/typofilter.js';

  const Typofilter = window.createTypofilterPlugin({ Plugin, Command, ButtonView });
  ```

* **DLL build** (`window.CKEditor5.dll`, used by Drupal): registered as
  `CKEditor5.typofilter.Typofilter`.

Optional config:

```js
typofilter: {
  label: 'Typography',       // button label
  keystroke: 'Ctrl+Shift+T', // false to disable
}
```

`plugins/ckeditor5/typofilter.svg` is the button icon as a file (e.g. for toolbar configuration UIs).

### Drupal

The package is `graker/typofilter` of type `drupal-library`, so Composer installs it to
`web/libraries/typofilter`:

```json
"repositories": [
    {"type": "vcs", "url": "https://github.com/graker/typofilter.js"}
]
```

```
composer require graker/typofilter:^1.1
```

The CKEditor 5 plugin still has to be registered by a module (`*.ckeditor5.yml` and a library
definition pointing to `/libraries/typofilter/...`).

### TinyMCE

Include `typofilter.js` script to the page, then use `plugins/tinymce` script to add a button
to the editor the usual way. It supports selected text processing only and may be outdated.

## Tests

```
npm test
```

`test/expected.json` holds reviewed outputs for `test/corpus.js`; every output is also
checked to be idempotent.
