/* Shared form-factor utilities for Page Designer editor widgets */
var CldFormFactorUtils = (function () {
    function parseBreakpoints(bpStr) {
        var bp = { mobile: 767, tablet: 1023 };
        if (bpStr) {
            try {
                var parsed = JSON.parse(bpStr);
                if (typeof parsed.mobile === 'number') bp.mobile = parsed.mobile;
                if (typeof parsed.tablet === 'number') bp.tablet = parsed.tablet;
            } catch (e) {}
        }
        return bp;
    }

    function toFormFactor(viewport, bpStr) {
        if (!viewport) return 'desktop';
        if (viewport.breakpoint) {
            var vbp = viewport.breakpoint.toLowerCase();
            if (vbp === 'mobile' || vbp === 'tablet' || vbp === 'desktop') return vbp;
        }
        var bp = parseBreakpoints(bpStr);
        var w = viewport.width || 1024;
        if (w <= bp.mobile) return 'mobile';
        if (w <= bp.tablet) return 'tablet';
        return 'desktop';
    }

    return { parseBreakpoints: parseBreakpoints, toFormFactor: toFormFactor };
}());
