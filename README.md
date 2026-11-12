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

The plugin is plain JavaScript for CKEditor 5 DLL builds (`window.CKEditor5.dll`, used by
Drupal) and registers `CKEditor5.typofilter.Typofilter`. Load `typofilter.js` first.
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
