'use strict';

module.exports.init = function (editor) {
    var PageMgr = require('dw/experience/PageMgr');
    var HashMap = require('dw/util/HashMap');
    var Logger = require('dw/system/Logger');
    var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');

    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());

    // Pass default player option values from site preference to the widget
    var currentSite = require('dw/system/Site').getCurrent();
    var playerOptionsRaw = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerVideoPlayerOptions');
    var playerOptions = { autoplay: false, muted: false, loop: false, controls: true };
    if (playerOptionsRaw) {
        try {
            var parsed = JSON.parse(playerOptionsRaw);
            var keys = ['autoplay', 'muted', 'loop', 'controls'];
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                if (k in parsed) {
                    playerOptions[k] = !!parsed[k];
                }
            }
        } catch (e) { /* keep defaults on parse error */ }
    }
    editor.configuration.put('playerOptions', JSON.stringify(playerOptions));

    var breakpointsRaw = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerFormFactorBreakpoints');
    var breakpoints = { mobile: 767, tablet: 1023 };
    if (breakpointsRaw) {
        try {
            var parsedBp = JSON.parse(breakpointsRaw);
            if (typeof parsedBp.mobile === 'number') breakpoints.mobile = parsedBp.mobile;
            if (typeof parsedBp.tablet === 'number') breakpoints.tablet = parsedBp.tablet;
        } catch (e) {
            Logger.getLogger('bm_cloudinary_pd', 'bm_cloudinary_pd').error('CloudinaryPageDesignerFormFactorBreakpoints is not valid JSON: {0}', e.message);
        }
    }
    editor.configuration.put('breakpoints', JSON.stringify(breakpoints));

    var conf = new HashMap();
    conf.put('type', 'video');
    var mediaPicker = PageMgr.getCustomEditor('cloudinary.mediaSelector', conf);
    editor.dependencies.put('mediaPicker', mediaPicker);

    var advancedConfig = PageMgr.getCustomEditor('cloudinary.advancedVideoForm', new HashMap());
    editor.dependencies.put('advancedConfig', advancedConfig);
};
