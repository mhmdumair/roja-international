import * as readline from "readline";
import * as bcrypt from "bcryptjs";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Enter admin password: ", async (pw) => {
  if (!pw || pw.length < 6) { console.error("❌ Password must be at least 6 characters"); rl.close(); process.exit(1); }
  const hash = await bcrypt.hash(pw, 10);
  console.log("\n✅ Add this to your .env:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  rl.close();
});
