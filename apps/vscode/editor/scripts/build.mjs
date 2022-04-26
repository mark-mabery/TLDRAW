/* eslint-disable */
import fs from 'fs'
import esbuild from 'esbuild'
import { createRequire } from 'module'

const pkg = createRequire(import.meta.url)('../package.json')

const { log: jslog } = console

async function main() {
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true }, (e) => {
      if (e) {
        throw e
      }
    })
  }

  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist')
  }

  fs.copyFile('./src/index.html', './dist/index.html', (err) => {
    if (err) throw err
  })

  try {
    esbuild.buildSync({
      entryPoints: ['./src/index.tsx'],
      outfile: 'dist/index.js',
      minify: false,
      bundle: true,
      format: 'esm',
      target: 'es6',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      tsconfig: './tsconfig.json',
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    })

    jslog(`✔ ${pkg.name}: Build completed.`)
  } catch (e) {
    jslog(`× ${pkg.name}: Build failed due to an error.`)
    jslog(e)
  }
}

main()
