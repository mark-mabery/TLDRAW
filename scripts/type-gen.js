// @ts-check

/*
Type gen script

This script will generate TypeScript declarations for the code editor. It reads
the global types, as well as all of the code classes, and writes them into a
single file as a string. This string is fed into the Monaco editor as an extraLib. 
*/

const fs = require("fs/promises")

async function copyTypesToFile() {
  const types = await fs.readFile(__dirname + "/../types.ts", 'utf8')
  const codeIndex = await fs.readFile(__dirname + "/../state/code/index.ts", 'utf8')
  const codeDot = await fs.readFile(__dirname + "/../state/code/dot.ts", 'utf8')
  const codeEllipse = await fs.readFile(__dirname + "/../state/code/ellipse.ts", 'utf8')
  const codeLine = await fs.readFile(__dirname + "/../state/code/line.ts", 'utf8')
  const codePolyline = await fs.readFile(__dirname + "/../state/code/polyline.ts", 'utf8')
  const codeRay = await fs.readFile(__dirname + "/../state/code/ray.ts", 'utf8')
  const codeArrow = await fs.readFile(__dirname + "/../state/code/arrow.ts", 'utf8')
  const codeDraw = await fs.readFile(__dirname + "/../state/code/draw.ts", 'utf8')
  const codeRectangle = await fs.readFile(__dirname + "/../state/code/rectangle.ts", 'utf8')
  const codeVector = await fs.readFile(__dirname + "/../utils/vec.ts", 'utf8')
  const codeUtils = await fs.readFile(__dirname + "/../state/code/utils.ts", 'utf8')

  const content = `
// HEY! DO NOT MODIFY THIS FILE. THE CONTENTS OF THIS FILE
// ARE AUTO-GENERATED BY A SCRIPT AT: /scripts/type-gen.js
// ANY CHANGES WILL BE LOST WHEN THE SCRIPT RUNS AGAIN!

export default {` + `
    name: "types.ts",
    content: \`    

${types}

${codeIndex.match(/export default(.|\n)*$/g)[0]}
${codeDot.match(/\/\*\*(.|\n)*$/g)[0]}
${codeEllipse.match(/\/\*\*(.|\n)*$/g)[0]}
${codeLine.match(/\/\*\*(.|\n)*$/g)[0]}
${codePolyline.match(/\/\*\*(.|\n)*$/g)[0]}
${codeRay.match(/\/\*\*(.|\n)*$/g)[0]}
${codeRectangle.match(/\/\*\*(.|\n)*$/g)[0]}
${codeArrow.match(/\/\*\*(.|\n)*$/g)[0]}
${codeDraw.match(/\/\*\*(.|\n)*$/g)[0]}
${codeUtils.match(/\/\*\*(.|\n)*$/g)[0]}
${codeVector}
\`
  }`.replaceAll("export default", "").replaceAll("export ", "")

  await fs.writeFile(__dirname + "/../components/code-panel/types-import.ts", content)
}

// Kickoff
copyTypesToFile()