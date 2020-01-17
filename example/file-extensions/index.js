const lmb = require('../../.')
const path = require('path')

const sourceUris = [
    './src1',
    './src2',
    './src3',
    './src4',
]

console.log('None of these dang files have the right extensions!', sourceUris)

for (const u of sourceUris) {
    const src = new lmb.Source(u)
    src.open((err) => {
        function onprobe(err, data) {
            let fileFormat = data.format.format_name
            const theType = lmb.extensions.typeof(fileFormat)
            console.log(`\nCorrect file basename for ${src.uri} is:`)
            if (theType === 'unknown') {
                fileFormat =  fileFormat.split(',')[0]
                console.log(`${src.uri}.${fileFormat === 'matroska' ? 'mkv' : fileFormat}`)
            } else {
                console.log(`${src.uri}.${fileFormat}`)
            }
        }
        src.probe(onprobe)
    })
}
/*

const src = new lmb.Source('./src1')
console.log(src)

*/

