import { build } from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const handlersDir = 'src/handlers';
const outDir = 'dist';

// Get all handler files
const handlerFiles = readdirSync(handlersDir)
  .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
  .map(file => file.replace('.ts', ''));

console.log('📦 Bundling Lambda handlers:', handlerFiles);

// Bundle each handler separately
for (const handler of handlerFiles) {
  try {
    await build({
      entryPoints: [`${handlersDir}/${handler}.ts`],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outfile: `${outDir}/handlers/${handler}.js`,
      external: [
        // AWS SDK is available in Lambda runtime
        '@aws-sdk/*',
        'aws-sdk'
      ],
      minify: true,
      sourcemap: false,
      metafile: false,
    });
    
    console.log(`✅ Bundled ${handler}.js`);
  } catch (error) {
    console.error(`❌ Failed to bundle ${handler}:`, error);
    process.exit(1);
  }
}

console.log('🎉 All handlers bundled successfully!');
