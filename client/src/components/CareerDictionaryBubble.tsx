import { useMemo, useState } from 'react';
import type { CareerId } from '../game/careerCatalog';
import { getCareerById } from '../game/careerCatalog';
import { getCareerDictionary, type CareerDictionaryTerm } from '../game/careerDictionaryData';

interface CareerDictionaryBubbleProps {
  careerId: CareerId;
}

export function CareerDictionaryBubble({ careerId }: CareerDictionaryBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const career = getCareerById(careerId);
  const terms = useMemo(() => getCareerDictionary(careerId), [careerId]);

  const filteredTerms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return terms;
    return terms.filter((item) =>
      `${item.term} ${item.meaning}`.toLowerCase().includes(normalized),
    );
  }, [query, terms]);

  return (
    <div className="fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-3 w-[min(92vw,390px)] overflow-hidden rounded-[1.5rem] border-2 border-[#070a17] bg-[#fff8f0] text-[#172033] shadow-[7px_7px_0_#070a17]">
          <div className="border-b-2 border-[#070a17] bg-[#171d3d] p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8be9fd]">TỪ ĐIỂN NGHỀ NGHIỆP</p>
                <h2 className="mt-1 text-lg font-black text-[#ffe066]">{career?.shortTitle ?? 'Ngành nghề'}</h2>
                <p className="mt-1 text-xs font-semibold text-[#cbd5ff]">Tra nhanh thuật ngữ tiếng Anh xuất hiện trong game.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng từ điển" className="rounded-xl border-2 border-white/20 bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">✕</button>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm: deadline, KPI, bug..."
              className="mt-3 w-full rounded-xl border-2 border-[#4d568c] bg-[#0f1430] px-3 py-2.5 text-sm font-bold text-white outline-none placeholder:text-[#8d95bc] focus:border-[#ffe066]"
              aria-label="Tìm thuật ngữ"
            />
          </div>

          <div className="max-h-[52vh] overflow-y-auto p-3 sm:max-h-[460px]">
            {filteredTerms.length === 0 ? (
              <p className="rounded-xl border-2 border-dashed border-[#cfc4b0] px-3 py-5 text-center text-sm font-bold text-[#6b5c43]">Chưa tìm thấy thuật ngữ này.</p>
            ) : (
              <div className="space-y-2">
                {filteredTerms.map((item) => <DictionaryTermCard key={item.term} item={item} />)}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Đóng từ điển nghề nghiệp' : 'Mở từ điển nghề nghiệp'}
        className="flex items-center gap-2 rounded-full border-2 border-[#070a17] bg-[#ffe066] px-4 py-3 text-sm font-black text-[#172033] shadow-[5px_5px_0_#070a17] transition hover:-translate-y-0.5"
      >
        <span className="grid size-8 place-items-center rounded-full bg-[#171d3d] text-base text-white">📖</span>
        <span>{isOpen ? 'ĐÓNG TỪ ĐIỂN' : 'TỪ ĐIỂN'}</span>
      </button>
    </div>
  );
}

function DictionaryTermCard({ item }: { item: CareerDictionaryTerm }) {
  return (
    <article className="rounded-xl border-2 border-[#d6cbb5] bg-white p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <strong className="text-sm font-black text-[#5b21b6]">{item.term}</strong>
        <span className="text-xs font-bold text-[#6b5c43]">→</span>
        <span className="text-sm font-black text-[#172033]">{item.meaning}</span>
      </div>
    </article>
  );
}

// test connecting