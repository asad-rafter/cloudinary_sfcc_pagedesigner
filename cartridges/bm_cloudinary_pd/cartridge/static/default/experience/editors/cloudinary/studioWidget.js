/**
 * studioWidget.js - SFCC Page Designer breakout editor
 *
 * Uses the official Cloudinary Studio Widget JS SDK:
 * https://studio-widget.cloudinary.com/latest/all.js
 */

(() => {
    subscribe('sfcc:ready', function ({ value, config }) {
        // Capture emit at subscribe time — stable reference across async callbacks
        var _emit = emit;

        // Container the SDK will mount the widget into
        var container = document.createElement('div');
        container.id = 'cld-studio-container';
        document.body.appendChild(container);

        // Size the container to fill the modal viewport
        var rem    = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        var chrome = 55 + 55 + (4 * rem);
        var h      = Math.max(Math.round(window.innerHeight - chrome), 400);

        container.style.width  = '100%';
        container.style.height = h + 'px';

        initWidget(_emit);

        function initWidget(emitFn) {
            var widget = window.cloudinary.studioWidget({
                cloudName: config.cloudName,
                apiKey:    config.apiKey,
                appendTo:  '#cld-studio-container'
            });

            var publicId = getPublicId(value);
            if (publicId) {
                widget.update({ publicIds: [publicId] });
            }

            widget.show();

            // Destroy the widget cleanly when SFCC closes the breakout modal
            window.addEventListener('pagehide', function () {
                try { widget.destroy(); } catch (e) {}
            });

            widget.on('insert', function (payload) {
                try {
                    var imageUrl = '';
                    var publicId = '';
                    var trans    = '[]';

                    if (typeof payload === 'string') {
                        imageUrl = payload;
                        var parsed = parseCloudinaryUrl(payload);
                        publicId   = parsed.publicId;
                        trans      = parsed.transformation;
                    } else {
                        var asset = Array.isArray(payload?.assets) && payload.assets.length
                            ? payload.assets[0]
                            : Array.isArray(payload) && payload.length
                                ? payload[0]
                                : payload;
                        imageUrl = asset?.url || asset?.imageUrl || asset?.secure_url || '';
                        publicId = asset?.public_id || asset?.publicId || '';
                        trans    = asset?.transformation || asset?.eager_transformation || '[]';
                        if (typeof trans !== 'string') {
                            try { trans = JSON.stringify(trans); } catch (e) { trans = '[]'; }
                        }
                    }

                    var result = {
                        formValues: {
                            studioResult: {
                                imageUrl:                 imageUrl,
                                transformation:           trans,
                                public_id:                publicId,
                                isTransformationOverride: true
                            }
                        }
                    };

                    emitFn({ type: 'sfcc:value', payload: result });

                    // Close the breakout modal by clicking SFCC's Apply button in the parent frame
                    setTimeout(function () {
                        try {
                            for (var btn of window.parent.document.querySelectorAll('button')) {
                                if (btn.textContent.trim() === 'Apply') {
                                    btn.click();
                                    break;
                                }
                            }
                        } catch (e) { /* cross-origin guard */ }
                    }, 50);

                } catch (err) {
                    console.error('[CLD Studio] insert handler error:', err);
                }
            });
        }
    });

    function getPublicId(value) {
        var fv = value?.formValues;
        if (!fv) return '';
        var entry = fv.desktop || fv.tablet || fv.mobile;
        return entry?.asset?.public_id || fv.image?.asset?.public_id || '';
    }

    /**
     * Parse a Cloudinary delivery URL into its transformation string and public_id.
     */
    function parseCloudinaryUrl(url) {
        var UPLOAD = '/upload/';
        var idx = url.indexOf(UPLOAD);
        if (idx === -1) return { publicId: '', transformation: '[]' };

        var afterUpload = url.substring(idx + UPLOAD.length).split('?')[0];
        var segments    = afterUpload.split('/');

        var transParts = [];
        var pidParts   = [];
        var inPid      = false;

        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            if (!inPid && isTransformSegment(seg)) {
                transParts.push(seg);
            } else {
                inPid = true;
                pidParts.push(seg);
            }
        }

        // Strip file extension from the last public_id segment
        var last   = pidParts[pidParts.length - 1] || '';
        var dotIdx = last.lastIndexOf('.');
        if (dotIdx !== -1) pidParts[pidParts.length - 1] = last.substring(0, dotIdx);

        return {
            publicId:       pidParts.join('/'),
            transformation: transParts.length ? transParts.join('/') : '[]'
        };
    }

    function isTransformSegment(seg) {
        var parts = seg.split(',');
        return parts.every(function (p) {
            return /^[a-z]{1,3}_/.test(p) || /^[a-z]{1,3}[A-Z]/.test(p);
        });
    }
})();
