import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from '@/components/common/Link';
import { useRouter } from '@/lib/nav';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { Art } from '@/components/common/Art';
import { Icon } from '@/components/common/Icon';
import { useNameOf } from '@/components/demo/Txt';

export function SearchBox() {
  const { search } = useCatalog();
  const router = useRouter();
  const nameOf = useNameOf();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const results = useMemo(() => search(q).slice(0, 5), [q, search]);
  const term = q.trim();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = () => {
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="search" ref={ref}>
      <Icon name="search" size={18} />
      <input
        type="search"
        role="combobox"
        aria-autocomplete="list"
        value={q}
        placeholder="Search products"
        autoComplete="off"
        aria-label="Search products"
        aria-controls={listId}
        aria-expanded={open && !!term}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') go();
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      <div id={listId} className={`sugg${open && term ? ' on' : ''}`}>
        {results.length > 0 ? (
          results.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} onClick={() => setOpen(false)}>
              <Art id={p.id} emoji={p.emoji} name={nameOf(p.id, p.name)} image={p.image} sizes="40px" />
              <span>{nameOf(p.id, p.name)}</span>
              <b>{inr(p.price)}</b>
            </Link>
          ))
        ) : (
          <button type="button" className="sugg-empty" onClick={go}>
            No quick matches. Search for “{term}”
          </button>
        )}
      </div>
    </div>
  );
}
