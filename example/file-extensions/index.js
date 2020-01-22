const fs = require('fs')
const { Source, extensions } = require('../../.')
const path = require('path')

const sourceUris = [
    './src1',
    './src2',
    './src3',
    './src4',
]

console.log('None of these dang files have the right extensions!', sourceUris)

for (const u of sourceUris) {
    const src = new Source(u)
    src.open((err) => {
        function onprobe(err, data) {
            let fileFormat = data.format.format_name
            const theType = extensions.typeof(fileFormat)
            console.log(`\nCorrect file basename for ${src.uri} is:`)
            if (theType === 'unknown') {
                fileFormat =  fileFormat.split(',')[0]
                fileFormat = fileFormat === 'matroska' ? 'mkv' : fileFormat
            }

            const newFile = `${u}.${fileFormat}`
            fs.renameSync(u, newFile)
            console.log(newFile)
        }

        src.probe(onprobe)
    })
}
