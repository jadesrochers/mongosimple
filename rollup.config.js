import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { terser } from "rollup-plugin-terser";

export default {
    input: './src/mongotools.js',
    external: [ 'ramda' ],
    output: [
      {
          format: 'cjs',
          file: './dist/mongosimple-cjs.js',
          name: 'mongosimple',
      },
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        resolve(),
        commonjs(),
        /* terser(), */
        filesize(),
    ]
}
