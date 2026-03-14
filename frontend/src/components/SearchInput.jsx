import { Search } from "lucide-react";

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-4 px-4 pt-2 animate-fade-in">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-2.5 pl-10 pr-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm
            border border-gray-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400
            text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
      </div>
    </div>
  );
}

export default SearchInput;
