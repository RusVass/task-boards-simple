import { BoardProvider } from "../state/BoardContext";
import { BoardPage } from "../pages/BoardPage";

export function App() {
  return (
    <BoardProvider>
      <BoardPage />
    </BoardProvider>
  );
}
