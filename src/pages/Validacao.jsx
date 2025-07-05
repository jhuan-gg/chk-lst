import { useParams } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function Validacao() {
  const { tarefaId } = useParams();
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-indigo-900">
        Conferir tarefa{" "}
        <span className="text-purple-700 font-extrabold">#{tarefaId}</span>
      </h1>
      <textarea
        className="border w-full mb-4 p-3 rounded-lg shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
        placeholder="Comentário"
        rows={4}
      />
      <div className="flex gap-4">
        <button className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2">
          <FaCheck /> Aprovar
        </button>
        <button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2">
          <FaTimes /> Rejeitar
        </button>
      </div>
    </div>
  );
}