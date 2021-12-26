const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const cheerio = require('cheerio');
const got = require('got').gotScraping;

module.exports = {
    get: (url, option = {}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await got.get(url, option);

                return resolve(response);
            } catch (e) {
                if (e.statusCode === 503) {
                    const response = await got.get('https://mirror.katowproject.ink/?url=' + url, option);

                    return resolve(response);
                }
                reject(e);
            }
        });
    },

    generatePDF: async (images) => {
        try {
            const doc = new PDFDocument({ autoFirstPage: false });

            for (const image of images) {
                if (image.endsWith(".gif")) continue;
                const buffer = await require('got')(image).buffer();
                const img = doc.openImage(buffer);
                doc.addPage({ size: [img.width, img.height] });
                doc.image(img, 0, 0);
            };

            doc.end();

            const pdfStream = await getStream.buffer(doc);

            return pdfStream;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    getVideoSrc: async (url) => {
        try {
            const response = await get(url);
            const $ = cheerio.load(response.body);
            let source1 = $.html().search('"file":');
            let source2 = $.html().search("'file':");
            let source3 = $('source').attr('src');
            let source4 = $('iframe').attr('src');

            if (source1 !== -1) {
                const end = $.html().indexOf('","');
                return $.html().substring(source1 + 8, end);
            } else if (source2 !== -1) {
                const end = $.html().indexOf("','");
                return $.html().substring(source2 + 8, end);
            } else if (source3) {
                return source3;
            }
            return "-";
        } catch (error) {
            return "-";
        }
    }

};