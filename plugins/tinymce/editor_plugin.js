(function() {
	tinymce.create('tinymce.plugins.TypofilterPlugin', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceTypofilter');
			ed.addCommand('mceTypofilter', function() {
				var selection = tinymce.activeEditor.selection.getContent();
				selection = Typographus.typo_text(selection);
				tinymce.activeEditor.selection.setContent(selection);
			});

			// Register button
			ed.addButton('typofilter', {
				title : 'Typographus',
				cmd : 'mceTypofilter',
			});

		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Typofilter plugin',
				author : 'Graker',
				authorurl : 'http://graker.ru',
				infourl : 'http://graker.ru/project/typofilter_js',
				version : "1.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('typofilter', tinymce.plugins.TypofilterPlugin);
})();
