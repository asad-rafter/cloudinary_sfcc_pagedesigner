'use strict';

module.exports.init = function (editor) {
    var PageMgr = require('dw/experience/PageMgr');
    var HashMap = require('dw/util/HashMap');
    var Logger = require('dw/system/Logger');
    var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');
    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());

    var currentSite = require('dw/system/Site').getCurrent();
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
    conf.put('type', 'image');
    var mediaPicker = PageMgr.getCustomEditor('cloudinary.mediaSelector', conf);
    editor.dependencies.put('mediaPicker', mediaPicker);

    var studioWidget = PageMgr.getCustomEditor('cloudinary.studioWidget', new HashMap());
    editor.dependencies.put('studioWidget', studioWidget);
};
