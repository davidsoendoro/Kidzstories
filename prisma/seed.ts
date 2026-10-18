import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "demo@kidzstories.test";
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo Parent", passwordHash: await bcrypt.hash("password123", 12), storyCredits: 3, videoCredits: 1 },
  });
  if (!(await db.child.findFirst({ where: { userId: user.id } }))) {
    await db.child.create({ data: { userId: user.id, name: "Maya", age: 5, pronoun: "she", appearance: "Curly black hair, freckles, yellow raincoat", interests: "dinosaurs, painting" } });
  }
  console.log(`Seeded ${email} / password123 (3 story credits, 1 video credit)`);
}

main().finally(() => db.$disconnect());
