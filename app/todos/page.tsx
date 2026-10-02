import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos, error } = await supabase.from("todos").select("id, name");

  if (error) {
    console.error("Failed to load todos:", error.message);
    return <p>할 일 목록을 불러오지 못했습니다.</p>;
  }

  if (!todos?.length) {
    return <p>등록된 할 일이 없습니다.</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}
