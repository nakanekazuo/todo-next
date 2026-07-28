"use client";

import { useEffect, useRef, useState } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

type Filter = "all" | "active" | "done";

const STORAGE_KEY = "todo-next.todos";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        // Deferred to an effect (not a lazy initializer) so the client's
        // first render matches the server-rendered empty state and avoids
        // a hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTodos(JSON.parse(raw));
      } catch {
        // ignore corrupted storage
      }
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (loaded.current) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos]);

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function commitEdit(id: string) {
    const text = editingText.trim();
    setTodos((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, text } : t))
        .filter((t) => t.text.length > 0),
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const remaining = todos.filter((t) => !t.done).length;
  const hasCompleted = todos.some((t) => t.done);
  const visibleTodos = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "active", label: "未完了" },
    { key: "done", label: "完了" },
  ];

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Todo
      </h1>

      <form onSubmit={addTodo} className="mb-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="やることを入力..."
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          追加
        </button>
      </form>

      {todos.length > 0 && (
        <div className="mb-4 flex gap-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-foreground text-background"
                  : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {visibleTodos.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {todos.length === 0
            ? "タスクはまだありません。"
            : "該当するタスクはありません。"}
        </p>
      ) : (
        <ul className="mb-4 flex flex-col gap-2">
          {visibleTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="h-4 w-4 shrink-0"
              />
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editingText}
                  autoFocus
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => commitEdit(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(todo.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              ) : (
                <span
                  onDoubleClick={() => startEditing(todo)}
                  className={`flex-1 text-sm ${
                    todo.done
                      ? "text-zinc-400 line-through dark:text-zinc-600"
                      : "text-black dark:text-zinc-50"
                  }`}
                >
                  {todo.text}
                </span>
              )}
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                aria-label="削除"
                className="text-sm text-zinc-400 hover:text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            残り {remaining} / {todos.length} 件
          </p>
          {hasCompleted && (
            <button
              type="button"
              onClick={clearCompleted}
              className="hover:text-red-500"
            >
              完了済みを削除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
