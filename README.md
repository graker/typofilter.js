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
* replaces quotes with laquo/raquo (Russian-style quotes)
* replaces hyphens with mdash in text when appropriate
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

### CKEditor and TinyMCE

Include `typofilter.js` script to the page, then use corresponding script from plugins/ckeditor or plugins/tinymce to add button to editor the usual way.

Both plugins support selected text processing only. Also, since I haven't used this plugin with CKEditor or TinyMCE for a long time, the code for plugins can be outdated.
