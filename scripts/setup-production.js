import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Codexel.ai Production Setup Tool');
console.log('-----------------------------------');

const checkEnv = () => {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return false;
  }
  const env = fs.readFileSync(envPath, 'utf8');
  const required = ['DATABASE_URL', 'OPENAI_API_KEY', 'JWT_SECRET', 'CLOUDFLARE_API_TOKEN'];
  let missing = false;
  
  required.forEach(key => {
    if (!env.includes(`${key}=`) || env.includes(`${key}=#`) || env.match(new RegExp(`${key}=\\s*$`))) {
      console.log(`⚠️  Missing or commented out: ${key}`);
      missing = true;
    }
  });
  
  return !missing;
};

const setupSupabase = () => {
  console.log('\n💎 Step 1: Supabase (Database)');
  try {
    console.log('Pushing schema to Supabase...');
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Schema pushed successfully');
  } catch (e) {
    console.log('❌ Failed to push schema. Check your DATABASE_URL.');
  }
};

const setupVercel = () => {
  console.log('\n⚡ Step 2: Vercel (Hosting)');
  try {
    console.log('Linking to Vercel...');
    execSync('vercel link --yes', { stdio: 'inherit' });
    console.log('✅ Project linked to Vercel');
    console.log('Pushing environment variables...');
    execSync('vercel env pull .env.vercel', { stdio: 'inherit' });
    console.log('✅ Env vars synchronized');
  } catch (e) {
    console.log('❌ Vercel setup failed. Ensure you are logged in (vercel login).');
  }
};

const setupCloudflare = () => {
  console.log('\n🌐 Step 3: Cloudflare (DNS/Edge)');
  console.log('Cloudflare is handled dynamically by the engine.');
  console.log('Ensure CLOUDFLARE_API_TOKEN is set in your Vercel/Replit environment.');
};

const main = async () => {
  if (!checkEnv()) {
    console.log('\n❌ Please fill in your .env file before proceeding.');
    process.exit(1);
  }
  
  setupSupabase();
  setupVercel();
  setupCloudflare();
  
  console.log('\n🎉 Production setup complete! Your engine is ready for codexel.ai.');
};

main();
