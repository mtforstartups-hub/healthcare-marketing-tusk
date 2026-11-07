import {spawnSync} from 'node:child_process';import fs from 'node:fs';
const out='.test-runtime/core-tests';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/package.json','{"type":"commonjs"}');
const compile=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--outDir',out,'--module','commonjs','--moduleResolution','node','--resolveJsonModule','--esModuleInterop','--target','ES2022','--skipLibCheck','--types','node','lib/intake-core.ts','lib/security.ts'],{stdio:'inherit'});if(compile.status!==0)process.exit(compile.status||1);
const run=spawnSync(process.execPath,['--test','tests/intake.test.cjs'],{stdio:'inherit'});process.exit(run.status||0);
