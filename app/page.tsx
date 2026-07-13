import TodoApp from "./components/TodoApp";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <TodoApp />
    </div>
  );
}
