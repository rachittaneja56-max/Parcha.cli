import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/schema";

class UserService {
  public async getUserById(id: string) {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
    return user;
  }
}

export default UserService;
